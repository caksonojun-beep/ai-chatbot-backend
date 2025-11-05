// server.js (debug-friendly)
import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// Logging sederhana
console.log("📥 Starting server script...");

// CORS & preflight
app.use(cors());
app.options("*", cors());
app.use(express.json());

// Global error handlers (bantu tangkap crash)
process.on("uncaughtException", (err) => {
  console.error("🔴 Uncaught Exception:", err && (err.stack || err));
});
process.on("unhandledRejection", (reason) => {
  console.error("🔴 Unhandled Rejection:", reason && (reason.stack || reason));
});

app.get("/", (req, res) => {
  res.send("✅ Server AI Chatbot aktif (debug)");
});

app.post("/chat", async (req, res) => {
  try {
    console.log("📩 POST /chat body:", req.body);
    if (!req.body || typeof req.body.message !== "string") {
      return res.status(400).json({ error: "Bad request: message missing" });
    }

    const apiKey = process.env.AISTUDIO_API_KEY;
    if (!apiKey) {
      console.error("⚠️ AISTUDIO_API_KEY is missing!");
      return res.status(500).json({ error: "AISTUDIO_API_KEY not set" });
    }

    const resp = await fetch("https://api.aistudio.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: req.body.message }]
      }),
      // timeout handling not native in node-fetch v3; we'll rely logs
    });

    const data = await resp.json();
    console.log("📤 AI Studio response status:", resp.status);
    console.log("📦 AI Studio response body:", JSON.stringify(data).slice(0, 1000));

    if (!data?.choices?.[0]?.message?.content) {
      console.error("⚠️ Response from AI Studio invalid:", data);
      return res.status(500).json({ error: "Invalid response from AI Studio" });
    }

    res.json({ reply: data.choices[0].message.content });
  } catch (err) {
    console.error("❌ Error in /chat handler:", err && (err.stack || err));
    res.status(500).json({ error: "Gagal memanggil AI Studio" });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});
