import { useRef, type KeyboardEvent } from "react";
import { useReducedMotion } from "framer-motion";
import type { Product } from "../types/catalog";
import { IconChevron } from "./Icons";
import { ProductCard } from "./ProductCard";

type ProductCarouselProps = {
  products: Product[];
  label: string;
};

export function ProductCarousel({ products, label }: ProductCarouselProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  const scrollByCard = (direction: number) => {
    const scroller = scrollerRef.current;
    if (!scroller) {
      return;
    }
    const card = scroller.querySelector<HTMLElement>("[data-card]");
    const amount = (card?.offsetWidth ?? 260) + 18;
    scroller.scrollBy({
      left: direction * amount,
      behavior: reduce ? "auto" : "smooth",
    });
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      scrollByCard(1);
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      scrollByCard(-1);
    }
  };

  return (
    <div className="carousel">
      <button type="button" className="carousel-button carousel-prev" aria-label={`Previous ${label}`} onClick={() => scrollByCard(-1)}>
        <IconChevron />
      </button>
      <div
        ref={scrollerRef}
        className="carousel-track"
        tabIndex={0}
        role="region"
        aria-label={label}
        onKeyDown={onKeyDown}
      >
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      <button type="button" className="carousel-button carousel-next" aria-label={`Next ${label}`} onClick={() => scrollByCard(1)}>
        <IconChevron />
      </button>
    </div>
  );
}
