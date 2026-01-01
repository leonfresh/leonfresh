import { Project } from "./types";
import projects from "./data/projects.json";

export const INITIAL_PROJECTS: Project[] = projects as Project[];

export const TECH_STACK = [
  {
    category: "Front-End",
    skills: ["React", "TypeScript", "Tailwind", "Three.js"],
  },
  {
    category: "Back-End",
    skills: ["Node.js", "Python", "PostgreSQL", "Redis"],
  },
  { category: "Design", skills: ["Figma", "Adobe XD", "Blender", "Motion"] },
  { category: "AI", skills: ["LLM Integration", "TensorFlow", "OpenAI API"] },
];
