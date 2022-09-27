import { browser } from "webextension-polyfill-ts";
import { handleAutoDope } from "./plugins/autoDope";
import { initConfetti } from "./plugins/confetti";
import { handleHideLightbulbs, initHideLightBulbs } from "./plugins/hideLightbulbs";

// eslint-disable-next-line @typescript-eslint/no-var-requires
import "./content.scss";
import { initModal } from "./modal";
import { CollectLikes } from "./plugins/collectLikes";
import { handleMoveVibeMeter, initMoveVibeMeter } from "./plugins/moveVibemeter";
import { initButton } from "./ttleButton";
import { getElementBySelector, getOptions, log, onElRemove, waitForEl } from "./utils";

const collectLikes = new CollectLikes();

const initTTLEnhance = async () => {
  log("Init TTL Enhance");

  // Init global elements
  initButton();
  initModal();
  // collectLikes.init();

  const options = await getOptions();

  handleAutoDope(options.autoDope);

  const getSidebar = getElementBySelector("#chat-users-scroll-area");
  waitForEl(getSidebar).then(() => {
    refreshSidebarFeatures();
  });

  browser.storage.onChanged.addListener((changes: any) => {
    if (changes.autoDope !== undefined) {
      handleAutoDope(changes.autoDope.newValue);
    }
    if (changes.hideLightbulbs !== undefined) {
      handleHideLightbulbs(changes.hideLightbulbs.newValue);
    }
    if (changes.moveVibeMeter !== undefined) {
      handleMoveVibeMeter(changes.moveVibeMeter.newValue);
    }
    if (changes.stats !== undefined) {
      collectLikes.refreshPreviousPlayedPanel();
    }
  });
};

const refreshSidebarFeatures = async () => {
  const options = await getOptions();
  initMoveVibeMeter(options.moveVibeMeter);
  initHideLightBulbs(options.hideLightbulbs);
  initConfetti();

  const getSidebar = getElementBySelector("#chat-users-scroll-area");

  onElRemove(getSidebar).then(() => {
    waitForEl(getSidebar).then(() => {
      refreshSidebarFeatures();
    });
  });
};

// Init the plugin
initTTLEnhance();
