import assert from "node:assert/strict";
import fs from "node:fs";
import { createRequire } from "node:module";
import { beforeEach, test } from "node:test";
import ts from "typescript";

const loadModule = createRequire(import.meta.url);

// Exercise the actual TypeScript site and its utilities without a new test dependency.
loadModule.extensions[".ts"] = (module, filename) => {
  const { outputText } = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
    fileName: filename,
  });
  module._compile(outputText, filename);
};
const site = loadModule("../src/extension/content/injected/sites/YouTubeMusic.ts").default;
const { EventError, StateMode } = loadModule("../src/extension/types.ts");
let video;
let bar;
let buttons;
let metadata;

beforeEach(() => {
  video = {
    readyState: 4,
    paused: false,
    ended: false,
    currentTime: 90,
    duration: 240,
    volume: 0.7,
    muted: false,
    play() {
      this.paused = false;
      return Promise.resolve();
    },
    pause() {
      this.paused = true;
    },
  };
  buttons = new Map(
    ["Previous", "Next"].map((label) => [
      label,
      {
        disabled: false,
        clicks: 0,
        click() {
          this.clicks++;
        },
      },
    ]),
  );
  bar = {
    querySelector(selector) {
      return buttons.get(selector.match(/aria-label="(.*?)"/)[1]) ?? null;
    },
  };
  metadata = { title: "Test track", artist: "Test artist", album: "Test album", artwork: [] };
  globalThis.HTMLMediaElement = { HAVE_METADATA: 1 };
  globalThis.document = {
    querySelector(selector) {
      if (selector === "ytmusic-player-bar") return bar;
      if (selector === "video") return video;
      if (selector === ".time-info") return { innerText: "1:30 / 4:00" };
      return null;
    },
  };
  Object.defineProperty(globalThis, "navigator", { configurable: true, value: { mediaSession: { metadata } } });
});

test("detects a loaded song without the legacy playerApi", () => {
  assert.equal(site.ready(), true);
  assert.equal(site.info.title(), "Test track");
  assert.equal(site.info.artist(), "Test artist");
  assert.equal(site.info.album(), "Test album");
  assert.equal(site.info.position(), 90);
  assert.equal(site.info.duration(), 240);
  // Keep the existing displayed-duration parser, including the premium-user workaround.
  video.duration = 999;
  assert.equal(site.info.duration(), 240);
});

test("does not detect an unrelated or uninitialized video", () => {
  video.readyState = 0;
  assert.equal(Boolean(site.ready()), false);
  video.readyState = 4;
  const saved = bar;
  bar = null;
  assert.equal(Boolean(site.ready()), false);
  bar = saved;
  video = null;
  assert.equal(Boolean(site.ready()), false);
});

test("preserves the legacy player API when present", () => {
  const legacy = { isReady: () => true, getCurrentTime: () => 17 };
  bar.playerApi = legacy;
  assert.equal(site.debug.getPlayer(), legacy);
  assert.equal(site.ready(), true);
  assert.equal(site.info.position(), 17);
});

test("reports playing, paused and ended states", () => {
  assert.equal(site.info.state(), StateMode.PLAYING);
  video.paused = true;
  assert.equal(site.info.state(), StateMode.PAUSED);
  video.ended = true;
  assert.equal(site.info.state(), StateMode.STOPPED);
});

test("repeated playback commands act on the HTML video", () => {
  for (let i = 0; i < 3; i++) {
    site.events.setState(StateMode.PAUSED);
    assert.equal(video.paused, true);
    site.events.setState(StateMode.PLAYING);
    assert.equal(video.paused, false);
  }
  site.events.setState(StateMode.STOPPED);
  assert.equal(video.paused, true);
  assert.equal(video.currentTime, 0);
});

test("seeks in seconds and clamps to track bounds", () => {
  site.events.setPosition(120);
  assert.equal(video.currentTime, 120);
  site.events.setPosition(-10);
  assert.equal(video.currentTime, 0);
  site.events.setPosition(999);
  assert.equal(video.currentTime, 240);
});

test("rejects invalid positions and unknown durations without moving playback", () => {
  for (const seconds of [NaN, Infinity, -Infinity]) {
    assert.throws(() => site.events.setPosition(seconds), EventError);
    assert.equal(video.currentTime, 90);
  }
  for (const duration of [NaN, Infinity, 0]) {
    video.duration = duration;
    assert.throws(() => site.events.setPosition(120), EventError);
    assert.equal(video.currentTime, 90);
  }
});

test("reads mute and sets a bounded volume", () => {
  assert.equal(site.info.volume(), 70);
  video.muted = true;
  assert.equal(site.info.volume(), 0);
  site.events.setVolume(25);
  assert.equal(video.volume, 0.25);
  site.events.setVolume(-1);
  assert.equal(video.volume, 0);
  site.events.setVolume(101);
  assert.equal(video.volume, 1);
  assert.throws(() => site.events.setVolume(NaN), EventError);
});

test("dispatches previous and next to the player-bar buttons", () => {
  site.events.skipPrevious();
  site.events.skipNext();
  assert.equal(buttons.get("Previous").clicks, 1);
  assert.equal(buttons.get("Next").clicks, 1);
});

test("missing or disabled navigation buttons fail cleanly", () => {
  buttons.get("Next").disabled = true;
  assert.throws(() => site.events.skipNext(), EventError);
  buttons.delete("Previous");
  assert.throws(() => site.events.skipPrevious(), EventError);
});

test("resolves replacement video elements and updated track metadata", () => {
  const previousVideo = video;
  video = { ...video, currentTime: 3, paused: true };
  metadata.title = "Next track";
  assert.equal(site.info.title(), "Next track");
  assert.equal(site.info.position(), 3);
  site.events.setState(StateMode.PLAYING);
  site.events.setPosition(20);
  assert.equal(video.currentTime, 20);
  assert.equal(video.paused, false);
  assert.equal(previousVideo.currentTime, 90);
});
