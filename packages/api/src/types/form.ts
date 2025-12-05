// packages/api/src/types/form.ts
export type FormDefinition = {
  id: string;
  ownerId: string;
  title: string;
  slug: string;
  schema: any;       // later we define proper schema types
  canvas: any;       // canvas JSON
  createdAt: string;
  updatedAt: string;
};
