import clsx from "clsx";
import { Component } from "solid-js";

const Anchor: Component<{
  text: string;
  highlight?: boolean;
  link?: string;
  onClick: (e: MouseEvent) => void;
  class?: string;
  disabled?: boolean;
}> = (props) => {
  return (
    <a
      class={clsx(
        props.class,
        [props.highlight && "text-indigo-400"],
        [!props.disabled && "cursor-pointer hover:text-indigo-300 "],
        [props.disabled && "cursor-default opacity-50"],
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
