import { log } from "./utils";

export const handleMoveVibeMeter = (moveVibeMeter: boolean) => {
  const needleElement = document.querySelector("[src*='needle']");
  const vibeMeterElement = needleElement ? needleElement.parentElement?.parentElement?.parentElement : null;

  if (vibeMeterElement) {
    if (moveVibeMeter) {
      (vibeMeterElement as HTMLElement).style.order = "-1";
      log("moveVibeMeter enabled");
    } else {
      (vibeMeterElement as HTMLElement).style.order = "0";
      log("moveVibeMeter disabled");
    }
  }
};

export const initMoveVibeMeter = (moveVibeMeter: boolean) => {
  if (!moveVibeMeter) return;

  const check = setInterval(() => {
    const needleElement = document.querySelector("[src*='needle']");
    if (needleElement) {
      clearInterval(check);
      handleMoveVibeMeter(moveVibeMeter);
    }
  });
};
