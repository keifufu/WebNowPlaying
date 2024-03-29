import { getVersionFromGithub } from "../../utils/misc";
import { defaultSettings, Settings } from "../../utils/settings";

// To use a different key for storing, to migrate settings.
// Example: updateFrequency used to be an object, now it's a number
const settingsMap: { [Prop in keyof Partial<Settings>]: string } = {
  // updateFrequencyMs: 'updateFrequencyMs2',
  customAdapters: "customAdapters2",
};

const replaceKeys = (_settings: Settings) => {
  const settings = { ..._settings };
  for (const [_key, _newKey] of Object.entries(settingsMap)) {
    const key = _key as keyof Settings;
    const newKey = _newKey as keyof Settings;
    settings[newKey] = settings[key] as any;
    delete settings[key];
  }
  return settings;
};

const undoReplaceKeys = (_settings: Settings) => {
  const settings = { ..._settings };
  for (const [_newKey, _key] of Object.entries(settingsMap)) {
    const key = _key as keyof Settings;
    const newKey = _newKey as keyof Settings;
    settings[newKey] = settings[key] as any;
    delete settings[key];
  }
  return settings;
};

export const readSettings = (): Promise<Settings> => {
  return new Promise((resolve) => {
    if (typeof browser === "undefined") {
      chrome.storage.local.get(
        {
          ...replaceKeys(defaultSettings),
        },
        (items) => {
          resolve(undoReplaceKeys(items as Settings));
        },
      );
    } else {
      browser.storage.local
        .get({
          ...replaceKeys(defaultSettings),
        })
        .then((items) => {
          resolve(undoReplaceKeys(items as Settings));
        })
        .catch(() => {
          resolve(defaultSettings);
        });
    }
  });
};

export const saveSettings = (settings: Settings) => {
  chrome.storage.local.set({ ...replaceKeys(settings) });
};

const ghCache = new Map<string, string>();
export const getGithubVersion = async (gh: string): Promise<string> => {
  const cachedResult = ghCache.get(gh);
  if (cachedResult) {
    return cachedResult;
  } else {
    const version = await getVersionFromGithub(gh);
    if (version !== "Error") ghCache.set(gh, version);
    return version;
  }
};

export const setBadge = (badgeText: string, title: string) => {
  chrome.action.setBadgeText({ text: badgeText });
  chrome.action.setBadgeBackgroundColor({ color: [255, 0, 0, 255] });
  chrome.action.setTitle({
    title,
  });
};

export const setOutdated = () => {
  setBadge("!", "One of your adapters is oudated. Click to check.");
};
