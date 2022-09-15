import { browser } from "webextension-polyfill-ts";
import { IOptions } from "./types";

export const log = (message: string) => console.log(`TTLEnhance: ${message}`);

export const getOptions = async () => {
  const data = await browser.storage.sync.get({
    autoDope: false,
    confetti: false,
  });

  return data as IOptions;
};
