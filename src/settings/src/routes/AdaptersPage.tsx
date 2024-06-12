import clsx from "clsx";
import { Component, For, Index, Show, createEffect, createSignal, onMount } from "solid-js";
import { isVersionOutdated } from "../../../utils/misc";
import {
  BuiltInAdapters,
  SocketInfoState,
  Adapter as TAdapter,
  CustomAdapter as TCustomAdapter,
  defaultSocketInfoState,
} from "../../../utils/settings";
import { ServiceWorkerUtils } from "../../../utils/sw";
import Anchor from "../components/Anchor";
import Checkbox from "../components/Checkbox";
import Hyperlink from "../components/Hyperlink";
import { useSettings } from "../hooks/useSettings";
import { useSocketInfo } from "../hooks/useSocketInfo";

const AdaptersPage: Component = () => {
  const { settings, hasLoaded } = useSettings();
  const socketInfo = useSocketInfo();
  const [showConnectionHelp, setShowConnectionHelp] = createSignal(false);

  createEffect(() => {
    let show = false;
    socketInfo().states.forEach((value) => {
      if (value.reconnectAttempts >= 2) {
        show = true;
      }
    });
    setShowConnectionHelp(show);
  });

  return (
    <div class="flex h-full w-full flex-col items-center gap-2 overflow-y-scroll p-2">
      <ConnectionHelp show={showConnectionHelp()} />
      <For each={BuiltInAdapters.filter((e) => e.official)}>
        {(adapter) => (
          <Adapter
            adapter={adapter}
            enabled={hasLoaded() ? settings().enabledBuiltInAdapters.includes(adapter.name) : false}
            info={socketInfo().states.get(adapter.port) ?? defaultSocketInfoState}
          />
        )}
      </For>
      <div class="w-full text-center">Unofficial Adapters</div>
      <For each={BuiltInAdapters.filter((e) => !e.official)}>
        {(adapter) => (
          <Adapter
            adapter={adapter}
            enabled={settings().enabledBuiltInAdapters.includes(adapter.name)}
            info={socketInfo().states.get(adapter.port) ?? defaultSocketInfoState}
          />
        )}
      </For>
      <Show when={settings().customAdapters.length > 0}>
        <div class="w-full text-center">Custom Adapters</div>
      </Show>
      <Index each={settings().customAdapters}>
        {(adapter) => <CustomAdapter adapter={adapter()} info={socketInfo().states.get(adapter().port) ?? defaultSocketInfoState} />}
      </Index>
    </div>
  );
};

const AdapterAuthors: Component<{ adapter: TAdapter }> = (props) => {
  return (
    <>
      <span class="pl-1 text-slate-400"> -</span>
      <For each={props.adapter.authors}>
        {(author, i) => (
          <div class="text-slate-300">
            <Hyperlink text={author.name} link={author.link} class="pl-1" />
            <Show when={i() !== props.adapter.authors.length - 1}>
              <span class="pl-0.5">,</span>
            </Show>
          </div>
        )}
      </For>
    </>
  );
};

