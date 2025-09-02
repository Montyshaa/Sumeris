import type { Policy, PolicyCategory } from "./types"

export const POLICIES: Policy[] = [
  {
    id: "basic_income",
    name: "Salario Básico",
    description: "Garantiza ingresos mínimos para todos los ciudadanos. +10 WB, pero +5% coste ENG y -5% MAT.",
    cost: 50,
    duration: 0, // permanent until deactivated
    cooldown: 120, // 2 hours
    category: "social",
    icon: "💰",
    effects: [
      { type: "index_modifier", target: "welfare", value: 10, description: "+10 Bienestar" },
      { type: "resource_cost", target: "energy", value: 1.05, description: "+5% coste Energía" },
      { type: "resource_production", target: "materials", value: 0.95, description: "-5% producción Materiales" },
    ],
  },
  {
    id: "green_tax",
    name: "Impuesto Verde",
    description: "Incentiva prácticas sostenibles. +8 SUS, +20% CC/h, -5 LEG si WB < 60.",
    cost: 40,
    duration: 0,
    cooldown: 120,
    category: "environmental",
    icon: "🌱",
    effects: [
      { type: "index_modifier", target: "sustainability", value: 8, description: "+8 Sostenibilidad" },
      { type: "resource_production", target: "civicCredit", value: 1.2, description: "+20% producción CC" },
      { type: "special", target: "conditional_legitimacy", value: -5, description: "-5 LEG si WB < 60" },
    ],
  },
  {
    id: "ai_audit",
    name: "Auditoría IA",
    description: "Supervisa sistemas de inteligencia artificial. +12 LEG, +12% coste DAT, reduce incidentes.",
    cost: 60,
    duration: 0,
    cooldown: 120,
    category: "security",
    icon: "🔍",
    effects: [
      { type: "index_modifier", target: "legitimacy", value: 12, description: "+12 Legitimidad" },
      { type: "resource_cost", target: "data", value: 1.12, description: "+12% coste Datos" },
      { type: "special", target: "reduce_incidents", value: 0.5, description: "Reduce incidentes IA" },
    ],
  },
  {
    id: "active_neutrality",
    name: "Neutralidad Activa",
    description: "Política de no agresión. +10 LEG, +10% bonus defensivo por 2h, impide atacar.",
    cost: 30,
    duration: 120, // 2 hours
    cooldown: 240, // 4 hours
    category: "security",
    icon: "🕊️",
    effects: [
      { type: "index_modifier", target: "legitimacy", value: 10, description: "+10 Legitimidad" },
      { type: "special", target: "defense_bonus", value: 1.1, description: "+10% bonus defensivo" },
      { type: "special", target: "disable_attacks", value: 1, description: "Impide atacar" },
    ],
  },
  {
    id: "innovation_boost",
    name: "Impulso Innovación",
    description: "Acelera el desarrollo tecnológico. -20% tiempo I+D, +15% coste HR.",
    cost: 80,
    duration: 180, // 3 hours
    cooldown: 360, // 6 hours
    category: "economic",
    icon: "🚀",
    effects: [
      { type: "special", target: "research_time_reduction", value: 0.8, description: "-20% tiempo I+D" },
      { type: "resource_cost", target: "talent", value: 1.15, description: "+15% coste Talento" },
    ],
  },
  {
    id: "energy_rationing",
    name: "Racionamiento Energético",
    description: "Conserva energía en tiempos difíciles. -30% consumo ENG, -8 WB, +5 SUS.",
    cost: 25,
    duration: 0,
    cooldown: 180, // 3 hours
    category: "environmental",
    icon: "⚡",
    effects: [
      { type: "resource_cost", target: "energy", value: 0.7, description: "-30% consumo Energía" },
      { type: "index_modifier", target: "welfare", value: -8, description: "-8 Bienestar" },
      { type: "index_modifier", target: "sustainability", value: 5, description: "+5 Sostenibilidad" },
    ],
  },
  {
    id: "social_programs",
    name: "Programas Sociales",
    description: "Invierte en el bienestar ciudadano. +15 WB, -25% producción CC, +10% coste MAT.",
    cost: 70,
    duration: 0,
    cooldown: 120,
    category: "social",
    icon: "🏥",
    effects: [
      { type: "index_modifier", target: "welfare", value: 15, description: "+15 Bienestar" },
      { type: "resource_production", target: "civicCredit", value: 0.75, description: "-25% producción CC" },
      { type: "resource_cost", target: "materials", value: 1.1, description: "+10% coste Materiales" },
    ],
  },
  {
    id: "surveillance_state",
    name: "Estado de Vigilancia",
    description: "Aumenta el control social. +8 LEG, -12 WB, +20% producción DAT.",
    cost: 90,
    duration: 0,
    cooldown: 240,
    category: "security",
    icon: "👁️",
    effects: [
      { type: "index_modifier", target: "legitimacy", value: 8, description: "+8 Legitimidad" },
      { type: "index_modifier", target: "welfare", value: -12, description: "-12 Bienestar" },
      { type: "resource_production", target: "data", value: 1.2, description: "+20% producción Datos" },
    ],
  },
]

export const getPolicyById = (id: string): Policy | undefined => {
  return POLICIES.find((policy) => policy.id === id)
}

export const getPoliciesByCategory = (category: PolicyCategory): Policy[] => {
  return POLICIES.filter((policy) => policy.category === category)
}
