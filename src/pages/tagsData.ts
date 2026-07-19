export type TagColorName =
  | "Red"
  | "Orange"
  | "Yellow"
  | "Lime"
  | "Green"
  | "Light Blue"
  | "Blue"
  | "Navy"
  | "Purple"
  | "Pink"
  | "White"
  | "Gray"
  | "Brown"
  | "Dark Gray";

export type TagColor = {
  id: number;
  name: TagColorName;
  value: string;
  backgroundValue: string;
};

// TAG_COLORS is no longer a database table. These values are UI-only palette
// metadata; TAGS stores only the selected numeric color_id.
export const tagColors: TagColor[] = [
  { id: 1, name: "Red", value: "#ef4444", backgroundValue: "#fee2e2" },
  { id: 2, name: "Orange", value: "#f97316", backgroundValue: "#ffedd5" },
  { id: 3, name: "Yellow", value: "#eab308", backgroundValue: "#fef9c3" },
  { id: 4, name: "Lime", value: "#84cc16", backgroundValue: "#ecfccb" },
  { id: 5, name: "Green", value: "#22c55e", backgroundValue: "#dcfce7" },
  { id: 6, name: "Light Blue", value: "#38bdf8", backgroundValue: "#e0f2fe" },
  { id: 7, name: "Blue", value: "#3b82f6", backgroundValue: "#dbeafe" },
  { id: 8, name: "Navy", value: "#1e3a8a", backgroundValue: "#dbeafe" },
  { id: 9, name: "Purple", value: "#8b5cf6", backgroundValue: "#ede9fe" },
  { id: 10, name: "Pink", value: "#ec4899", backgroundValue: "#fce7f3" },
  { id: 11, name: "White", value: "#d1d5db", backgroundValue: "#ffffff" },
  { id: 12, name: "Gray", value: "#6b7280", backgroundValue: "#f3f4f6" },
  { id: 13, name: "Brown", value: "#92400e", backgroundValue: "#fef3c7" },
  { id: 14, name: "Dark Gray", value: "#374151", backgroundValue: "#e5e7eb" },
];
