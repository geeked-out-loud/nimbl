// packages/ui/src/types.ts
export type FieldType = "text" | "number" | "select" | "checkbox";

export type FieldSchema = {
  id: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  options?: string[]; // for select
  x?: number; // canvas position (future)
  y?: number;
  w?: number;
  h?: number;
};