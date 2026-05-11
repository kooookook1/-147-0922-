import express from "express";
import { createServer as createViteServer } from "vite";
import fs from "fs";
import path from "path";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// NOWPayments Configuration
// Note: In production, NEVER hardcode these. Use environment variables.
const NOWPAYMENTS_API_KEY = process.env.NOWPAYMENTS_API_KEY || "J6HD6YW-A53M8FG-QWKBE5C-WTZN476";
const NOWPAYMENTS_API_URL = "https://api.nowpayments.io/v1";

// 1. Check API Status
app.get("/api/nowpayments/status", async (req, res) => {
  try {
    const response = await fetch(`${NOWPAYMENTS_API_URL}/status`);
    const data = await response.json();
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 2. Generate a Unique Payment/Deposit Address
app.post("/api/nowpayments/deposit-address", async (req, res) => {
  const { currency, order_id, order_description } = req.body;
  
  if (!currency) {
    return res.status(400).json({ error: "currency is required" });
  }

  try {
    console.log(`Generating address for: ${currency}, order_id: ${order_id}`);
    
    // We use a high dummy price_amount to generate an open address, since NowPayments
    // will accept partial payments and notify via IPN with the actually_paid amount.
    const response = await fetch(`${NOWPAYMENTS_API_URL}/payment`, {
      method: "POST",
      headers: {
        "x-api-key": NOWPAYMENTS_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        price_amount: 5000,
        price_currency: "usd",
        pay_currency: currency,
        ipn_callback_url: "https://your-domain.com/api/nowpayments/ipn",
        order_id,
        order_description
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
        console.error("NOWPayments Error:", data);
        return res.status(response.status).json(data);
    }
    
    res.json(data);
  } catch (error: any) {
    console.error("NOWPayments Request Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// 3. Handle IPN Callback from NOWPayments (When a user actually pays)
app.post("/api/nowpayments/ipn", async (req, res) => {
  // In a real database scenario, you would verify the HMAC signature here
  // using NOWPAYMENTS_IPN_SECRET and then update the user's balance in SQLite/Postgres.
  console.log("Received IPN from NOWPayments:", req.body);
  const { payment_status, order_id, price_amount } = req.body;
  
  if (payment_status === "finished") {
    console.log(`Payment confirmed! Order ID: ${order_id}, Amount: ${price_amount}`);
    // Here you would add the amount to the user's balance
  }
  
  res.status(200).send("OK");
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Vite middleware for development
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production serving
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`NOWPayments API configured with key: ${NOWPAYMENTS_API_KEY.substring(0, 5)}...`);
  });
}

startServer();
