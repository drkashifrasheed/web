'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, 
  Send, 
  Phone, 
  Video, 
  MoreVertical,
  Smile,
  Paperclip,
  Check,
  CheckCheck,
  ArrowLeft,
  Image as ImageIcon,
  FileText
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { messageApi } from '@/lib/api'
import { Message, User } from '@/types'
import Navbar from '@/components/Navbar'
import { formatDistanceToNow } from 'date-fns'

interface Conversation {
  partner: User
  lastMessage: Message
  unreadCount: number
}

export default function ChatPage() {
  const { user } = useAuthStore()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadConversations()
  }, [])

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.partner._id)
    }
  }, [selectedConversation])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const loadConversations = async () => {
    try {
      const response = await messageApi.getConversations()
      setConversations(response.data.data.conversations)
    } catch (error) {
      console.error('Error loading conversations:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadMessages = async (userId: string) => {
    try {
      const response = await messageApi.getMessages(userId)
      setMessages(response.data.data.messages)
    } catch (error) {
      console.error('Error loading messages:', error)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedConversation) return

    try {
      const response = await messageApi.sendMessage(selectedConversation.partner._id, {
        content: newMessage
      })
      setMessages(prev => [...prev, response.data.data.message])
      setNewMessage('')
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  const filteredConversations = conversations.filter(conv => 
    conv.partner.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <>
      <Navbar />
      <div className="page-shell bg-gray-50">
        <div className="page-content !px-0 sm:!px-6 lg:!px-8 !pb-0 sm:!pb-4 max-w-7xl">
          <div className="bg-white sm:rounded-2xl shadow-lg overflow-hidden flex h-[calc(100dvh-var(--nav-height)-var(--safe-top)-0.5rem)] sm:h-[calc(100dvh-var(--nav-height-sm)-2rem)]">
            {/* Conversations Sidebar */}
            <div className={`w-full md:w-80 lg:w-96 border-r border-gray-200 flex flex-col min-h-0 ${selectedConversation ? 'hidden md:flex' : 'flex'}`}>
              {/* Header */}
              <div className="p-3 sm:p-4 border-b border-gray-200 flex-shrink-0">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">Messages</h2>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search conversations..."
                    className="input-mobile pl-10"
                  />
                </div>
              </div>

              {/* Conversations List */}
              <div className="flex-1 overflow-y-auto">
                {isLoading ? (
                  <div className="p-4 space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex items-center gap-3 animate-pulse">
                        <div className="w-12 h-12 bg-gray-200 rounded-full" />
                        <div className="flex-1">
                          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                          <div className="h-3 bg-gray-200 rounded w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : filteredConversations.length === 0 ? (
                  <div className="p-8 text-center">
                    <p className="text-gray-500">No conversations yet</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {filteredConversations.map((conversation) => (
                      <motion.button
                        key={conversation.partner._id}
                        onClick={() => setSelectedConversation(conversation)}
                        whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.05)' }}
                        className={`w-full p-4 flex items-center gap-3 transition-colors ${
                          selectedConversation?.partner._id === conversation.partner._id
                            ? 'bg-blue-50'
                            : ''
                        }`}
                      >
                        <div className="relative">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full flex items-center justify-center text-white font-semibold">
                            {conversation.partner.fullName.charAt(0)}
                          </div>
                          {conversation.partner.isOnline && (
                            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                          )}
                        </div>
                        <div className="flex-1 text-left">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-gray-900">{conversation.partner.fullName}</h3>
                            <span className="text-xs text-gray-500">
                              {formatDistanceToNow(new Date(conversation.lastMessage.createdAt), { addSuffix: true })}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 truncate">{conversation.lastMessage.content}</p>
                        </div>
                        {conversation.unreadCount > 0 && (
                          <span className="w-5 h-5 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center">
                            {conversation.unreadCount}
                          </span>
                        )}
                      </motion.button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Chat Area */}
            <div className={`flex-1 flex flex-col min-h-0 min-w-0 ${selectedConversation ? 'flex' : 'hidden md:flex'}`}>
              {selectedConversation ? (
                <>
                  {/* Chat Header */}
                  <div className="p-3 sm:p-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0 safe-top">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                      <button
                        type="button"
                        onClick={() => setSelectedConversation(null)}
                        className="md:hidden btn-touch p-2 text-gray-600 hover:bg-gray-100 rounded-lg flex-shrink-0"
                      >
                        <ArrowLeft className="w-5 h-5" />
                      </button>
                      <div className="relative">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full flex items-center justify-center text-white font-semibold">
                          {selectedConversation.partner.fullName.charAt(0)}
                        </div>
                        {selectedConversation.partner.isOnline && (
                          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{selectedConversation.partner.fullName}</h3>
                        <p className="text-sm text-gray-500">
                          {selectedConversation.partner.isOnline ? 'Online' : 'Offline'}
                        </p>
                      </div>
                    </div>
                    <div className="hidden sm:flex items-center gap-1 flex-shrink-0">
                      <button type="button" className="btn-touch p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                        <Phone className="w-5 h-5" />
                      </button>
                      <button type="button" className="btn-touch p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                        <Video className="w-5 h-5" />
                      </button>
                      <button type="button" className="btn-touch p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 min-h-0">
                    {messages.map((message, index) => {
                      const isOwn = message.sender === user?._id
                      const showAvatar = index === 0 || messages[index - 1].sender !== message.sender

                      return (
                        <motion.div
                          key={message._id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`flex items-end gap-2 max-w-[85%] sm:max-w-[70%] ${isOwn ? 'flex-row-reverse' : ''}`}>
                            {!isOwn && showAvatar && (
                              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                                {selectedConversation.partner.fullName.charAt(0)}
                              </div>
                            )}
                            {!isOwn && !showAvatar && <div className="w-8" />}
                            <div
                              className={`px-4 py-2 rounded-2xl ${
                                isOwn
                                  ? 'bg-gradient-to-r from-blue-500 to-cyan-400 text-white rounded-br-none'
                                  : 'bg-gray-100 text-gray-900 rounded-bl-none'
                              }`}
                            >
                              <p>{message.content}</p>
                              <div className={`flex items-center gap-1 mt-1 ${isOwn ? 'text-blue-100' : 'text-gray-400'}`}>
                                <span className="text-xs">
                                  {formatDistanceToNow(new Date(message.createdAt), { addSuffix: false })}
                                </span>
                                {isOwn && (
                                  message.isRead ? <CheckCheck className="w-3 h-3" /> : <Check className="w-3 h-3" />
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )
                    })}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input Area */}
                  <form onSubmit={handleSendMessage} className="p-3 sm:p-4 border-t border-gray-200 flex-shrink-0 safe-bottom bg-white">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <button type="button" className="hidden sm:flex btn-touch p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
                        <Paperclip className="w-5 h-5" />
                      </button>
                      <button type="button" className="hidden sm:flex btn-touch p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
                        <ImageIcon className="w-5 h-5" />
                      </button>
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 min-w-0 input-mobile py-2.5"
                      />
                      <motion.button
                        type="submit"
                        whileTap={{ scale: 0.95 }}
                        disabled={!newMessage.trim()}
                        className="btn-touch p-3 bg-gradient-to-r from-blue-500 to-cyan-400 text-white rounded-xl disabled:opacity-50 flex-shrink-0"
                      >
                        <Send className="w-5 h-5" />
                      </motion.button>
                    </div>
                  </form>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Send className="w-10 h-10 text-blue-500" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Select a conversation</h3>
                    <p className="text-gray-500">Choose a conversation from the sidebar to start chatting</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
