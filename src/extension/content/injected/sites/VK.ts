import { Repeat, Site, StateMode } from "../../../types";
import { _throw, createDefaultControls, createSiteInfo } from "../utils";

const getPlayer = () => (window as any)?.getAudioPlayer?.();

function unescape(input: string) {
  return new DOMParser().parseFromString(input, "text/html").querySelector("html")!.textContent!;
}

const VK: Site = {
  debug: {
    getPlayer,
    unescape,
  },
  init: null,
  ready: () => !!getPlayer(),
  info: createSiteInfo({
    name: () => "VK",
    title: () => unescape(getPlayer()?.stats?.currentAudio?.title ?? ""),
    artist: () => unescape(getPlayer()?.stats?.currentAudio?.performer ?? ""),
    album: () => "", // Apparently no way to get the album
    cover: () => getPlayer()?.stats?.currentAudio?.coverUrl_p ?? "",
    state: () => (!getPlayer()?.getCurrentPlaylist() ? StateMode.STOPPED : getPlayer().isPlaying() ? StateMode.PLAYING : StateMode.PAUSED),
    position: () => (getPlayer()?.getCurrentProgress() ?? 0) * VK.info.duration(),
    duration: () => getPlayer()?.stats?.currentAudio?.duration ?? 0,
    volume: () => (getPlayer()?.getVolume() ?? 1) ** (1 / 3) * 100,
    rating: () => 0,
    repeat: () => (getPlayer()?.isRepeatAll() ? Repeat.ALL : getPlayer()?.isRepeatCurrentAudio() ? Repeat.ONE : Repeat.NONE),
    shuffle: () => getPlayer()?.getPlaylistQueue()?.shuffled ?? false,
  }),
  events: {
    setState: (state) => {
      switch (state) {
        case StateMode.STOPPED:
          _throw(getPlayer()?.stop)();
          break;
        case StateMode.PAUSED:
          _throw(getPlayer()?.pause)();
          break;
        case StateMode.PLAYING:
          _throw(getPlayer()?.play)();
          break;
      }
    },
    skipPrevious: () => _throw(getPlayer()?.playPrev)(),
    skipNext: () => _throw(getPlayer()?.playNext)(),
    setPosition: (seconds) => _throw(getPlayer()?.seekToTime)(seconds),
    setVolume: (volume) => _throw(getPlayer()?.setVolume)((volume / 100) ** 3),
    setRating: null,
    setRepeat: (repeat) => {
      const player = _throw(getPlayer());
      switch (repeat) {
        case Repeat.NONE:
          if (player.isRepeatCurrentAudio()) player.toggleRepeatCurrentAudio();
          if (player.isRepeatAll()) player.toggleRepeatAll();
          break;
        case Repeat.ALL:
          if (player.isRepeatCurrentAudio()) player.toggleRepeatCurrentAudio();
          if (!player.isRepeatAll()) player.toggleRepeatAll();
          break;
        case Repeat.ONE:
          if (player.isRepeatAll()) player.toggleRepeatAll();
          if (!player.isRepeatCurrentAudio()) player.toggleRepeatCurrentAudio();
          break;
      }
    },
    setShuffle: (shuffle) => _throw(getPlayer()?.getPlaylistQueue()?.shuffle)(shuffle),
  },
  controls: () =>
    createDefaultControls(VK, {
      availableRepeat: Repeat.NONE | Repeat.ALL | Repeat.ONE,
    }),
};

export default VK;
