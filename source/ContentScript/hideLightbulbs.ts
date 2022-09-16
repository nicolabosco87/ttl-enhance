import { log } from "./utils";

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

  const check = setInterval(() => {
    const bulbElements = document.querySelectorAll("[src*='bulb']");
    if (bulbElements.length > 0) {
      clearInterval(check);
      handleHideLightbulbs(hideLightbulbs);
    }
  });
};
