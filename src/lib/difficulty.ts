export type DifficultyColor = "green" | "yellow" | "red";

export const getDifficultyLabel = (d: number): string =>
  d <= 2.0 ? "Începător" : d <= 3.5 ? "Intermediar" : "Avansat";

export const getDifficultyColor = (d: number): DifficultyColor =>
  d <= 2.0 ? "green" : d <= 3.5 ? "yellow" : "red";
