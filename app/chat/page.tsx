'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Send, 
  Paperclip, 
  Camera, 
  ArrowLeft, 
  Bot, 
  User,
  FileText,
  Image as ImageIcon,
  Loader2
} from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  message_type: 'text' | 'food_photo' | 'analysis_file' | 'water_log'
  created_at: string
  metadata?: any
}

export default function ChatPage() {
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [inputText, setInputText] = useState('')
  const [loading, setLoading] = useState(false)
  const [uploadingFile, setUploadingFile] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadChatHistory()
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const loadChatHistory = async () => {
    try {
      const telegramUser = typeof window !== 'undefined' && window.Telegram?.WebApp ? 
        window.Telegram.WebApp.initDataUnsafe?.user : null
      
      const telegramId = telegramUser?.id || 6103273611 // fallback для тестирования

      const response = await fetch('/api/chat', {
        headers: {
          'x-telegram-user-id': telegramId.toString()
        }
      })

      const result = await response.json()

      if (result.success) {
        setMessages(result.data.messages || [])
      }
    } catch (error) {
      console.error('Ошибка загрузки истории чата:', error)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const sendMessage = async (content: string, messageType: 'text' | 'food_photo' | 'analysis_file' = 'text', file?: File) => {
    if (!content.trim() && !file) return

    setLoading(true)

    try {
      const telegramUser = typeof window !== 'undefined' && window.Telegram?.WebApp ? 
        window.Telegram.WebApp.initDataUnsafe?.user : null
      
      const telegramId = telegramUser?.id || 6103273611

      // Добавляем сообщение пользователя в UI сразу
      const userMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: content,
        message_type: messageType,
        created_at: new Date().toISOString()
      }
      setMessages(prev => [...prev, userMessage])

      const formData = new FormData()
      formData.append('content', content)
      formData.append('message_type', messageType)
      
      if (file) {
        formData.append('file', file)
      }

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'x-telegram-user-id': telegramId.toString()
        },
        body: formData
      })

      const result = await response.json()

      if (result.success) {
        // Добавляем ответ ассистента
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: result.data.response,
          message_type: 'text',
          created_at: new Date().toISOString(),
          metadata: result.data.metadata
        }
        setMessages(prev => [...prev, assistantMessage])
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error('Ошибка отправки сообщения:', error)
      
      // Добавляем сообщение об ошибке
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        role: 'assistant',
        content: 'Извините, произошла ошибка. Попробуйте еще раз.',
        message_type: 'text',
        created_at: new Date().toISOString()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const handleSendText = () => {
    if (inputText.trim()) {
      const messageText = inputText.trim()
      setInputText('') // Очищаем поле ввода сразу
      sendMessage(messageText, 'text')
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploadingFile(true)

    try {
      const fileType = file.type
      let messageType: 'food_photo' | 'analysis_file' = 'analysis_file'
      let content = `Загружен файл: ${file.name}`

      if (fileType.startsWith('image/')) {
        messageType = 'food_photo'
        content = 'Загружено изображение для анализа'
      }

      await sendMessage(content, messageType, file)
    } catch (error) {
      console.error('Ошибка загрузки файла:', error)
    } finally {
      setUploadingFile(false)
      // Сбрасываем input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleCameraPhoto = () => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      window.Telegram.WebApp.HapticFeedback.impactOccurred('medium')
      window.Telegram.WebApp.showAlert('Функция камеры скоро будет доступна! 📸')
    } else {
      alert('Функция камеры скоро будет доступна! 📸')
    }
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('ru-RU', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-lime-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-green-200/50 p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-xl hover:bg-green-50 transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-green-600" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-800">ДаЕда AI Coach</h1>
              <p className="text-sm text-gray-500">Ваш персональный помощник</p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <Bot className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Добро пожаловать в чат с ДаЕда!</h2>
            <p className="text-gray-600 max-w-md mx-auto">
              Вы можете писать текстом, отправлять фото еды для анализа, загружать медицинские анализы или задавать любые вопросы о здоровье и питании.
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                message.role === 'user'
                  ? 'bg-green-500 text-white rounded-br-md'
                  : 'bg-white border border-gray-200 text-gray-800 rounded-bl-md'
              }`}>
                <div className="flex items-start gap-2">
                  {message.role === 'assistant' && (
                    <Bot className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  )}
                  
                  <div className="flex-1">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                    
                    {message.metadata && (
                      <div className="mt-2 text-xs opacity-75">
                        {message.metadata.analysis && (
                          <div className="bg-black/10 rounded-lg p-2 mt-2">
                            <p>📊 Анализ завершен</p>
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className={`text-xs mt-1 ${
                      message.role === 'user' ? 'text-green-100' : 'text-gray-500'
                    }`}>
                      {formatTime(message.created_at)}
                    </div>
                  </div>
                  
                  {message.role === 'user' && (
                    <User className="w-5 h-5 text-green-100 mt-0.5 flex-shrink-0" />
                  )}
                </div>
              </div>
            </div>
          ))
        )}
        
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md px-4 py-3 max-w-xs">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-green-600" />
                <div className="flex gap-1">
                  <Loader2 className="w-4 h-4 animate-spin text-green-600" />
                  <span className="text-sm text-gray-600">ДаЕда думает...</span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-green-200/50 p-4">
        <div className="flex items-end gap-3">
          {/* File Upload Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingFile || loading}
            className="p-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors disabled:opacity-50"
          >
            {uploadingFile ? (
              <Loader2 className="w-5 h-5 animate-spin text-gray-600" />
            ) : (
              <Paperclip className="w-5 h-5 text-gray-600" />
            )}
          </button>

          {/* Camera Button */}
          <button
            onClick={handleCameraPhoto}
            disabled={loading}
            className="p-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors disabled:opacity-50"
          >
            <Camera className="w-5 h-5 text-gray-600" />
          </button>

          {/* Text Input */}
          <div className="flex-1 flex items-end gap-2">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSendText()
                }
              }}
              placeholder="Сообщение..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl resize-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              rows={1}
              style={{ minHeight: '48px', maxHeight: '120px' }}
            />
            
            <button
              onClick={handleSendText}
              disabled={!inputText.trim() || loading}
              className="p-3.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white rounded-xl transition-all duration-200 disabled:cursor-not-allowed shadow-lg hover:shadow-xl disabled:shadow-none"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.pdf,.txt,.doc,.docx"
        onChange={handleFileUpload}
        className="hidden"
      />
    </div>
  )
} 