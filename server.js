import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// ✅ Aktifkan CORS agar frontend (localhost atau domain lain) bisa akses
app.use(cors({
  origin: "*",
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

// ✅ Route tes biar gak 404 saat diakses langsung
app.get("/", (req, res) => {
  res.send("✅ Server AI Chatbot aktif di Railway!");
});

// ✅ Endpoint utama untuk chatbot
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

    if (!data || !data.choices || !data.choices[0].message) {
      console.error("❌ Response dari AI Studio tidak valid:", data);
      return res.status(500).json({ error: "Respons AI tidak valid" });
    }

    res.json({ reply: data.choices[0].message.content });
  } catch (error) {
    console.error("❌ Error saat memanggil AI Studio:", error);
    res.status(500).json({ error: "Gagal menghubungi AI Studio" });
  }
});

// ✅ Gunakan PORT dari Railway atau default ke 5000 (untuk lokal)
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server berjalan di port ${PORT}`));
