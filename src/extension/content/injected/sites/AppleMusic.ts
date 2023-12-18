import { EventError, RatingSystem, Repeat, Site, StateMode } from "../../../types";
import { createDefaultControls, createSiteInfo, setRepeat } from "../utils";

const getPlayer = () => (window as any).audioPlayer;
const getPlayerThrow = () => {
  const player = getPlayer();
  if (player) return player;
  throw new EventError();
};

const AppleMusic: Site = {
  init: null,
  ready: () => !!navigator.mediaSession.metadata && !!document.querySelector("audio"),
  info: createSiteInfo({
    name: () => "Apple Music",
    title: () => getPlayer()?._nowPlayingItem?.attributes.name ?? "",
    artist: () => getPlayer()?._nowPlayingItem?.attributes.artistName ?? "",
    album: () => getPlayer()?._nowPlayingItem?.attributes.albumName ?? "",
    cover: () => {
      const artwork = getPlayer()?._nowPlayingItem?.container.attributes.artwork;
      if (!artwork) return "";
      // height x height on purpose, width x height sometimes gives ugly borders
      return artwork.url.replace("{w}", artwork.height).replace("{h}", artwork.height);
    },
    state: () => (getPlayer()?._stopped ? StateMode.STOPPED : getPlayer()?._paused ? StateMode.PAUSED : StateMode.PLAYING),
    position: () => getPlayer()?.audio.currentTime ?? 0,
    duration: () => getPlayer()?.audio.duration ?? 0,
    volume: () => getPlayer()?.volume * 100 ?? 100,
    rating: () => 0,
    repeat: () => {
      const repeatButton = document
        .querySelector("amp-chrome-player")
        ?.shadowRoot?.querySelector("apple-music-playback-controls")
        ?.shadowRoot?.querySelector("amp-playback-controls-repeat")
        ?.shadowRoot?.querySelector(".button--repeat");
      return repeatButton?.classList.contains("mode--0") ? Repeat.NONE : repeatButton?.classList.contains("mode--1") ? Repeat.ONE : Repeat.ALL;
    },
    shuffle: () => {
      const shuffleButton = document
        .querySelector("amp-chrome-player")
        ?.shadowRoot?.querySelector("apple-music-playback-controls")
        ?.shadowRoot?.querySelector("amp-playback-controls-shuffle")
        ?.shadowRoot?.querySelector(".button--shuffle");
      return shuffleButton?.classList.contains("shuffled") ?? false;
    },
  }),
  events: {
    setState: (state) => {
      switch (state) {
        case StateMode.STOPPED:
          getPlayerThrow().stop();
          break;
        case StateMode.PAUSED:
          getPlayerThrow().pause();
          break;
        case StateMode.PLAYING:
          getPlayerThrow().play();
          break;
      }
    },
    skipPrevious: () => {
      const button = document
        .querySelector("amp-chrome-player")
        ?.shadowRoot?.querySelector("apple-music-playback-controls")
        ?.shadowRoot?.querySelector('amp-playback-controls-item-skip[class="previous"]')
        ?.shadowRoot?.querySelector<HTMLButtonElement>(".button--previous");
      if (!button) throw new EventError();
      button.click();
    },
    skipNext: () => {
      const button = document
        .querySelector("amp-chrome-player")
        ?.shadowRoot?.querySelector("apple-music-playback-controls")
        ?.shadowRoot?.querySelector('amp-playback-controls-item-skip[class="next"]')
        ?.shadowRoot?.querySelector<HTMLButtonElement>(".button--next");
      if (!button) throw new EventError();
      button.click();
    },
    setPosition: (seconds) => {
      getPlayerThrow().seekToTime(seconds);
    },
    setVolume: (volume) => {
      getPlayerThrow().volume = volume / 100;
    },
    setRating: null,
    setRepeat: (repeat) => {
      const currentRepeat = AppleMusic.info.repeat();
      if (currentRepeat === repeat) return;
      const button = document
        .querySelector("amp-chrome-player")
        ?.shadowRoot?.querySelector("apple-music-playback-controls")
        ?.shadowRoot?.querySelector("amp-playback-controls-repeat")
        ?.shadowRoot?.querySelector<HTMLButtonElement>(".button--repeat");
      if (!button) throw new EventError();

      const repeatMap = {
        [Repeat.NONE]: 0,
        [Repeat.ALL]: 1,
        [Repeat.ONE]: 2,
      };

      setRepeat(button, repeatMap, currentRepeat, repeat);
    },
    setShuffle: (shuffle) => {
      if (AppleMusic.info.shuffle() === shuffle) return;
      const button = document
        .querySelector("amp-chrome-player")
        ?.shadowRoot?.querySelector("apple-music-playback-controls")
        ?.shadowRoot?.querySelector("amp-playback-controls-shuffle")
        ?.shadowRoot?.querySelector<HTMLButtonElement>(".button--shuffle");
      if (!button) throw new EventError();
      button.click();
    },
  },
  controls: () =>
    createDefaultControls(AppleMusic, {
      ratingSystem: RatingSystem.NONE,
      availableRepeat: Repeat.NONE | Repeat.ALL | Repeat.ONE,
    }),
};

export default AppleMusic;
