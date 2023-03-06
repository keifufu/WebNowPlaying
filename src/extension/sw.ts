import { getVersionFromGithub } from '../utils/misc'
import { defaultSettings, Settings } from '../utils/settings'

let saveTimeout: NodeJS.Timeout

const readSettings = (): Promise<Settings> => new Promise((resolve) => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  if (typeof browser === 'undefined') {
    chrome.storage.sync.get({
      ...defaultSettings
    }, (items) => {
      resolve(items as Settings)
    })
  } else {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    // eslint-disable-next-line no-undef
    browser.storage.sync.get({
      ...defaultSettings
    }).then((items: Settings) => {
      resolve(items)
    }).catch(() => {
      resolve(defaultSettings)
    })
  }
})

const ghCache: Record<string, string> = {}
const reportCache: Record<string, string> = {}

export type ServiceWorkerMessage = {
  event: 'sendAutomaticReport' | 'setOutdated' | 'resetOutdated' | 'getGithubVersion' | 'getSettings' | 'saveSettings' | 'setColorScheme',
  settings?: Settings,
  gh?: string,
  report?: { message: string },
  colorScheme?: 'light' | 'dark'
}

const handleWsMessage = async (request: ServiceWorkerMessage, sendResponse: (response?: any) => void) => {
  switch (request.event) {
    case 'sendAutomaticReport': {
      // We only send 'sendAutomaticReport' if telemetry is enabled, no need to check here
      if (!request.report || reportCache[request.report.message]) return
      reportCache[request.report.message] = request.report.message
      fetch('https://keifufu.dev/report', {
        method: 'POST',
        body: JSON.stringify({
          type: 'automatic',
          extVersion: chrome.runtime.getManifest().version,
          message: request.report.message
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      })
      break
    }
    case 'setOutdated':
      // TODO: enable this again once spicetify is updated
      // chrome.action.setBadgeText({ text: '!' })
      // chrome.action.setBadgeBackgroundColor({ color: [255, 0, 0, 255] })
      // chrome.action.setTitle({ title: 'One of the adapters is outdated. Click to check.' })
      break
    case 'resetOutdated':
      chrome.action.setBadgeText({ text: '' })
      chrome.action.setTitle({ title: '' })
      break
    case 'getGithubVersion':
      if (!request.gh) return
      if (ghCache[request.gh]) {
        sendResponse(ghCache[request.gh])
      } else {
        getVersionFromGithub(request.gh).then((version) => {
          if (version !== 'Error') ghCache[request.gh as string] = version
          sendResponse(version)
        })
      }
      break
    case 'getSettings':
      sendResponse(await readSettings())
      break
    case 'saveSettings':
      if (!request.settings) return
      clearTimeout(saveTimeout)
      saveTimeout = setTimeout(() => {
        chrome.storage.sync.set({ ...request.settings })
      }, 500)
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
    default:
      break
  }
}

chrome.runtime.onMessage.addListener((request: ServiceWorkerMessage, sender, sendResponse) => {
  handleWsMessage(request, sendResponse)

  /* Return true to keep port open */
  return true
})