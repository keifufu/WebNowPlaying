import { Repeat, Site, StateMode } from "../../../types";
import { _throw, createDefaultControls, createSiteInfo } from "../utils";

function getMeta() {
  return navigator.mediaSession?.metadata;
}

function getCover() {
  const md: any = getMeta();
  const art = md?.artwork?.[md.artwork.length - 1]?.src ?? md?.artwork?.[0]?.src ?? "";
  // 去掉 ?param=xxx
  return art ? art.split("?")[0] : "";
}

function parseTime(s: string): number {
  const t = (s || "").trim();
  const parts = t.split(":").map((x) => parseInt(x, 10));
  if (parts.some((n) => Number.isNaN(n))) return 0;
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return 0;
}

function getTimeText(): string {
  // 你验证过这里稳定存在： "00:32 / 02:54"
  return (document.querySelector("span.j-flag.time")?.textContent || "").trim();
}

function getPositionDuration() {
  const text = getTimeText();
  const [posStrRaw, durStrRaw] = text.split("/").map((x) => x.trim());
  const position = parseTime(posStrRaw || "");
  const duration = parseTime(durStrRaw || "");
  return { position, duration };
}

function getPlayButton(): HTMLAnchorElement | null {
  return document.querySelector('a[data-action="play"],a[data-action="pause"]');
}

function isPlaying(): boolean {
  const btn = getPlayButton();
  // 你验证：data-action="pause" 表示正在播放（点击它会暂停）
  return btn?.dataset.action === "pause";
}

function click(sel: string) {
  _throw(document.querySelector<HTMLElement>(sel))?.click();
}

const NeteaseMusic: Site = {
  debug: {
    getMeta,
    getTimeText,
    isPlaying,
  },
  init: null,

  ready: () => {
    // metadata 有 + 控制按钮有 + 时间文本有，基本就绪
    return !!getMeta() && !!getPlayButton() && getTimeText().includes("/");
  },

  info: createSiteInfo({
    name: () => "NeteaseMusic",

    title: () => getMeta()?.title ?? "",
    artist: () => getMeta()?.artist ?? "",
    album: () => getMeta()?.album ?? "",
    cover: () => getCover(),

    state: () => (isPlaying() ? StateMode.PLAYING : StateMode.PAUSED),

    position: () => getPositionDuration().position,
    duration: () => getPositionDuration().duration,

    // 你目前不需要音量/评分/循环/随机，这里给默认即可
    volume: () => 100,
    rating: () => 0,
    repeat: () => Repeat.NONE, // Repeat.NONE 的数值一般是 1（你项目里 Repeat 枚举可对照）
    shuffle: () => false,
  }),

  events: {
    setState: (state) => {
      const btn = getPlayButton();
      if (!btn) return;

      if (state === StateMode.PLAYING && btn.dataset.action === "play") btn.click();
      if ((state === StateMode.PAUSED || state === StateMode.STOPPED) && btn.dataset.action === "pause") btn.click();
    },

    skipPrevious: () => click('a[data-action="prev"]'),
    skipNext: () => click('a[data-action="next"]'),

    // 你暂时不需要这些
    setPosition: null,
    setVolume: null,
    setRating: null,
    setRepeat: null,
    setShuffle: null,
  },

  controls: () =>
    createDefaultControls(NeteaseMusic, {
      canSetState: true,
      canSkipPrevious: true,
      canSkipNext: true,
      // 如果以后你想支持拖动进度，我们再实现 setPosition 并把 canSetPosition 打开
    //   canSetPosition: false,
    }),
};

export default NeteaseMusic;