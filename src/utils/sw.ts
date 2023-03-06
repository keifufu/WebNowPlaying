import { ServiceWorkerMessage } from '../extension/sw'
import { ContentUtils, defaultSettings, Settings } from './settings'

const _sendSwMessage = (message: ServiceWorkerMessage, defaultValue?: any): Promise<any> => new Promise((resolve) => {
  if (!window?.chrome?.runtime?.id) {
    resolve(defaultValue)
    return
  }

  chrome.runtime.sendMessage(message, (response) => {
    resolve(response)
  })
})

// This is the cache for content.ts, so we don't have to send a message to the service worker every time
const reportCache: Record<string, boolean> = {}
export const ServiceWorkerUtils = {
  sendAutomaticReport: (report: { message: string }) => {
    if (!ContentUtils.getSettings().useTelemetry || reportCache[report.message]) return
    reportCache[report.message] = true
    _sendSwMessage({ event: 'sendAutomaticReport', report })
  },
  setOutdated: () => _sendSwMessage({ event: 'setOutdated' }),
  resetOutdated: () => _sendSwMessage({ event: 'resetOutdated' }),
  getGithubVersion: (gh: string) => _sendSwMessage({ event: 'getGithubVersion', gh }),
  getSettings: () => _sendSwMessage({ event: 'getSettings' }, defaultSettings),
  saveSettings: (settings: Settings) => _sendSwMessage({ event: 'saveSettings', settings }),
  setColorScheme: (colorScheme: 'light' | 'dark') => _sendSwMessage({ event: 'setColorScheme', colorScheme })
}