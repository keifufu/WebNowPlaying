import { capitalize } from "../../../utils/misc";
import { defaultSettings } from "../../../utils/settings";
import { ServiceWorkerUtils } from "../../../utils/sw";
import { RatingSystem, Repeat, Site, SiteControls, StateMode } from "../../types";

export function createSiteInfo(info: Site["info"]): Site["info"] {
  const handler: ProxyHandler<any> = {
    get: function (target, prop) {
      const originalFunction = target[prop];

      if (typeof originalFunction === "function") {
        return function (...args: any[]) {
          let result = originalFunction.apply(target, args);

          if (originalFunction.name === "name" && result == "Generic") {
            result = capitalize(window.location.hostname.split(".").slice(-2).join("."));
          }

          if (typeof result === "number") {
            if (isNaN(result)) {
              if (originalFunction.name === "volume") result = 100;
              else result = 0;
            } else {
              result = Math.round(result);
            }
          } else if (typeof result === "string") {
            result = result.trim();
          }

          return result;
        };
      }

      return originalFunction;
    },
  };

  const proxiedInfo = new Proxy(info, handler);
  return proxiedInfo as Site["info"];
}

export const ratingUtils = {
  like: (site: Site, rating: number, { toggleLike }: { toggleLike: () => void }) => {
    const currentRating = site.info.rating();
    if (rating >= 3 && currentRating !== 5) toggleLike();
    else if (rating < 3 && currentRating === 5) toggleLike();
  },
  likeDislike: (site: Site, rating: number, { toggleLike, toggleDislike }: { toggleLike: () => void; toggleDislike: () => void }) => {
    const currentRating = site.info.rating();
    if (rating === 0 && currentRating === 5) return toggleLike();
    else if (rating === 0 && currentRating === 1) return toggleDislike();

    if (rating >= 3 && currentRating !== 5) toggleLike();
    else if (rating < 3 && currentRating !== 1) toggleDislike();
  },
};

export function setRepeat(button: HTMLButtonElement, repeatModeMap: any, currentRepeat: Repeat, targetRepeat: Repeat) {
  const currentModeIndex = repeatModeMap[currentRepeat];
  const targetModeIndex = repeatModeMap[targetRepeat];
  const clickCount = (targetModeIndex - currentModeIndex + 3) % 3;

  let i = 0;
  const clickWithDelay = () => {
    if (i < clickCount) {
      button.click();
      i++;
      setTimeout(clickWithDelay, 100);
    }
  };

  clickWithDelay();
}

// Setting the correct state when the only control available is a button that toggles playing/pausing
export function setStatePlayPauseButton(button: HTMLButtonElement, currentState: StateMode, targetState: StateMode) {
  const paused = currentState === StateMode.PAUSED ?? currentState === StateMode.PLAYING;
  if (paused && (targetState === StateMode.STOPPED ?? targetState === StateMode.PAUSED)) return;
  if (!paused && targetState === StateMode.PLAYING) return;
  button.click();
}

export function notDisabled(el: HTMLButtonElement | null | undefined) {
  if (!el) return false;
  return !el.disabled;
}

let _settings = defaultSettings;
export const InjectedUtils = {
  init: async () => {
    _settings = await ServiceWorkerUtils.getSettings();
  },
  getSettings: () => _settings,
};

export function createDefaultControls(site: Site, overwrite?: Partial<SiteControls>): SiteControls {
  return {
    ratingSystem: RatingSystem.NONE,
    availableRepeat: Repeat.NONE,
    canSetState: !!site.events.setState,
    canSkipPrevious: !!site.events.skipPrevious,
    canSkipNext: !!site.events.skipNext,
    canSetPosition: !!site.events.setPosition,
    canSetVolume: !!site.events.setVolume,
    canSetRating: !!site.events.setRating,
    canSetRepeat: !!site.events.setRepeat,
    canSetShuffle: !!site.events.setShuffle,
    ...overwrite,
  };
}

export function positionSecondsToPercent(site: Site, seconds: number) {
  const duration = site.info.duration();
  if (duration === 0) return 0;
  return seconds / site.info.duration();
}
