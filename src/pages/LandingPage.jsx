import { useState } from 'react'
import { Link } from 'react-router-dom'
import { calculateHedgingScenario } from '../utils/calculations'
import { formatAUD } from '../utils/formatters'
import './LandingPage.css'

export default function LandingPage() {
  const [tonnes, setTonnes] = useState(11)
  const [multiplier, setMultiplier] = useState(1.8)

  const scenario = calculateHedgingScenario({
    copperSource: 'tonnes',
    manualTonnes: tonnes,
    futurePriceMultiplier: multiplier,
  })

  return (
    <div className="landing">
      {/* Hero */}
      <section className="hero">
        <div className="hero-inner">
          <p className="eyebrow">Crucible Industrial</p>
          <h1>
            Copper certainty for<br />
            switchboard builders & mining camps
          </h1>
          <p className="lead">
            Lock copper exposure at order acceptance. Protect fixed-price packages from LME moves
            and keep remote-site schedules intact.
          </p>
          <Link to="/forecaster" className="btn-primary">
            Open Forecaster →
          </Link>
        </div>

        <div className="hero-card">
          <div className="hero-card-header">
            <span>Live scenario</span>
            <span className="live-dot">LME</span>
          </div>
          <div className="hero-metrics">
            <div>
              <label>Net savings</label>
              <strong>{formatAUD(scenario.netSavings)}</strong>
            </div>
            <div>
              <label>Days protected</label>
              <strong>{scenario.actualDelayDays}</strong>
            </div>
            <div>
              <label>Hedge ROI</label>
              <strong>{scenario.roi.toFixed(0)}%</strong>
            </div>
          </div>
          <p className="hero-caption">
            {tonnes} t package · {multiplier.toFixed(1)}× copper move
          </p>
        </div>
      </section>

      {/* Problem / Solution strip */}
      <section className="split">
        <div className="split-card">
          <h2>The problem</h2>
          <ul>
            <li>Fixed-price quotes to mining clients and EPCs</li>
            <li>High copper content in switchboards & cabling</li>
            <li>Lag between order acceptance and material buy</li>
            <li>LME moves erase margin or force re-negotiation</li>
            <li>Remote-site delays are extremely expensive</li>
          </ul>
        </div>
        <div className="split-card accent">
          <h2>The Copper Lock</h2>
          <ol>
            <li>Estimate copper tonnes from the package</li>
            <li>Lock LME forward matched to fabrication window</li>
            <li>Coordinate physical supply at protected price</li>
            <li>Fabricate and deliver with margin intact</li>
          </ol>
        </div>
      </section>

      {/* Interactive mini calculator */}
      <section className="mini-calc">
        <h2>Model a package in 10 seconds</h2>
        <div className="calc-controls">
          <label>
            Copper tonnes
            <input
              type="range"
              min={2}
              max={30}
              step={0.5}
              value={tonnes}
              onChange={(e) => setTonnes(Number(e.target.value))}
            />
            <span>{tonnes} t</span>
          </label>
          <label>
            Price multiplier
            <input
              type="range"
              min={1}
              max={2.5}
              step={0.1}
              value={multiplier}
              onChange={(e) => setMultiplier(Number(e.target.value))}
            />
            <span>{multiplier.toFixed(1)}×</span>
          </label>
        </div>
        <div className="calc-results">
          <div>
            <span>Net savings</span>
            <strong>{formatAUD(scenario.netSavings)}</strong>
          </div>
          <div>
            <span>Timeline protected</span>
            <strong>{scenario.actualDelayDays} days</strong>
          </div>
          <div>
            <span>Lock-in fee</span>
            <strong>{formatAUD(scenario.totalLockInFee)}</strong>
          </div>
        </div>
        <Link to="/forecaster" className="btn-secondary">
          Full analysis →
        </Link>
      </section>

      {/* Benefits */}
      <section className="benefits">
        <h2>Why industrial fabricators use it</h2>
        <div className="benefit-grid">
          <div>
            <h3>Protect the quote</h3>
            <p>Lock copper the moment the order is firm so the number you sold remains achievable.</p>
          </div>
          <div>
            <h3>Stop re-quotes</h3>
            <p>Remove the most common reason fixed-price electrical packages get reopened on site.</p>
          </div>
          <div>
            <h3>Keep the workshop moving</h3>
            <p>Fabrication schedules stay intact because material cost is no longer a moving target.</p>
          </div>
          <div>
            <h3>Remote-site reality</h3>
            <p>Avoid expensive demob/remob and liquidated damages caused by copper-driven delays.</p>
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        <span>Crucible Industrial — forked for Australian switchboard builders & mining camp packages</span>
        <span>L-S-CAPITAL</span>
      </footer>
    </div>
  )
}
