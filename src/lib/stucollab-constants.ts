export const DEPARTMENTS = [
  "Computer Science",
  "Cyber Security",
  "Information Technology",
  "Software Engineering",
  "Electrical/Electronic Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "Mathematics / Statistics",
  "Physics",
  "Chemistry",
  "Biochemistry",
  "Microbiology",
  "Biology",
  "Medicine & Health Sciences",
  "Nursing",
  "Public Health",
  "Agriculture",
  "Economics",
  "Accounting",
  "Business Administration",
  "Mass Communication",
  "Political Science",
  "Sociology",
  "Psychology",
  "Law",
  "Education",
  "English / Languages",
  "Architecture",
  "Other",
] as const;

export const CATEGORIES = [
  "Web Development",
  "Mobile",
  "UI/UX",
  "Documentation",
  "Research",
  "Data",
  "Cybersecurity",
  "Hardware / IoT",
  "Business / Entrepreneurship",
  "Creative / Media",
  "General",
] as const;

export type SkillOption = { name: string; group: string };

export const SKILL_CATALOG: SkillOption[] = [
  // Web & Mobile
  ...[
    "HTML",
    "CSS",
    "JavaScript",
    "TypeScript",
    "React",
    "Next.js",
    "Vue",
    "Tailwind CSS",
    "Bootstrap",
    "Node.js",
    "Express",
    "PHP",
    "Laravel",
    "WordPress",
    "Flutter",
    "React Native",
    "Kotlin",
    "Java (Android)",
    "Swift",
    "REST APIs",
  ].map((name) => ({ name, group: "Web & Mobile" })),

  // Systems & Backend
  ...[
    "Python",
    "Django",
    "Flask",
    "FastAPI",
    "Java",
    "Spring Boot",
    "C",
    "C++",
    "C#",
    ".NET",
    "Go",
    "SQL",
    "PostgreSQL",
    "MySQL",
    "SQLite",
    "MongoDB",
    "Firebase",
    "Supabase",
    "Git & GitHub",
    "Linux",
    "Docker",
    "Networking",
    "Cybersecurity",
    "Ethical Hacking",
  ].map((name) => ({ name, group: "Systems & Backend" })),

  // Data, AI & Math
  ...[
    "Data Analysis",
    "Machine Learning",
    "Pandas",
    "NumPy",
    "Scikit-learn",
    "TensorFlow",
    "PyTorch",
    "Computer Vision",
    "Natural Language Processing",
    "Power BI",
    "Tableau",
    "Excel / Google Sheets",
    "MATLAB",
    "R",
    "Statistics",
  ].map((name) => ({ name, group: "Data, AI & Math" })),

  // Design & Creative
  ...[
    "UI/UX Design",
    "Figma",
    "Wireframing",
    "Graphic Design",
    "Adobe Photoshop",
    "Adobe Illustrator",
    "Canva",
    "Video Editing",
    "Premiere Pro",
    "3D Modeling (Blender)",
    "Animation",
    "Photography",
  ].map((name) => ({ name, group: "Design & Creative" })),

  // Research & Writing
  ...[
    "Academic Writing",
    "Literature Review",
    "Questionnaire & Survey Design",
    "Data Collection & Fieldwork",
    "Statistical Analysis (SPSS)",
    "Technical Report Writing",
    "Referencing (APA/MLA)",
    "Presentation & Defense Slides",
    "Proofreading & Editing",
    "Interviews & Focus Groups",
    "Laboratory Work",
  ].map((name) => ({ name, group: "Research & Writing" })),

  // Hardware & IoT
  ...[
    "Arduino",
    "Raspberry Pi",
    "Embedded Systems",
    "Circuit Design",
    "PCB Design",
    "Robotics",
    "AutoCAD",
    "SolidWorks",
  ].map((name) => ({ name, group: "Hardware & IoT" })),

  // Business & Soft skills
  ...[
    "Project Management",
    "Business Plan Writing",
    "Market Research",
    "Financial Analysis",
    "Digital Marketing",
    "Social Media Management",
    "Public Speaking",
    "Teaching / Tutoring",
  ].map((name) => ({ name, group: "Business & Soft Skills" })),
];

export const SKILL_NAMES = SKILL_CATALOG.map((s) => s.name);

export const POPULAR_SKILLS = [
  "React",
  "Python",
  "UI/UX Design",
  "Academic Writing",
  "Node.js",
  "Data Analysis",
  "Flutter",
  "Figma",
  "SQL",
  "Statistical Analysis (SPSS)",
  "Java",
  "Graphic Design",
] as const;

export const MAX_PROFILE_SKILLS = 12;
export const MAX_POST_SKILLS = 8;
export const MAX_SKILL_LENGTH = 32;

/** Normalise a custom skill so "react js " and "React JS" don't both end up stored. */
export function normalizeSkill(raw: string): string {
  const cleaned = raw.trim().replace(/\s+/g, " ").slice(0, MAX_SKILL_LENGTH);
  if (!cleaned) return "";
  const match = SKILL_NAMES.find((s) => s.toLowerCase() === cleaned.toLowerCase());
  if (match) return match;
  return cleaned
    .split(" ")
    .map((w) => (w.length > 2 && w === w.toLowerCase() ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
}
