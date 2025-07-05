import type { NextApiRequest, NextApiResponse } from "next";

// fetching gold api 
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const url = "https://www.goldapi.io/api/XAU/USD";
  const apiKey = process.env.GOLD_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "API key not set" });
  }

  try {
    const response = await fetch(url, {
      headers: { "x-access-token": apiKey }
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: "Failed to fetch gold price" });
    }

    const data = await response.json();
    const pricePerOunce = data.price;
    const pricePerGram = pricePerOunce / 31.1035;

    return res.status(200).json({ pricePerGram: pricePerGram.toFixed(2)});
  } catch (error) {
    return res.status(500).json({ error: `Internal Server Error: ${error}` });
  }
}
