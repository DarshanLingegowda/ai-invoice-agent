import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import fetch from "node-fetch";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "dist")));

const API_KEY = process.env.GOOGLE_API_KEY;

app.post("/api/agent", async (req, res) => {
  const { message, invoices } = req.body;
  
  if (!API_KEY) {
    return res.status(500).json({ reply: "Server configuration error: Missing API Key" });
  }

  const context = invoices ? invoices.map(inv => `${inv.id} | ${inv.client?.name || 'Unknown'} | ${inv.status} | ${inv.amount || 0}`).join("\n") : "No invoices found.";

  try {
    // UPDATED: Using gemini-2.5-flash as confirmed by your ListModels call
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `You are an invoice assistant. Context:\n${context}\n\nUser Question: ${message}` }] }]
        })
      }
    );

    const data = await response.json();
    
    if (data.error) {
       console.error("Gemini API Error:", data.error);
       return res.json({ reply: "AI Error: " + data.error.message });
    }

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm sorry, I couldn't generate a response.";
    res.json({ reply });

  } catch (err) {
    res.status(500).json({ reply: "Failed to connect to AI service." });
  }
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

const port = process.env.PORT || 8080;
app.listen(port, "0.0.0.0", () => {
  console.log(`Server is running on port ${port}`);
});
