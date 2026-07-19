/**
 * Crucible Industrial — calculation engine
 * Adapted from residential apartment model to industrial switchboard / mining camp packages.
 */

export const CRUCIBLE_MARGIN_RATE = 0.20

export const DEFAULT_INPUTS = {
  projectName: 'Bowen Basin Camp — Main Switchboards',
  copperSource: 'tonnes',          // primary mode for industrial
  // package-based (secondary)
  packageCount: 4,
  copperPerPackage: 2.8,           // tonnes per major switchboard package
  // direct
  manualTonnes: 11.2,
  currentSpotPrice: 13500,         // AUD / tonne
  futurePriceMultiplier: 1.8,
  operationalCostPercent: 4.5,     // slightly higher for industrial coordination
  dailyHoldingCost: 8500,          // remote site / demob risk higher
  delayDays: 18,                   // typical re-quote / variation cycle
}

export function calculateTotalTonnes({ copperSource, packageCount, copperPerPackage, manualTonnes }) {
  if (copperSource === 'packages') {
    return packageCount * copperPerPackage
  }
  return manualTonnes
}

export function calculateHedgingScenario(inputs) {
  const merged = { ...DEFAULT_INPUTS, ...inputs }
  const totalTonnes = calculateTotalTonnes(merged)

  const initialCopperCost = totalTonnes * merged.currentSpotPrice
  const futureSpotPrice = merged.currentSpotPrice * merged.futurePriceMultiplier
  const unhedgedCopperCost = totalTonnes * futureSpotPrice
  const copperSurgeCost = unhedgedCopperCost - initialCopperCost

  const operationalCost = initialCopperCost * (merged.operationalCostPercent / 100)
  const crucibleMargin = operationalCost * CRUCIBLE_MARGIN_RATE
  const totalLockInFee = operationalCost * (1 + CRUCIBLE_MARGIN_RATE)
  const totalLockInPercent = merged.operationalCostPercent * (1 + CRUCIBLE_MARGIN_RATE)

  const hedgedCopperCost = initialCopperCost + totalLockInFee

  // Delay only materialises if price has moved
  const actualDelayDays = merged.futurePriceMultiplier > 1.05 ? merged.delayDays : 0
  const delayCost = actualDelayDays * merged.dailyHoldingCost

  const unhedgedTotalCost = unhedgedCopperCost + delayCost
  const hedgedTotalCost = hedgedCopperCost

  const netSavings = unhedgedTotalCost - hedgedTotalCost
  const materialSavingsOnly = unhedgedCopperCost - hedgedCopperCost
  const timeSavingsOnly = delayCost
  const roi = totalLockInFee > 0 ? (netSavings / totalLockInFee) * 100 : 0

  const chartHeight = 220
  const maxTotal = Math.max(unhedgedTotalCost, hedgedTotalCost, 1)
  const scale = chartHeight / maxTotal

  return {
    totalTonnes,
    initialCopperCost,
    futureSpotPrice,
    unhedgedCopperCost,
    copperSurgeCost,
    operationalCost,
    crucibleMargin,
    totalLockInFee,
    totalLockInPercent,
    crucibleMarginPercent: merged.operationalCostPercent * CRUCIBLE_MARGIN_RATE,
    hedgedCopperCost,
    actualDelayDays,
    delayCost,
    unhedgedTotalCost,
    hedgedTotalCost,
    netSavings,
    materialSavingsOnly,
    timeSavingsOnly,
    roi,
    chart: {
      scale,
      unhedgedBaseH: initialCopperCost * scale,
      unhedgedSurgeH: copperSurgeCost * scale,
      unhedgedDelayH: delayCost * scale,
      hedgedBaseH: initialCopperCost * scale,
      hedgedOperationalH: operationalCost * scale,
      hedgedMarginH: crucibleMargin * scale,
    },
  }
}

export function scenarioFromProject(project) {
  return {
    projectName: project.name,
    copperSource: project.copperSource || 'tonnes',
    packageCount: project.packageCount || 4,
    copperPerPackage: project.copperPerPackage || 2.8,
    manualTonnes: project.manualTonnes || project.tonnes || 11,
    currentSpotPrice: project.lockedPrice || project.currentSpotPrice || 13500,
    futurePriceMultiplier: project.futurePriceMultiplier || 1.8,
    operationalCostPercent: project.operationalCostPercent || 4.5,
    dailyHoldingCost: project.dailyHoldingCost || 8500,
    delayDays: project.delayDays || 18,
  }
}
