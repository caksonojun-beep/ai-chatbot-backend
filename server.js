import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// 🔧 Izinkan semua origin (termasuk localhost & hosting kamu)
app.use(cors({
  origin: ["*", "http://127.0.0.1:5500", "http://localhost:5500"],
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

app.get("/", (req, res) => {
  res.send("✅ Server AI Chatbot aktif di Railway!");
});

app.post("/chat", async (req, res) => {
  try {
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
    if (!data?.choices?.[0]?.message?.content) {
      console.error("⚠️ Respons AI Studio tidak valid:", data);
      return res.status(500).json({ error: "Respons AI tidak valid" });
    }

    res.json({ reply: data.choices[0].message.content });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ error: "Gagal menghubungi AI Studio" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server berjalan di port ${PORT}`));
