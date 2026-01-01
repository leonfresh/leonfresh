export interface Project {
  id: string;
  title: string;
  category: string;
  description: string;
  thumbnail: string;
  images: string[];
  tags: string[];
  stats?: { label: string; value: string }[];
  links?: { label: string; url: string }[];
  url?: string;
}

export interface Skill {
  name: string;
  level: number; // 0-100
  icon?: string;
}

export interface Experience {
  role: string;
  company: string;
  duration: string;
}
