document.addEventListener("DOMContentLoaded", async () => {
  const apiKeyInput = document.getElementById("apiKey");
  const saveKeyBtn = document.getElementById("saveKeyBtn");
  const captureBtn = document.getElementById("captureBtn");
  const statusEl = document.getElementById("status");

  // Load saved API Key from chrome.storage.local
  const { apiKey } = await chrome.storage.local.get("apiKey");
  if (apiKey) {
    apiKeyInput.value = apiKey;
  }

  saveKeyBtn.addEventListener("click", async () => {
    const key = apiKeyInput.value.trim();
    if (!key) {
      statusEl.className = "error";
      statusEl.textContent = "API key cannot be empty";
      return;
    }
    await chrome.storage.local.set({ apiKey: key });
    statusEl.className = "success";
    statusEl.textContent = "API Key saved!";
  });

  captureBtn.addEventListener("click", captureAndSend);
});

async function captureAndSend() {
  const statusEl = document.getElementById("status");
  statusEl.className = "";
  statusEl.textContent = "Capturing bug...";

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab) {
      throw new Error("No active tab found");
    }

    const screenshotUrl = await chrome.tabs.captureVisibleTab();
    const { apiKey } = await chrome.storage.local.get("apiKey");

    if (!apiKey) {
      statusEl.className = "error";
      statusEl.textContent = "Please save an API Key first.";
      return;
    }

    const payload = {
      pageUrl: tab.url,
      screenshotUrl,
      browserInfo: { userAgent: navigator.userAgent },
      note: document.getElementById("note").value,
    };

    const res = await fetch("http://localhost:3000/api/reports", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      statusEl.className = "success";
      statusEl.textContent = "Sent!";
      document.getElementById("note").value = "";
    } else {
      const errorData = await res.json().catch(() => ({}));
      statusEl.className = "error";
      statusEl.textContent = "Failed: " + (errorData.error || res.statusText);
    }
  } catch (err) {
    statusEl.className = "error";
    statusEl.textContent = "Failed: " + err.message;
  }
}
