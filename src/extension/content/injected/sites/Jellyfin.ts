import { getMediaSessionCover } from "../../../../utils/misc";
import { EventError, RatingSystem, Repeat, Site, StateMode } from "../../../types";
import { _throw, createDefaultControls, createSiteInfo, ratingUtils, setRepeat } from "../utils";

const getPlayer = () => document.querySelector("video") ?? document.querySelector("audio[src]");

const Jellyfin: Site = {
  debug: {
    getPlayer,
  },
  init: null,
  ready: () => !!(document.querySelector("video") || document.querySelector("audio[src]")),
  info: createSiteInfo({
    name: () => "Jellyfin",
    title: () => navigator.mediaSession.metadata?.title ?? document.querySelector<HTMLElement>(".pageTitle")?.innerText ?? "",
    artist: () => navigator.mediaSession.metadata?.artist ?? "",
    album: () => navigator.mediaSession.metadata?.album ?? "",
    cover: () => {
      if (getPlayer()?.src?.includes("/Videos/")) {
        const itemId = getPlayer()?.src?.split("/Videos/")[1].split("/")[0].split("?")[0];
        if (itemId) return `${window.location.origin}/Items/${itemId}/Images/Primary`;
      }

      const mediaSessionCover = getMediaSessionCover();
      if (mediaSessionCover) return mediaSessionCover;

      // Not all videos have a poster, so there is still a chance no image is found
      const poster = getPlayer()?.getAttribute("poster");
      if (poster) {
        if (poster.startsWith("http")) return poster;
        else return window.location.origin + poster;
      }

      return "";
    },
    state: () => {
      const player = getPlayer();
      if (!player) return StateMode.STOPPED;
      return player.paused ? StateMode.PAUSED : StateMode.PLAYING;
    },
    position: () => getPlayer()?.currentTime ?? 0,
    duration: () => getPlayer()?.duration ?? 0,
    volume: () => {
      const player = getPlayer();
      if (!player) return 0;
      if (player.muted) return 0;
      return Math.round(player.volume ** (1 / 3) * 100);
    },
    rating: () =>
      document.querySelector(".nowPlayingBarUserDataButtons > button[data-isfavorite]")?.getAttribute("data-isfavorite") === "true" ? 5 : 0,
    repeat: () => {
      const button = document.querySelector(".toggleRepeatButton");
      const span = button?.querySelector("span");
      if (!span) return Repeat.NONE;
      if (span.classList.contains("repeat_one")) return Repeat.ONE;
      if (button?.classList.contains("buttonActive")) return Repeat.ALL;
      return Repeat.NONE;
    },
    shuffle: () => document.querySelector(".btnShuffleQueue")?.classList.contains("buttonActive") ?? false,
  }),
  events: {
    setState: (state) => {
      switch (state) {
        case StateMode.STOPPED:
        case StateMode.PAUSED:
          _throw(getPlayer()?.pause)();
          break;
        case StateMode.PLAYING:
          _throw(getPlayer()?.play)();
          break;
      }
    },
    skipPrevious: () => {
      const button = document.querySelector<HTMLButtonElement>(".btnPreviousTrack");
      if (!button) throw new EventError();
      button.click();
    },
    skipNext: () => {
      const button = document.querySelector<HTMLButtonElement>(".btnNextTrack");
      if (!button) throw new EventError();
      button.click();
    },
    setPosition: (seconds) => (_throw(getPlayer()).currentTime = seconds),
    setVolume: (volume) => {
      const player = _throw(getPlayer());
      player.muted = false;
      player.volume = (volume / 100) ** 3;
    },
    setRating: (rating) => {
      ratingUtils.like(Jellyfin, rating, {
        toggleLike: () => {
          const button = document.querySelector<HTMLButtonElement>(".nowPlayingBarUserDataButtons > button[data-isfavorite]");
          if (!button) throw new EventError();
          button.click();
        },
      });
    },
    setRepeat: (repeat) => {
      const currentRepeat = Jellyfin.info.repeat();
      if (currentRepeat === repeat) return;
      const button = document.querySelector<HTMLButtonElement>(".toggleRepeatButton");
      if (!button) throw new EventError();

      const repeatMap = {
        [Repeat.NONE]: 0,
        [Repeat.ALL]: 1,
        [Repeat.ONE]: 2,
      };

      setRepeat(button, repeatMap, currentRepeat, repeat);
    },
    setShuffle: (shuffle) => {
      if (Jellyfin.info.shuffle() === shuffle) return;
      const button = document.querySelector<HTMLButtonElement>(".");
      if (!button) throw new EventError();
      button.click();
    },
  },
  controls: () =>
    createDefaultControls(Jellyfin, {
      ratingSystem: RatingSystem.LIKE,
      availableRepeat: Repeat.NONE | Repeat.ALL | Repeat.ONE,
    }),
};

export default Jellyfin;
