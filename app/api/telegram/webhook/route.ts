import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

// Webhook для обработки команд Telegram бота
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message } = body

    if (!message || !message.from) {
      return NextResponse.json({ ok: true })
    }

    const telegramId = message.from.id
    const chatId = message.chat.id
    const text = message.text || ''

    // Отправляем ответ с кнопкой Web App
    if (text === '/start' || text === '/app' || text === '/health') {
      await sendWebAppButton(chatId)
    }

    return NextResponse.json({ ok: true })

  } catch (error) {
    console.error('Ошибка webhook:', error)
    return NextResponse.json({ ok: true })
  }
}

// Функция отправки кнопки Web App
async function sendWebAppButton(chatId: number) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN
  
  if (!botToken) {
    console.error('TELEGRAM_BOT_TOKEN не найден')
    return
  }

  const webAppUrl = process.env.NEXTAUTH_URL || 'https://your-app.railway.app'
  
  const keyboard = {
    inline_keyboard: [
      [
        {
          text: "🏃‍♀️ Открыть ДаЕда Health Coach",
          web_app: { url: webAppUrl }
        }
      ],
      [
        {
          text: "📊 Мой дашборд",
          web_app: { url: `${webAppUrl}?page=dashboard` }
        },
        {
          text: "🍎 Добавить еду", 
          web_app: { url: `${webAppUrl}?action=add_food` }
        }
      ],
      [
        {
          text: "💧 Выпить воды",
          web_app: { url: `${webAppUrl}?action=add_water` }
        },
        {
          text: "📋 Анализы",
          web_app: { url: `${webAppUrl}?action=health_analysis` }
        }
      ]
    ]
  }

  const message = {
    chat_id: chatId,
    text: `🏃‍♀️ *Добро пожаловать в ДаЕда!*
    
Ваш персональный AI-коуч по здоровью готов помочь:

🍎 *Анализ питания* - фото еды → калории и БЖУ
💧 *Трекинг воды* - контроль водного баланса  
📊 *Дашборд* - прогресс и аналитика
📋 *Анализы* - загрузка медицинских данных
🤖 *AI-советы* - персональные рекомендации

Нажмите кнопку ниже, чтобы открыть приложение! 👇`,
    parse_mode: 'Markdown',
    reply_markup: keyboard
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    })

    if (!response.ok) {
      console.error('Ошибка отправки сообщения:', await response.text())
    }
  } catch (error) {
    console.error('Ошибка API Telegram:', error)
  }
}

// Webhook для получения информации о боте
export async function GET() {
  const botToken = process.env.TELEGRAM_BOT_TOKEN
  
  if (!botToken) {
    return NextResponse.json({ error: 'Bot token не найден' }, { status: 500 })
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/getMe`)
    const botInfo = await response.json()
    
    return NextResponse.json({
      success: true,
      bot: botInfo.result,
      webhook_url: `${process.env.NEXTAUTH_URL || 'https://your-app.railway.app'}/api/telegram/webhook`
    })
  } catch (error) {
    return NextResponse.json({ error: 'Ошибка получения информации о боте' }, { status: 500 })
  }
} 