// Типы для Telegram WebApp API
declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        ready(): void
        expand(): void
        close(): void
        MainButton: {
          text: string
          color: string
          textColor: string
          isVisible: boolean
          isActive: boolean
          show(): void
          hide(): void
          enable(): void
          disable(): void
          onClick(callback: () => void): void
          offClick(callback: () => void): void
        }
        BackButton: {
          isVisible: boolean
          show(): void
          hide(): void
          onClick(callback: () => void): void
          offClick(callback: () => void): void
        }
        HapticFeedback: {
          impactOccurred(style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft'): void
          notificationOccurred(type: 'error' | 'success' | 'warning'): void
          selectionChanged(): void
        }
        colorScheme: 'light' | 'dark'
        themeParams: {
          bg_color?: string
          text_color?: string
          hint_color?: string
          link_color?: string
          button_color?: string
          button_text_color?: string
          secondary_bg_color?: string
        }
        isExpanded: boolean
        viewportHeight: number
        viewportStableHeight: number
        initData: string
        initDataUnsafe: {
          query_id?: string
          user?: {
            id: number
            is_bot: boolean
            first_name: string
            last_name?: string
            username?: string
            language_code?: string
            is_premium?: boolean
            photo_url?: string
          }
          receiver?: {
            id: number
            is_bot: boolean
            first_name: string
            last_name?: string
            username?: string
            language_code?: string
            is_premium?: boolean
            photo_url?: string
          }
          chat?: {
            id: number
            type: string
            title?: string
            username?: string
            photo_url?: string
          }
          chat_type?: string
          chat_instance?: string
          start_param?: string
          can_send_after?: number
          auth_date: number
          hash: string
        }
        sendData(data: string): void
        switchInlineQuery(query: string, choose_chat_types?: string[]): void
        openLink(url: string, options?: { try_instant_view?: boolean }): void
        openTelegramLink(url: string): void
        openInvoice(url: string, callback?: (status: string) => void): void
        showPopup(params: {
          title?: string
          message: string
          buttons?: Array<{
            id?: string
            type?: 'default' | 'ok' | 'close' | 'cancel' | 'destructive'
            text: string
          }>
        }, callback?: (buttonId: string) => void): void
        showAlert(message: string, callback?: () => void): void
        showConfirm(message: string, callback?: (confirmed: boolean) => void): void
        showScanQrPopup(params: {
          text?: string
        }, callback?: (text: string) => boolean): void
        closeScanQrPopup(): void
        readTextFromClipboard(callback?: (text: string) => void): void
        requestWriteAccess(callback?: (granted: boolean) => void): void
        requestContact(callback?: (granted: boolean) => void): void
        onEvent(eventType: string, eventHandler: () => void): void
        offEvent(eventType: string, eventHandler: () => void): void
        isVersionAtLeast(version: string): boolean
        platform: string
        version: string
      }
    }
  }
}

export {} 