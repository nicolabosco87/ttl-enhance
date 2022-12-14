import { getOptions, onElRemove, waitForEl } from "./utils";
const confetti = require("canvas-confetti");

const MIN_ANGLE_FOR_SUCCESSFUL_TRACK = 40;

let confettiInterval: NodeJS.Timeout;

const isSuccessfullTrack = () => {
  const needle = document.querySelectorAll("[src*='needle']")[0];

  const st = window.getComputedStyle(needle, null);

  const tr =
    st.getPropertyValue("-webkit-transform") ||
    st.getPropertyValue("-moz-transform") ||
    st.getPropertyValue("-ms-transform") ||
    st.getPropertyValue("-o-transform") ||
    st.getPropertyValue("transform") ||
    false;

  if (!tr) {
    return false;
  }

  let values = tr.split("(")[1];
  values = values.split(")")[0];
  const valuesSplitted = values.split(",");

  const a = Number(valuesSplitted[0]);
  const b = Number(valuesSplitted[1]);
  const angle = Math.round(Math.atan2(b, a) * (180 / Math.PI));

  return angle >= MIN_ANGLE_FOR_SUCCESSFUL_TRACK;
};

export const initConfetti = () => {
  waitForEl("[src*='needle']").then(() => {
    const needle = document.querySelector("[src*='needle']");

    if (needle && needle.parentElement?.parentElement?.parentElement) {
      const confettiCanvas = document.createElement("canvas");
      confettiCanvas.id = "ttle-confetti";

      needle.parentElement.parentElement.parentElement.append(confettiCanvas);
      needle.parentElement.parentElement.parentElement.style.position = "relative";

      const myConfetti = confetti.create(confettiCanvas, { resize: true });

      // Reset interval if already enabled
      if (confettiInterval) {
        clearInterval(confettiInterval);
      }

      confettiInterval = setInterval(async () => {
        const newOptions = await getOptions();
        if (newOptions.confetti && isSuccessfullTrack()) {
          if (!document.hidden) {
            myConfetti({
              particleCount: 100,
              spread: 70,
              scalar: 1.5,
              origin: { y: 0 },
            });
          }
        }
      }, 1000);

      onElRemove("#ttle-confetti").then(() => {
        if (confettiInterval) {
          clearInterval(confettiInterval);
        }
      });
    }
  });
};
