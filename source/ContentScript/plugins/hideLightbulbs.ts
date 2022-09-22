import { log, waitForEl } from "../utils";

export const handleHideLightbulbs = (hideLightbulbs: boolean) => {
  const bulbElements = document.querySelectorAll("[src*='bulb']");

  if (hideLightbulbs) {
    bulbElements.forEach((el) => ((el as HTMLElement).style.display = "none"));
    log("HideLightbulbs enabled");
  } else {
    bulbElements.forEach((el) => ((el as HTMLElement).style.display = "block"));
    log("HideLightbulbs disabled");
  }
};

export const initHideLightBulbs = (hideLightbulbs: boolean) => {
  if (!hideLightbulbs) return;
  waitForEl("[src*='bulb']").then(() => handleHideLightbulbs(hideLightbulbs));
};
