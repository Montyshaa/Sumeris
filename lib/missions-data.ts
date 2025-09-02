import type { Mission } from "./types"

export const MISSIONS: Mission[] = [
  // Day 1: Basic Construction and Production
  {
    id: "day1_upgrade_factory",
    name: "Expandir Producción",
    description: "Mejora la Fábrica Modular al nivel 2 para aumentar la producción de materiales",
    day: 1,
    order: 1,
    type: "build",
    objective: {
      type: "build",
      target: "factory",
      value: 2,
    },
    reward: {
      resources: { materials: 300 },
    },
    icon: "🏭",
  },
  {
    id: "day1_welfare_target",
    name: "Bienestar Ciudadano",
    description: "Alcanza un nivel de bienestar de 55 para mantener a la población contenta",
    day: 1,
    order: 2,
    type: "maintain",
    objective: {
      type: "maintain",
      target: "welfare",
      value: 55,
    },
    reward: {
      resources: { data: 200 },
    },
    icon: "😊",
  },
  {
    id: "day1_produce_materials",
    name: "Acumular Recursos",
    description: "Produce 400 unidades de materiales para futuras construcciones",
    day: 1,
    order: 3,
    type: "produce",
    objective: {
      type: "produce",
      target: "materials",
      value: 400,
    },
    reward: {
      resources: { talent: 1 },
    },
    icon: "📦",
  },
  {
    id: "day1_explore_district",
    name: "Exploración Inicial",
    description: "Explora un distrito del mapa para conocer el territorio",
    day: 1,
    order: 4,
    type: "explore",
    objective: {
      type: "explore",
      target: "district",
      value: 1,
    },
    reward: {
      resources: { civicCredit: 100 },
    },
    icon: "🗺️",
  },

  // Day 2: Combat and Policies
  {
    id: "day2_train_drones",
    name: "Fuerza Militar",
    description: "Entrena 20 Drones Ligeros para defender tu ciudad",
    day: 2,
    order: 1,
    type: "build",
    objective: {
      type: "build",
      target: "drones",
      value: 20,
    },
    reward: {
      resources: { materials: 600 },
    },
    icon: "🚁",
  },
  {
    id: "day2_win_attack",
    name: "Primera Victoria",
    description: "Gana tu primer ataque contra otro jugador",
    day: 2,
    order: 2,
    type: "explore",
    objective: {
      type: "explore",
      target: "attack_win",
      value: 1,
    },
    reward: {
      resources: { data: 300 },
    },
    icon: "⚔️",
  },
  {
    id: "day2_activate_policy",
    name: "Política Social",
    description: "Activa la política 'Salario Básico' durante 60 minutos",
    day: 2,
    order: 3,
    type: "policy",
    objective: {
      type: "policy",
      target: "basic_income",
      value: 60,
    },
    reward: {
      indices: { legitimacy: 8 },
    },
    icon: "📋",
  },
  {
    id: "day2_maintain_sustainability",
    name: "Equilibrio Ambiental",
    description: "Mantén la sostenibilidad ≥ 60 durante 6 horas",
    day: 2,
    order: 4,
    type: "maintain",
    objective: {
      type: "maintain",
      target: "sustainability",
      value: 60,
    },
    reward: {
      resources: { talent: 1 },
    },
    icon: "🌱",
  },

  // Day 3: Advanced Systems
  {
    id: "day3_upgrade_datacenter",
    name: "Centro de Datos",
    description: "Mejora la Nube de Datos al nivel 3 para desbloquear el Parque de IA",
    day: 3,
    order: 1,
    type: "build",
    objective: {
      type: "build",
      target: "datacenter",
      value: 3,
    },
    reward: {
      resources: { data: 800 },
    },
    icon: "💾",
  },
  {
    id: "day3_research_recycling",
    name: "Tecnología Verde",
    description: "Investiga 'Reciclaje I' para mejorar la sostenibilidad",
    day: 3,
    order: 2,
    type: "research",
    objective: {
      type: "research",
      target: "recycling_1",
      value: 1,
    },
    reward: {
      indices: { sustainability: 5 },
    },
    icon: "♻️",
  },
  {
    id: "day3_recruit_talent",
    name: "Captación de Talento",
    description: "Capta 1 unidad de talento humano especializado",
    day: 3,
    order: 3,
    type: "produce",
    objective: {
      type: "produce",
      target: "talent",
      value: 1,
    },
    reward: {
      resources: { civicCredit: 200 },
    },
    icon: "👥",
  },
  {
    id: "day3_control_district",
    name: "Dominio Territorial",
    description: "Mantén el control de un distrito durante 12 horas",
    day: 3,
    order: 4,
    type: "maintain",
    objective: {
      type: "maintain",
      target: "district_control",
      value: 12,
    },
    reward: {
      special: "Marco cosmético de ciudad avanzada",
    },
    icon: "🏛️",
  },
]

export const getMissionsByDay = (day: number): Mission[] => {
  return MISSIONS.filter((mission) => mission.day === day).sort((a, b) => a.order - b.order)
}

export const getMissionById = (id: string): Mission | undefined => {
  return MISSIONS.find((mission) => mission.id === id)
}

export const getTotalMissionsByDay = (day: number): number => {
  return MISSIONS.filter((mission) => mission.day === day).length
}
