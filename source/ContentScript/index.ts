import { browser } from "webextension-polyfill-ts";
import { handleAutoDope } from "./autoDope";
import { watchConfetti } from "./confetti";
import { handleHideLightbulbs, initHideLightBulbs } from "./hideLightbulbs";

// eslint-disable-next-line @typescript-eslint/no-var-requires
import "./content.scss";
import { handleMoveVibeMeter, initMoveVibeMeter } from "./moveVibemeter";
import { getOptions, log } from "./utils";

const initButton = () => {
  log("initButton");

  const initButtonInterval = setInterval(() => {
    if (document.getElementById("ttle-open")) {
      clearInterval(initButtonInterval);
      return;
    }

    const nextButton = document.querySelector("button[data-testid=library-button]");

    if (nextButton) {
      const newButton = document.createElement("button");
      newButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-alien" width="44" height="44" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round" >
      <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
      <path d="M11 17a2.5 2.5 0 0 0 2 0" />
      <path d="M12 3c-4.664 0 -7.396 2.331 -7.862 5.595a11.816 11.816 0 0 0 2 8.592a10.777 10.777 0 0 0 3.199 3.064c1.666 1 3.664 1 5.33 0a10.777 10.777 0 0 0 3.199 -3.064a11.89 11.89 0 0 0 2 -8.592c-.466 -3.265 -3.198 -5.595 -7.862 -5.595z" />
      <line x1="8" y1="11" x2="10" y2="13" />
      <line x1="16" y1="11" x2="14" y2="13" />
    </svg>`;
      newButton.id = "ttle-open";
      newButton.classList.add("ttle-button");
      newButton.onclick = () => {
        toggleModal();
      };
      nextButton.parentNode?.append(newButton);
    }
  }, 1000);
};

const modal = document.createElement("div");

const initModal = async () => {
  const options = await getOptions();

  modal.id = "ttle-modal";

  modal.innerHTML = `
    <div id="ttle-modal__box">
      <div id="ttle-modal__header">
        <h2 id="modal-title">TTL Enhance</h2>
        <button id="ttle-modal-close" class="sc-dkzDqf dfHUdv sc-iBkjds bDgMN">
          <svg width="1em" height="1em" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg"><title>Close Button</title><path d="M1 1L9 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M9 1L1 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>
        </button>
      </div>
      <div id="ttle-modal__body">
        <div class="" style="margin-top: 0.5rem;">
          <input id="ttle-autodope" aria-invalid="false" type="checkbox" class="ttle-checkbox" checked="">
          <label for="ttle-autodope" class="ttle-label">Enable AutoDope</label>
        <div>

        <div style="margin-top: 0.5rem;">
          <input id="ttle-confetti-check" aria-invalid="false" type="checkbox" class="ttle-checkbox" checked="">
          <label for="ttle-confetti-check" class="ttle-label">Enable Confetti</label>
        <div>

        <div style="margin-top: 0.5rem;">
          <input id="ttle-hide-lightbulbs-check" aria-invalid="false" type="checkbox" class="ttle-checkbox" checked="">
          <label for="ttle-hide-lightbulbs-check" class="ttle-label">Hide LightBulbs</label>
        </div>
        
        <div style="margin-top: 0.5rem;">
          <input id="ttle-move-vibe-meter-check" aria-invalid="false" type="checkbox" class="ttle-checkbox" checked="">
          <label for="ttle-move-vibe-meter-check" class="ttle-label">Move VibeMeter to top</label>
        </div>
      </div>
    </div>
  `;

  const body = document.querySelector("body");
  if (body) {
    body.append(modal);

    setTimeout(() => {
      const close = document.getElementById("ttle-modal-close");
      if (close) {
        close.onclick = () => {
          toggleModal();
        };
      }

      const autodopeCheckbox = document.getElementById("ttle-autodope") as HTMLInputElement;
      const confettiCheckbox = document.getElementById("ttle-confetti-check") as HTMLInputElement;
      const hideLightbulbsCheckbox = document.getElementById("ttle-hide-lightbulbs-check") as HTMLInputElement;
      const moveVibeMeterCheckbox = document.getElementById("ttle-move-vibe-meter-check") as HTMLInputElement;

      if (autodopeCheckbox) {
        autodopeCheckbox.checked = options.autoDope;
        autodopeCheckbox.onclick = () => {
          browser.storage.sync.set({
            autoDope: autodopeCheckbox.checked,
          });
        };
      }

      if (confettiCheckbox) {
        confettiCheckbox.checked = options.confetti;
        confettiCheckbox.onclick = () => {
          browser.storage.sync.set({
            confetti: confettiCheckbox.checked,
          });
        };
      }

      if (hideLightbulbsCheckbox) {
        hideLightbulbsCheckbox.checked = options.hideLightbulbs;
        hideLightbulbsCheckbox.onclick = () => {
          browser.storage.sync.set({
            hideLightbulbs: hideLightbulbsCheckbox.checked,
          });
        };
      }

      if (moveVibeMeterCheckbox) {
        moveVibeMeterCheckbox.checked = options.moveVibeMeter;
        moveVibeMeterCheckbox.onclick = () => {
          browser.storage.sync.set({
            moveVibeMeter: moveVibeMeterCheckbox.checked,
          });
        };
      }
    });
  }
};

const toggleModal = () => {
  modal.classList.toggle("active");
};

const initTTLEnhance = async () => {
  console.log("Init TTL Enhance");

  initButton();
  initModal();
  watchConfetti();

  // get options
  const options = await getOptions();

  handleAutoDope(options.autoDope);
  initMoveVibeMeter(options.moveVibeMeter);
  initHideLightBulbs(options.hideLightbulbs);

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
  });
};

initTTLEnhance();
