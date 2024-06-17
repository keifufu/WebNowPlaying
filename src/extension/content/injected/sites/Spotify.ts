import { getMediaSessionCover } from "../../../../utils/misc";
import { RatingSystem, Repeat, Site, StateMode } from "../../../types";
import { _throw, createDefaultControls, createSiteInfo, ratingUtils } from "../utils";

let _Spotify: any = null;
function getSpotify() {
  if (_Spotify !== null) return _Spotify;
  const Spotify: any = {};
  (window as any).registry._map.forEach((value: any, key: any) => {
    (Spotify as any)[key.description] = value.instance;
  });
  if (!Spotify.PlayerAPI || !Spotify.PlaybackAPI || !Spotify.LibraryAPI) return Spotify;
  _Spotify = Spotify;
  return Spotify;
}

const Spotify: Site = {
  debug: {
    getSpotify,
  },
  init: null,
  ready: () => !!getSpotify()?.PlayerAPI?._state,
  info: createSiteInfo({
    name: () => "Spotify",
    title: () => navigator.mediaSession.metadata?.title ?? "",
    artist: () => navigator.mediaSession.metadata?.artist ?? "",
    album: () => navigator.mediaSession.metadata?.album ?? "",
    cover: () => getMediaSessionCover(),
    state: () => (getSpotify()?.PlayerAPI?._state?.isPaused === false ? StateMode.PLAYING : StateMode.PAUSED), // technically never STOPPED, unless not ready()
    position: () => {
      const PlayerAPI = getSpotify()?.PlayerAPI;
      if (!PlayerAPI?._state) return 0;
      if (PlayerAPI._state.isPaused) {
        return Math.floor(PlayerAPI._state.positionAsOfTimestamp / 1000);
      } else {
        return Math.floor((Date.now() - PlayerAPI._state.timestamp + PlayerAPI._state.positionAsOfTimestamp) / 1000);
      }
    },
    duration: () => getSpotify()?.PlayerAPI?._state?.duration ?? 0,
    volume: () => getSpotify()?.PlaybackAPI?._volume ?? 0,
    rating: () => (getSpotify()?.PlayerAPI?._state?.item?.metadata?.["collection.in_collection"] === "true" ? 5 : 0),
    repeat: () => {
      switch (getSpotify()?.PlayerAPI?._state?.repeat) {
        default:
          return Repeat.NONE;
        case 0:
          return Repeat.NONE;
        case 1:
          return Repeat.ALL;
        case 2:
          return Repeat.ONE;
      }
    },
    shuffle: () => getSpotify()?.PlayerAPI?._state?.shuffle ?? false,
  }),
  events: {
    setState: (state) => {
      switch (state) {
        case StateMode.STOPPED:
        case StateMode.PAUSED:
          _throw(getSpotify()?.PlayerAPI?.pause)();
          break;
        case StateMode.PLAYING:
          _throw(getSpotify()?.PlayerAPI?.resume)();
          break;
      }
    },
    skipPrevious: () => _throw(getSpotify()?.PlayerAPI?.skipToPrevious)(),
    skipNext: () => _throw(getSpotify()?.PlayerAPI?.skipToNext)(),
    setPosition: (seconds) => _throw(getSpotify()?.PlayerAPI?.seekTo)(seconds * 1000),
    setVolume: (volume) => _throw(getSpotify()?.PlayerAPI?.setVolume)(volume),
    setRating: (rating) => {
      ratingUtils.like(Spotify, rating, {
        toggleLike: () => {
          const uris = [_throw(getSpotify()?.PlayerAPI?._state?.item?.uri)];
          if (Spotify.info.rating() === 5) _throw(getSpotify()?.LibraryAPI?.add)({ uris });
          else _throw(getSpotify()?.LibraryAPI?.remove)({ uris });
        },
      });
    },
    setRepeat: (repeat) => {
      switch (repeat) {
        case Repeat.NONE:
          _throw(getSpotify()?.PlayerAPI?.setRepeat)(0);
          break;
        case Repeat.ONE:
          _throw(getSpotify()?.PlayerAPI?.setRepeat)(2);
          break;
        case Repeat.ALL:
          _throw(getSpotify()?.PlayerAPI?.setRepeat)(1);
          break;
      }
    },
    setShuffle: (shuffle) => _throw(getSpotify()?.PlayerAPI?.setShuffle)(shuffle),
  },
  controls: () =>
    createDefaultControls(Spotify, {
      ratingSystem: RatingSystem.LIKE,
      availableRepeat: Repeat.NONE | Repeat.ALL | Repeat.ONE,
    }),
};

export default Spotify;
