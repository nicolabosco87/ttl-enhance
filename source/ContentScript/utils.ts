import { browser } from "webextension-polyfill-ts";
import { IOptions } from "./types";

export const log = (message: string, ...otherMessages: string[]) =>
  console.log(`TTLEnhance: ${message}`, ...otherMessages);

export const getOptions = async () => {
  const data = await browser.storage.sync.get({
    autoDope: false,
    stats: false,
    confetti: false,
    hideLightbulbs: false,
    moveVibeMeter: false,
  });

  return data as IOptions;
};

export const getElementBySelector = (selector: string) => () => document.querySelector(selector);

export function waitForEl(getElement: () => Element | null) {
  return new Promise((resolve) => {
    if (getElement()) {
      return resolve(getElement());
    }

    const observer = new MutationObserver(() => {
      if (getElement()) {
        resolve(getElement());
        observer.disconnect();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  });
}

export function onElRemove(getElement: () => Element | null) {
  return new Promise<void>((resolve) => {
    const element = getElement();
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

export const getJWT = () => localStorage.getItem("token-storage");
