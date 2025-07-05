// Helper funtions
export async function getGoldPricePerGram(): Promise<number | null> {
  try {
    const res = await fetch("/api/getGold");
    if (!res.ok) throw new Error("Failed to fetch gold price");
    const json = await res.json();
    return parseFloat(json.pricePerGram);
  } catch (error) {
    return null;
  }
}

export async function getLocalProduct(): Promise<Product[] | null> {
    try {
      const res = await fetch("/localJson/products.json");
      if (!res.ok) {
        throw new Error(`HTTP Status Error: ${res.status}`);
      }
      const data = await res.json();
      return data;
    } catch (error) {
      throw new Error(`Failed to fetch products: ${error}`);
    } 
}