const Adapter: Component<{ adapter: TAdapter; enabled: boolean; info: SocketInfoState }> = (props) => {
  const { toggleAdapter } = useSettings();
  const [githubVersion, setGithubVersion] = createSignal("...");
  const [btnDisabled, setBtnDisabled] = createSignal(false);
  const [lastConnected, setLastConnected] = createSignal(false);
  const [lastConnecting, setLastConnecting] = createSignal(false);
  const [toggleDisabled, setToggleDisabled] = createSignal(false);
  const [isHovering, setIsHovering] = createSignal(false);

  onMount(() => {
    ServiceWorkerUtils.getGithubVersion(props.adapter.gh).then((v) => setGithubVersion(v));
  });

  const toggleConnection = () => {
    if (btnDisabled()) return;
    setBtnDisabled(true);
    setLastConnected(props.info.isConnected);
    setLastConnecting(props.info.isConnecting);
    if (props.info.isConnected || props.info.isConnecting) ServiceWorkerUtils.disconnectSocket(props.adapter.port);
    else ServiceWorkerUtils.connectSocket(props.adapter.port);
  };

  createEffect(() => {
    if (props.info.isConnected !== lastConnected() || props.info.isConnecting !== lastConnecting()) {
      setLastConnected(props.info.isConnected);
      setLastConnecting(props.info.isConnecting);
      setBtnDisabled(false);
    }
  });

  return (
    <div
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      class="flex w-full flex-col items-center rounded-md bg-indigo-950/20 p-2"
    >
      <div class="flex w-full items-center">
        <Checkbox
          checked={props.enabled}
          disabled={toggleDisabled()}
          onChange={() => {
            if (props.enabled) ServiceWorkerUtils.disconnectSocket(props.adapter.port);
            else ServiceWorkerUtils.connectSocket(props.adapter.port);
            toggleAdapter(props.adapter.port);
            setToggleDisabled(true);
            setTimeout(() => setToggleDisabled(false), 250);
          }}
        />
        <Hyperlink text={props.adapter.displayName} link={`https://github.com/${props.adapter.gh}`} />
        <AdapterAuthors adapter={props.adapter} />
      </div>
      <div
        class={clsx(
          "flex w-full flex-col overflow-hidden transition-all duration-200 ease-in-out",
          [!props.enabled && "h-0"],
          [props.enabled && (!isHovering() || props.info._isPlaceholder) && "h-6"],
          [props.enabled && isHovering() && !props.info._isPlaceholder && "h-11"],
        )}
      >
        <Show when={props.info._isPlaceholder}>
          <div>Loading..</div>
        </Show>
        <Show when={!props.info._isPlaceholder}>
          <div class="flex justify-between">
            <div
              class={clsx(
                [props.info.isConnected && "text-green-400"],
                [!props.info.isConnected && "text-red-400"],
                [props.info.isConnecting && "text-yellow-400"],
              )}
            >
              {props.info.isConnected
                ? "Connected"
                : props.info.isConnecting
                ? `Connecting.. (Attempt #${props.info.reconnectAttempts + 1})`
                : "Not connected"}
            </div>
            <Show when={props.enabled && props.info.isConnected}>
              <div>
                <Show when={githubVersion() === "Error"}>
                  <div class="text-red-400">Couldn't check for updates</div>
                </Show>
                <Show
                  when={
                    githubVersion() !== "Error" &&
                    githubVersion() !== "..." &&
                    isVersionOutdated(props.info.version, githubVersion()) &&
                    props.info.version !== "0.0.0"
                  }
                >
                  <Hyperlink text="Update available" link={`https://github.com/${props.adapter.gh}/releases/latest`} class="pl-2 text-yellow-400" />
                </Show>
                <Show when={props.info.version !== "0.0.0" && githubVersion() !== "Error" && !isVersionOutdated(props.info.version, githubVersion())}>
                  <div class="pl-2 text-green-400">Up to date</div>
                </Show>
              </div>
            </Show>
          </div>
        </Show>
        <Anchor
          text={props.info.isConnected || props.info.isConnecting ? "Disconnect" : "Connect"}
          highlight
          disabled={btnDisabled() || props.info._isPlaceholder}
          onClick={toggleConnection}
        />
      </div>
    </div>
  );
};

