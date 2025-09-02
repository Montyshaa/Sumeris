import type { Research, ResearchTree } from "./types"

export const RESEARCH_DATA: Research[] = [
  // Socio-económica Tree
  {
    id: "decent_housing",
    name: "Vivienda Digna",
    description: "Mejora las condiciones de vida de los ciudadanos",
    tree: "socioeconomic",
    tier: 1,
    cost: { materials: 200, energy: 100, data: 150, talent: 1, civicCredit: 0 },
    timeMinutes: 30,
    effects: [{ type: "index_bonus", target: "welfare", value: 8, description: "+8 Bienestar" }],
    icon: "🏠",
  },
  {
    id: "universal_healthcare",
    name: "Sanidad Universal",
    description: "Sistema de salud accesible para todos",
    tree: "socioeconomic",
    tier: 2,
    cost: { materials: 300, energy: 200, data: 250, talent: 2, civicCredit: 0 },
    timeMinutes: 60,
    prerequisites: ["decent_housing"],
    effects: [
      { type: "index_bonus", target: "welfare", value: 12, description: "+12 Bienestar" },
      { type: "resource_production", target: "energy", value: -0.05, description: "+5% coste ENG" },
    ],
    icon: "⚕️",
  },
  {
    id: "algorithmic_transparency",
    name: "Transparencia Algorítmica",
    description: "Sistemas de IA auditables y transparentes",
    tree: "socioeconomic",
    tier: 2,
    cost: { materials: 150, energy: 150, data: 400, talent: 2, civicCredit: 0 },
    timeMinutes: 45,
    prerequisites: ["decent_housing"],
    effects: [
      { type: "index_bonus", target: "legitimacy", value: 10, description: "+10 Legitimidad" },
      { type: "resource_production", target: "data", value: -0.05, description: "+5% coste DAT" },
    ],
    icon: "🔍",
  },
  {
    id: "digital_rights",
    name: "Derechos Digitales",
    description: "Marco legal para la era digital",
    tree: "socioeconomic",
    tier: 3,
    cost: { materials: 200, energy: 200, data: 500, talent: 3, civicCredit: 50 },
    timeMinutes: 90,
    prerequisites: ["universal_healthcare", "algorithmic_transparency"],
    effects: [
      { type: "index_bonus", target: "legitimacy", value: 15, description: "+15 Legitimidad" },
      { type: "index_bonus", target: "welfare", value: 8, description: "+8 Bienestar" },
    ],
    icon: "⚖️",
  },

  // Eco-tecnológica Tree
  {
    id: "recycling_i",
    name: "Reciclaje I",
    description: "Sistemas básicos de reciclaje y reutilización",
    tree: "ecotech",
    tier: 1,
    cost: { materials: 150, energy: 150, data: 100, talent: 1, civicCredit: 0 },
    timeMinutes: 25,
    effects: [{ type: "index_bonus", target: "sustainability", value: 10, description: "+10 Sostenibilidad" }],
    icon: "♻️",
  },
  {
    id: "co2_capture",
    name: "Captura de CO₂",
    description: "Tecnología para capturar y almacenar carbono",
    tree: "ecotech",
    tier: 2,
    cost: { materials: 400, energy: 300, data: 200, talent: 2, civicCredit: 0 },
    timeMinutes: 75,
    prerequisites: ["recycling_i"],
    effects: [
      { type: "index_bonus", target: "sustainability", value: 15, description: "+15 Sostenibilidad" },
      { type: "unlock_feature", target: "green_events", value: 1, description: "Bonifica eventos verdes" },
    ],
    icon: "🌱",
  },
  {
    id: "green_logistics",
    name: "Logística Verde",
    description: "Transporte y distribución sostenible",
    tree: "ecotech",
    tier: 2,
    cost: { materials: 250, energy: 200, data: 150, talent: 1, civicCredit: 0 },
    timeMinutes: 50,
    prerequisites: ["recycling_i"],
    effects: [{ type: "cost_reduction", target: "units_energy", value: 0.15, description: "-15% consumo ENG tropas" }],
    icon: "🚛",
  },
  {
    id: "circular_economy",
    name: "Economía Circular",
    description: "Sistema económico regenerativo completo",
    tree: "ecotech",
    tier: 3,
    cost: { materials: 500, energy: 400, data: 300, talent: 3, civicCredit: 30 },
    timeMinutes: 120,
    prerequisites: ["co2_capture", "green_logistics"],
    effects: [
      { type: "index_bonus", target: "sustainability", value: 20, description: "+20 Sostenibilidad" },
      { type: "resource_production", target: "materials", value: 0.1, description: "+10% producción MAT" },
    ],
    icon: "🔄",
  },

  // Aero-IA Tree
  {
    id: "ai_logistics",
    name: "IA Logística",
    description: "Optimización de procesos mediante IA",
    tree: "aero-ai",
    tier: 1,
    cost: { materials: 100, energy: 200, data: 300, talent: 2, civicCredit: 0 },
    timeMinutes: 40,
    effects: [
      { type: "cost_reduction", target: "training_time", value: 0.2, description: "-20% tiempo entrenamiento" },
    ],
    icon: "🤖",
  },
  {
    id: "drones_v2",
    name: "Drones V2",
    description: "Nueva generación de drones de combate",
    tree: "aero-ai",
    tier: 2,
    cost: { materials: 300, energy: 250, data: 400, talent: 2, civicCredit: 0 },
    timeMinutes: 80,
    prerequisites: ["ai_logistics"],
    effects: [{ type: "building_bonus", target: "drones_attack", value: 0.25, description: "+25% ataque drones" }],
    icon: "🚁",
  },
  {
    id: "orbital_shields",
    name: "Escudos Orbitales",
    description: "Sistemas defensivos espaciales avanzados",
    tree: "aero-ai",
    tier: 2,
    cost: { materials: 200, energy: 300, data: 500, talent: 3, civicCredit: 0 },
    timeMinutes: 90,
    prerequisites: ["ai_logistics"],
    effects: [{ type: "building_bonus", target: "orbital_defense", value: 0.3, description: "+30% defensa orbital" }],
    icon: "🛡️",
  },
  {
    id: "singularity_core",
    name: "Núcleo Singularidad",
    description: "IA superinteligente para gestión urbana",
    tree: "aero-ai",
    tier: 3,
    cost: { materials: 600, energy: 800, data: 1000, talent: 5, civicCredit: 100 },
    timeMinutes: 180,
    prerequisites: ["drones_v2", "orbital_shields"],
    effects: [
      { type: "resource_production", target: "data", value: 0.2, description: "+20% producción DAT" },
      { type: "index_bonus", target: "legitimacy", value: 10, description: "+10 Legitimidad" },
      { type: "unlock_feature", target: "ai_governor", value: 1, description: "Desbloquea Gobernador IA" },
    ],
    icon: "🧠",
  },
]

export const getResearchByTree = (tree: ResearchTree): Research[] => {
  return RESEARCH_DATA.filter((research) => research.tree === tree)
}

export const getResearchById = (id: string): Research | undefined => {
  return RESEARCH_DATA.find((research) => research.id === id)
}

export const getAvailableResearch = (completedResearch: string[]): Research[] => {
  return RESEARCH_DATA.filter((research) => {
    // Check if already completed
    if (completedResearch.includes(research.id)) return false

    // Check prerequisites
    if (research.prerequisites) {
      return research.prerequisites.every((prereq) => completedResearch.includes(prereq))
    }

    return true
  })
}
