import clsx from "clsx";
import { Component, For, Show, createEffect, createSignal } from "solid-js";
import Checkbox from "../components/Checkbox";
import { useSettings } from "../hooks/useSettings";

const GenericSettingsPage: Component = () => {
  const { settings, toggleUseGeneric, setUseGenericList, setIsListBlocked, setGenericList } = useSettings();
  const [input, setInput] = createSignal(settings().genericList.join("\n"));

  let _timeout: NodeJS.Timeout;
  createEffect(() => {
    input(); // Here to make the effect run when input changes
    clearTimeout(_timeout);
    _timeout = setTimeout(() => {
      setGenericList(
        input()
          .split("\n")
          .filter((s) => s !== "")
          .map((s) => s.trim()),
      );
    }, 250);
  });

  return (
    <div class="flex h-full w-full flex-col gap-2 p-2">
      <Checkbox text="Try to parse media on unsupported websites" checked={settings().useGeneric} onChange={toggleUseGeneric} />
      <div class="-mx-3 w-[111%] border-t border-solid border-indigo-400" />
      <RadioGroup
        disabled={!settings().useGeneric}
        value={settings().useGenericList ? "list" : "all"}
        onChange={(value) => setUseGenericList(value !== "all")}
        options={[
          {
            text: "Allow on all websites",
            value: "all",
          },
          {
            label: "www",
            children: (
              <label for="www" class={clsx("flex items-center", [settings().useGeneric && "cursor-pointer"])}>
                <span class="pr-1 text-[0.9rem]">Only </span>
                <select
                  disabled={!settings().useGeneric || !settings().useGenericList}
                  value={settings().isListBlocked ? "block" : "allow"}
                  onChange={(e) => setIsListBlocked(e.currentTarget.value === "block")}
                  // eslint-disable-next-line tailwindcss/no-custom-classname
                  class={clsx(
                    `without-ring form-select h-6 w-20 rounded-md border border-solid border-indigo-400 bg-[#2b2a33] px-2 py-0 text-sm text-white focus:ring-indigo-600`,
                    [(!settings().useGeneric || !settings().useGenericList) && "opacity-50"],
                    [settings().useGeneric && settings().useGenericList && "cursor-pointer"],
                  )}
                >
                  <option value="allow" class={clsx("bg-[#2b2a33] text-white")}>
                    allow
                  </option>
                  <option value="block" class={clsx("bg-[#2b2a33] text-white")}>
                    block
                  </option>
                </select>
                <span class="text-[0.9rem]"> these websites:</span>
              </label>
            ),
            value: "list",
          },
        ]}
      />
      <textarea
        value={input()}
        onInput={(e) => setInput(e.currentTarget.value)}
        disabled={!settings().useGenericList || !settings().useGeneric}
        class={clsx(`h-full w-full resize-none rounded-md border border-solid border-indigo-400 bg-transparent p-2`, [
          (!settings().useGenericList || !settings().useGeneric) && "opacity-50",
        ])}
      />
    </div>
  );
};

const RadioGroup: Component<{
  options: { text?: string; value: string; children?: any; label?: any }[];
  bigText?: boolean;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}> = (props) => {
  return (
    <div class="flex flex-col">
      <For each={props.options}>
        {({ text, value, children, label }) => (
          <div class="flex items-center">
            <div class="flex items-center pr-2">
              <input
                id={text || label}
                type="radio"
                checked={props.value === value}
                onChange={() => props.onChange(value)}
                disabled={props.disabled}
                // eslint-disable-next-line tailwindcss/no-custom-classname
                class={clsx(
                  `without-ring form-radio h-4 w-4 rounded-full border-indigo-400 bg-transparent text-indigo-400 transition-all duration-100 ease-in-out`,
                  [props.disabled && "opacity-50"],
                  [!props.disabled && "cursor-pointer"],
                )}
              />
            </div>
            <Show when={text}>
              <label
                for={text}
                class={clsx([!props.bigText && "text-[0.9rem]"], [props.disabled && "opacity-50"], [!props.disabled && "cursor-pointer"])}
              >
                {text}
              </label>
            </Show>
            <Show when={children}>
              <div class={clsx([props.disabled && "opacity-50"])}>{children}</div>
            </Show>
          </div>
        )}
      </For>
    </div>
  );
};

export default GenericSettingsPage;
