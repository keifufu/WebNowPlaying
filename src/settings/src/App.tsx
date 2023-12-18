import { A, Navigate, Route, Routes, useLocation } from "@solidjs/router";
import { FaSolidCircleArrowLeft, FaSolidCirclePlus } from "solid-icons/fa";
import { IoSettingsSharp } from "solid-icons/io";
import { Component, Show } from "solid-js";
import { getExtensionVersion } from "../../utils/misc";
import { ServiceWorkerUtils } from "../../utils/sw";
import { bg } from "./bg";
import Hyperlink from "./components/Hyperlink";
import Permissions from "./components/Permissions";
import SettingsMenu, { showSettingsMenu } from "./components/SettingsMenu";
import SiteSettings from "./components/SiteSettings";
import { useSettings } from "./hooks/useSettings";
import AdaptersPage from "./routes/AdaptersPage";
import SanitizationPage from "./routes/SanitizationPage";
import SupportedSitesPage from "./routes/SupportedSitesPage";
import UnsupportedSitesPage from "./routes/UnsupportedSitesPage";

ServiceWorkerUtils.resetOutdated();

// The way the background and blur filter is applied here is
// a weird workaround to fix overflow on firefox popup corners
// when backdrop-filter is used.
// I currently still use backdrop-filter in the settings menu
// and the site settings dialog, but I can't be bothered to find
// solutions for those right now, at least there is no overflow
// by default.
const App: Component = () => {
  return (
    <>
      <div
        style={{
          background: `url(data:image/jpeg;base64,${bg})`,
        }}
        class="fixed top-0 h-screen w-screen"
      />
      <div
        style={{
          background: `url(data:image/jpeg;base64,${bg})`,
          filter: "blur(20px)",
          "clip-path": "inset(0.75rem 0.75rem 0.75rem 0.75rem)",
        }}
        class="fixed top-0 h-screen w-screen"
      />
      <div class="fixed top-0 flex h-screen w-screen select-none flex-col p-3 text-white">
        <SettingsMenu />
        <SiteSettings />
        <Permissions />
        <div
          style={{ "box-shadow": "0 4px 30px rgba(0, 0, 0, 0.1)" }}
          class="flex h-full grow flex-col overflow-hidden rounded-lg bg-indigo-950/40 bg-clip-padding"
        >
          <Header />
          <Routes>
            <Route path="/adapters" component={AdaptersPage} />
            <Route path="/sanitization" component={SanitizationPage} />
            <Route path="/supportedSites" component={SupportedSitesPage} />
            <Route path="/unsupportedSites" component={UnsupportedSitesPage} />
            <Route path="*">
              <Navigate href="/adapters" />
            </Route>
          </Routes>
          <div class="flex self-center rounded-lg pb-2 text-xs text-gray-200">
            <div>
              <Hyperlink text="GitHub" link="https://github.com/keifufu/WebNowPlaying" /> |{" "}
              <Hyperlink text="Documentation" link="https://wnp.keifufu.dev" /> | v{getExtensionVersion()}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const Header: Component = () => {
  const { addCustomAdapter } = useSettings();
  const location = useLocation();

  return (
    <div class="flex w-full justify-between bg-indigo-950/30 p-2">
      <Show when={location.pathname === "/adapters"}>
        <div class="flex cursor-pointer items-center hover:opacity-60" onClick={addCustomAdapter}>
          <FaSolidCirclePlus size={20} />
          <p class="pl-1.5">Add custom adapter</p>
        </div>
        <div class="flex cursor-pointer items-center hover:opacity-60" onClick={showSettingsMenu}>
          <p class="pr-1.5">Settings</p>
          <IoSettingsSharp size={20} />
        </div>
      </Show>
      <Show when={location.pathname !== "/adapters"}>
        <A href="/adapters" class="flex cursor-pointer items-center hover:opacity-60">
          <FaSolidCircleArrowLeft size={20} />
          <p class="pl-1.5">Go back</p>
        </A>
      </Show>
    </div>
  );
};

export default App;
