// ==============================
// API Configuration (LIVE BACKEND)
// ==============================
const API_URL = "https://ai-bot-xp22.onrender.com/chat";

// ==============================
// DOM Elements
// ==============================
const userInput = document.getElementById("userInput");
const askButton = document.getElementById("askButton");
const clearButton = document.getElementById("clearButton");
const chatHistory = document.getElementById("chatHistory");
const loadingIndicator = document.getElementById("loadingIndicator");
const errorMessage = document.getElementById("errorMessage");
const charCounter = document.getElementById("charCounter");
const suggestedPrompts = document.getElementById("suggestedPrompts");
const promptButtons = document.querySelectorAll(".prompt-btn");

// ==============================
// State
// ==============================
let messages = [];

// ==============================
// Event Listeners
// ==============================
askButton.addEventListener("click", handleAskAI);
clearButton.addEventListener("click", handleClearChat);
userInput.addEventListener("input", updateCharCounter);

userInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        handleAskAI();
    }
});

// Suggested prompt buttons
promptButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
        const prompt = btn.getAttribute("data-prompt");
        userInput.value = prompt;
        updateCharCounter();
        userInput.focus();
    });
});

// ==============================
// Character Counter
// ==============================
function updateCharCounter() {
    const count = userInput.value.length;
    charCounter.textContent = `${count} / 1000`;

    if (count > 900) {
        charCounter.style.color = "#dc3545";
    } else if (count > 700) {
        charCounter.style.color = "#ffc107";
    } else {
        charCounter.style.color = "#666";
    }
}

// ==============================
// Main Chat Handler
// ==============================
async function handleAskAI() {
    const prompt = userInput.value.trim();

    if (!prompt) {
        showError("Please enter a question or prompt.");
        return;
    }

    if (messages.length === 0) {
        suggestedPrompts.classList.add("hidden");
    }

    addMessage("user", prompt);

    userInput.value = "";
    updateCharCounter();

    hideError();
    showLoading();
    disableInput();

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ prompt }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || "Failed to get AI response");
        }

        if (data.status === "success" && data.response) {
            addMessage("ai", data.response);
        } else {
            throw new Error("Invalid response from server");
        }
    } catch (error) {
        console.error(error);
        showError("Unable to reach AI server. Please try again.");
    } finally {
        hideLoading();
        enableInput();
    }
}

// ==============================
// Chat Rendering
// ==============================
function addMessage(type, text) {
    const timestamp = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
    });

    messages.push({ type, text, timestamp });
    renderChatHistory();

    chatHistory.classList.remove("hidden");

    setTimeout(() => {
        chatHistory.scrollTop = chatHistory.scrollHeight;
    }, 100);
}

function renderChatHistory() {
    chatHistory.innerHTML = "";

    messages.forEach((msg, index) => {
        const wrapper = document.createElement("div");
        wrapper.className = "chat-message";

        if (msg.type === "user") {
            wrapper.innerHTML = `
                <div class="user-message">
                    <div class="message-header">
                        <span>👤 You</span>
                        <span>${msg.timestamp}</span>
                    </div>
                    <div class="message-text">${escapeHtml(msg.text)}</div>
                </div>
            `;
        } else {
            wrapper.innerHTML = `
                <div class="ai-message">
                    <div class="message-header">
                        <span>🤖 Mr.Cool</span>
                        <span>${msg.timestamp}</span>
                    </div>
                    <div class="message-text">${escapeHtml(msg.text)}</div>
                    <button class="copy-btn" onclick="copyToClipboard(${index}, event)">📋 Copy</button>
                </div>
            `;
        }

        chatHistory.appendChild(wrapper);
    });
}

// ==============================
// Copy to Clipboard
// ==============================
function copyToClipboard(index, event) {
    const msg = messages[index];
    if (!msg || msg.type !== "ai") return;

    navigator.clipboard.writeText(msg.text).then(() => {
        const btn = event.target;
        const original = btn.innerText;
        btn.innerText = "✅ Copied!";
        setTimeout(() => (btn.innerText = original), 2000);
    });
}

// ==============================
// Clear Chat
// ==============================
function handleClearChat() {
    if (messages.length === 0) return;

    if (confirm("Clear chat history?")) {
        messages = [];
        chatHistory.innerHTML = "";
        chatHistory.classList.add("hidden");
        suggestedPrompts.classList.remove("hidden");
        hideError();
    }
}

// ==============================
// Utils
// ==============================
function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}

function showLoading() {
    loadingIndicator.classList.remove("hidden");
}

function hideLoading() {
    loadingIndicator.classList.add("hidden");
}

function showError(msg) {
    errorMessage.textContent = msg;
    errorMessage.classList.remove("hidden");
    setTimeout(hideError, 5000);
}

function hideError() {
    errorMessage.classList.add("hidden");
}

function disableInput() {
    userInput.disabled = true;
    askButton.disabled = true;
    clearButton.disabled = true;
}

function enableInput() {
    userInput.disabled = false;
    askButton.disabled = false;
    clearButton.disabled = false;
    userInput.focus();
}

// ==============================
// Init
// ==============================
window.addEventListener("load", () => {
    userInput.focus();
    updateCharCounter();
});
