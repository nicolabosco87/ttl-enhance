import { getOptions } from "./utils";
const confetti = require("canvas-confetti");

const isSuccessfullTrack = () => {
  const needle = document.querySelectorAll("[src*='needle']")[0];

  const st = window.getComputedStyle(needle, null);

  const tr =
    st.getPropertyValue("-webkit-transform") ||
    st.getPropertyValue("-moz-transform") ||
    st.getPropertyValue("-ms-transform") ||
    st.getPropertyValue("-o-transform") ||
    st.getPropertyValue("transform") ||
    "fail...";

  let values = tr.split("(")[1];
  values = values.split(")")[0];
  const valuesSplitted = values.split(",");

  const a = Number(valuesSplitted[0]);
  const b = Number(valuesSplitted[1]);
  //   const c = Number(valuesSplitted[2]);
  // const d = Number(valuesSplitted[3]);
  //   const scale = Math.sqrt(a * a + b * b);
  //   const sin = b / scale;
  const angle = Math.round(Math.atan2(b, a) * (180 / Math.PI));

  return angle >= 45;
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

  // you should  only initialize a canvas once, so save this function
  // we'll save it to the canvas itself for the purpose of this demo
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
