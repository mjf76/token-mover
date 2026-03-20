import OBR from "@owlbear-rodeo/sdk";

const GRID_SIZE = 150; // dimensione cella in unità OBR (default griglia quadrata)

let selectedTokenId = null;

// Elementi UI
const loading = document.getElementById("loading");
const main = document.getElementById("main");
const tokenList = document.getElementById("token-list");
const dpad = document.getElementById("dpad");
const tokenName = document.getElementById("token-name");

// Quando OBR è pronto
OBR.onReady(async () => {
  loading.classList.add("hidden");
  main.classList.remove("hidden");

  await caricaToken();

  // Aggiorna la lista se i token cambiano
  OBR.scene.items.onChange(() => {
    caricaToken();
  });
});

// Carica i token del layer CHARACTER dalla scena
async function caricaToken() {
  const items = await OBR.scene.items.getItems(
    (item) => item.layer === "CHARACTER"
  );

  const valorePrecedente = tokenList.value;
  tokenList.innerHTML = '<option value="">-- seleziona il tuo token --</option>';

  items.forEach((item) => {
    const option = document.createElement("option");
    option.value = item.id;
    option.textContent = item.name || "Token senza nome";
    tokenList.appendChild(option);
  });

  // Ripristina selezione precedente se ancora presente
  if (valorePrecedente) {
    tokenList.value = valorePrecedente;
    if (tokenList.value) {
      mostraDpad(valorePrecedente, items.find(i => i.id === valorePrecedente)?.name);
    }
  }
}

// Mostra il D-Pad quando si seleziona un token
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
  tokenName.textContent = `Token selezionato: ${nome}`;
}

// Funzione di movimento
async function muoviToken(dx, dy) {
  if (!selectedTokenId) return;

  await OBR.scene.items.updateItems([selectedTokenId], (items) => {
    for (const item of items) {
      item.position.x += dx * GRID_SIZE;
      item.position.y += dy * GRID_SIZE;
    }
  });
}

// Bottoni D-Pad
document.getElementById("btn-up").addEventListener("click", () => muoviToken(0, -1));
document.getElementById("btn-down").addEventListener("click", () => muoviToken(0, 1));
document.getElementById("btn-left").addEventListener("click", () => muoviToken(-1, 0));
document.getElementById("btn-right").addEventListener("click", () => muoviToken(1, 0));
document.getElementById("btn-center").addEventListener("click", async () => {
  // Il pulsante centrale mostra le info del token selezionato
  if (!selectedTokenId) return;
  const items = await OBR.scene.items.getItems([selectedTokenId]);
  if (items.length > 0) {
    const t = items[0];
    await OBR.notification.show(
      `📍 ${t.name} — X: ${Math.round(t.position.x)}, Y: ${Math.round(t.position.y)}`,
      "INFO"
    );
  }
});