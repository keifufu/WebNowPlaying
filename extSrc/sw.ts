import { defaultSettings, getVersionFromGithub, Settings } from '../shared/utils'

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

export type WsMessage = {
  event: 'sendAutomaticReport' | 'setOutdated' | 'resetOutdated' | 'getGithubVersion' | 'getSettings' | 'saveSettings',
  settings?: Settings,
  gh?: string,
  report?: { message: string }
}


const sendAutomaticReport = async (request: WsMessage, sendResponse: (response?: any) => void) => {
  if (!request.report) return
  if (reportCache[request.report.message]) return
  const settings = await readSettings()
  if (!settings.useTelemetry) return
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
}

const wGetSettings = async (sendResponse: (response?: any) => void) => {
  const settings = await readSettings()
  sendResponse(settings)
}

chrome.runtime.onMessage.addListener((request: WsMessage, sender, sendResponse) => {
  switch (request.event) {
    case 'sendAutomaticReport': {
      sendAutomaticReport(request, sendResponse)
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
      wGetSettings(sendResponse)
      break
    case 'saveSettings':
      if (!request.settings) return
      clearTimeout(saveTimeout)
      saveTimeout = setTimeout(() => {
        chrome.storage.sync.set({ ...request.settings })
      }, 500)
      break
    default:
      break
  }

  /* Return true to keep port open */
  return true
})