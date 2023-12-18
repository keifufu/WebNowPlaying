import { IoSettingsSharp } from "solid-icons/io";
import { Component, For, Show } from "solid-js";
import { SiteSettings, SupportedSites, TSupportedSites } from "../../../utils/settings";
import Checkbox from "../components/Checkbox";
import { openSiteSettings } from "../components/SiteSettings";
import { useSettings } from "../hooks/useSettings";

const SiteSettingsPage: Component = () => {
  const { settings } = useSettings();

  return (
    <div class="flex h-full w-full flex-col items-center gap-2 overflow-y-scroll p-2 ">
      <For each={SupportedSites}>
        {(site) => <Site name={site} enabled={!settings().disabledSites.includes(site)} settings={SiteSettings[site]} />}
      </For>
    </div>
  );
};

type SiteProps = {
  name: TSupportedSites;
  enabled: boolean;
  settings: (typeof SiteSettings)[TSupportedSites];
};

const Site: Component<SiteProps> = (props) => {
  const { toggleSite } = useSettings();

  return (
    <div class="flex w-full justify-between rounded-md bg-indigo-950/20 p-2">
      <Checkbox text={props.name} bigText onChange={() => toggleSite(props.name)} checked={props.enabled} />
      <Show when={props.settings}>
        <div class="flex items-center">
          <IoSettingsSharp class="h-4 w-4 cursor-pointer transition-all duration-100 hover:opacity-50" onClick={() => openSiteSettings(props.name)} />
        </div>
      </Show>
    </div>
  );
};

export default SiteSettingsPage;
