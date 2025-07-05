type ProductImages = {
  yellow: string;
  rose: string;
  white: string;
};

type Color = "yellow" | "rose" | "white";

type Product = {
  images: ProductImages;
  name: string;
  popularityScore: number;
  weight: number;
};
