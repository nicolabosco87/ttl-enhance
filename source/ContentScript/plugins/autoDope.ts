import { log } from "../utils";

let autoDopeInterval: NodeJS.Timer;

export const handleAutoDope = (autoDope: boolean) => {
  if (autoDope) {
    autoDopeInterval = setInterval(() => {
      const likeButton = document.querySelectorAll("[data-for='vote-button']")[1] as HTMLButtonElement;
      if (likeButton) {
        likeButton.click();
      }
    }, 5000);
    log("AutoDope enabled");
  } else {
    if (autoDopeInterval) {
      clearInterval(autoDopeInterval);
    }
    log("AutoDope disabled");
  }
};
