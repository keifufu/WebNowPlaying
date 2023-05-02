import { getExtensionVersion, getVersionFromGithub, isDeveloperMode } from '../../utils/misc'
import { Settings } from '../../utils/settings'
import { connectSocket, disconnectSocket, getSocketInfo, reloadSockets, updateSettings } from './port'
import { readSettings, saveSettings } from './shared'

export type ServiceWorkerMessage = {
  event: 'sendAutomaticReport' | 'resetOutdated' | 'getSettings' | 'saveSettings' | 'setColorScheme' | 'reloadSockets' | 'getSocketInfo' | 'connectSocket' | 'disconnectSocket' | 'getGithubVersion',
  settings?: Settings,
  report?: { message: string },
  colorScheme?: 'light' | 'dark',
  port?: number
  gh?: string,
  useNativeAPIs?: boolean
}

const reportCache = new Map<string, boolean>()
const ghCache = new Map<string, string>()
export const MessageHandler = async (request: ServiceWorkerMessage, sendResponse: (response?: any) => void) => {
  switch (request.event) {
    case 'sendAutomaticReport': {
      // We only send 'sendAutomaticReport' if telemetry is enabled, no need to check here
      const isDev = await isDeveloperMode()
      if (isDev || !request.report || reportCache.get(request.report.message)) return
      reportCache.set(request.report.message, true)
      fetch('https://keifufu.dev/report', {
        method: 'POST',
        body: JSON.stringify({
          type: 'automatic',
          extVersion: getExtensionVersion(),
          message: request.report.message
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      })
      break
    }
    case 'resetOutdated':
      chrome.action.setBadgeText({ text: '' })
      chrome.action.setTitle({ title: '' })
      break
    case 'getSettings':
      sendResponse(await readSettings())
      break
    case 'saveSettings':
      if (!request.settings) return
      saveSettings(request.settings)
      updateSettings()
      break
    case 'setColorScheme':
      if (!request.colorScheme) return
      chrome.action.setIcon({
        path: request.colorScheme === 'light' ? {
          128: 'icons/icon-lightmode-128.png',
          256: 'icons/icon-lightmode-256.png'
        } : {
          128: 'icons/icon-darkmode-128.png',
          256: 'icons/icon-darkmode-256.png'
        }
      })
      break
    case 'reloadSockets':
      await reloadSockets()
      break
    case 'getSocketInfo': {
      const socketInfo = getSocketInfo()
      const jsonString = JSON.stringify({ ...socketInfo, states: Array.from(socketInfo.states.entries()) })
      sendResponse(jsonString)
      break
    }
    case 'connectSocket':
      await connectSocket(request.port ?? 0)
      break
    case 'disconnectSocket':
      disconnectSocket(request.port ?? 0)
      break
    case 'getGithubVersion': {
      if (ghCache.has(request.gh ?? ''))
        return sendResponse(ghCache.get(request.gh ?? ''))

      const version = await getVersionFromGithub(request.gh ?? '')
      if (version) {
        ghCache.set(request.gh ?? '', version)
        sendResponse(version)
      }
      sendResponse('Error')
      break
    }
    default:
      break
  }
}