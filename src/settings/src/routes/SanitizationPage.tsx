import clsx from "clsx";
import { Component, For } from "solid-js";
import { SanitizationSettings, sanitizationSettings } from "../../../utils/settings";
import Checkbox from "../components/Checkbox";
import { useSettings } from "../hooks/useSettings";

const SanitizationPage: Component = () => {
  return (
    <div class="flex h-full flex-col gap-2 p-2">
      <For each={sanitizationSettings}>{(settings) => <Entry settings={settings} />}</For>
    </div>
  );
};

const Entry: Component<{ settings: SanitizationSettings }> = (props) => {
  const { settings, toggleSanitizationId } = useSettings();
  return (
    <div class="rounded-lg bg-indigo-950/20 p-2">
      <Checkbox
        text={props.settings.name}
        checked={settings().enabledSanitizationId.includes(props.settings.id)}
        onChange={() => {
          toggleSanitizationId(props.settings.id);
        }}
      />
      <div class={clsx("text-sm text-gray-300/75")}>{props.settings.description}</div>
    </div>
  );
};

export default SanitizationPage;
