export type FaqSource = {
  label: string;
  paragraphs: string[];
};

export type FaqReview = {
  summary: string;
  sources: FaqSource[];
};

export type FaqItem = {
  id: string;
  question: string;
  paragraphs: string[];
  review?: FaqReview;
};

export type FaqCategory = {
  id: string;
  label: string;
  eyebrow: string;
  title: string;
  description: string;
  items: FaqItem[];
};

export const faqCategories: FaqCategory[] = [
  {
    id: "shipping",
    label: "Shipping & Delivery",
    eyebrow: "Shipping & Delivery",
    title: "Shipping & Delivery",
    description: "Information about shipping options, delivery times, and international orders.",
    items: [
      {
        id: "shipping-cost",
        question: "How much does shipping cost?",
        paragraphs: [
          "Suzuki Parts USA ships via USPS, UPS, and DHL. Many items are shipped free. Shipping charges are added at checkout based on the method chosen. The charge uses real-time rates from the chosen carrier for the ship-to location.",
        ],
      },
      {
        id: "puerto-rico",
        question: "Do you ship to Puerto Rico?",
        paragraphs: [
          "Yes. Most items ship to Puerto Rico via USPS, and DHL may also be available. At checkout, select Puerto Rico as the country, not as a state. Many items ship free to Puerto Rico. Others require a shipping charge.",
        ],
      },
      {
        id: "international",
        question: "Do you ship internationally?",
        paragraphs: [
          "Yes. Suzuki Parts USA ships to most countries via DHL, and ships to Canada and Mexico through several carrier options. Taxes and duties are the buyer’s responsibility in each country and are due to the carrier before delivery.",
        ],
      },
      {
        id: "shipping-time",
        question: "How long does shipping take?",
        paragraphs: [
          "Orders are often shipped the next business day, but an order may ship within 3 business days of purchase. Time in transit depends on the shipping method, the carrier, and the delivery location.",
        ],
      },
      {
        id: "sales-tax",
        question: "Will I be charged sales tax?",
        paragraphs: [
          "Suzuki Parts USA is located in Kentucky. A sales tax rate of 6% is charged on any order shipped within Kentucky. Because of the Wayfair v. South Dakota decision on June 21, 2018, tax may also be collected for the state where the order is delivered. When tax is not collected on an out-of-state purchase, it is up to the buyer to report the purchase to their state and pay the applicable sales tax.",
        ],
      },
    ],
  },
  {
    id: "payment",
    label: "Payment & Warranty",
    eyebrow: "Payment & Warranty",
    title: "Payment & Warranty",
    description: "Learn about accepted payment methods and manufacturer warranties.",
    items: [
      {
        id: "payment-methods",
        question: "What payment methods do you accept?",
        paragraphs: [
          "Suzuki Parts USA accepts all major credit cards through PayPal. A PayPal account is not required to pay.",
        ],
      },
      {
        id: "warranty",
        question: "What warranty comes with the parts?",
        paragraphs: ["Parts carry the original manufacturer’s warranty."],
      },
    ],
  },
  {
    id: "returns",
    label: "Returns & Refunds",
    eyebrow: "Returns & Refunds",
    title: "Returns & Refunds",
    description: "Details from the About page FAQ and the Refund and Returns page.",
    items: [
      {
        id: "return-policy",
        question: "What is your return policy?",
        paragraphs: [],
        review: {
          summary:
            "Needs review. The About page FAQ and the Refund and Returns page do not agree on the return window. Both statements are shown here until the correct policy is confirmed.",
          sources: [
            {
              label: "About page FAQ",
              paragraphs: [
                "Returns are accepted up to 14 days from the date of purchase. The item must be returned in new condition and in its original packaging. The buyer pays return shipping. A 20% restocking fee may be deducted from the refund.",
              ],
            },
            {
              label: "Refund and Returns page",
              paragraphs: [
                "The refund and returns policy lasts 30 days. If 30 days have passed since the purchase, a full refund or exchange is not offered. To be eligible, the item must be unused, in the same condition it was received, and in the original packaging.",
                "Only regular-priced items may be refunded. Clearance items cannot be returned. The buyer pays the return shipping, and the original shipping cost is not refunded. Mail the return to SPUSA, 1000 Gilberts Creek Rd, Lawrenceburg, KY 40342, and include the order number on the box or on a note inside the box.",
                "After the return is received and inspected, the refund is applied to the original payment method. A partial refund may be credited if the item is returned because of an inaccurate address, or if the packaging is not original and the item is not unused.",
              ],
            },
          ],
        },
      },
      {
        id: "incorrect-address",
        question: "What if my order is returned because of an incorrect address?",
        paragraphs: [
          "The About page FAQ says an item returned by the courier because of an inaccurate address is charged a 20% restocking fee. Verify the address before submitting the order.",
          "The Refund and Returns page says a partial refund may be credited when an item is returned because of an inaccurate address.",
        ],
      },
    ],
  },
  {
    id: "promotions",
    label: "Promotions",
    eyebrow: "Promotions",
    title: "Promotions",
    description: "Information about sales, discounts, and promotional pricing.",
    items: [
      {
        id: "promo-pricing",
        question: "Can an earlier order receive a later promotional price?",
        paragraphs: [
          "When a promotion is active, orders placed before the promotion dates are not adjusted to the promotional price.",
        ],
      },
    ],
  },
];

export function faqItemText(item: FaqItem) {
  const parts = [item.question, ...item.paragraphs];
  if (item.review) {
    parts.push(item.review.summary);
    for (const source of item.review.sources) {
      parts.push(source.label, ...source.paragraphs);
    }
  }
  return parts.join(" ");
}

export function faqAnswerPlainText(item: FaqItem) {
  if (!item.review) {
    return item.paragraphs.join(" ");
  }
  const sources = item.review.sources
    .map((source) => `${source.label}: ${source.paragraphs.join(" ")}`)
    .join(" ");
  return `${item.review.summary} ${sources}`;
}
