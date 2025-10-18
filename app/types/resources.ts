/**
 * Resource type definitions for AI Safety learning materials
 */

export type ResourceType = "video" | "paper" | "course" | "article" | "wiki" | "book";

export type ResourceTopic = "alignment" | "interpretability" | "robustness" | "governance" | "general";

export type DifficultyLevel = "beginner" | "intermediate" | "advanced";

export interface Resource {
  id: string;
  title: string;
  titleEs: string;
  url: string;
  type: ResourceType;
  topic: ResourceTopic;
  difficulty: DifficultyLevel;
  timeToComplete: string;
  timeToCompleteEs: string;
  description?: string;
  descriptionEs?: string;
  isNew?: boolean;
}
