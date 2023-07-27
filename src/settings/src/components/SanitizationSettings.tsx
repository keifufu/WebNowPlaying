import clsx from "clsx";
import { IoClose } from "solid-icons/io";
import { Component, createSignal } from "solid-js";
import { useBorderColorClass, useTheme } from "../hooks/useTheme";
import Checkbox from "./Checkbox";

const [isOpen, setIsOpen] = createSignal(false);

export const openSanitizationSettings = () => setIsOpen(true);

export const SanitizationSettings: Component = () => {
  const borderColorClass = useBorderColorClass();
  const { theme } = useTheme();

  return (
    <div
      class={clsx("fixed top-0 left-0 z-50 flex h-full w-full cursor-pointer items-center justify-center bg-black/50 transition-all duration-100", [
        !isOpen() && "pointer-events-none opacity-0",
      ])}
      onClick={() => setIsOpen(false)}
    >
      <div
        class={clsx(
          `flex w-[75%] cursor-default flex-col rounded-md border border-solid ${borderColorClass()} p-2`,
          [theme() === "dark" && "bg-[#2b2a33] text-white"],
          [theme() === "light" && "bg-slate-100 text-gray-800"],
          [theme() === "konami" && "bg-gradient-to-tl from-[#0CB6C4] to-[#1D358F] text-white"]
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div class="flex items-center justify-between">
          <div>Sanitization Settings</div>
          <IoClose class="float-right cursor-pointer hover:opacity-50" size={18} onClick={() => setIsOpen(false)} />
        </div>
        <div class={`-mx-2 my-2 w-[104%] border-t border-solid ${borderColorClass()}`} />
        <div class="flex flex-col">
          <Checkbox text={"Remove duplicate artist"} checked={true} onChange={() => null} />
          <div class={clsx("text-sm", [theme() !== "konami" && "text-gray-500"], [theme() === "konami" && "text-gray-300"])}>
            Removes the artist from the title
          </div>
          <Checkbox text={"Standardize Featuring"} checked={true} onChange={() => null} />
          <div class={clsx("text-sm", [theme() !== "konami" && "text-gray-500"], [theme() === "konami" && "text-gray-300"])}>
            Standardizes "featuring", "feat.", "ft."
          </div>
          <Checkbox text={"Move Featuring to end"} checked={true} onChange={() => null} />
          <div class={clsx("text-sm", [theme() !== "konami" && "text-gray-500"], [theme() === "konami" && "text-gray-300"])}>
            Moves featuring to the end of the title
          </div>
          <Checkbox text={"Remove Featuring"} checked={true} onChange={() => null} />
          <div class={clsx("text-sm", [theme() !== "konami" && "text-gray-500"], [theme() === "konami" && "text-gray-300"])}>
            Removes featuring entirely
          </div>
          <Checkbox text={"Default Title"} checked={true} onChange={() => null} />
          <div class={clsx("text-sm", [theme() !== "konami" && "text-gray-500"], [theme() === "konami" && "text-gray-300"])}>
            What title to show when none is found
          </div>
          <Checkbox text={"Default Artist"} checked={true} onChange={() => null} />
          <div class={clsx("text-sm", [theme() !== "konami" && "text-gray-500"], [theme() === "konami" && "text-gray-300"])}>
            What artist to show when none is found
          </div>
        </div>
      </div>
    </div>
  );
};

export default SanitizationSettings;
