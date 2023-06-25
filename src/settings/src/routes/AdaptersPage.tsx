import { Component, For, Index } from "solid-js";
import { BuiltInAdapters, defaultSocketInfoState } from "../../../utils/settings";
import Adapter from "../components/Adapter";
import Anchor from "../components/Anchor";
import Checkbox from "../components/Checkbox";
import CustomAdapter from "../components/CustomAdapter";
import Hyperlink from "../components/Hyperlink";
import { useSettings } from "../hooks/useSettings";
import { useSocketInfo } from "../hooks/useSocketInfo";
import { useBorderColorClass } from "../hooks/useTheme";

const AdaptersPage: Component = () => {
  const { settings, addCustomAdapter, setUseNativeAPIs } = useSettings();
  const borderColorClass = useBorderColorClass();
  const socketInfo = useSocketInfo();

  /* const onInputUpdateFrequency = (e: InputEvent) => {
    const number = parseInt((e.currentTarget as HTMLInputElement).value)
    if (isNaN(number)) return
    setUpdateFrequencyMs(number)
  } */

  return (
    <div class="flex h-full w-full flex-col items-center">
      <div class="w-full overflow-y-scroll">
        <For each={BuiltInAdapters}>
          {(adapter) => (
            <Adapter
              adapter={adapter}
              enabled={settings().enabledBuiltInAdapters.includes(adapter.name)}
              info={socketInfo().states.get(adapter.port) ?? defaultSocketInfoState}
            />
          )}
        </For>
        <Index each={settings().customAdapters}>
          {(adapter) => <CustomAdapter adapter={adapter()} info={socketInfo().states.get(adapter().port) ?? defaultSocketInfoState} />}
        </Index>
        <div class="flex w-full justify-end pr-2">
          <Anchor text="Add custom adapter" highlight onClick={addCustomAdapter} />
        </div>
        <div class="ml-16 mt-3">
          Want to create or submit your own adapter? Click{" "}
          <Hyperlink text="here" highlight link="https://github.com/keifufu/WebNowPlaying-Redux/blob/main/CreatingAdapters.md" />!
        </div>
      </div>
      <div class="mt-auto w-full">
        <div class={`-mx-3 w-[111%] border-t border-solid ${borderColorClass()}`} />
        <div class="flex flex-col pt-1.5">
          <div class="flex items-center">
            <Checkbox
              noMt
              text="Use native APIs"
              checked={settings().useNativeAPIs}
              onChange={() => {
                setUseNativeAPIs(!settings().useNativeAPIs);
              }}
            />
            <div class="ml-1.5 text-sm">
              (<Hyperlink text="Learn more" highlight link="https://github.com/keifufu/WebNowPlaying-Redux/blob/main/NativeAPIs.md" />)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdaptersPage;
