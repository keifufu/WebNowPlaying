import { MessageHandler } from './messaging'
import { initPort } from './port'

chrome.runtime.onMessage.addListener(MessageHandler)
initPort()