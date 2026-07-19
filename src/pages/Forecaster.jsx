import { useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  ShieldCheck,
  TrendingDown,
  Layers,
  Activity,
  Building2,
  Printer,
  Link2,
} from 'lucide-react'
import {
  calculateHedgingScenario,
  DEFAULT_INPUTS,
  scenarioFromProject,
  CRUCIBLE_MARGIN_RATE,
} from '../utils/calculations'
import { formatAUD, formatTonnes } from '../utils/formatters'
import { loadProjects, SCENARIO_PRESETS } from '../utils/sampleData'
import './Forecaster.css'

const TOOLTIPS = {
  copperVol:
    'Typical copper content for industrial switchboard packages: main switchboards, MCCs, distribution boards and associated cabling for mining camp power infrastructure.',
  spotPrice:
    'London Metal Exchange (LME) spot translated to AUD, including typical industrial wholesaler margins and freight.',
  holdingCost:
    'Daily cost of site establishment, demobilisation risk, temporary power, accommodation, and contract liquidated damages exposure on remote mining projects.',
  delayDays:
    'When copper surges, fixed-price fabricators or electrical contractors push for variation or pause. Re-negotiation or re-tender on remote packages commonly takes 2–4 weeks.',
}

function SliderInput({
  id,
  label,
  value,
  displayValue,
  min,
  max,
  step,
  scaleLabels,
  tooltip,
  valueColor,
  onChange,
}) {
  return (
    <div className="input-group">
      <label className="input-label" htmlFor={id}>
        {label}
        {tooltip && <span className="tooltip-hint" title={tooltip}>?</span>}
      </label>
      <div className="slider-row">
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
        />
        <span className="slider-value" style={valueColor ? { color: valueColor } : undefined}>
          {displayValue}
        </span>
      </div>
      {scaleLabels && (
        <div className="scale-labels">
          {scaleLabels.map((l) => (
            <span key={l}>{l}</span>
          ))}
        </div>
      )}
    </div>
  )
}

function MetricCard({ label, value, subtext, variant }) {
  return (
    <div className={`metric-card ${variant || ''}`}>
      <span className="metric-label">{label}</span>
      <strong className="metric-value">{value}</strong>
      <span className="metric-sub">{subtext}</span>
    </div>
  )
}

