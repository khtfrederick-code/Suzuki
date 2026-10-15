import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { categories } from "../data/categories";
import { vehicles } from "../data/vehicles";
import { CategoryCard } from "./CategoryCard";
import { IconArrow } from "./Icons";
import { Reveal } from "./Reveal";
import { VehicleCard } from "./VehicleCard";

type FinderTab = "vehicle" | "category";

export function ShopFinder() {
  const [tab, setTab] = useState<FinderTab>("vehicle");
  const [selectedId, setSelectedId] = useState(vehicles[0]?.id ?? "samurai");
  const reduce = useReducedMotion();
  const selected = vehicles.find((vehicle) => vehicle.id === selectedId) ?? vehicles[0];

  return (
    <section className="section" id="find-parts" aria-labelledby="finder-title">
      <div className="container">
        <Reveal>
          <div className="section-head">
            <div>
              <h2 id="finder-title">Find the Parts You Need</h2>
              <p>Browse by vehicle or part category to quickly find the parts you need.</p>
            </div>
            <a className="text-link" href="/shop">
              View All Parts <IconArrow />
            </a>
          </div>
        </Reveal>

        <Reveal delay={0.08}>
          <div className="finder">
            <div className="finder-tabs" role="tablist" aria-label="Shop by">
              <button
                type="button"
                role="tab"
                id="tab-vehicle"
                aria-selected={tab === "vehicle"}
                aria-controls="finder-panel"
                className={tab === "vehicle" ? "is-active" : ""}
                onClick={() => setTab("vehicle")}
              >
                Shop by Vehicle
              </button>
              <button
                type="button"
                role="tab"
                id="tab-category"
                aria-selected={tab === "category"}
                aria-controls="finder-panel"
                className={tab === "category" ? "is-active" : ""}
                onClick={() => setTab("category")}
              >
                Shop by Part Category
              </button>
            </div>

            <div
              id="finder-panel"
              role="tabpanel"
              aria-labelledby={tab === "vehicle" ? "tab-vehicle" : "tab-category"}
            >
              <AnimatePresence mode="wait">
                {tab === "vehicle" ? (
                  <motion.div
                    key="vehicle"
                    initial={reduce ? false : { opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={reduce ? undefined : { opacity: 0, y: -8 }}
                    transition={{ duration: reduce ? 0 : 0.22 }}
                  >
                    <div className="choice-grid choice-grid-3">
                      {vehicles.map((vehicle) => (
                        <VehicleCard
                          key={vehicle.id}
                          vehicle={vehicle}
                          selected={vehicle.id === selected?.id}
                          onSelect={setSelectedId}
                        />
                      ))}
                    </div>
                    {selected ? (
                      <div className="finder-action">
                        <a className="btn" href={selected.href}>
                          Browse Parts for Selected Vehicle <IconArrow />
                        </a>
                      </div>
                    ) : null}
                  </motion.div>
                ) : (
                  <motion.div
                    key="category"
                    initial={reduce ? false : { opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={reduce ? undefined : { opacity: 0, y: -8 }}
                    transition={{ duration: reduce ? 0 : 0.22 }}
                  >
                    <div className="choice-grid choice-grid-4">
                      {categories.map((category) => (
                        <CategoryCard key={category.id} category={category} />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
