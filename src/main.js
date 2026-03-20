import OBR from "@owlbear-rodeo/sdk";

const GRID_SIZE = 150;
let selectedTokenId = null;
let passiRetti = 0;
let passiDiagonali = 0;

const loading = document.getElementById("loading");
const main = document.getElementById("main");
const dpad = document.getElementById("dpad");
const notFound = document.getElementById("not-found");
const tokenNameLabel = document.getElementById("token-name-label");
const stepCount = document.getElementById("step-count");
const stepDistance = document.getElementById("step-distance");

OBR.onReady(async () => {
  loading.classList.add("hidden");
  main.classList.remove("hidden");

  const scenaPronte = await OBR.scene.isReady();
  if (scenaPronte) {
    await inizializza();
  }

  OBR.scene.onReadyChange(async (ready) => {
    if (ready) {
      await inizializza();
    } else {
      dpad.classList.add("hidden");
      notFound.classList.add("hidden");
      selectedTokenId = null;
      tokenNameLabel.textContent = "";
    }
  });
});

async function aspettaScena() {
  const pronta = await OBR.scene.isReady();
  if (pronta) {
    await inizializza();
  } else {
    setTimeout(aspettaScena, 500);
  }
}

async function inizializza() {
  try {
    const nomeGiocatore = await OBR.player.getName();

    const items = await OBR.scene.items.getItems(
      (item) => item.layer === "CHARACTER"
    );

    const mioToken = items.find(
      (item) => item.name.toLowerCase().trim() === nomeGiocatore.toLowerCase().trim()
    );

    if (mioToken) {
      selectedTokenId = mioToken.id;
      tokenNameLabel.textContent = "🧙 " + mioToken.name;
      notFound.classList.add("hidden");
      dpad.classList.remove("hidden");
    } else {
      selectedTokenId = null;
      tokenNameLabel.textContent = "";
      dpad.classList.add("hidden");
      notFound.classList.remove("hidden");
    }
  } catch(e) {
    setTimeout(inizializza, 500);
  }
}

function aggiornaContapassi(diagonale) {
  if (diagonale) {
    passiDiagonali++;
  } else {
    passiRetti++;
  }

  const ftDiagonali = Math.floor(passiDiagonali / 2) * 10 + (passiDiagonali % 2) * 5;
  const ftTotali = passiRetti * 5 + ftDiagonali;
  const mTotali = (ftTotali * 0.3).toFixed(1);
  const passiTotali = passiRetti + passiDiagonali;

  stepCount.textContent = passiTotali;
  stepDistance.textContent = ftTotali + " ft / " + mTotali + " m";
}

async function centraViewport() {
  try {
    if (!selectedTokenId) return;
    const scenaPronte = await OBR.scene.isReady();
    if (!scenaPronte) return;
    const items = await OBR.scene.items.getItems([selectedTokenId]);
    if (items.length > 0) {
      const scale = await OBR.viewport.getScale();
      await OBR.viewport.animateTo({
        target: items[0].position,
        scale: scale,
      });
    }
  } catch(e) {}
}

async function muoviToken(dx, dy) {
  if (!selectedTokenId) return;
  const diagonale = dx !== 0 && dy !== 0;
  try {
    await OBR.scene.items.updateItems([selectedTokenId], (items) => {
      for (const item of items) {
        item.position.x += dx * GRID_SIZE;
        item.position.y += dy * GRID_SIZE;
      }
    });
    aggiornaContapassi(diagonale);
    await centraViewport();
  } catch(e) {}
}

document.getElementById("btn-up").addEventListener("click", () => muoviToken(0, -1));
document.getElementById("btn-down").addEventListener("click", () => muoviToken(0, 1));
document.getElementById("btn-left").addEventListener("click", () => muoviToken(-1, 0));
document.getElementById("btn-right").addEventListener("click", () => muoviToken(1, 0));
document.getElementById("btn-upleft").addEventListener("click", () => muoviToken(-1, -1));
document.getElementById("btn-upright").addEventListener("click", () => muoviToken(1, -1));
document.getElementById("btn-downleft").addEventListener("click", () => muoviToken(-1, 1));
document.getElementById("btn-downright").addEventListener("click", () => muoviToken(1, 1));

document.getElementById("btn-reset").addEventListener("click", () => {
  passiRetti = 0;
  passiDiagonali = 0;
  stepCount.textContent = "0";
  stepDistance.textContent = "0 ft / 0 m";
});