import { A } from "@solidjs/router";
import { Component, Show, createSignal } from "solid-js";
import { useSettings } from "../hooks/useSettings";
import Checkbox from "./Checkbox";

const [show, setShow] = createSignal(false);
export const showSettingsMenu = () => setShow(true);
const SettingsMenu: Component = () => {
  return (
    <Show when={show()}>
      <div
        style={{ "backdrop-filter": "blur(20px)", "box-shadow": "0 4px 30px rgba(0, 0, 0, 0.1)" }}
        class="fixed right-3 top-12 z-20 flex flex-col rounded-lg bg-indigo-950/40 bg-clip-padding pb-1"
      >
        <div class="rounded-t-lg bg-indigo-950/20 text-center">Settings</div>
        <SettingsEntry text="Sanitization" href="/sanitization" />
        <SettingsEntry text="Supported Sites" href="/supportedSites" />
        <SettingsEntry text="Unsupported Sites" href="/unsupportedSites" />
        <DesktopPlayersEntry />
      </div>
      <div class="fixed z-10 h-screen w-screen cursor-pointer bg-black/0" onClick={() => setShow(false)} />
    </Show>
  );
};

const SettingsEntry: Component<{ text: string; href: string }> = (props) => (
  <A href={props.href} onClick={() => setShow(false)} class="cursor-pointer px-2 py-1 hover:bg-slate-200/20">
    {props.text}
  </A>
);

const DesktopPlayersEntry: Component = () => {
  const { settings, setUseDesktopPlayers } = useSettings();

  return (
    <label for="usedesktopplayers" class="flex cursor-pointer items-center px-2 py-1">
      <p class="pr-2">Desktop Players</p>
      <Checkbox
        label="usedesktopplayers"
        checked={settings().useDesktopPlayers}
        onChange={(event) => {
          setUseDesktopPlayers(event.currentTarget.checked);
        }}
      />
    </label>
  );
};

export default SettingsMenu;
