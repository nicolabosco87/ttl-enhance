import { browser } from "webextension-polyfill-ts";
import { IOptions } from "./types";

export const log = (message: string) => console.log(`TTLEnhance: ${message}`);

export const getOptions = async () => {
  const data = await browser.storage.sync.get({
    autoDope: false,
    confetti: false,
    hideLightbulbs: false,
    moveVibeMeter: false,
  });

  return data as IOptions;
};

export function waitForEl(selector: string) {
  return new Promise((resolve) => {
    if (document.querySelector(selector)) {
      return resolve(document.querySelector(selector));
    }

    const observer = new MutationObserver(() => {
      if (document.querySelector(selector)) {
        resolve(document.querySelector(selector));
        observer.disconnect();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  });
}

export function onElRemove(selector: string) {
  return new Promise<void>((resolve) => {
    const element = document.querySelector(selector);
    if (!element) {
      resolve();
      return;
    }

    const parent = element.parentNode;
    if (!parent) throw new Error("The node must already be attached");

    const obs = new MutationObserver(() => {
      if (!document.body.contains(element)) {
        obs.disconnect();
        resolve();
      }
    });
    obs.observe(document.body, {
      childList: true,
    });
  });
}
