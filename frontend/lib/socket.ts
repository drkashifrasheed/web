import { io, Socket } from 'socket.io-client'

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000'

let socket: Socket | null = null

export function getSocket(): Socket {
  if (!socket) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true
    })
  }
  return socket
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}

export function reconnectSocket() {
  disconnectSocket()
  return getSocket()
}
