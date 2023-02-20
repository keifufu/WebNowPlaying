chrome.runtime.onMessage.addListener((request) => {
  if (request.event === 'outdated') {
    chrome.action.setBadgeText({ text: '!' })
    // Red, Green, Blue, Alpha
    chrome.action.setBadgeBackgroundColor({ color: [255, 0, 0, 255] })
    chrome.action.setTitle({ title: 'Connected but plugin is outdated. Click to update' })
  } else if (request.event === 'wsDisconnected') {
    chrome.action.setBadgeText({ text: '!' })
    chrome.action.setTitle({ title: 'Not connected to Rainmeter. Click to troubleshoot' })
  } else if (request.event === 'wsConnected') {
    chrome.action.setBadgeText({ text: '' })
    chrome.action.setTitle({ title: 'Connected and sending info' })
  }
})