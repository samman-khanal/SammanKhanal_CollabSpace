export interface BoardMethodology {
  id: string;
  name: string;
  description: string;
  icon: string;
  columns: string[];
}
export const BOARD_METHODOLOGIES: BoardMethodology[] = [{
  id: "empty",
  name: "Empty Board",
  description: "Start from scratch with no columns",
  icon: "📋",
  columns: []
}, {
  id: "kanban",
  name: "Kanban",
  description: "Visualize work flow with WIP limits",
  icon: "📊",
  columns: ["Backlog", "To Do", "In Progress", "Review", "Done"]
}, {
  id: "scrum",
  name: "Scrum",
  description: "Sprint-based iterative development",
  icon: "🏃",
  columns: ["Product Backlog", "Sprint Backlog", "In Progress", "In Review", "QA / Testing", "Done"]
}, {
  id: "agile",
  name: "Agile",
  description: "Flexible, iterative project management",
  icon: "⚡",
  columns: ["Icebox", "Backlog", "In Development", "Code Review", "Testing", "Staging", "Released"]
}, {
  id: "sdlc",
  name: "SDLC (Waterfall)",
  description: "Sequential software development phases",
  icon: "🔄",
  columns: ["Planning", "Requirements", "Design", "Development", "Testing", "Deployment", "Maintenance"]
}, {
  id: "rup",
  name: "RUP",
  description: "Rational Unified Process — phase-driven",
  icon: "🏗️",
  columns: ["Inception", "Elaboration", "Construction", "Transition", "Production"]
}, {
  id: "xp",
  name: "Extreme Programming",
  description: "Rapid iterations with continuous feedback",
  icon: "🚀",
  columns: ["User Stories", "Planning", "Pair Programming", "Testing", "Integration", "Release"]
}, {
  id: "devops",
  name: "DevOps",
  description: "CI/CD pipeline-oriented workflow",
  icon: "🔧",
  columns: ["Plan", "Code", "Build", "Test", "Release", "Deploy", "Operate", "Monitor"]
}];
//* Function for get methodology
export function getMethodology(id: string): BoardMethodology {
  //* Function for this task
  return BOARD_METHODOLOGIES.find(m => m.id === id) ?? BOARD_METHODOLOGIES.find(m => m.id === "kanban")!;
}