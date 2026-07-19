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
  const [searchParams, setSearchParams] = useSearchParams()
  const projects = useMemo(() => loadProjects(), [])

  const [inputs, setInputs] = useState(() => {
    const params = new URLSearchParams(window.location.search)
    const projectId = params.get('project')
    if (projectId) {
      const project = loadProjects().find((p) => p.id === projectId)
      if (project) return { ...DEFAULT_INPUTS, ...scenarioFromProject(project) }
    }
    return { ...DEFAULT_INPUTS }
  })

  const [shareCopied, setShareCopied] = useState(false)

  const update = (key, value) => setInputs((prev) => ({ ...prev, [key]: value }))

  const scenario = calculateHedgingScenario(inputs)
  const {
    netSavings,
    materialSavingsOnly,
    timeSavingsOnly,
    actualDelayDays,
    roi,
    futureSpotPrice,
    totalLockInFee,
    totalLockInPercent,
    operationalCost,
    crucibleMargin,
    totalTonnes,
  } = scenario

  const handleProjectSelect = (e) => {
    const id = e.target.value
    if (!id) return
    const project = projects.find((p) => p.id === id)
    if (project) {
      setInputs((prev) => ({ ...prev, ...scenarioFromProject(project) }))
      setSearchParams({ project: id })
    }
  }

  const handleShare = async () => {
    const params = new URLSearchParams()
    Object.entries(inputs).forEach(([k, v]) => params.set(k, String(v)))
    const url = `${window.location.origin}${window.location.pathname}?${params.toString()}`
    try {
      await navigator.clipboard.writeText(url)
      setShareCopied(true)
      setTimeout(() => setShareCopied(false), 2000)
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="page forecaster-page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Industrial Forecaster</p>
          <h1 className="page-title">Model your copper hedge</h1>
          <p className="page-subtitle">
            Quantify material and timeline risk for switchboard packages and mining camp electrical work.
          </p>
        </div>

        <div className="forecaster-actions">
          <select
            className="form-input project-select"
            value={searchParams.get('project') || ''}
            onChange={handleProjectSelect}
          >
            <option value="">Select package…</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          <div className="preset-btns">
            {SCENARIO_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                className={`preset-btn ${inputs.futurePriceMultiplier === preset.multiplier ? 'active' : ''}`}
                onClick={() => update('futurePriceMultiplier', preset.multiplier)}
              >
                {preset.label} ({preset.multiplier}×)
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
                max={8}
                step={0.1}
                scaleLabels={['0.5 t', '2.8 t', '8 t']}
                tooltip={TOOLTIPS.copperVol}
                onChange={(v) => update('copperPerPackage', v)}
              />
            </>
          ) : (
            <SliderInput
              id="input-manual-tonnes"
              label="Total Estimated Copper"
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
            Modelled volume: <strong>{formatTonnes(totalTonnes)}</strong>
          </div>

          <SliderInput
            id="input-spot-price"
            label="Current LME Copper Spot (AUD/t)"
            value={inputs.currentSpotPrice}
            displayValue={`${formatAUD(inputs.currentSpotPrice)} / t`}
            min={8000}
            max={18000}
            step={250}
            scaleLabels={['$8k', '$13k', '$18k']}
            tooltip={TOOLTIPS.spotPrice}
            onChange={(v) => update('currentSpotPrice', v)}
          />

          <SliderInput
            id="input-multiplier"
            label="Price Multiplier at Fabrication Window"
            value={inputs.futurePriceMultiplier}
            displayValue={`${inputs.futurePriceMultiplier.toFixed(1)}× (${formatAUD(futureSpotPrice)}/t)`}
            min={1.0}
            max={2.5}
            step={0.1}
            scaleLabels={['1.0×', '1.5×', '2.0×', '2.5×']}
            valueColor={inputs.futurePriceMultiplier >= 1.8 ? 'var(--danger)' : 'var(--copper)'}
            onChange={(v) => update('futurePriceMultiplier', v)}
          />

          <SliderInput
            id="input-holding-cost"
            label="Daily Site / Delay Cost (AUD)"
            value={inputs.dailyHoldingCost}
            displayValue={`${formatAUD(inputs.dailyHoldingCost)} / day`}
            min={2000}
            max={20000}
            step={500}
            scaleLabels={['$2k', '$10k', '$20k']}
            tooltip={TOOLTIPS.holdingCost}
            onChange={(v) => update('dailyHoldingCost', v)}
          />

          <SliderInput
            id="input-delay-days"
            label="Re-negotiation / Variation Delay (Days)"
            value={inputs.delayDays}
            displayValue={`${inputs.delayDays} days`}
            min={0}
            max={45}
            step={1}
            scaleLabels={['0', '20', '45']}
            tooltip={TOOLTIPS.delayDays}
            onChange={(v) => update('delayDays', v)}
          />

          <div className="input-group">
            <label className="input-label" htmlFor="input-operational-cost">
              Operational Pass-Through (% of copper notional)
            </label>
            <input
              id="input-operational-cost"
              type="number"
              step="0.1"
              min="1"
              max="12"
              className="form-input"
              value={inputs.operationalCostPercent}
              onChange={(e) => update('operationalCostPercent', Number(e.target.value))}
            />
            <p className="pricing-note">
              Lock-in fee = operational × {(1 + CRUCIBLE_MARGIN_RATE).toFixed(2)} (includes{' '}
              {(CRUCIBLE_MARGIN_RATE * 100).toFixed(0)}% Crucible margin). Currently{' '}
              <strong>{formatAUD(totalLockInFee)}</strong> ({totalLockInPercent.toFixed(2)}% of notional):{' '}
              {formatAUD(operationalCost)} pass-through + {formatAUD(crucibleMargin)} margin.
            </p>
          </div>
        </div>

        {/* OUTPUTS */}
        <div className="outputs-panel">
          <div className="metrics-row">
            <MetricCard
              label="Total Savings"
              value={netSavings > 0 ? formatAUD(netSavings) : '$0'}
              subtext="Hedged vs Unhedged"
              variant="savings"
            />
            <MetricCard
              label="Timeline Protected"
              value={`${actualDelayDays} days`}
              subtext="Avoided delay exposure"
              variant="time"
            />
            <MetricCard
              label="Return on Hedge"
              value={netSavings > 0 ? `${roi.toFixed(0)}%` : '0%'}
              subtext="ROI of lock-in fee"
              variant="roi"
            />
          </div>

          {/* Simple cost comparison bars */}
          <div className="cost-compare glass-card">
            <h3 className="panel-title">Cost Stack Comparison</h3>
            <div className="bar-group">
              <div className="bar-label">Unhedged</div>
              <div className="bar-track">
                <div
                  className="bar-fill unhedged"
                  style={{
                    width: `${Math.min(100, (scenario.unhedgedTotalCost / Math.max(scenario.unhedgedTotalCost, scenario.hedgedTotalCost, 1)) * 100)}%`,
                  }}
                />
              </div>
              <div className="bar-value">{formatAUD(scenario.unhedgedTotalCost)}</div>
            </div>
            <div className="bar-group">
              <div className="bar-label">Hedged</div>
              <div className="bar-track">
                <div
                  className="bar-fill hedged"
                  style={{
                    width: `${Math.min(100, (scenario.hedgedTotalCost / Math.max(scenario.unhedgedTotalCost, scenario.hedgedTotalCost, 1)) * 100)}%`,
                  }}
                />
              </div>
              <div className="bar-value">{formatAUD(scenario.hedgedTotalCost)}</div>
            </div>
            <div className="bar-legend">
              <span><i className="dot unhedged" /> Includes surge + delay cost</span>
              <span><i className="dot hedged" /> Locked copper + lock-in fee</span>
            </div>
          </div>

          {/* Breakdown */}
          <div className="breakdown glass-card">
            <h3 className="panel-title">Breakdown</h3>
            <table>
              <tbody>
                <tr>
                  <td>Copper volume</td>
                  <td>{formatTonnes(totalTonnes)}</td>
                </tr>
                <tr>
                  <td>Initial copper cost</td>
                  <td>{formatAUD(scenario.initialCopperCost)}</td>
                </tr>
                <tr>
                  <td>Unhedged copper (at multiplier)</td>
                  <td>{formatAUD(scenario.unhedgedCopperCost)}</td>
                </tr>
                <tr>
                  <td>Surge exposure</td>
                  <td className="danger">{formatAUD(scenario.copperSurgeCost)}</td>
                </tr>
                <tr>
                  <td>Delay cost exposure</td>
                  <td className="danger">{formatAUD(scenario.delayCost)}</td>
                </tr>
                <tr>
                  <td>Lock-in fee (ops + margin)</td>
                  <td>{formatAUD(totalLockInFee)}</td>
                </tr>
                <tr className="highlight">
                  <td>Net savings if locked</td>
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
