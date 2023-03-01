import { defaultSettings, getVersionFromGithub, Settings } from '../shared/utils'

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

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.event) {
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
          if (version !== 'Error') ghCache[request.gh] = version
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