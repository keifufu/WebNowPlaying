import { EventError, Repeat, Site, StateMode } from "../../../types";
import { createDefaultControls, createSiteInfo } from "../utils";

const Twitch: Site = {
  init: null,
  ready: () => !!document.querySelector("video"),
  info: createSiteInfo({
    name: () => "Twitch",
    title: () => document.querySelector<HTMLElement>('h2[data-a-target="stream-title"]')?.innerText ?? "",
    artist: () => document.querySelector<HTMLElement>("h1.tw-title")?.innerText ?? "",
    album: () =>
      document.querySelector<HTMLElement>('a[data-a-target="stream-game-link"] > span, [data-a-target="video-info-game-boxart-link"] p')?.innerText ??
      "",
    cover: () => document.querySelector<HTMLImageElement>(`img[alt="${Twitch.info.artist()}" i]`)?.src.replace("70x70", "600x600") ?? "",
    state: () => {
      const video = document.querySelector("video");
      if (!video) return StateMode.STOPPED;
      return video.paused ? StateMode.PAUSED : StateMode.PLAYING;
    },
    position: () => {
      const video = document.querySelector("video");
      if (!video) return 0;
      if (video.duration !== 1073741824) return video.currentTime;
      const el = document.querySelector<HTMLElement>("span.live-time");
      if (!el) return 0;
      const duration_read = el.innerText.split(":");
      duration_read.reverse();
      let duration = 0;
      for (let i = duration_read.length - 1; i >= 0; i--) duration += Number(duration_read[i]) * 60 ** i;
      return duration;
    },
    duration: () => {
      const video = document.querySelector("video");
      if (!video) return 0;
      if (video.duration !== 1073741824) return video.duration;
      const el = document.querySelector<HTMLElement>("span.live-time");
      if (!el) return 0;
      const duration_read = el.innerText.split(":");
      duration_read.reverse();
      let duration = 0;
      for (let i = duration_read.length - 1; i >= 0; i--) duration += Number(duration_read[i]) * 60 ** i;
      return duration;
    },
    volume: () => {
      const video = document.querySelector("video");
      if (!video || video?.muted) return 0;
      return video.volume * 100;
    },
    // Rating could be following, but extensions like 7tv, ffz, bttv fuck it up so I can't get it consistently
    rating: () => 0,
    repeat: () => Repeat.NONE,
    shuffle: () => false,
  }),
  events: {
    setState: (state) => {
      const video = document.querySelector("video");
      if (!video) throw new EventError();
      switch (state) {
        case StateMode.STOPPED:
        case StateMode.PAUSED:
          video.pause();
          break;
        case StateMode.PLAYING:
          video.play();
          break;
      }
    },
    skipPrevious: () => {
      const video = document.querySelector("video");
      if (!video) throw new EventError();
      if (video.duration !== 1073741824) throw new EventError();
      video.currentTime = 0;
    },
    skipNext: () => {
      const video = document.querySelector("video");
      if (!video) throw new EventError();
      if (video.duration !== 1073741824) throw new EventError();
      video.currentTime = video.duration;
    },
    setPosition: (seconds) => {
      const video = document.querySelector("video");
      if (!video) throw new EventError();
      if (video.duration !== 1073741824) throw new EventError();
      video.currentTime = seconds;
    },
    setVolume: (volume) => {
      const video = document.querySelector("video");
      if (!video) throw new EventError();
      video.muted = false;
      video.volume = volume / 100;
      // Code below doesn't work anymore, it used to actually update the slider
      // For now, setting the volume at all is better than not.
      // Advantages of actually updating the slider:
      // - Volume is maintained after switching to a new channel
      // - Volume is correctly shown to the user

      // const slider = document.querySelector<HTMLInputElement>('[id^="player-volume-slider"]');
      // if (!slider) throw new EventError();
      // slider.value = (volume / 100).toString();
      // slider.dispatchEvent(new Event("input", { bubbles: true }));
    },
    setRating: null,
    setRepeat: null,
    setShuffle: null,
  },
  controls: () =>
    createDefaultControls(Twitch, {
      availableRepeat: Repeat.NONE | Repeat.ONE,
      canSkipPrevious: !document.querySelector("video"),
      canSkipNext: !!document.querySelector("video"),
    }),
};

export default Twitch;
