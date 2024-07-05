const encryptorMap = { a: "ai", e: "enter", i: "imes", o: "ober", u: "ufat" };
const decryptorMap = Object.fromEntries(
  Object.entries(encryptorMap).map(([k, v]) => [v, k])
);

const inputText = document.getElementById("input-text");
const resultText = document.getElementById("result-text");
const actionButton = document.getElementById("action-button");
const copyButton = document.getElementById("copy-button");
const historyDropdown = document.getElementById("history-dropdown");
const tabButtons = document.querySelectorAll(".tab-button");
const copyMessage = document.getElementById("copy-message");
const pasteButton = document.getElementById("paste-button");

let currentMode = "encrypt";
let encryptHistory = [];
let decryptHistory = [];
updateHistoryDisplay();

function encrypt(text) {
  return text.replace(
    /[aeiou]/gi,
    (match) => encryptorMap[match.toLowerCase()] || match
  );
}

function decrypt(text) {
  let decrypted = text;
  Object.entries(decryptorMap).forEach(([code, letter]) => {
    decrypted = decrypted.replace(new RegExp(code, "g"), letter);
  });
  return decrypted;
}

function updateHistory(input) {
  const history = currentMode === "encrypt" ? encryptHistory : decryptHistory;
  if (input && !history.includes(input)) {
    history.push(input);
    updateHistoryDisplay();
  }
}

function updateHistoryDisplay() {
  const history = currentMode === "encrypt" ? encryptHistory : decryptHistory;
  const historyContainer = document.querySelector(".history-container");

  if (history.length === 0) {
    historyContainer.classList.add("hidden");
    return;
  }

  historyContainer.classList.remove("hidden");
  historyDropdown.innerHTML = '<option value="">Seleccionar...</option>';

  history.forEach((item, index) => {
    const option = document.createElement("option");
    option.value = index;
    option.textContent = item;
    historyDropdown.appendChild(option);
  });
}

function performAction() {
  const input = inputText.value;
  if (input.trim() === "") return;

  let output;
  if (currentMode === "encrypt") {
    output = encrypt(input);
  } else {
    output = decrypt(input);
  }
  resultText.value = output;
  updateHistory(input);
  copyToClipboard();
}

async function pasteFromClipboard() {
  try {
    const text = await navigator.clipboard.readText();
    inputText.value = text;
    processInputRealTime();
  } catch (err) {
    console.error("Failed to read clipboard contents: ", err);
  }
}

function copyToClipboard() {
  resultText.select();
  document.execCommand("copy");
  showCopyMessage();
}

function showCopyMessage() {
  copyMessage.textContent = "¡Texto copiado al portapapeles!";
  setTimeout(() => {
    copyMessage.textContent = "";
  }, 3000);
}

function processInputRealTime() {
  const input = inputText.value;
  let output;
  if (currentMode === "encrypt") {
    output = encrypt(input);
  } else {
    output = decrypt(input);
  }
  resultText.value = output;
}

actionButton.addEventListener("click", performAction);

inputText.addEventListener("input", processInputRealTime);

copyButton.addEventListener("click", copyToClipboard);

pasteButton.addEventListener("click", pasteFromClipboard);

historyDropdown.addEventListener("change", (e) => {
  const index = e.target.value;
  if (index !== "") {
    const history = currentMode === "encrypt" ? encryptHistory : decryptHistory;
    inputText.value = history[index];
    processInputRealTime();
  }
});

tabButtons.forEach((button) => {
  button.addEventListener("click", () => {
    currentMode = button.dataset.tab;
    tabButtons.forEach((btn) => btn.classList.remove("active"));
    button.classList.add("active");
    actionButton.textContent =
      currentMode === "encrypt"
        ? "Encriptar / Guardar"
        : "Desencriptar / Guardar";
    pasteButton.textContent = "Pegar texto copiado";
    inputText.value = "";
    resultText.value = "";
    updateHistoryDisplay(); // Llamada aquí
  });
});
