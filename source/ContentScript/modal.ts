import { browser } from "webextension-polyfill-ts";
import { getOptions } from "./utils";

const modal = document.createElement("div");

export const initModal = async () => {
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
          <input id="ttle-stats-check" aria-invalid="false" type="checkbox" class="ttle-checkbox" checked="">
          <label for="ttle-stats-check" class="ttle-label">Enable Tracks Stats</label>
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
      const statsCheckbox = document.getElementById("ttle-stats-check") as HTMLInputElement;
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

      if (statsCheckbox) {
        statsCheckbox.checked = options.stats;
        statsCheckbox.onclick = () => {
          browser.storage.sync.set({
            stats: statsCheckbox.checked,
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

export const toggleModal = () => {
  modal.classList.toggle("active");
};
