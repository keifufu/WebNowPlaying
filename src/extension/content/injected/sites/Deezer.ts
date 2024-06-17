import { EventError, RatingSystem, Repeat, Site, StateMode } from "../../../types";
import { _throw, createDefaultControls, createSiteInfo, positionSecondsToPercent, ratingUtils } from "../utils";

const getPlayer = () => (window as any).dzPlayer;

const Deezer: Site = {
  debug: {
    getPlayer,
  },
  init: null,
  ready: () => !!navigator.mediaSession.metadata && !!document.querySelector(".track-link"),
  info: createSiteInfo({
    name: () => "Deezer",
    title: () => getPlayer()?.getSongTitle() ?? "",
    artist: () => getPlayer()?.getArtistName() ?? "",
    album: () => getPlayer()?.getAlbumTitle() ?? "",
    cover: () => {
      const id = getPlayer()?.getCover();
      if (id) return `https://e-cdns-images.dzcdn.net/images/cover/${id}/512x512-000000-80-0-0.jpg`;
      return "";
    },
    state: () => (getPlayer()?.playing ? StateMode.PLAYING : getPlayer()?.paused ? StateMode.PAUSED : StateMode.STOPPED),
    position: () => getPlayer()?.position ?? 0,
    duration: () => getPlayer()?.duration ?? 0,
    volume: () => (getPlayer()?.muted ? 0 : getPlayer()?.volume * 100 ?? 100),
    rating: () => {
      const svg = document.querySelectorAll(".track-actions svg")[2];
      if (svg && svg.getAttribute("data-testid") === "HeartIcon") return 5;
      return 0;
    },
    repeat: () => (getPlayer()?.repeat === 2 ? Repeat.ONE : getPlayer()?.repeat === 1 ? Repeat.ALL : Repeat.NONE),
    shuffle: () => getPlayer()?.shuffle ?? false,
  }),
  events: {
    setState: (state) => {
      switch (state) {
        case StateMode.STOPPED:
          _throw(getPlayer()?.control?.stop)();
          break;
        case StateMode.PAUSED:
          _throw(getPlayer()?.control?.pause)();
          break;
        case StateMode.PLAYING:
          _throw(getPlayer()?.control?.play)();
          break;
      }
    },
    skipPrevious: () => _throw(getPlayer()?.control?.prevSong)(),
    skipNext: () => _throw(getPlayer()?.control?.nextSong)(),
    setPosition: (seconds) => {
      const percent = positionSecondsToPercent(Deezer, seconds);
      if (!_throw(getPlayer()?.control?.canSeek)()) throw new EventError();
      _throw(getPlayer()?.control?.seek)(percent);
    },
    setVolume: (volume) => _throw(getPlayer()?.control?.setVolume)(volume / 100),
    setRating: (rating) => {
      ratingUtils.like(Deezer, rating, {
        toggleLike: () => {
          const button = document.querySelectorAll<HTMLButtonElement>(".track-actions button")[2];
          if (!button) throw new EventError();
          button.click();
        },
      });
    },
    setRepeat: (repeat) => {
      const repeatMap = {
        [Repeat.NONE]: 0,
        [Repeat.ALL]: 1,
        [Repeat.ONE]: 2,
      };

      _throw(getPlayer()?.control?.setRepeat)(repeatMap[repeat]);
    },
    setShuffle: (shuffle) => _throw(getPlayer()?.control?.setShuffle)(shuffle),
  },
  controls: () =>
    createDefaultControls(Deezer, {
      ratingSystem: RatingSystem.LIKE,
      availableRepeat: Repeat.NONE | Repeat.ALL | Repeat.ONE,
      canSkipPrevious: !document.querySelectorAll<HTMLButtonElement>(".player-controls button")[0]?.disabled,
      canSkipNext: !document.querySelectorAll<HTMLButtonElement>(".player-controls button")[2]?.disabled,
    }),
};

export default Deezer;
