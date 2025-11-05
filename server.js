import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// ✅ Izinkan semua origin sementara
app.use(cors({
  origin: "*",
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

// ✅ Endpoint untuk tes (biar tahu server hidup)
app.get("/", (req, res) => {
  res.send("✅ Server AI Chatbot aktif dan siap digunakan!");
});

app.post("/chat", async (req, res) => {
  try {
    if (!process.env.AISTUDIO_API_KEY) {
      throw new Error("API key belum diatur di Railway Variables");
    }

    const response = await fetch("https://api.aistudio.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.AISTUDIO_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: req.body.message }]
      })
    });

    const data = await response.json();
    res.json({ reply: data?.choices?.[0]?.message?.content || "⚠️ Tidak ada respons dari AI." });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ error: "Gagal menghubungi AI Studio" });
  }
});

// ✅ Railway pakai PORT environment variable
const PORT = process.env.PORT || 8080;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server berjalan di port ${PORT}`);
});
