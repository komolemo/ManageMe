import config from "@/config.json";

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
  textValue: string;
};

// TAG_COLORS is no longer a database table. TAGS stores only color_id, while
// the visual border/background values are application configuration.
export const tagColors: TagColor[] = config.tagColors.map((color) => ({
  id: color.id,
  name: color.name as TagColorName,
  value: color.borderColor,
  backgroundValue: color.backgroundColor,
  textValue: color.textColor,
}));

export const tagColorById = new Map(
  tagColors.map((color) => [color.id, color]),
);
