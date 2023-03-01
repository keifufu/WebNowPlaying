import { defaultSettings, getExtensionVersion, getVersionFromGithub, Settings } from '../shared/utils'

let saveTimeout: NodeJS.Timeout
let _settings = defaultSettings
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
if (typeof browser === 'undefined') {
  chrome.storage.sync.get({
    ...defaultSettings
  }, (items) => {
    _settings = items as Settings
  })
} else {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  // eslint-disable-next-line no-undef
  browser.storage.sync.get({
    ...defaultSettings
  }).then((items: Settings) => {
    _settings = items
  })
}

const ghCache: Record<string, string> = {}

const reportCache: Record<string, string> = {}

export type WsMessage = {
  event: 'sendAutomaticReport' | 'setOutdated' | 'resetOutdated' | 'getGithubVersion' | 'getSettings' | 'saveSettings',
  settings?: Settings,
  gh?: string,
  report?: { message: string }
}

chrome.runtime.onMessage.addListener((request: WsMessage, sender, sendResponse) => {
  switch (request.event) {
    case 'sendAutomaticReport':
      if (!request.report) return
      if (!_settings.useTelemetry) return
      if (reportCache[request.report.message]) return
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
      sendResponse(_settings)
      break
    case 'saveSettings':
      if (!request.settings) return
      _settings = request.settings
      clearTimeout(saveTimeout)
      saveTimeout = setTimeout(() => {
        chrome.storage.sync.set({ ..._settings })
      }, 500)
      break
    default:
      break
  }

  /* Return true to keep port open */
  return true
})