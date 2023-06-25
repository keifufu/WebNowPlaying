/* eslint-disable no-loop-func */
import { capitalize, getMediaSessionCover } from "../../../utils/misc";
import { RatingSystem, RepeatMode, Site, StateMode } from "../../types";
import { ContentUtils } from "../utils";

let updateInterval: NodeJS.Timeout;
let element: HTMLMediaElement;
let artistFromTitle = "";

// Function that sanitizes a title from unicode characters like '◼ ❙❙ ❚❚ ► ▮▮ ▶ ▷ ❘ ❘ ▷' and trim double whitespace
// Website for unicode lookup: https://unicodeplus.com
const sanitizeTitle = (title: string) =>
  title
    .replace(/[\u25A0\u2759\u275A\u25AE\u25AE\u25B6\u25BA\u25B7\u2758\u25FC]/g, "")
    .trim()
    .replace(/\s+/g, " ");

const site: Site = {
  match: () => {
    const settings = ContentUtils.getSettings();
    if (settings.useGeneric) {
      if (settings.useGenericList) {
        if (settings.isListBlocked && settings.genericList.includes(location.hostname)) return false;
        if (!settings.isListBlocked && !settings.genericList.includes(location.hostname)) return false;
      }
      return true;
    }
    return false;
  },
  init: () => {
    console.log(`Initializing generic site: ${location.hostname}`);
    // Setup events on all elements to get when updated (Also called in readyCheck)
    setupElementEvents();
    // This will update which element is selected to display
    updateInterval = setInterval(() => {
      updateCurrentElement();
    }, 1000);
  },
  ready: () => {
    // Most elements will already have events attached but this will add it to any new elements
    setupElementEvents();
    return (element !== undefined && element !== null && element.duration > 0) || navigator.mediaSession.metadata !== null;
  },
  ratingSystem: RatingSystem.NONE,
  info: {
    playerName: () => capitalize(window.location.hostname.split(".").slice(-2).join(".")) as any,
    state: () => {
      if (navigator.mediaSession.playbackState === "playing") return StateMode.PLAYING;
      else if (navigator.mediaSession.playbackState === "paused") return StateMode.PAUSED;
      if (!element) return StateMode.STOPPED;
      if (element.paused) return StateMode.PAUSED;
      else return StateMode.PLAYING;
    },
    title: () => {
      if (navigator.mediaSession.metadata?.title) return navigator.mediaSession.metadata.title;

      let title = "";

      const ogTitle = document.querySelector('meta[property="og:title"]');
      const metaTitle = document.querySelector('meta[name="title"]');
      if (ogTitle !== null && ogTitle.getAttribute("content")) title = ogTitle.getAttribute("content") as string;
      else if (metaTitle !== null && metaTitle.getAttribute("content")) title = metaTitle.getAttribute("content") as string;
      else title = document.title;

      title = sanitizeTitle(title);

      // Try to parse the title to see if it contains the artist info
      // These might sometimes work, but might cause many false positives: | -
      if (title.includes(", by")) {
        const parts = title.split(", by");
        title = parts[0].trim();
        artistFromTitle = parts[1].trim();
      } else if (title.includes("by:")) {
        const parts = title.split("by:");
        title = parts[0].trim();
        artistFromTitle = parts[1].trim();
      }

      return title;
    },
    artist: () => {
      if (navigator.mediaSession.metadata?.artist) return navigator.mediaSession.metadata.artist;

      if (artistFromTitle !== "") return artistFromTitle;

      // Returns 'YouTube' for youtube.com, 'Spotify' for open.spotify.com, etc.
      return capitalize(window.location.hostname.split(".").slice(-2)[0]);
    },
    album: () => {
      if (navigator.mediaSession.metadata?.album) return navigator.mediaSession.metadata.album;

      // I think it's better to return no album if there is no way to get it.
      // The original generic script returned the same as artist above (the site's name)
      return "";
    },
    coverUrl: () => {
      const mediaSessionCover = getMediaSessionCover();
      if (mediaSessionCover) return mediaSessionCover;

      const poster = element?.getAttribute("poster");
      if (poster) {
        if (poster.startsWith("http")) return poster;
        else return window.location.origin + poster;
      }

      const ogImageContent = document.querySelector('meta[property="og:image"]')?.getAttribute("content");
      if (ogImageContent) {
        if (ogImageContent.startsWith("http")) return ogImageContent;
        else return window.location.origin + ogImageContent;
      }

      return "";
    },
    // Sometimes, the duration and position returned can seem weird
    // I noticed that on adultswim, it's because the video is buffering
    // and the duration keeps increasing? Either way, it doesn't seem
    // to be an issue with timeInSecondsToString, and not with
    // element.duration/element.currentTime.
    durationSeconds: () => element?.duration || 0,
    positionSeconds: () => element?.currentTime || 0,
    volume: () => (element?.muted ? 0 : (element?.volume ?? 1) * 100),
    rating: () => 0,
    repeatMode: () => (element?.loop ? RepeatMode.ONE : RepeatMode.NONE),
    shuffleActive: () => false,
  },
  canSkipPrevious: () => !!element,
  canSkipNext: () => !!element,
  events: {
    setState: (state) => {
      if (!element) return;
      state === StateMode.PLAYING ? element.play() : element.pause();
    },
    skipPrevious: () => {
      if (!element) return;
      element.currentTime = 0;
    },
    skipNext: () => {
      if (!element) return;
      element.currentTime = element.duration;
    },
    setPositionSeconds: (positionInSeconds: number) => {
      if (!element) return;
      element.currentTime = positionInSeconds;
    },
    setPositionPercentage: null,
    setVolume: (volume: number) => {
      if (!element) return;
      element.muted = false;
      element.volume = volume / 100;
    },
    toggleRepeatMode: () => {
      if (!element) return;
      element.loop = !element.loop;
    },
    toggleShuffleActive: null,
    setRating: null,
  },
};

window.addEventListener("beforeunload", () => {
  clearInterval(updateInterval);
});

let elements: (HTMLVideoElement | HTMLAudioElement)[] = [];
function updateCurrentElement() {
  if (elements.length > 0) {
    // If currently used element does not exist in array, find a new one
    if (elements.indexOf(element) < 0) {
      const filtered = elements.filter((e) => !e.muted && e.volume > 0);
      if (filtered.length > 0) element = filtered[filtered.length - 1];
    }
  } else if (!element) {
    // Find all audio elements and set element to the first one with any length
    const audios = Array.from(document.getElementsByTagName("audio"));
    for (const audio of audios) {
      if (audio.duration > 0) {
        element = audio;
        break;
      }
    }
    // If no suitable audio element was found, try again with video elements
    if (!element) {
      const videos = Array.from(document.getElementsByTagName("video"));
      for (const video of videos) {
        if (video.duration > 0) {
          element = video;
          break;
        }
      }
    }

    elements = [];
  }
}

function setupElementEvents() {
  for (let i = 0; i < document.getElementsByTagName("audio").length; i++) {
    if (document.getElementsByTagName("audio")[i].ontimeupdate === null) {
      document.getElementsByTagName("audio")[i].ontimeupdate = function () {
        elements.push(this as HTMLAudioElement);
      };
    }
  }

  for (let i = 0; i < document.getElementsByTagName("video").length; i++) {
    if (document.getElementsByTagName("video")[i].ontimeupdate === null) {
      document.getElementsByTagName("video")[i].ontimeupdate = function () {
        elements.push(this as HTMLVideoElement);
      };
    }
  }
}

export default site;
