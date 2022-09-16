import { browser } from "webextension-polyfill-ts";
import { IOptions } from "./types";

export const log = (message: string) => console.log(`TTLEnhance: ${message}`);

export const getOptions = async () => {
  const data = await browser.storage.sync.get({
    // settings: {
    autoDope: false,
    confetti: false,
    hideLightbulbs: false,
    // },
  });

  return data as IOptions;
};

// export const setOptions = async (changes: Partial<IOptions>) => {
//   const currentOptions = getOptions();

//   browser.storage.sync.set({
//     settings: {
//       currentOptions,
//       ...changes,
//     },
//   });
// };
