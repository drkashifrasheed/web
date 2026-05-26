'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  MessageSquare,
  X,
  Send,
  ImagePlus,
  Loader2
} from 'lucide-react'
import toast from 'react-hot-toast'
import { getSocket, disconnectSocket } from '@/lib/socket'
import { bookingApi, messageApi } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { showBrowserNotification } from '@/lib/browserNotify'

type CallMessage = {
  _id: string
  sender: { _id: string; fullName: string; profileImage?: string; role?: string }
  content: string
  messageType: string
  fileUrl?: string
  createdAt: string
}

interface VideoCallRoomProps {
  bookingId: string
  remoteUserName: string
  remoteUserId: string
}

export default function VideoCallRoom({
  bookingId,
  remoteUserName,
  remoteUserId
}: VideoCallRoomProps) {
  const router = useRouter()
  const { user } = useAuthStore()
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const peerRef = useRef<RTCPeerConnection | null>(null)
  const localStreamRef = useRef<MediaStream | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [connected, setConnected] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)
  const [messages, setMessages] = useState<CallMessage[]>([])
  const [text, setText] = useState('')
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [cameraOn, setCameraOn] = useState(true)
  const [micOn, setMicOn] = useState(true)
  const [ending, setEnding] = useState(false)

  const roomId = `booking_${bookingId}`

  const setupPeer = useCallback(() => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }, { urls: 'stun:stun1.l.google.com:19302' }]
    })
    peerRef.current = pc

    pc.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0]
      }
    }

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        const socket = getSocket()
        socket.emit('ice_candidate', {
          roomId,
          candidate: event.candidate,
          targetUserId: remoteUserId
        })
      }
    }

    return pc
  }, [roomId, remoteUserId])

  const startLocalMedia = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
      audio: true
    })
    localStreamRef.current = stream
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream
    }
    stream.getTracks().forEach((track) => {
      peerRef.current?.addTrack(track, stream)
    })
    return stream
  }

  const createOffer = async () => {
    const pc = peerRef.current
    if (!pc) return
    const offer = await pc.createOffer()
    await pc.setLocalDescription(offer)
    getSocket().emit('video_offer', {
      roomId,
      offer,
      targetUserId: remoteUserId
    })
  }

  useEffect(() => {
    let mounted = true

    const init = async () => {
      try {
        await bookingApi.startVideoCall(bookingId)
        const socket = getSocket()
        setupPeer()
        await startLocalMedia()

        socket.emit('join_booking_call', { bookingId })
        socket.emit('join_video_room', { roomId })

        socket.on('user_joined_call', async (data: { userId: string }) => {
          if (data.userId !== user?._id && mounted) {
            setConnected(true)
            await createOffer()
          }
        })

        socket.on('video_offer', async (data: { offer: RTCSessionDescriptionInit; senderId: string }) => {
          if (data.senderId === user?._id) return
          const pc = peerRef.current
          if (!pc) return
          await pc.setRemoteDescription(new RTCSessionDescription(data.offer))
          const answer = await pc.createAnswer()
          await pc.setLocalDescription(answer)
          socket.emit('video_answer', {
            roomId,
            answer,
            targetUserId: data.senderId
          })
          setConnected(true)
        })

        socket.on('video_answer', async (data: { answer: RTCSessionDescriptionInit }) => {
          const pc = peerRef.current
          if (!pc) return
          await pc.setRemoteDescription(new RTCSessionDescription(data.answer))
          setConnected(true)
        })

        socket.on('ice_candidate', async (data: { candidate: RTCIceCandidateInit }) => {
          try {
            await peerRef.current?.addIceCandidate(new RTCIceCandidate(data.candidate))
          } catch {
            /* ignore stale ice */
          }
        })

        socket.on('call_chat_message', (data: { message: CallMessage }) => {
          setMessages((prev) => [...prev, data.message])
          if (!chatOpen) {
            showBrowserNotification('New message', { body: data.message.content })
          }
        })

        socket.on('call_ended', () => {
          toast('Call ended')
          cleanup()
          router.push(user?.role === 'admin' ? '/secure-admin-dashboard' : '/profile')
        })

        socket.on('new_notification', (payload: { notification: { title: string; message: string } }) => {
          showBrowserNotification(payload.notification.title, {
            body: payload.notification.message
          })
        })
      } catch (e) {
        console.error(e)
        toast.error('Could not start video call')
      }
    }

    init()

    return () => {
      mounted = false
      cleanup()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingId])

  const cleanup = () => {
    localStreamRef.current?.getTracks().forEach((t) => t.stop())
    peerRef.current?.close()
    disconnectSocket()
  }

  const endCall = async () => {
    setEnding(true)
    try {
      await bookingApi.endVideoCall(bookingId)
      getSocket().emit('end_call', { roomId, bookingId })
      cleanup()
      router.push(user?.role === 'admin' ? '/secure-admin-dashboard' : '/profile')
    } catch {
      toast.error('Failed to end call')
    } finally {
      setEnding(false)
    }
  }

  const sendChat = async (file?: File) => {
    const content = text.trim() || (file ? 'Photo' : '')
    if (!content && !file) return

    try {
      if (file) {
        const res = await messageApi.sendMessage(
          remoteUserId,
          { content: 'Photo', bookingId },
          file
        )
        const m = res.data.data.message
        setMessages((prev) => [
          ...prev,
          {
            _id: m._id,
            sender: {
              _id: user!._id,
              fullName: user!.fullName,
              profileImage: user!.profileImage,
              role: user!.role
            },
            content: m.content,
            messageType: 'image',
            fileUrl: m.fileUrl,
            createdAt: m.createdAt
          }
        ])
      } else {
        getSocket().emit('call_chat_message', {
          bookingId,
          receiverId: remoteUserId,
          content,
          messageType: 'text'
        })
        setMessages((prev) => [
          ...prev,
          {
            _id: Date.now().toString(),
            sender: {
              _id: user!._id,
              fullName: user!.fullName,
              profileImage: user!.profileImage,
              role: user!.role
            },
            content,
            messageType: 'text',
            createdAt: new Date().toISOString()
          }
        ])
      }
      setText('')
    } catch {
      toast.error('Failed to send message')
    }
  }

  const onImagePick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    await sendChat(file)
    e.target.value = ''
  }

  const apiBase = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000'

  return (
    <div className="fixed inset-0 bg-[#0b141a] flex flex-col z-50">
      {/* Remote video — full background (WhatsApp style) */}
      <div className="absolute inset-0">
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />
        {!connected && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0b141a]/90 text-white">
            <Loader2 className="w-12 h-12 animate-spin mb-4 text-[#25d366]" />
            <p className="text-lg">Connecting to {remoteUserName}...</p>
          </div>
        )}
        <div className="absolute top-0 left-0 right-0 flex justify-between items-start z-10 safe-top pt-3 px-3 sm:pt-4 sm:px-4">
          <div className="bg-black/50 backdrop-blur px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-white text-xs sm:text-sm max-w-[85%] truncate">
            {remoteUserName} {connected ? '• Live' : '• Connecting...'}
          </div>
        </div>
      </div>

      {/* Local PiP — hidden when chat open on small screens */}
      <div
        className={`absolute z-20 transition-all duration-300 ${
          chatOpen
            ? 'hidden sm:block sm:bottom-24 sm:right-4 w-28 h-40 sm:w-32 sm:h-44'
            : 'bottom-24 right-4 w-28 h-40 sm:w-36 sm:h-48'
        } rounded-2xl overflow-hidden shadow-2xl border-2 border-white/30`}
      >
        <video
          ref={localVideoRef}
          autoPlay
          muted
          playsInline
          className={`w-full h-full object-cover ${!cameraOn ? 'hidden' : ''}`}
        />
        {!cameraOn && (
          <div className="w-full h-full bg-gray-800 flex items-center justify-center text-white text-xs">
            Camera off
          </div>
        )}
      </div>

      {/* Chat overlay — bottom half */}
      {chatOpen && (
        <div className="absolute inset-x-0 bottom-20 top-1/2 z-30 flex flex-col bg-[#0b141a]/95 backdrop-blur-md border-t border-white/10 rounded-t-3xl">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <span className="text-white font-medium">In-call chat</span>
            <button
              type="button"
              onClick={() => setChatOpen(false)}
              className="p-2 text-white/80 hover:bg-white/10 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {messages.map((m) => {
              const mine = m.sender._id === user?._id
              return (
                <div key={m._id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[85%] rounded-2xl px-3 py-2 ${
                      mine ? 'bg-[#005c4b] text-white' : 'bg-[#202c33] text-white'
                    }`}
                  >
                    {m.messageType === 'image' && m.fileUrl ? (
                      <button type="button" onClick={() => setPreviewImage(m.fileUrl!.startsWith('http') || m.fileUrl!.startsWith('data:') ? m.fileUrl! : `${apiBase}${m.fileUrl}`)}>
                        <img
                          src={m.fileUrl.startsWith('data:') || m.fileUrl.startsWith('http') ? m.fileUrl : `${apiBase}${m.fileUrl}`}
                          alt="shared"
                          className="max-h-40 rounded-lg"
                        />
                      </button>
                    ) : (
                      <p className="text-sm">{m.content}</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
          <div className="p-3 border-t border-white/10 flex gap-2 items-center">
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onImagePick} />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-white/80 hover:bg-white/10 rounded-full"
            >
              <ImagePlus className="w-5 h-5" />
            </button>
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && void sendChat()}
              placeholder="Message..."
              className="flex-1 bg-[#202c33] text-white rounded-full px-4 py-2 text-sm outline-none"
            />
            <button
              type="button"
              onClick={() => void sendChat()}
              className="p-2 bg-[#25d366] text-white rounded-full"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Image preview modal */}
      {previewImage && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute top-4 right-4 text-white p-2"
            onClick={() => setPreviewImage(null)}
          >
            <X className="w-8 h-8" />
          </button>
          <img src={previewImage} alt="preview" className="max-w-full max-h-full object-contain" />
        </div>
      )}

      {/* Controls bar */}
      <div className="absolute bottom-0 left-0 right-0 z-40 bg-gradient-to-t from-black/80 to-transparent px-3 sm:px-4 pt-6 safe-bottom pb-[max(1.25rem,var(--safe-bottom))]">
        <div className="flex items-center justify-center gap-3 sm:gap-6">
          <button
            type="button"
            onClick={() => {
              const t = localStreamRef.current?.getAudioTracks()[0]
              if (t) {
                t.enabled = !t.enabled
                setMicOn(t.enabled)
              }
            }}
            className={`btn-touch p-3.5 sm:p-4 rounded-full ${micOn ? 'bg-white/20 text-white' : 'bg-red-500 text-white'}`}
          >
            {micOn ? <Mic className="w-5 h-5 sm:w-6 sm:h-6" /> : <MicOff className="w-5 h-5 sm:w-6 sm:h-6" />}
          </button>
          <button
            type="button"
            onClick={() => {
              const t = localStreamRef.current?.getVideoTracks()[0]
              if (t) {
                t.enabled = !t.enabled
                setCameraOn(t.enabled)
              }
            }}
            className={`p-4 rounded-full ${cameraOn ? 'bg-white/20 text-white' : 'bg-red-500 text-white'}`}
          >
            {cameraOn ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
          </button>
          <button
            type="button"
            onClick={() => setChatOpen(!chatOpen)}
            className={`p-4 rounded-full ${chatOpen ? 'bg-[#25d366] text-white' : 'bg-white/20 text-white'}`}
          >
            <MessageSquare className="w-6 h-6" />
          </button>
          <button
            type="button"
            onClick={endCall}
            disabled={ending}
            className="p-4 rounded-full bg-red-600 text-white"
          >
            {ending ? <Loader2 className="w-6 h-6 animate-spin" /> : <PhoneOff className="w-6 h-6" />}
          </button>
        </div>
      </div>
    </div>
  )
}
