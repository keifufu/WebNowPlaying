import { onMessage } from "./messaging";
import { onPortConnect, reloadSockets } from "./port";
import { setBadge } from "./shared";

chrome.permissions.contains(
  {
    origins: ["*://*/*"],
  },
  (hasPermissions) => {
    if (!hasPermissions) {
      setBadge("!", "Missing permissions. Click to check.");
    }
  },
);

chrome.runtime.onConnect.addListener(onPortConnect);
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  onMessage(message, sendResponse);
  return true;
});
reloadSockets();
