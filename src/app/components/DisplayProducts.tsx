"use client"
import { Loader2, Star } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Scrollbar } from "swiper/modules";
import { getGoldPricePerGram, getLocalProduct } from "../utils/fetchGold";
import "swiper/css/scrollbar";
import "swiper/css";
import "swiper/css/navigation";


// handle the star number to show as values between (0,5) 
const popularityToStars = (score: number) => {
  return Math.round(score * 5 * 2) / 2;
};

// handle the star shape 
const Stars = ({ rating }: { rating: number }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  const stars = [];

  for (let i = 1; i <= 5; i++) {
    if (i <= fullStars) {
      stars.push(
        <Star
          key={i}
          size={24}
          color="#fbbf24"
          fill="#fbbf24"
          strokeWidth={1.5}
        />
      );
    } else if (i === fullStars + 1 && hasHalfStar) {
      stars.push(
        <div
          key={i}
          style={{
            position: "relative",
            width: 24,
            height: 24,
            display: "inline-block",
          }}
        >
          <Star
            size={24}
            color="#6b7280"
            fill="#D9D9D9"
            strokeWidth={1.5}
            style={{ position: "absolute", top: 0, left: 0 }}
          />
          <Star
            size={24}
            color="#fbbf24"
            fill="#fbbf24"
            strokeWidth={1.5}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: 24,
              height: 24,
              overflow: "hidden",
              clipPath: "polygon(0 0, 50% 0, 50% 100%, 0 100%)",
            }}
          />
        </div>
      );
    } else {
      stars.push(
        <Star
          key={i}
          size={24}
          color="#6b7280"
          fill="#D9D9D9"
          strokeWidth={1.5}
        />
      );
    }
  }

  return <div className="flex gap-1">{stars}</div>;
};

// get colors to return image based on  it.
const colours: { key: Color; className: string }[] = [
  { key: "yellow", className: "#E6CA97" },
  { key: "white", className: "#D9D9D9" },
  { key: "rose", className: "#E1A4A9" },
];

