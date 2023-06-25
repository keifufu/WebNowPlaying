import { Component, createEffect } from "solid-js";

type Props = {
  value: string;
  onInput: (value: string) => void;
  class?: string;
  placeholder?: string;
};

// A input that always reflects props.value
const StrictInput: Component<Props> = (props) => {
  let ref: HTMLInputElement;

  createEffect(() => {
    if (ref) ref.value = props.value;
  });

  return (
    <input
      ref={(el) => (ref = el)}
      value={props.value}
      class={props.class}
      placeholder={props.placeholder}
      onInput={(e) => {
        const value = e.currentTarget.value;
        props.onInput(value);
        ref.value = props.value;
      }}
    />
  );
};

export default StrictInput;
