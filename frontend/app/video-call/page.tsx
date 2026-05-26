'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  PhoneOff, 
  MonitorUp,
  MessageSquare,
  Users,
  Copy,
  CheckCircle,
  ArrowLeft,
  Settings
} from 'lucide-react'
import Navbar from '@/components/Navbar'

export default function VideoCallPage() {
  const [hasJoined, setHasJoined] = useState(false)
  const [isCameraOn, setIsCameraOn] = useState(true)
  const [isMicOn, setIsMicOn] = useState(true)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [meetingId, setMeetingId] = useState('')
  const [copied, setCopied] = useState(false)
  const [participants, setParticipants] = useState([
    { id: 1, name: 'Dr. Mahar Kashif', isHost: true, isVideoOn: true }
  ])
  
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    // Generate random meeting ID
    setMeetingId(Math.random().toString(36).substring(2, 15))
  }, [])

  const handleJoinMeeting = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      })
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream
      }
      setHasJoined(true)
    } catch (error) {
      console.error('Error accessing media devices:', error)
      alert('Please allow camera and microphone access to join the meeting')
    }
  }

  const toggleCamera = () => {
    setIsCameraOn(!isCameraOn)
    // Implementation would toggle video track
  }

  const toggleMic = () => {
    setIsMicOn(!isMicOn)
    // Implementation would toggle audio track
  }

  const toggleScreenShare = () => {
    setIsScreenSharing(!isScreenSharing)
    // Implementation would toggle screen sharing
  }

  const leaveMeeting = () => {
    setHasJoined(false)
    // Stop all tracks
    if (localVideoRef.current?.srcObject) {
      const stream = localVideoRef.current.srcObject as MediaStream
      stream.getTracks().forEach(track => track.stop())
    }
  }

  const copyMeetingId = () => {
    navigator.clipboard.writeText(meetingId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!hasJoined) {
    return (
      <>
        <Navbar />
        <div className="page-shell bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
          <div className="page-content-tight">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8 sm:mb-12"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-2xl mb-4 sm:mb-6 shadow-lg shadow-blue-500/25">
                <Video className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              <h1 className="text-2xl sm:text-4xl font-bold text-white mb-2 sm:mb-4">Video Consultation</h1>
              <p className="text-base sm:text-xl text-gray-400">Connect with your doctor face-to-face</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
              {/* Join Meeting */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20"
              >
                <h2 className="text-2xl font-bold text-white mb-6">Join Meeting</h2>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Meeting ID</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter meeting ID"
                      className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-semibold rounded-xl hover:shadow-lg transition-all">
                      Join
                    </button>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/20"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-gray-800 text-gray-400">or</span>
                  </div>
                </div>

                <button
                  onClick={handleJoinMeeting}
                  className="w-full mt-6 py-4 bg-gradient-to-r from-green-500 to-emerald-400 text-white font-semibold rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <Video className="w-5 h-5" />
                  Start New Meeting
                </button>
              </motion.div>

              {/* Meeting Info */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20"
              >
                <h2 className="text-2xl font-bold text-white mb-6">Meeting Details</h2>
                
                <div className="space-y-4">
                  <div className="p-4 bg-white/5 rounded-xl">
                    <p className="text-sm text-gray-400 mb-1">Meeting ID</p>
                    <div className="flex items-center gap-2">
                      <code className="text-xl font-mono text-white">{meetingId}</code>
                      <button
                        onClick={copyMeetingId}
                        className="p-2 text-gray-400 hover:text-white transition-colors"
                      >
                        {copied ? <CheckCircle className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="p-4 bg-white/5 rounded-xl">
                    <p className="text-sm text-gray-400 mb-1">Doctor</p>
                    <p className="text-lg font-semibold text-white">Dr. Mahar Kashif Rasheed</p>
                  </div>

                  <div className="p-4 bg-white/5 rounded-xl">
                    <p className="text-sm text-gray-400 mb-1">Scheduled Time</p>
                    <p className="text-lg font-semibold text-white">Today, 3:00 PM</p>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                  <p className="text-sm text-yellow-400">
                    <strong>Tip:</strong> Make sure you're in a quiet place with good lighting for the best experience.
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <div className="h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={leaveMeeting}
            className="p-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h2 className="text-lg font-semibold text-white">Video Consultation</h2>
            <p className="text-sm text-gray-400">Meeting ID: {meetingId}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowChat(!showChat)}
            className={`p-2 rounded-lg transition-colors ${showChat ? 'bg-blue-500 text-white' : 'text-gray-400 hover:text-white'}`}
          >
            <MessageSquare className="w-5 h-5" />
          </button>
          <button className="p-2 text-gray-400 hover:text-white transition-colors">
            <Users className="w-5 h-5" />
          </button>
          <button className="p-2 text-gray-400 hover:text-white transition-colors">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Video Grid */}
      <div className="flex-1 flex">
        <div className={`flex-1 p-4 ${showChat ? 'hidden lg:block' : ''}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
            {/* Local Video */}
            <div className="relative bg-gray-800 rounded-2xl overflow-hidden">
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                className={`w-full h-full object-cover ${!isCameraOn ? 'hidden' : ''}`}
              />
              {!isCameraOn && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full flex items-center justify-center text-3xl font-bold text-white">
                    You
                  </div>
                </div>
              )}
              <div className="absolute bottom-4 left-4 px-3 py-1 bg-black/50 rounded-full text-white text-sm">
                You {!isMicOn && '(Muted)'}
              </div>
            </div>

            {/* Remote Video */}
            <div className="relative bg-gray-800 rounded-2xl overflow-hidden">
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                <div className="text-center">
                  <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full flex items-center justify-center text-4xl font-bold text-white mx-auto mb-4">
                    D
                  </div>
                  <p className="text-white font-semibold">Dr. Mahar Kashif</p>
                  <p className="text-gray-400 text-sm">Connecting...</p>
                </div>
              </div>
              <div className="absolute bottom-4 left-4 px-3 py-1 bg-black/50 rounded-full text-white text-sm">
                Dr. Mahar Kashif
              </div>
            </div>
          </div>
        </div>

        {/* Chat Sidebar */}
        {showChat && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full lg:w-80 bg-gray-800 border-l border-gray-700 flex flex-col"
          >
            <div className="p-4 border-b border-gray-700">
              <h3 className="font-semibold text-white">Chat</h3>
            </div>
            <div className="flex-1 p-4 overflow-y-auto">
              <div className="space-y-4">
                <div className="flex justify-center">
                  <span className="text-xs text-gray-500">Today, 3:00 PM</span>
                </div>
                <div className="flex gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    D
                  </div>
                  <div className="bg-gray-700 rounded-2xl rounded-tl-none px-4 py-2 max-w-[80%]">
                    <p className="text-white text-sm">Hello! How are you feeling today?</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-gray-700">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <button className="p-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors">
                  <MessageSquare className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Controls */}
      <div className="bg-gray-800 border-t border-gray-700 p-4">
        <div className="flex items-center justify-center gap-4">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleMic}
            className={`p-4 rounded-full transition-colors ${
              isMicOn 
                ? 'bg-gray-700 text-white hover:bg-gray-600' 
                : 'bg-red-500 text-white hover:bg-red-600'
            }`}
          >
            {isMicOn ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleCamera}
            className={`p-4 rounded-full transition-colors ${
              isCameraOn 
                ? 'bg-gray-700 text-white hover:bg-gray-600' 
                : 'bg-red-500 text-white hover:bg-red-600'
            }`}
          >
            {isCameraOn ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleScreenShare}
            className={`p-4 rounded-full transition-colors ${
              isScreenSharing 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-700 text-white hover:bg-gray-600'
            }`}
          >
            <MonitorUp className="w-6 h-6" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={leaveMeeting}
            className="p-4 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
          >
            <PhoneOff className="w-6 h-6" />
          </motion.button>
        </div>
      </div>
    </div>
  )
}