export default function Products() {
  // state managent 
  const [products, setProducts] = useState<Product[] | null>(null);
  const [goldPrice, setGoldPrice] = useState<number>();
  const [isLoadingProducts, setIsLoadingProducts] = useState<boolean>(false);
  const [isLoadingGold, setIsLoadingGold] = useState<boolean>(false);

  const [minPriceInput, setMinPriceInput] = useState<string>(""); 
  const [maxPriceInput, setMaxPriceInput] = useState<string>(""); 
  const [minStarsInput, setMinStarsInput] = useState<string>(""); 

  const [filteredProducts, setFilteredProducts] = useState<Product[] | null>(null);

  // handle any loading
  const isLoading = isLoadingProducts || isLoadingGold || !products || !goldPrice;

  const getProducts = async () => {
    setIsLoadingProducts(true);
    try {
      const data = await getLocalProduct();
      if (!data) {
        throw new Error("Failed to get products");
      }
      setProducts(data);
      setFilteredProducts(data);
    } catch (error) {
      throw new Error(`Failed to fetch products: ${error}`);
    } finally {
      setIsLoadingProducts(false);
    }
  };


  const getGold = async () => {
    setIsLoadingGold(true);
    try {
      const goldPrice = await getGoldPricePerGram();
      if (!goldPrice) {
        throw new Error("Failed to get gold price");
      }
      setGoldPrice(goldPrice);
    } catch (error) {
      throw new Error(`Failed to fetch gold price: ${error}`);
    } finally {
      setIsLoadingGold(false);
    }
  };

  useEffect(() => {
    Promise.all([getProducts(), getGold()]);
  }, []);

  // Calculate min and max prices 
  const priceRange = useMemo(() => {
    if (!products || !goldPrice) return { min: 0, max: 0 };
    let min = Infinity;
    let max = -Infinity;
    for (const product of products) {
      const price = product.popularityScore + 1 * product.weight * goldPrice;
      if (price < min) min = price;
      if (price > max) max = price;
    }
    return { min: Math.floor(min), max: Math.ceil(max) };
  }, [products, goldPrice]);

  // Filter function 
  const applyFilter = () => {
    if (!products || !goldPrice) return;

    const minPrice = minPriceInput ? parseFloat(minPriceInput) : priceRange.min;
    const maxPrice = maxPriceInput ? parseFloat(maxPriceInput) : priceRange.max;
    const minStars = minStarsInput ? parseFloat(minStarsInput) : 0;

    const filtered = products.filter((product) => {
      const price = product.popularityScore + 1 * product.weight * goldPrice;
      const stars = popularityToStars(product.popularityScore);

      return (
        price >= minPrice &&
        price <= maxPrice &&
        stars >= minStars
      );
    });

    setFilteredProducts(filtered);
  };

  return (
    <div className="w-full flex flex-col items-center px-4 pt-6">
      <main className="w-full ">

       {/* Titile  */}

        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 mb-8 justify-center w-full">
          <h1 className="text-2xl sm:text-4xl font-normal capitalize text-center sm:text-left">
            Product List
          </h1>

          <div className="w-16 h-0.5 bg-black opacity-70 rounded-full my-3 mx-auto sm:hidden" />

          <div className="flex items-center gap-1 sm:gap-2 sm:self-end">
            <div className="hidden sm:block w-[200px]">
              <div className="h-0.5 bg-black opacity-70 rounded-full" />
            </div>

            <span className="text-sm sm:text-base text-gray-400 capitalize">
              Avenir - Book - 45
            </span>
          </div>
        </div>

       {/* FILTER CONTROLS */}
        <div className="flex flex-col sm:flex-row gap-4 items-center mb-6 justify-center">
          <div className="flex flex-col">
            <label htmlFor="minPrice" className="text-sm font-medium mb-1">
              Min Price
            </label>
            <input
              id="minPrice"
              type="number"
              placeholder={`${priceRange.min}`}
              value={minPriceInput}
              onChange={(e) => setMinPriceInput(e.target.value)}
              className="border border-gray-300 rounded px-3 py-1 w-32 text-sm"
              min={priceRange.min}
              max={priceRange.max}
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="maxPrice" className="text-sm font-medium mb-1">
              Max Price
            </label>
            <input
              id="maxPrice"
              type="number"
              placeholder={`${priceRange.max}`}
              value={maxPriceInput}
              onChange={(e) => setMaxPriceInput(e.target.value)}
              className="border border-gray-300 rounded px-3 py-1 w-32 text-sm"
              min={priceRange.min}
              max={priceRange.max}
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="minStars" className="text-sm font-medium mb-1">
              Stars
            </label>
            <input
              id="minStars"
              type="number"
              step={0.5}
              min={0}
              max={5}
              placeholder="0-5"
              value={minStarsInput}
              onChange={(e) => setMinStarsInput(e.target.value)}
              className="border border-gray-300 rounded px-3 py-1 w-28 text-sm"
            />
          </div>

          <button
            onClick={applyFilter}
            className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700 transition mt-6 sm:mt-0 sm:self-end"
          >
            Filter
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="animate-spin" size={48} />
          </div>
        ) : (
          <section className="mt-8">
            <Swiper
              modules={[Navigation, Scrollbar]}
              scrollbar={{ draggable: true }}
              navigation={true}
              spaceBetween={16}
              breakpoints={{
                0: { slidesPerView: 1 },
                640: { slidesPerView: 2 },
                1024: { slidesPerView: 4 },
              }}
              loop={true}
              className="productSwiper"
              style={{ paddingLeft: "20px", paddingRight: "20px" }}
            >
              {(filteredProducts || []).map((product, index) => (
                <SwiperSlide key={index}>
                  <ProductCard product={product} goldPrice={goldPrice!} />
                </SwiperSlide>
              ))}
            </Swiper>
          </section>
        )}
      </main>
    </div>
  );
}

function ProductCard({ product, goldPrice }: { product: Product; goldPrice: number }) {
  const [currentColour, setCurrentColour] = useState<Color>("yellow");
  const { name, popularityScore, images } = product;
  const price = product.popularityScore + 1 * product.weight * goldPrice;
  const img = images[currentColour];
  const stars = popularityToStars(popularityScore);

  return (
    <div className="overflow-hidden p-4 flex flex-col gap-4 items-center mb-6">
      <div className="max-h-96 max-w-96 aspect-square bg-gray-100 overflow-hidden rounded-2xl flex items-center justify-center">
        <img
          src={img}
          alt={`${name} in ${currentColour}`}
          className="object-contain w-full h-full transition duration-300"
        />
      </div>

      <div className="w-full flex flex-col gap-4 items-start max-w-96">
        <div>
          <h3 className="font-semibold text-lg">{name}</h3>
          <span className="text-md">${price.toFixed(2)} USD</span>
        </div>

        <div className="flex justify-center gap-2">
          {colours.map(({ key, className }) => (
            <button
              key={key}
              onClick={() => setCurrentColour(key)}
              aria-label={key}
              className={`relative flex items-center justify-center
              w-8 h-8 rounded-full transition
              ${currentColour === key ? "border-2 border-[#3a3a3a]" : "border-2 border-transparent"}`}
            >
              <span className="block w-5 h-5 rounded-full" style={{ backgroundColor: className }} />
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-1 ">
          <span className="capitalize">{currentColour} Gold</span>
          <div className="flex items-center gap-2 select-none">
            <Stars rating={stars} />
            <span className="text-sm ">{stars}/5</span>
          </div>
        </div>
      </div>
    </div>
  );
}
