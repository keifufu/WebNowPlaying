import clsx from "clsx";
import { IoWarning } from "solid-icons/io";
import { Component, createSignal } from "solid-js";
import { useSettings } from "../hooks/useSettings";

const [isOpen, setIsOpen] = createSignal(false);
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
  const { settings, setRejectedPermissions } = useSettings();

  return (
    <>
      <div class={clsx("fixed bottom-10 left-[30%] z-50", [!settings().rejectedPermissions && "pointer-events-none opacity-0"])}>
        <div
          style={{ "backdrop-filter": "blur(20px)", "box-shadow": "0 4px 30px rgba(0, 0, 0, 0.1)" }}
          class="flex cursor-pointer flex-col rounded-md bg-indigo-950/40 bg-clip-padding text-white"
          onClick={() => {
            setRejectedPermissions(false);
            setIsOpen(true);
          }}
        >
          <div class="flex items-center justify-between rounded-md bg-indigo-950/20 p-1">
            <div class="flex items-center p-0.5">
              <IoWarning size="20" />
              <div class="pl-1 text-xs">Missing permissions</div>
            </div>
          </div>
        </div>
      </div>
      <div
        class={clsx("fixed left-0 top-0 z-50 flex h-full w-full items-center justify-center bg-indigo-950/40", [
          (!isOpen() || settings().rejectedPermissions) && "pointer-events-none opacity-0",
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
            <button
              class="mt-1 rounded-md bg-indigo-950/30 p-1 hover:bg-indigo-950/50"
              onClick={() => {
                setRejectedPermissions(true);
                setIsOpen(false);
              }}
            >
              Don't ask again
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Permissions;
