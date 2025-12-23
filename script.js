const API_URL = "https://ai-bot-xp22.onrender.com/chat";

const userInput = document.getElementById("userInput");
const askButton = document.getElementById("askButton");
const clearButton = document.getElementById("clearButton");
const chatHistory = document.getElementById("chatHistory");
const loadingIndicator = document.getElementById("loadingIndicator");
const errorMessage = document.getElementById("errorMessage");
const charCounter = document.getElementById("charCounter");
const suggestedPrompts = document.getElementById("suggestedPrompts");

let messages = [];

document.querySelectorAll(".prompt-btn").forEach(btn => {
  btn.onclick = () => {
    userInput.value = btn.dataset.prompt;
    updateCharCounter();
    userInput.focus();
  };
});

askButton.onclick = handleAsk;
clearButton.onclick = clearChat;
userInput.oninput = updateCharCounter;

function updateCharCounter() {
  charCounter.innerText = `${userInput.value.length} / 1000`;
}

async function handleAsk() {
  const prompt = userInput.value.trim();
  if (!prompt) return showError("Please enter a prompt");

  if (!messages.length) suggestedPrompts.classList.add("hidden");

  addMessage("user", prompt);
  userInput.value = "";
  updateCharCounter();
  showLoading();

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt })
    });

    const data = await res.json();
    if (!res.ok) throw new Error();

    addMessage("ai", data.response);
  } catch {
    showError("Failed to connect to AI server");
  } finally {
    hideLoading();
  }
}

function addMessage(type, text) {
  messages.push({
    type,
    text,
    time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  });
  renderChat();
}

function renderChat() {
  chatHistory.innerHTML = "";
  messages.forEach((msg, i) => {
    const div = document.createElement("div");
    div.className = msg.type === "user" ? "user-message" : "ai-message";
    div.innerHTML = `
      <div class="message-header">
        <span>${msg.type === "user" ? "You" : "Mr.Cool"}</span>
        <span>${msg.time}</span>
      </div>
      <div>${escapeHtml(msg.text)}</div>
      ${msg.type === "ai" ? `<button class="copy-btn" onclick="copyText(${i})">📋 Copy</button>` : ""}
    `;
    chatHistory.appendChild(div);
  });
  chatHistory.classList.remove("hidden");
  chatHistory.scrollTop = chatHistory.scrollHeight;
}

function copyText(i) {
  navigator.clipboard.writeText(messages[i].text);
}

function clearChat() {
  messages = [];
  chatHistory.innerHTML = "";
  chatHistory.classList.add("hidden");
  suggestedPrompts.classList.remove("hidden");
}

function showLoading() {
  loadingIndicator.classList.remove("hidden");
}

function hideLoading() {
  loadingIndicator.classList.add("hidden");
}

function showError(msg) {
  errorMessage.innerText = msg;
  errorMessage.classList.remove("hidden");
  setTimeout(() => errorMessage.classList.add("hidden"), 3000);
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}
