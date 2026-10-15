import { backInStock } from "../data/products";
import { AboutFeature } from "./AboutFeature";
import { ClearanceFeature } from "./ClearanceFeature";
import { Hero } from "./Hero";
import { ProductCarousel } from "./ProductCarousel";
import { Reveal } from "./Reveal";
import { ShopFinder } from "./ShopFinder";
import { SupportBanner } from "./SupportBanner";

export function HomePage() {
  return (
    <>
      <Hero />
      <ShopFinder />
      <section className="section" id="back-in-stock" aria-labelledby="restock-title">
        <div className="container">
          <Reveal>
            <div className="section-head">
              <div>
                <h2 id="restock-title">Back in Stock</h2>
                <p>These popular items are available again. Get them while they last.</p>
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.08}>
            <ProductCarousel products={backInStock} label="Back in stock products" />
          </Reveal>
        </div>
      </section>
      <ClearanceFeature />
      <AboutFeature />
      <SupportBanner />
    </>
  );
}
