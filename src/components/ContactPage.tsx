import { FormEvent, useEffect, useId, useState } from "react";
import { SITE } from "../data/site";
import { IconArrow, IconBox, IconChat, IconClock, IconHelp, IconMail, IconPin, IconWrench } from "./Icons";
import { Reveal } from "./Reveal";

const inquiryTypes = [
  "Part identification",
  "Existing order",
  "Shipping",
  "Return or refund",
  "Something else",
] as const;

type FormState = {
  name: string;
  email: string;
  topic: string;
  message: string;
};

type FormErrors = Partial<Record<keyof FormState, string>>;

const emptyForm: FormState = {
  name: "",
  email: "",
  topic: "",
  message: "",
};

export function ContactPage() {
  const formId = useId();
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState("");

  useEffect(() => {
    const previous = document.title;
    document.title = "Contact Us | Suzuki Parts USA";
    return () => {
      document.title = previous;
    };
  }, []);

  const update = (key: keyof FormState, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
    setStatus("");
  };

  const validate = (values: FormState): FormErrors => {
    const next: FormErrors = {};
    if (!values.name.trim()) {
      next.name = "Enter your name.";
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
      next.email = "Enter a valid email address.";
    }
    if (!values.topic) {
      next.topic = "Choose an inquiry type.";
    }
    if (!values.message.trim()) {
      next.message = "Enter a message.";
    }
    return next;
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validate(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setStatus("");
      return;
    }

    const subject = `Suzuki Parts USA inquiry: ${form.topic}`;
    const body = [
      `Name: ${form.name.trim()}`,
      `Email: ${form.email.trim()}`,
      `Inquiry: ${form.topic}`,
      "",
      form.message.trim(),
    ].join("\n");
    window.location.href = `mailto:${SITE.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setStatus(`Your email app should open with this message addressed to ${SITE.email}. Email is the best way to reach the team.`);
  };

  return (
    <>
      <section className="hero hero-contact" aria-labelledby="contact-title">
        <img
          className="hero-photo"
          src="/assets/vehicles/samurai-mountain-hero.webp"
          alt=""
          width="1280"
          height="720"
          fetchPriority="high"
          decoding="async"
        />
        <div className="hero-shade" />
        <div className="container hero-copy">
          <p className="eyebrow-dash">Contact Us</p>
          <h1 id="contact-title">Get in Touch</h1>
          <p className="hero-lead">
            Questions about an order or need help identifying a Suzuki part? We’re here to help.
          </p>
        </div>
      </section>

      <section className="contact-section" aria-labelledby="contact-info-title">
        <div className="container contact-grid">
          <Reveal>
            <article className="contact-card">
              <h2 id="contact-info-title">Contact Information</h2>
              <p className="contact-intro">Email is the best way to reach our team.</p>
              <ul className="contact-facts">
                <li>
                  <span className="fact-icon" aria-hidden="true">
                    <IconMail />
                  </span>
                  <div>
                    <h3>Email Support</h3>
                    <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
                    <p>This is the preferred method for all inquiries.</p>
                  </div>
                </li>
                <li>
                  <span className="fact-icon" aria-hidden="true">
                    <IconChat />
                  </span>
                  <div>
                    <h3>Text Messages Only</h3>
                    <p className="fact-phone">{SITE.textOnlyPhone}</p>
                    <p>Voicemails cannot be returned.</p>
                  </div>
                </li>
                <li>
                  <span className="fact-icon" aria-hidden="true">
                    <IconPin />
                  </span>
                  <div>
                    <h3>Business Address</h3>
                    <p className="fact-value">
                      {SITE.address[0]}
                      <br />
                      {SITE.address[1]} USA
                    </p>
                  </div>
                </li>
                <li>
                  <span className="fact-icon" aria-hidden="true">
                    <IconClock />
                  </span>
                  <div>
                    <h3>Business Hours</h3>
                    <p className="fact-value">
                      Monday – Friday: 9am to 5pm ET
                      <br />
                      Saturday – Sunday: Closed
                      <br />
                      Online ordering available 24/7
                    </p>
                  </div>
                </li>
              </ul>
            </article>
          </Reveal>

          <Reveal delay={0.08}>
            <article className="contact-card" aria-labelledby="inquiry-title">
              <h2 id="inquiry-title">Send an Inquiry</h2>
              <p className="contact-intro">Fill out the form below and we’ll get back to you as soon as possible.</p>
              <form className="inquiry-form" onSubmit={onSubmit} noValidate>
                <div className="field-row">
                  <div className="field">
                    <label htmlFor={`${formId}-name`}>
                      Your Name <span aria-hidden="true">*</span>
                    </label>
                    <input
                      id={`${formId}-name`}
                      name="name"
                      autoComplete="name"
                      value={form.name}
                      aria-invalid={errors.name ? true : undefined}
                      aria-describedby={errors.name ? `${formId}-name-error` : undefined}
                      placeholder="Enter your name"
                      onChange={(event) => update("name", event.target.value)}
                    />
                    {errors.name ? (
                      <p className="field-error" id={`${formId}-name-error`}>
                        {errors.name}
                      </p>
                    ) : null}
                  </div>
                  <div className="field">
                    <label htmlFor={`${formId}-email`}>
                      Email Address <span aria-hidden="true">*</span>
                    </label>
                    <input
                      id={`${formId}-email`}
                      name="email"
                      type="email"
                      autoComplete="email"
                      value={form.email}
                      aria-invalid={errors.email ? true : undefined}
                      aria-describedby={errors.email ? `${formId}-email-error` : undefined}
                      placeholder="Enter your email"
                      onChange={(event) => update("email", event.target.value)}
                    />
                    {errors.email ? (
                      <p className="field-error" id={`${formId}-email-error`}>
                        {errors.email}
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className="field">
                  <label htmlFor={`${formId}-topic`}>
                    What can we help with? <span aria-hidden="true">*</span>
                  </label>
                  <select
                    id={`${formId}-topic`}
                    name="topic"
                    value={form.topic}
                    aria-invalid={errors.topic ? true : undefined}
                    aria-describedby={errors.topic ? `${formId}-topic-error` : undefined}
                    onChange={(event) => update("topic", event.target.value)}
                  >
                    <option value="">Select an inquiry type</option>
                    {inquiryTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                  {errors.topic ? (
                    <p className="field-error" id={`${formId}-topic-error`}>
                      {errors.topic}
                    </p>
                  ) : null}
                </div>

                <div className="field">
                  <label htmlFor={`${formId}-message`}>
                    Message <span aria-hidden="true">*</span>
                  </label>
                  <textarea
                    id={`${formId}-message`}
                    name="message"
                    rows={5}
                    value={form.message}
                    aria-invalid={errors.message ? true : undefined}
                    aria-describedby={errors.message ? `${formId}-message-error` : undefined}
                    placeholder="Tell us how we can help..."
                    onChange={(event) => update("message", event.target.value)}
                  />
                  {errors.message ? (
                    <p className="field-error" id={`${formId}-message-error`}>
                      {errors.message}
                    </p>
                  ) : null}
                </div>

                <div className="inquiry-tip">
                  <span className="fact-icon" aria-hidden="true">
                    <IconWrench />
                  </span>
                  <p>
                    <strong>Need help finding a part?</strong>
                    Include your vehicle model, year, and part name or SKU (if known) for the quickest response.
                  </p>
                </div>

                <button className="btn btn-block" type="submit">
                  Send Message <IconArrow />
                </button>
                <p className="inquiry-note">We typically respond during business hours, Monday–Friday, 9am to 5pm ET.</p>
                {status ? (
                  <p className="inquiry-status" role="status">
                    {status}
                  </p>
                ) : null}
              </form>
            </article>
          </Reveal>
        </div>
      </section>

      <section className="resources-band" aria-labelledby="resources-title">
        <div className="resources-photo">
          <img
            src="/assets/photography/engine-valve-cover.webp"
            alt="Suzuki engine valve cover, gasket, and oil cap from the Suzuki Parts USA catalog"
            width="1400"
            height="1400"
            loading="lazy"
          />
        </div>
        <div className="resources-copy">
          <Reveal>
            <p className="eyebrow-dash">Looking for answers?</p>
            <h2 id="resources-title">Helpful Resources</h2>
            <p>You might find what you need in our FAQs or parts catalog.</p>
            <div className="resource-grid">
              <article className="resource-card">
                <span className="resource-icon" aria-hidden="true">
                  <IconHelp />
                </span>
                <h3>Frequently Asked Questions</h3>
                <p>Find information about shipping, payments, returns and more.</p>
                <a className="text-link" href="/faq">
                  View FAQ <IconArrow />
                </a>
              </article>
              <article className="resource-card">
                <span className="resource-icon" aria-hidden="true">
                  <IconBox />
                </span>
                <h3>Browse Suzuki Parts</h3>
                <p>Explore our full catalog and search for replacement parts.</p>
                <a className="text-link" href="/shop">
                  Shop Parts <IconArrow />
                </a>
              </article>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
