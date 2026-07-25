chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "captureBug") {
    chrome.tabs.captureVisibleTab(null, { format: "png" }, (dataUrl) => {
      chrome.storage.sync.get(["apiKey"], async (result) => {
        const apiKey = result.apiKey;
        if (!apiKey) {
          sendResponse({ success: false, error: "Missing API Key" });
          return;
        }

        try {
          // Prepare bug payload
          const payload = {
            screenshotUrl: dataUrl,
            note: request.note,
            pageUrl: sender.tab?.url || "",
          };

          // Example POST request to API backend
          // const res = await fetch("http://localhost:3000/api/reports", {
          //   method: "POST",
          //   headers: {
          //     "Content-Type": "application/json",
          //     "Authorization": `Bearer ${apiKey}`
          //   },
          //   body: JSON.stringify(payload)
          // });

          sendResponse({ success: true });
        } catch (err) {
          sendResponse({ success: false, error: err.message });
        }
      });
    });
    return true; // Keep message channel open for async response
  }
});
