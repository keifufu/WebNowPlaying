import clsx from "clsx";
import { Component, Show } from "solid-js";

const Checkbox: Component<{
  label?: string;
  children?: any;
  text?: string;
  bigText?: boolean;
  checked: boolean;
  disabled?: boolean;
  class?: string;
  onChange: (event: Event & { currentTarget: HTMLInputElement; target: HTMLInputElement }) => void;
}> = (props) => {
  return (
    <div class={clsx(props.class, "flex items-center")}>
      <input
        id={props.label || props.text}
        type="checkbox"
        checked={props.checked}
        onChange={props.onChange}
        disabled={props.disabled}
        // eslint-disable-next-line tailwindcss/no-custom-classname
        class={clsx(
          "without-ring form-checkbox mr-2 h-4 w-4 rounded border-indigo-300/80 bg-transparent text-indigo-400 transition-all duration-200 ease-in-out",
          [props.disabled && "opacity-50"],
          [!props.disabled && "cursor-pointer"],
        )}
      />
      <Show when={props.text}>
        <label
          for={props.label || props.text}
          class={clsx([!props.bigText && "text-[0.9rem]"], [props.disabled && "opacity-50"], [!props.disabled && "cursor-pointer"])}
        >
          {props.text}
        </label>
      </Show>
      <Show when={props.children}>
        <div class={clsx([props.disabled && "opacity-50"])}>{props.children}</div>
      </Show>
    </div>
  );
};

export default Checkbox;
