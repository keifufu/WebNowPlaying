import clsx from "clsx";
import { IoWarning } from "solid-icons/io";
import { Component, createSignal } from "solid-js";

const [isOpen, setIsOpen] = createSignal(true);
if (typeof chrome !== "undefined") {
  chrome.permissions.contains(
    {
      origins: ["*://*/*"],
    },
    (hasPermissions) => {
      setIsOpen(!hasPermissions);
    },
  );
}

const requestPermissions = () => {
  if (typeof chrome === "undefined") return;
  chrome.permissions
    .request({
      origins: ["*://*/*"],
    })
    .then((granted) => {
      setIsOpen(!granted);
    });
};

export const Permissions: Component = () => {
  return (
    <div
      class={clsx("fixed left-0 top-0 z-50 flex h-full w-full items-center justify-center bg-indigo-950/40", [
        !isOpen() && "pointer-events-none opacity-0",
      ])}
    >
      <div
        style={{ "backdrop-filter": "blur(20px)", "box-shadow": "0 4px 30px rgba(0, 0, 0, 0.1)" }}
        class="flex w-[75%] cursor-default flex-col rounded-md bg-indigo-950/40 bg-clip-padding text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div class="flex items-center justify-between rounded-t-lg bg-indigo-950/20 p-1">
          <div class="flex items-center p-1">
            <IoWarning size="20" />
            <div class="pl-1">Missing permissions</div>
          </div>
        </div>
        <div class="flex flex-col p-2 text-sm">
          <div class="pb-2">Your browser didn't automatically request permissions after installation.</div>
          <button class="rounded-md bg-indigo-950/30 p-1 hover:bg-indigo-950/50" onClick={requestPermissions}>
            Grant permissions
          </button>
        </div>
      </div>
    </div>
  );
};

export default Permissions;
