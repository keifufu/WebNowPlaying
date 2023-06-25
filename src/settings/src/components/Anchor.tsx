import clsx from "clsx";
import { Component } from "solid-js";
import { useTheme } from "../hooks/useTheme";

const Anchor: Component<{
  text: string;
  highlight?: boolean;
  link?: string;
  onClick: (e: MouseEvent) => void;
  class?: string;
  disabled?: boolean;
}> = (props) => {
  const { theme } = useTheme();

  return (
    <a
      class={clsx(
        "-mt-0.5",
        props.class,
        [props.highlight && theme() === "dark" && "text-cyan-500"],
        [props.highlight && theme() === "light" && "text-cyan-700"],
        [props.highlight && theme() === "konami" && "text-cyan-300"],
        [!props.disabled && "cursor-pointer"],
        [props.disabled && "cursor-default opacity-50 hover:no-underline"]
      )}
      href={props.link}
      onClick={(e) => {
        if (props.onClick && !props.disabled) props.onClick(e);
      }}
    >
      {props.text}
    </a>
  );
};

export default Anchor;
