import { getOptions } from "./utils";
const confetti = require("canvas-confetti");

const MIN_ANGLE_FOR_SUCCESSFUL_TRACK = 45;

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

export const watchConfetti = () => {
  const confettiCanvas = document.createElement("canvas");
  confettiCanvas.id = "ttle-confetti";

  const setCanvasInterval = setInterval(() => {
    const needle = document.querySelector("[src*='needle']");

    if (needle) {
      clearInterval(setCanvasInterval);

      if (needle.parentElement?.parentElement?.parentElement) {
        needle.parentElement?.parentElement?.parentElement?.append(confettiCanvas);
        needle.parentElement.parentElement.parentElement.style.position = "relative";
      }
    }
  });

  const myConfetti = confetti.create(confettiCanvas, { resize: true });

  setInterval(async () => {
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
};
