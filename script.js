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

askButton.onclick = handleAskAI;
clearButton.onclick = clearChat;
userInput.oninput = updateCharCounter;

function updateCharCounter() {
  charCounter.innerText = `${userInput.value.length} / 1000`;
}

async function handleAskAI() {
  const prompt = userInput.value.trim();
  if (!prompt) return showError("Enter a question");

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
    showError("Server error. Try again.");
  } finally {
    hideLoading();
  }
}

function addMessage(type, text) {
  messages.push({ type, text, time: new Date().toLocaleTimeString() });
  renderChat();
}

function renderChat() {
  chatHistory.innerHTML = "";
  messages.forEach((m, i) => {
    const div = document.createElement("div");
    div.className = m.type === "user" ? "user-message" : "ai-message";
    div.innerHTML = `
      <div class="message-header">
        <strong>${m.type === "user" ? "You" : "Mr.Cool"}</strong>
        <span>${m.time}</span>
      </div>
      <div>${escapeHtml(m.text)}</div>
      ${m.type === "ai" ? `<button class="copy-btn" onclick="copyText(${i})">📋 Copy</button>` : ""}
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
  if (!messages.length) return;
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
