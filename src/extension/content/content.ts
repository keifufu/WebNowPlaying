import { ServiceWorkerUtils } from "../../utils/sw";
import { initPort } from "./port";

initPort();

const onChange = (e: MediaQueryListEvent | MediaQueryList) => {
  if (e.matches) ServiceWorkerUtils.setColorScheme("light");
  else ServiceWorkerUtils.setColorScheme("dark");
};

onChange(matchMedia("(prefers-color-scheme: light)"));
matchMedia("(prefers-color-scheme: light)").addEventListener("change", onChange);