export default function Forecaster() {
  const [searchParams] = useSearchParams()
  const projects = useMemo(() => loadProjects(), [])

  const initialFromProject = useMemo(() => {
    const id = searchParams.get('project')
    if (!id) return null
    return projects.find((p) => p.id === id) || null
  }, [searchParams, projects])

  const [inputs, setInputs] = useState(() => {
    if (initialFromProject) return scenarioFromProject(initialFromProject)
    return { ...DEFAULT_INPUTS }
  })

  const [shareCopied, setShareCopied] = useState(false)

  const update = (key, value) => setInputs((prev) => ({ ...prev, [key]: value }))

  const scenario = useMemo(() => calculateHedgingScenario(inputs), [inputs])

  const {
    totalTonnes,
    netSavings,
    materialSavingsOnly,
    timeSavingsOnly,
    actualDelayDays,
    totalLockInFee,
    unhedgedTotalCost,
    hedgedTotalCost,
    copperSurgeCost,
    delayCost,
    operationalCost,
    crucibleMargin,
    roi,
    chart,
  } = scenario

  const maxBar = Math.max(unhedgedTotalCost, hedgedTotalCost, 1)

  const handlePreset = (multiplier) => {
    update('futurePriceMultiplier', multiplier)
  }

  const handleProjectSelect = (e) => {
    const project = projects.find((p) => p.id === e.target.value)
    if (project) {
      setInputs(scenarioFromProject(project))
    }
  }

  const handleShare = async () => {
    const url = window.location.href
    try {
      await navigator.clipboard.writeText(url)
      setShareCopied(true)
      setTimeout(() => setShareCopied(false), 2000)
    } catch {
      // ignore
    }
  }

  return (
    <div className="page forecaster-page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Industrial Forecaster</p>
          <h1 className="page-title">Package Copper Hedge</h1>
          <p className="page-subtitle">
            Model the cost of copper volatility and remote-site delay against a lock-in at order
            acceptance.
          </p>
        </div>
        <div className="forecaster-actions">
          <select className="form-input project-select" onChange={handleProjectSelect} defaultValue="">
            <option value="" disabled>
              Load sample package…
            </option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <div className="preset-btns">
            {SCENARIO_PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                className={`preset-btn ${inputs.futurePriceMultiplier === p.multiplier ? 'active' : ''}`}
                onClick={() => handlePreset(p.multiplier)}
              >
                {p.label}
              </button>
            ))}
          </div>
          <button type="button" className="action-btn" onClick={() => window.print()}>
            <Printer size={14} /> Export
          </button>
          <button type="button" className="action-btn" onClick={handleShare}>
            <Link2 size={14} /> {shareCopied ? 'Copied!' : 'Share'}
          </button>
        </div>
      </div>

      <div className="forecaster-grid">
        {/* INPUTS */}
        <div className="inputs-panel glass-card">
          <h2 className="panel-title">
            <Layers size={18} /> Package Hedging Inputs
          </h2>

          <div className="input-group">
            <label className="input-label" htmlFor="input-project-name">
              <Building2 size={14} /> Package / Project Name
            </label>
            <input
              id="input-project-name"
              type="text"
              className="form-input"
              value={inputs.projectName}
              onChange={(e) => update('projectName', e.target.value)}
            />
          </div>

          <div className="input-group">
            <label className="input-label">
              <Activity size={14} /> Copper Volume Method
            </label>
            <div className="toggle-group">
              <div
                className={`toggle-option ${inputs.copperSource === 'packages' ? 'active' : ''}`}
                onClick={() => update('copperSource', 'packages')}
              >
                By Package
              </div>
              <div
                className={`toggle-option ${inputs.copperSource === 'tonnes' ? 'active' : ''}`}
                onClick={() => update('copperSource', 'tonnes')}
              >
                Direct Tonnes
              </div>
            </div>
          </div>

          {inputs.copperSource === 'packages' ? (
            <>
              <SliderInput
                id="input-packages"
                label="Number of Switchboard Packages"
                value={inputs.packageCount}
                displayValue={`${inputs.packageCount} packages`}
                min={1}
                max={20}
                step={1}
                scaleLabels={['1', '10', '20']}
                onChange={(v) => update('packageCount', v)}
              />
              <SliderInput
                id="input-copper-per-package"
                label="Copper per Package (tonnes)"
                value={inputs.copperPerPackage}
                displayValue={`${inputs.copperPerPackage.toFixed(1)} t`}
                min={0.5}
                max={6}
                step={0.1}
                scaleLabels={['0.5 t', '3 t', '6 t']}
                tooltip={TOOLTIPS.copperVol}
                onChange={(v) => update('copperPerPackage', v)}
              />
            </>
          ) : (
            <SliderInput
              id="input-tonnes"
              label="Total Copper (tonnes)"
              value={inputs.manualTonnes}
              displayValue={formatTonnes(inputs.manualTonnes)}
              min={1}
              max={40}
              step={0.5}
              scaleLabels={['1 t', '20 t', '40 t']}
              tooltip={TOOLTIPS.copperVol}
              onChange={(v) => update('manualTonnes', v)}
            />
          )}

          <div className="tonnes-summary">
            Total copper exposure: <strong>{formatTonnes(totalTonnes)}</strong>
          </div>

          <SliderInput
            id="input-spot"
            label="Current Spot Price (AUD / t)"
            value={inputs.currentSpotPrice}
            displayValue={formatAUD(inputs.currentSpotPrice)}
            min={8000}
            max={20000}
            step={50}
            scaleLabels={['$8k', '$14k', '$20k']}
            tooltip={TOOLTIPS.spotPrice}
            onChange={(v) => update('currentSpotPrice', v)}
          />

          <SliderInput
            id="input-multiplier"
            label="Future Price Multiplier"
            value={inputs.futurePriceMultiplier}
            displayValue={`${inputs.futurePriceMultiplier.toFixed(1)}×`}
            min={1}
            max={2.5}
            step={0.1}
            scaleLabels={['1.0×', '1.7×', '2.5×']}
            valueColor="var(--copper-light)"
            onChange={(v) => update('futurePriceMultiplier', v)}
          />

          <SliderInput
            id="input-holding"
            label="Daily Holding / Delay Cost"
            value={inputs.dailyHoldingCost}
            displayValue={formatAUD(inputs.dailyHoldingCost)}
            min={2000}
            max={15000}
            step={250}
            scaleLabels={['$2k', '$8.5k', '$15k']}
            tooltip={TOOLTIPS.holdingCost}
            onChange={(v) => update('dailyHoldingCost', v)}
          />

          <SliderInput
            id="input-delay"
            label="Expected Delay if Unhedged (days)"
            value={inputs.delayDays}
            displayValue={`${inputs.delayDays} days`}
            min={0}
            max={45}
            step={1}
            scaleLabels={['0', '18', '45']}
            tooltip={TOOLTIPS.delayDays}
            onChange={(v) => update('delayDays', v)}
          />

          <p className="pricing-note">
            Lock-in fee = operational coordination cost ({inputs.operationalCostPercent}%) + 20%
            Crucible margin on that operational slice only. Copper notional is never marked up.
          </p>
        </div>

        {/* RESULTS */}
        <div className="results-panel">
          <div className="metrics-row">
            <MetricCard
              label="Net Savings"
              value={formatAUD(netSavings)}
              subtext="vs unhedged path"
              variant="savings"
            />
            <MetricCard
              label="Days Protected"
              value={actualDelayDays}
              subtext="remote site exposure"
              variant="time"
            />
            <MetricCard
              label="Hedge ROI"
              value={`${roi.toFixed(0)}%`}
              subtext={`on ${formatAUD(totalLockInFee)} fee`}
              variant="roi"
            />
          </div>

          <div className="cost-compare glass-card">
            <h3 className="panel-title">Cost Stack Comparison</h3>
            <div className="bar-group">
              <span className="bar-label">Unhedged</span>
              <div className="bar-track">
                <div
                  className="bar-fill unhedged"
                  style={{ width: `${(unhedgedTotalCost / maxBar) * 100}%` }}
                />
              </div>
              <span className="bar-value">{formatAUD(unhedgedTotalCost)}</span>
            </div>
            <div className="bar-group">
              <span className="bar-label">Hedged</span>
              <div className="bar-track">
                <div
                  className="bar-fill hedged"
                  style={{ width: `${(hedgedTotalCost / maxBar) * 100}%` }}
                />
              </div>
              <span className="bar-value">{formatAUD(hedgedTotalCost)}</span>
            </div>
            <div className="bar-legend">
              <span><span className="dot unhedged" /> Surge + delay risk</span>
              <span><span className="dot hedged" /> Locked + fee</span>
            </div>
          </div>

          <div className="breakdown glass-card">
            <h3 className="panel-title">Detailed Breakdown</h3>
            <table>
              <tbody>
                <tr>
                  <td>Initial copper cost</td>
                  <td>{formatAUD(scenario.initialCopperCost)}</td>
                </tr>
                <tr>
                  <td>Copper surge (unhedged)</td>
                  <td className="danger">{formatAUD(copperSurgeCost)}</td>
                </tr>
                <tr>
                  <td>Remote delay cost</td>
                  <td className="danger">{formatAUD(delayCost)}</td>
                </tr>
                <tr>
                  <td>Operational coordination</td>
                  <td>{formatAUD(operationalCost)}</td>
                </tr>
                <tr>
                  <td>Crucible margin (20%)</td>
                  <td>{formatAUD(crucibleMargin)}</td>
                </tr>
                <tr>
                  <td>Total lock-in fee</td>
                  <td>{formatAUD(totalLockInFee)}</td>
                </tr>
                <tr className="highlight">
                  <td>Net savings vs unhedged</td>
                  <td className="savings">{formatAUD(netSavings)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {netSavings > 0 ? (
            <div className="rec-banner">
              <div className="rec-icon">
                <ShieldCheck size={20} />
              </div>
              <div>
                <h4>Recommendation: LOCK IN</h4>
                <p>
                  Locking copper at order acceptance protects{' '}
                  <strong>{formatAUD(materialSavingsOnly)}</strong> of material surge and{' '}
                  <strong>{actualDelayDays} days</strong> of site delay exposure (
                  <strong>{formatAUD(timeSavingsOnly)}</strong>). The lock-in fee is small relative
                  to the risk on a remote mining package.
                </p>
              </div>
            </div>
          ) : (
            <div className="rec-banner neutral">
              <div className="rec-icon">
                <TrendingDown size={20} />
              </div>
              <div>
                <h4>Recommendation: STANDBY / SPOT</h4>
                <p>
                  With a flat or near-flat price path the lock-in fee is a net premium. Consider
                  locking only if forward indicators or client contract terms increase the cost of
                  a later variation.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
