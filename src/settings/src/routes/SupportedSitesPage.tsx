import { IoSettingsSharp } from "solid-icons/io";
import { Component, For, Show } from "solid-js";
import { SiteSettings, SupportedSites, TSupportedSites } from "../../../utils/settings";
import Checkbox from "../components/Checkbox";
import { openSiteSettings } from "../components/SiteSettings";
import { useSettings } from "../hooks/useSettings";
import { useBorderColorClass } from "../hooks/useTheme";

type SiteProps = {
  name: TSupportedSites;
  enabled: boolean;
  settings: (typeof SiteSettings)[TSupportedSites];
};

const Site: Component<SiteProps> = (props) => {
  const { toggleSite } = useSettings();
  const borderColorClass = useBorderColorClass();

  return (
    <div class={`m-[0.19rem] flex w-[32.7%] items-center rounded-md border border-solid ${borderColorClass()} p-[0.21rem] pl-2`}>
      <Checkbox text={props.name} bigText onChange={() => toggleSite(props.name)} checked={props.enabled} />
      <Show when={props.settings}>
        <div class="ml-auto flex items-center">
          <IoSettingsSharp class="h-4 w-4 cursor-pointer transition-all duration-100 hover:opacity-50" onClick={() => openSiteSettings(props.name)} />
        </div>
      </Show>
    </div>
  );
};

const Placeholder = () => {
  const borderColorClass = useBorderColorClass();

  return (
    <div class={`m-[0.19rem] flex w-[32.7%] items-center rounded-md border border-solid ${borderColorClass()} p-[0.21rem] pl-2`}>
      <div class="-mt-0.5 opacity-0">Placeholder</div>
    </div>
  );
};

const SiteSettingsPage: Component = () => {
  const { settings } = useSettings();

  return (
    <div class="-m-1 flex w-full flex-col flex-wrap items-center">
      <For each={SupportedSites}>
        {(site) => <Site name={site} enabled={!settings().disabledSites.includes(site)} settings={SiteSettings[site]} />}
      </For>
      {/* fill the extra spaces */}
      <For each={[...Array(30 - SupportedSites.length)].map((_, i) => i)}>{() => <Placeholder />}</For>
    </div>
  );
};

export default SiteSettingsPage;
