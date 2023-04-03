import { ContentUtils } from '../extension/content/utils'
import { ServiceWorkerMessage } from '../extension/sw/messaging'
import { defaultSettings, Settings } from './settings'

const _sendSwMessage = <T>(message: ServiceWorkerMessage, defaultValue?: T): Promise<T> => new Promise((resolve) => {
  if (typeof chrome === 'undefined' || !chrome.runtime?.id) {
    resolve(defaultValue as any)
    return
  }

  chrome.runtime.sendMessage(message, (response) => {
    resolve(response)
  })
})

// This is the cache for content.ts, so we don't have to send a message to the service worker every time
const reportCache = new Map<string, boolean>()
export const ServiceWorkerUtils = {
  sendAutomaticReport: (report: { message: string }) => {
    if (!ContentUtils.getSettings().useTelemetry || reportCache.get(report.message)) return
    reportCache.set(report.message, true)
    _sendSwMessage({ event: 'sendAutomaticReport', report })
  },
  resetOutdated: () => _sendSwMessage({ event: 'resetOutdated' }),
  getSettings: () => _sendSwMessage<Settings>({ event: 'getSettings' }, defaultSettings),
  saveSettings: (settings: Settings) => _sendSwMessage({ event: 'saveSettings', settings }),
  setColorScheme: (colorScheme: 'light' | 'dark') => _sendSwMessage({ event: 'setColorScheme', colorScheme }),
  reloadSockets: () => _sendSwMessage({ event: 'reloadSockets' }),
  getSocketInfo: () => _sendSwMessage<string>({ event: 'getSocketInfo' }),
  connectSocket: (port: number) => _sendSwMessage({ event: 'connectSocket', port }),
  disconnectSocket: (port: number) => _sendSwMessage({ event: 'disconnectSocket', port }),
  getGithubVersion: (gh: string) => _sendSwMessage<string>({ event: 'getGithubVersion', gh }, 'Error')
}