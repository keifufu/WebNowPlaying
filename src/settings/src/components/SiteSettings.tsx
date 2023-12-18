import clsx from "clsx";
import { IoClose } from "solid-icons/io";
import { Component, createSignal, For } from "solid-js";
import { SiteSettings, TSupportedSites } from "../../../utils/settings";
import { useSettings } from "../hooks/useSettings";
import Checkbox from "./Checkbox";

const [isOpen, setIsOpen] = createSignal(false);
const [site, setSite] = createSignal<TSupportedSites>();

export const openSiteSettings = (site: TSupportedSites) => {
  setSite(site);
  setIsOpen(true);
};

export const SiteSettingsComp: Component = () => {
  const siteSettings = () => SiteSettings[site() as TSupportedSites];
  const { settings, _saveSettingsInternal } = useSettings();
  const getValue = (key: string) => settings()[key as keyof typeof SiteSettingsComp];
  const saveValue = (key: string, value: any) => _saveSettingsInternal({ ...settings(), [key]: value });

  return (
    <div
      class={clsx("fixed left-0 top-0 z-50 flex h-full w-full cursor-pointer items-center justify-center bg-indigo-950/40", [
        !isOpen() && "pointer-events-none opacity-0",
      ])}
      onClick={() => setIsOpen(false)}
    >
      <div
        style={{ "backdrop-filter": "blur(20px)", "box-shadow": "0 4px 30px rgba(0, 0, 0, 0.1)" }}
        class="flex w-[75%] cursor-default flex-col rounded-md bg-indigo-950/40 bg-clip-padding text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div class="flex items-center justify-between rounded-t-lg bg-indigo-950/20 p-1">
          <div>{site()} Settings</div>
          <IoClose class="float-right cursor-pointer hover:opacity-50" size={18} onClick={() => setIsOpen(false)} />
        </div>
        <div class="flex flex-col p-2">
          <For each={siteSettings()}>
            {({ name, description, key, type }) => (
              <>
                {type === "checkbox" && <Checkbox text={name} checked={getValue(key)} onChange={() => saveValue(key, !getValue(key))} />}
                <div class={clsx("text-sm text-gray-300/75")}>{description}</div>
              </>
            )}
          </For>
        </div>
      </div>
    </div>
  );
};

export default SiteSettingsComp;
