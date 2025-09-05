// TypeScript types for the cosmic universe

export interface Cell {
  id: number;
  x: number;
  y: number;
  type: string;
  energy?: number;
  age: number;
  inventory_count: number;
  discoveries_count: number;
}

export interface CellCounts {
  plants: number;
  herbivores: number;
  carnivores: number;
}

export interface Planet {
  id: string;
  name: string;
  type: string;
  size: [number, number];
  cells: Cell[];
  cell_counts: CellCounts;
  conditions: {
    temperature: number;
    pressure: number;
    radiation: number;
    magnetic_field?: number;
  };
  discovery_multiplier: number;
  trade_routes: number;
  total_inventory: number;
  total_discoveries: number;
  scattered_materials: number;
}

export interface CosmicEvent {
  name: string;
  description: string;
  duration: number;
  affected_planets: string[];
}

export interface Discovery {
  name: string;
  significance: number;
  type: string;
  discoverer: string;
}

export interface DiscoveryStats {
  total_discoveries: number;
  recent_discoveries: Discovery[];
}

export interface UniverseState {
  type: string;
  step: number;
  planets: Planet[];
  cosmic_events: CosmicEvent[];
  discovery_stats: DiscoveryStats;
  timestamp: string;
}

export interface CellDetails {
  id: number;
  type: string;
  position: [number, number];
  age: number;
  energy?: number;
  curiosity?: number;
  experimentation_cooldown?: number;
  inventory: Array<{
    name: string;
    properties: string[];
  }>;
  known_discoveries: Array<{
    name: string;
    significance: number;
    type: string;
  }>;
  brain_info: {
    fitness?: number;
    generation?: number;
  };
}