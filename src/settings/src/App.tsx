import { Navigate, Route, Routes } from "@solidjs/router";
import clsx from "clsx";
import { Component, createSignal, onMount } from "solid-js";
import { getExtensionVersion } from "../../utils/misc";
import { ServiceWorkerUtils } from "../../utils/sw";
import Hyperlink from "./components/Hyperlink";
import RouterLink from "./components/RouterLink";
import SanitizationSettings from "./components/SanitizationSettings";
import SiteSettings from "./components/SiteSettings";
import { useBorderColorClass, useTheme } from "./hooks/useTheme";
import AdaptersPage from "./routes/AdaptersPage";
import ReportIssuesPage from "./routes/ReportIssuesPage";
import SupportedSitesPage from "./routes/SupportedSitesPage";
import UnsupportedSitesPage from "./routes/UnsupportedSitesPage";
import { lmao } from "./utils/common";

ServiceWorkerUtils.resetOutdated();

const App: Component = () => {
  const { theme, setTheme } = useTheme();
  const borderColorClass = useBorderColorClass();

  const [buffer, setBuffer] = createSignal<string[]>([]);

  onMount(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const konamiCode = [
        "ArrowUp",
        "ArrowUp",
        "ArrowDown",
        "ArrowDown",
        "ArrowLeft",
        "ArrowRight",
        "ArrowLeft",
        "ArrowRight",
        "KeyB",
        "KeyA",
        "Enter",
      ];
      const nextBuffer = [...buffer(), e.code];
      if (konamiCode.toString() === nextBuffer.toString()) {
        if (theme() === "konami") {
          setTheme(localStorage.getItem("pre-konami-theme") as "dark" | "light");
        } else {
          localStorage.setItem("pre-konami-theme", theme());
          setTheme("konami");
        }
        setBuffer([]);
      } else {
        if (e.code === "Enter") return setBuffer([]);
        setBuffer(nextBuffer);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  const toggleTheme = () => {
    if (theme() === "konami") return;
    theme() === "dark" ? setTheme("light") : setTheme("dark");
  };

  return (
    <div
      class={clsx(
        "flex h-screen select-none flex-col",
        [theme() === "dark" && "bg-[#2b2a33] text-white"],
        [theme() === "light" && "bg-slate-100 text-gray-800"],
        [theme() === "konami" && "bg-gradient-to-tl from-[#0CB6C4] to-[#1D358F] text-white"],
        [lmao() && "lmao"]
      )}
    >
      <div class={`mx-2 mt-2 flex h-min shrink-0 justify-between rounded-md border border-solid ${borderColorClass()} px-4 pt-1 pb-2`}>
        <RouterLink text="Adapters" link="/adapters" />
        <RouterLink text="Supported Sites" link="/supportedSites" />
        <RouterLink text="Unsupported Sites" link="/unsupportedSites" />
        <RouterLink text="Report Issues" link="/reportIssues" />
      </div>
      <div class={`m-2 flex h-full grow overflow-hidden rounded-md border border-solid ${borderColorClass()} p-2`}>
        <Routes>
          <Route path="/adapters" component={AdaptersPage} />
          <Route path="/supportedSites" component={SupportedSitesPage} />
          <Route path="/unsupportedSites" component={UnsupportedSitesPage} />
          <Route path="/reportIssues" component={ReportIssuesPage} />
          <Route path="*">
            <Navigate href="/adapters" />
          </Route>
        </Routes>
      </div>
      <div class={`mx-2 mb-2 flex h-min shrink-0 rounded-md border border-solid ${borderColorClass()} px-3 py-1 text-sm`}>
        <div>
          Made by <Hyperlink text="keifufu" link="https://github.com/keifufu" />, <Hyperlink text="tjhrulz" link="https://github.com/tjhrulz" />
        </div>
        <a class="ml-20 cursor-pointer" onClick={toggleTheme}>
          Toggle theme
        </a>
        <div class="ml-auto">
          <Hyperlink text="GitHub" link="https://github.com/keifufu/WebNowPlaying-Redux" /> | v{getExtensionVersion()}
        </div>
      </div>
      <SiteSettings />
      <SanitizationSettings />
    </div>
  );
};

export default App;
