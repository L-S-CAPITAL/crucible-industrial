import { calculateHedgingScenario } from './calculations'

export const SCENARIO_PRESETS = [
  { id: 'conservative', label: 'Conservative', multiplier: 1.3 },
  { id: 'moderate', label: 'Moderate', multiplier: 1.7 },
  { id: 'worst', label: 'Worst Case', multiplier: 2.2 },
]

export const MOCK_COPPER_PRICE = 13542
export const MOCK_COPPER_CHANGE = 4.2

const baseProjects = [
  {
    id: 'bowen',
    name: 'Bowen Basin Camp — Main Switchboards',
    region: 'Bowen Basin, QLD',
    status: 'active',
    copperSource: 'tonnes',
    manualTonnes: 11.2,
    packageCount: 4,
    copperPerPackage: 2.8,
    lockedPrice: 12850,
    currentMarketPrice: 13542,
    lockDate: '2026-02-12',
    supplier: 'Industrial Electrical Supply',
  },
  {
    id: 'pilbara',
    name: 'Pilbara Accommodation Village — Distribution Boards',
    region: 'Pilbara, WA',
    status: 'active',
    copperSource: 'packages',
    packageCount: 8,
    copperPerPackage: 1.9,
    manualTonnes: 15.2,
    lockedPrice: 13120,
    currentMarketPrice: 13542,
    lockDate: '2026-03-01',
    supplier: 'MM Kembla Industrial',
  },
  {
    id: 'hunter',
    name: 'Hunter Valley Expansion — MCC Packages',
    region: 'Hunter Valley, NSW',
    status: 'draft',
    copperSource: 'tonnes',
    manualTonnes: 7.5,
    packageCount: 3,
    copperPerPackage: 2.5,
    lockedPrice: 13500,
    currentMarketPrice: 13542,
    lockDate: null,
    supplier: 'Rexel Industrial',
  },
  {
    id: 'galilee',
    name: 'Galilee Basin Temporary Power — Switchrooms',
    region: 'Galilee Basin, QLD',
    status: 'completed',
    copperSource: 'packages',
    packageCount: 6,
    copperPerPackage: 3.1,
    manualTonnes: 18.6,
    lockedPrice: 11980,
    currentMarketPrice: 13542,
    lockDate: '2025-09-18',
    supplier: 'Lawrence & Hanson Industrial',
  },
]

export function enrichProject(project) {
  const tonnes =
    project.copperSource === 'packages'
      ? project.packageCount * project.copperPerPackage
      : project.manualTonnes || 0

  const scenario = calculateHedgingScenario({
    copperSource: project.copperSource,
    packageCount: project.packageCount,
    copperPerPackage: project.copperPerPackage,
    manualTonnes: project.manualTonnes,
    currentSpotPrice: project.lockedPrice || 13500,
    futurePriceMultiplier: 1.8,
  })

  const priceDelta = (project.currentMarketPrice || 13542) - (project.lockedPrice || 13500)
  const savingsToDate = project.status === 'draft' ? 0 : Math.max(0, tonnes * priceDelta)

  return {
    ...project,
    tonnes: Number(tonnes.toFixed(2)),
    savingsToDate,
    projectedSavings: scenario.netSavings,
    roi: scenario.roi,
  }
}

export const SAMPLE_PROJECTS = baseProjects.map(enrichProject)

export function loadProjects() {
  return SAMPLE_PROJECTS
}
