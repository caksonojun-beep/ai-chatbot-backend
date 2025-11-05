import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// ✅ Pastikan CORS aktif untuk semua asal (termasuk localhost)
app.use(cors());
app.options("*", cors()); // menangani preflight request (OPTIONS)

app.use(express.json());

app.get("/", (req, res) => {
  res.send("✅ Server AI Chatbot aktif di Railway dengan CORS!");
});

app.post("/chat", async (req, res) => {
  try {
    console.log("📩 Request dari frontend:", req.body.message);

    const response = await fetch("https://api.aistudio.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.AISTUDIO_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: req.body.message }],
      }),
    });

    const data = await response.json();

    if (!data?.choices?.[0]?.message?.content) {
      console.error("⚠️ Respons AI Studio tidak valid:", data);
      return res.status(500).json({ error: "Respons AI tidak valid" });
    }

    res.json({ reply: data.choices[0].message.content });
  } catch (error) {
    console.error("❌ Error koneksi:", error);
    res.status(500).json({ error: "Gagal menghubungi AI Studio" });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server berjalan di port ${PORT}`);
});