const CustomAdapter: Component<{ adapter: TCustomAdapter; info: SocketInfoState }> = (props) => {
  const [confirmDelete, setConfirmDelete] = createSignal(false);
  const { settings, toggleAdapter, removeCustomAdapter, updateCustomAdapter } = useSettings();
  const [btnDisabled, setBtnDisabled] = createSignal(false);
  const [lastConnected, setLastConnected] = createSignal(false);
  const [lastConnecting, setLastConnecting] = createSignal(false);
  const [toggleDisabled, setToggleDisabled] = createSignal(false);
  const [isHovering, setIsHovering] = createSignal(false);

  const toggleConnection = () => {
    if (btnDisabled()) return;
    setBtnDisabled(true);
    setLastConnected(props.info.isConnected);
    setLastConnecting(props.info.isConnecting);
    if (props.info.isConnected || props.info.isConnecting) ServiceWorkerUtils.disconnectSocket(props.adapter.port);
    else ServiceWorkerUtils.connectSocket(props.adapter.port);
  };

  createEffect(() => {
    if (props.info.isConnected !== lastConnected() || props.info.isConnecting !== lastConnecting()) {
      setLastConnected(props.info.isConnected);
      setLastConnecting(props.info.isConnecting);
      setBtnDisabled(false);
    }
  });

  const remove = () => {
    if (confirmDelete()) {
      removeCustomAdapter(props.adapter.id);
      ServiceWorkerUtils.disconnectSocket(props.adapter.port);
    } else {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 2000);
    }
  };

  let _timeout: NodeJS.Timeout;
  return (
    <div
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      class="flex w-full flex-col items-center rounded-md bg-indigo-950/20 p-2"
    >
      <div class="flex w-full items-center">
        <Checkbox
          label={props.adapter.id}
          text="Custom Adapter"
          checked={props.adapter.enabled}
          disabled={toggleDisabled()}
          bigText
          class="pr-2"
          onChange={() => {
            if (props.adapter.enabled) ServiceWorkerUtils.disconnectSocket(props.adapter.port);
            else ServiceWorkerUtils.connectSocket(props.adapter.port);
            toggleAdapter(props.adapter.port);
            setToggleDisabled(true);
            setTimeout(() => setToggleDisabled(false), 250);
          }}
        />
        <StrictInput
          placeholder="Port"
          // eslint-disable-next-line tailwindcss/no-custom-classname
          class="form-input h-6 w-14 rounded-md border border-solid border-indigo-400 bg-transparent px-2 text-sm text-indigo-300 placeholder:text-indigo-300/70 focus:ring-indigo-600 focus:ring-offset-0"
          value={props.adapter.port === 0 ? "" : props.adapter.port.toString()}
          onInput={(value) => {
            const port = parseInt(value || "0");
            if (port === props.adapter.port || isNaN(port)) return;
            // Checks if the port is valid
            try {
              // eslint-disable-next-line no-new
              new URL(`ws://127.0.0.1:${port}`);
            } catch {
              return;
            }
            if (BuiltInAdapters.some((e) => e.port === port)) return;
            if (settings().customAdapters.some((e) => e.port === port && e.id !== props.adapter.id)) return;
            ServiceWorkerUtils.disconnectSocket(props.adapter.port);
            updateCustomAdapter(props.adapter.id, port);
            clearTimeout(_timeout);
            if (port !== 0) _timeout = setTimeout(() => ServiceWorkerUtils.connectSocket(port), 250);
          }}
        />
      </div>
      <div
        class={clsx(
          "flex w-full flex-col overflow-hidden transition-all duration-200 ease-in-out",
          [!props.adapter.enabled && "h-0"],
          [props.adapter.enabled && !isHovering() && "h-6"],
          [props.adapter.enabled && isHovering() && "h-11"],
        )}
      >
        <Show when={props.info._isPlaceholder}>
          <div>Loading..</div>
        </Show>
        <Show when={!props.info._isPlaceholder}>
          <div
            class={clsx(
              [props.info.isConnected && "text-green-400"],
              [!props.info.isConnected && "text-red-400"],
              [props.info.isConnecting && "text-yellow-400"],
            )}
          >
            {props.info.isConnected
              ? "Connected"
              : props.info.isConnecting
              ? `Connecting.. (Attempt #${props.info.reconnectAttempts + 1})`
              : "Not connected"}
          </div>
        </Show>
        <div class="flex justify-between">
          <Anchor
            text={props.info.isConnected || props.info.isConnecting ? "Disconnect" : "Connect"}
            highlight
            disabled={btnDisabled() || props.info._isPlaceholder}
            onClick={toggleConnection}
          />
          <div class={clsx("cursor-pointer text-indigo-400 hover:text-indigo-300")} onClick={remove}>
            {confirmDelete() ? "Click again to confirm" : "Remove"}
          </div>
        </div>
      </div>
    </div>
  );
};

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

const ConnectionHelp: Component<{ show: boolean }> = (props) => {
  return (
    <Show when={props.show}>
      <div class="flex w-full flex-col rounded-md bg-indigo-950/20 p-2 text-sm">
        <div class="font-semibold text-yellow-400">Unable to connect?</div>
        <div class="flex items-start justify-start">
          <ul class="list-inside list-disc">
            <li>Multiple failed connects slow down reconnects</li>
            <li>Make sure the adapter is running</li>
            <li>
              See <Hyperlink highlight text="Troubleshooting" link="https://wnp.keifufu.dev/troubleshooting" />
            </li>
          </ul>
        </div>
      </div>
    </Show>
  );
};

export default AdaptersPage;
