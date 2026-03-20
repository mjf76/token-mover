import OBR from "@owlbear-rodeo/sdk";

const GRID_SIZE = 150;
let selectedTokenId = null;

const loading = document.getElementById("loading");
const main = document.getElementById("main");
const tokenList = document.getElementById("token-list");
const dpad = document.getElementById("dpad");
const tokenName = document.getElementById("token-name");
const debug = document.getElementById("debug");

function log(msg) {
  debug.innerHTML += msg + "<br>";
}

OBR.onReady(async () => {
  log("✅ OBR pronto");
  loading.classList.add("hidden");
  main.classList.remove("hidden");

  const scenaPronte = await OBR.scene.isReady();
  log("🎬 Scena pronta: " + scenaPronte);

  if (scenaPronte) {
    await caricaToken();
  }

  OBR.scene.onReadyChange(async (ready) => {
    log("🔄 Scena cambio stato: " + ready);
    if (ready) {
      await caricaToken();
    } else {
      tokenList.innerHTML = '<option value="">-- seleziona il tuo token --</option>';
      dpad.classList.add("hidden");
    }
  });

  OBR.scene.items.onChange(() => {
    log("🔁 Items cambiati");
    caricaToken();
  });
});

async function caricaToken() {
  try {
    const tuttiItems = await OBR.scene.items.getItems();
    log("📦 Items trovati: " + tuttiItems.length);
    tuttiItems.forEach(i => log("  → [" + i.layer + "] " + (i.name || "senza nome")));

    const valorePrecedente = tokenList.value;
    tokenList.innerHTML = '<option value="">-- seleziona il tuo token --</option>';

    tuttiItems.forEach((item) => {
      const option = document.createElement("option");
      option.value = item.id;
      option.textContent = "[" + item.layer + "] " + (item.name || "senza nome");
      tokenList.appendChild(option);
    });

    if (valorePrecedente) {
      tokenList.value = valorePrecedente;
      if (tokenList.value) {
        mostraDpad(valorePrecedente, tuttiItems.find(i => i.id === valorePrecedente)?.name);
      }
    }
  } catch(e) {
    log("❌ Errore: " + e.message);
  }
}

tokenList.addEventListener("change", (e) => {
  const id = e.target.value;
  const nome = tokenList.options[tokenList.selectedIndex]?.text;
  if (id) {
    selectedTokenId = id;
    mostraDpad(id, nome);
  } else {
    selectedTokenId = null;
    dpad.classList.add("hidden");
  }
});

function mostraDpad(id, nome) {
  selectedTokenId = id;
  dpad.classList.remove("hidden");
  tokenName.textContent = "Token selezionato: " + nome;
}

async function muoviToken(dx, dy) {
  if (!selectedTokenId) return;
  await OBR.scene.items.updateItems([selectedTokenId], (items) => {
    for (const item of items) {
      item.position.x += dx * GRID_SIZE;
      item.position.y += dy * GRID_SIZE;
    }
  });
}

document.getElementById("btn-up").addEventListener("click", () => muoviToken(0, -1));
document.getElementById("btn-down").addEventListener("click", () => muoviToken(0, 1));
document.getElementById("btn-left").addEventListener("click", () => muoviToken(-1, 0));
document.getElementById("btn-right").addEventListener("click", () => muoviToken(1, 0));
document.getElementById("btn-center").addEventListener("click", async () => {
  if (!selectedTokenId) return;
  const items = await OBR.scene.items.getItems([selectedTokenId]);
  if (items.length > 0) {
    const t = items[0];
    await OBR.notification.show(
      "📍 " + t.name + " — X: " + Math.round(t.position.x) + ", Y: " + Math.round(t.position.y),
      "INFO"
    );
  }
});