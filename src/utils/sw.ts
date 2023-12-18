import { ServiceWorkerMessage } from "../extension/sw/messaging";
import { EventResult } from "../extension/types";
import { defaultSettings, Settings } from "./settings";

function _sendSwMessage<T>(message: ServiceWorkerMessage, defaultValue?: T): Promise<T> {
  return new Promise((resolve) => {
    if (typeof chrome === "undefined" || !chrome.runtime?.id) {
      resolve(defaultValue as T);
      return;
    }

    chrome.runtime.sendMessage(message, (response) => {
      resolve(response);
    });
  });
}

export const ServiceWorkerUtils = {
  resetOutdated: () => _sendSwMessage({ event: "resetOutdated" }),
  getSettings: () => _sendSwMessage<Settings>({ event: "getSettings" }, defaultSettings),
  saveSettings: (settings: Settings) => _sendSwMessage({ event: "saveSettings", settings }),
  setColorScheme: (colorScheme: "light" | "dark") => _sendSwMessage({ event: "setColorScheme", colorScheme }),
  reloadSockets: () => _sendSwMessage({ event: "reloadSockets" }),
  getSocketInfo: () => _sendSwMessage<string>({ event: "getSocketInfo" }),
  connectSocket: (port: number) => _sendSwMessage({ event: "connectSocket", port }),
  disconnectSocket: (port: number) => _sendSwMessage({ event: "disconnectSocket", port }),
  getGithubVersion: (gh: string) => _sendSwMessage<string>({ event: "getGithubVersion", gh }, "Error"),
  sendEventResult: (eventSocketPort: number, eventId: string, eventResult: EventResult) =>
    _sendSwMessage({ event: "sendEventResult", eventSocketPort, eventId, eventResult: eventResult }),
  getPortId: () => _sendSwMessage<number>({ event: "getPortId" }),
};
