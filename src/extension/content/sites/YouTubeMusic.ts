import { convertTimeToSeconds, getMediaSessionCover } from "../../../utils/misc";
import { DEFAULT_UPDATE_FREQUENCY } from "../../../utils/settings";
import { RatingSystem, RepeatMode, Site, StateMode } from "../../types";
import { querySelector, querySelectorEventReport, querySelectorReport } from "../selectors";
import { ContentUtils, ratingUtils } from "../utils";

let currentVolume = 100;

const site: Site = {
  match: () => window.location.hostname === "music.youtube.com",
  init: () => {
    setInterval(async () => {
      currentVolume = (await ContentUtils.getYouTubeMusicVolume()) ?? 100;
    }, DEFAULT_UPDATE_FREQUENCY / 2);
  },
  ready: () => navigator.mediaSession.metadata !== null && querySelector<boolean, HTMLElement>("video", () => true, false),
  ratingSystem: RatingSystem.LIKE_DISLIKE,
  info: {
    playerName: () => "YouTube Music",
    state: () =>
      querySelectorReport<StateMode, HTMLVideoElement>(
        "video",
        (el) => (el.paused ? StateMode.PAUSED : StateMode.PLAYING),
        StateMode.PAUSED,
        "state"
      ),
    title: () => navigator.mediaSession.metadata?.title || "",
    artist: () => navigator.mediaSession.metadata?.artist || "",
    album: () => navigator.mediaSession.metadata?.album || "",
    coverUrl: () =>
      // This won't return the highest quality cover, but it's good enough for now.
      // Check the git history for how we used to do it. I changed it back to this
      // because the cover would flicker and I couldn't be bothered to fix it :3
      getMediaSessionCover().split("?")[0].replace("vi_webp", "vi"),
    durationSeconds: () =>
      querySelectorReport<number, HTMLElement>(
        ".time-info.ytmusic-player-bar",
        (el) => convertTimeToSeconds(el.innerText.split(" / ")[1] ?? "0:00"),
        0,
        "durationSeconds"
      ),
    positionSeconds: () =>
      querySelectorReport<number, HTMLElement>(
        ".time-info.ytmusic-player-bar",
        (el) => convertTimeToSeconds(el.innerText.split(" / ")[0] ?? "0:00"),
        0,
        "positionSeconds"
      ),
    volume: () => querySelectorReport<number, HTMLVideoElement>("video", (el) => (el.muted ? 0 : currentVolume), currentVolume, "volume"),
    rating: () => {
      const likeButtonPressed = querySelectorReport<boolean, HTMLButtonElement>(
        "(.middle-controls-buttons yt-button-shape)[1]",
        (el) => el.getAttribute("aria-pressed") === "true",
        false,
        "rating"
      );
      if (likeButtonPressed) return 5;
      const dislikeButtonPressed = querySelectorReport<boolean, HTMLButtonElement>(
        ".middle-controls-buttons yt-button-shape",
        (el) => el.getAttribute("aria-pressed") === "true",
        false,
        "rating"
      );
      if (dislikeButtonPressed) return 1;
      return 0;
    },
    repeatMode: () =>
      querySelectorReport<RepeatMode, HTMLElement>(
        "ytmusic-player-bar",
        (el) => {
          const repeatMode = el.getAttribute("repeat-mode_");
          if (repeatMode === "ALL") return RepeatMode.ALL;
          if (repeatMode === "ONE") return RepeatMode.ONE;
          return RepeatMode.NONE;
        },
        RepeatMode.NONE,
        "repeatMode"
      ),
    // YouTube music doesn't do shuffling the traditional way, it just shuffles the current queue with no way of undoing it
    shuffleActive: () => false,
  },
  // Seems the skip buttons are never disabled
  canSkipPrevious: () => true,
  canSkipNext: () => true,
  events: {
    setState: (state) => {
      if (site.info.state() === state) return;
      querySelectorEventReport<HTMLButtonElement>("#play-pause-button", (el) => el.click(), "setState");
    },
    skipPrevious: () => querySelectorEventReport<HTMLButtonElement>(".previous-button", (el) => el.click(), "skipPrevious"),
    skipNext: () => querySelectorEventReport<HTMLButtonElement>(".next-button", (el) => el.click(), "skipNext"),
    setPositionSeconds: null,
    setPositionPercentage: (positionPercentage: number) => {
      querySelectorEventReport<HTMLElement>(
        "#progress-bar tp-yt-paper-progress",
        (el) => {
          const loc = el.getBoundingClientRect();
          const position = positionPercentage * loc.width;

          el.dispatchEvent(
            new MouseEvent("mousedown", {
              view: window,
              bubbles: true,
              cancelable: true,
              clientX: loc.left + position,
              clientY: loc.top + loc.height / 2,
            })
          );
          el.dispatchEvent(
            new MouseEvent("mouseup", {
              view: window,
              bubbles: true,
              cancelable: true,
              clientX: loc.left + position,
              clientY: loc.top + loc.height / 2,
            })
          );
        },
        "setPositionPercentage"
      );
    },
    setVolume: (volume: number) => {
      querySelectorEventReport<HTMLVideoElement>(
        "video",
        (el) => {
          // Can't just set el.muted to false for some reason
          if (el.muted) querySelectorEventReport<HTMLButtonElement>(".volume", (el) => el.click(), "setVolume");
        },
        "setVolume"
      );
      ContentUtils.setYouTubeMusicVolume(volume);
      currentVolume = volume;
    },
    toggleRepeatMode: () => querySelectorEventReport<HTMLButtonElement>(".repeat", (el) => el.click(), "toggleRepeatMode"),
    toggleShuffleActive: () => querySelectorEventReport<HTMLButtonElement>(".shuffle", (el) => el.click(), "toggleShuffleActive"),
    setRating: (rating: number) => {
      ratingUtils.likeDislike(rating, site, {
        toggleLike: () => {
          querySelectorEventReport<HTMLButtonElement>("(.middle-controls-buttons button)[1]", (el) => el.click(), "setRating");
        },
        toggleDislike: () => {
          querySelectorEventReport<HTMLButtonElement>(".middle-controls-buttons button", (el) => el.click(), "setRating");
        },
      });
    },
  },
};

export default site;
