import { IconArrow, IconHelp } from "./Icons";
import { Reveal } from "./Reveal";

export function SupportBanner() {
  return (
    <section className="section support-section" aria-labelledby="support-title">
      <div className="container">
        <Reveal>
          <div className="support">
            <div className="support-icon" aria-hidden="true">
              <IconHelp />
            </div>
            <div>
              <h2 id="support-title">Need help identifying a part?</h2>
              <p>
                If you are not sure which part you need, send your vehicle information and any details
                about the part. Email is the best way to reach the team.
              </p>
            </div>
            <a className="btn" href="/contact">
              Contact Us <IconArrow />
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
