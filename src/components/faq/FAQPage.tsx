import { useEffect, useMemo, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { faqAnswerPlainText, faqCategories, faqItemText, type FaqCategory } from "../../data/faqs";
import { FAQCategoryNav } from "./FAQCategoryNav";
import { FAQHelpCard } from "./FAQHelpCard";
import { FAQHero } from "./FAQHero";
import { FAQSection } from "./FAQSection";
import { FAQSupportCTA } from "./FAQSupportCTA";

const defaultOpenId = faqCategories[0]?.items[0]?.id ?? "";

function filterCategories(query: string): FaqCategory[] {
  const needle = query.trim().toLowerCase();
  if (!needle) {
    return faqCategories;
  }
  return faqCategories
    .map((category) => ({
      ...category,
      items: category.items.filter((item) => faqItemText(item).toLowerCase().includes(needle)),
    }))
    .filter((category) => category.items.length > 0);
}

export function FAQPage() {
  const reduce = useReducedMotion();
  const [query, setQuery] = useState("");
  const [openIds, setOpenIds] = useState<string[]>(defaultOpenId ? [defaultOpenId] : []);
  const [activeId, setActiveId] = useState(faqCategories[0]?.id ?? "");
  const [pendingScroll, setPendingScroll] = useState<string | null>(null);
  const visibleCategories = useMemo(() => filterCategories(query), [query]);
  const searching = query.trim().length > 0;

  useEffect(() => {
    const previousTitle = document.title;
    const meta = document.querySelector('meta[name="description"]');
    const previousDescription = meta?.getAttribute("content") ?? "";
    document.title = "Frequently Asked Questions | Suzuki Parts USA";
    meta?.setAttribute(
      "content",
      "Answers about shipping, payment, warranty, returns, and promotions from Suzuki Parts USA.",
    );

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = "faq-structured-data";
    script.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqCategories.flatMap((category) =>
        category.items.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: faqAnswerPlainText(item),
          },
        })),
      ),
    });
    document.head.appendChild(script);

    return () => {
      document.title = previousTitle;
      meta?.setAttribute("content", previousDescription);
      script.remove();
    };
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setOpenIds(defaultOpenId ? [defaultOpenId] : []);
      return;
    }
    setOpenIds(filterCategories(query).flatMap((category) => category.items.map((item) => item.id)));
  }, [query]);

  useEffect(() => {
    if (!pendingScroll) {
      return;
    }
    document.getElementById(pendingScroll)?.scrollIntoView({
      behavior: reduce ? "auto" : "smooth",
      block: "start",
    });
    setPendingScroll(null);
  }, [pendingScroll, reduce, searching]);

  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (!faqCategories.some((category) => category.id === hash)) {
      return;
    }
    setActiveId(hash);
    setPendingScroll(hash);
  }, []);

  useEffect(() => {
    if (searching) {
      return;
    }
    const sections = faqCategories
      .map((category) => document.getElementById(category.id))
      .filter((section): section is HTMLElement => section instanceof HTMLElement);
    if (sections.length === 0) {
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((left, right) => right.intersectionRatio - left.intersectionRatio)[0];
        if (visible?.target.id) {
          setActiveId(visible.target.id);
        }
      },
      { rootMargin: "-25% 0px -55% 0px", threshold: [0.15, 0.4, 0.7] },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [searching]);

  const toggle = (id: string) => {
    setOpenIds((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  };

  const selectCategory = (id: string) => {
    setQuery("");
    setActiveId(id);
    setPendingScroll(id);
    window.history.replaceState(null, "", `#${id}`);
  };

  return (
    <>
      <FAQHero query={query} onQueryChange={setQuery} />
      <section className="faq-body" aria-label="Frequently asked questions">
        <div className="container faq-layout">
          <aside className="faq-sidebar">
            <FAQCategoryNav activeId={searching ? "" : activeId} onSelect={selectCategory} />
            <FAQHelpCard />
          </aside>
          <div className="faq-main">
            {visibleCategories.length > 0 ? (
              visibleCategories.map((category) => (
                <FAQSection key={category.id} category={category} openIds={openIds} onToggle={toggle} />
              ))
            ) : (
              <div className="faq-empty" role="status">
                <h2>No matching questions</h2>
                <p>
                  Nothing in the FAQs matches “{query.trim()}”. Try another word, or contact the team if you still
                  need help.
                </p>
                <a className="btn" href="/contact">
                  Contact Us
                </a>
              </div>
            )}
          </div>
        </div>
        <p className="faq-credit container">
          Engine photo:{" "}
          <a href="https://commons.wikimedia.org/wiki/File:2ZZ-GE_camshafts_inside_engine.jpg">
            Toyota 2ZZ-GE camshafts inside an engine
          </a>{" "}
          by Randaarde,{" "}
          <a href="https://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</a>.
        </p>
      </section>
      <FAQSupportCTA />
    </>
  );
}
