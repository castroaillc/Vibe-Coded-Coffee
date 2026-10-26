import { InstantQuote } from "./InstantQuote";
import { Icon } from "./Icons";
import { allDay, extraHour, largeEvent, packages, pricingPromises, usd } from "@/lib/packages";

/** Published packages + the instant-price calculator. Used on the home page and every event page. */
export function PricingSection({
  title = "Prices, up front",
  defaultGuests,
  defaultLength,
}: { title?: string; defaultGuests?: number; defaultLength?: string }) {
  return (
    <section className="section section--white pricing" id="pricing" aria-labelledby="pricing-title">
      <div className="container">
        <div className="split-head">
          <div>
            <p className="kicker kicker--ink">Pricing</p>
            <h2 id="pricing-title" className="h2">{title}</h2>
          </div>
          <p className="lede">
            No quote call, no waiting. Every price includes the station, a person running it, the coffee, cups, creamer,
            sugar, setup, cleanup and travel anywhere in the five boroughs.
          </p>
        </div>

        <ul className="tiers">
          {packages.map((p) => (
            <li key={p.id} className={`tier${p.featured ? " tier--featured" : ""}`}>
              {p.featured && <span className="tier__badge">Most booked</span>}
              <h3 className="tier__name">{p.name}</h3>
              <p className="tier__price">{usd(p.price)}</p>
              <p className="tier__spec">Up to {p.maxGuests} guests · {p.hours} hours</p>
              <p className="tier__per">About {usd(p.price / p.maxGuests, true)} per guest</p>
              <p className="tier__best">{p.bestFor}</p>
            </li>
          ))}
          <li className="tier tier--alt">
            <h3 className="tier__name">Hackathon</h3>
            <p className="tier__price">{usd(allDay.perGuestPerDay)}<span>/guest/day</span></p>
            <p className="tier__spec">Up to {allDay.hours} hours a day · {usd(allDay.minimumPerDay)} minimum</p>
            <p className="tier__per">Fresh batches from kickoff to demos</p>
            <p className="tier__best">Hackathons, all-day summits, multi-day offsites</p>
          </li>
        </ul>
        <p className="tiers__fine">
          Over 100 guests: {usd(largeEvent.perGuest, true)} per guest for {largeEvent.hours} hours. Extra hours {usd(extraHour.upTo50)} (up to 50
          guests) or {usd(extraHour.over50)}. Decaf on request.
        </p>

        <div className="pricing__calc">
          <div className="pricing__calc-copy">
            <h3 className="h3">Get your exact price</h3>
            <p>Two questions. The number you see is the number on the invoice.</p>
            <ul className="promises">
              {pricingPromises.map((x) => (
                <li key={x}><Icon name="check" size={18} /> {x}</li>
              ))}
            </ul>
          </div>
          <InstantQuote defaultGuests={defaultGuests} defaultLength={defaultLength} />
        </div>
      </div>
    </section>
  );
}
