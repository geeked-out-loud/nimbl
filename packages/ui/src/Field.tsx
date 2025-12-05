// packages/ui/src/Field.tsx
import React from "react";
import type { FieldSchema } from "./types";

export const Field = ({ schema }: { schema: FieldSchema }) => {
  const base = "block w-full p-2 rounded-md border";
  switch (schema.type) {
    case "text":
    case "number":
      return (
        <label className="block">
          <div className="text-sm mb-1">{schema.label}</div>
          <input
            className={base}
            placeholder={schema.placeholder}
            type={schema.type === "number" ? "number" : "text"}
          />
        </label>
      );
    case "select":
      return (
        <label className="block">
          <div className="text-sm mb-1">{schema.label}</div>
          <select className={base}>
            {(schema.options || []).map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </label>
      );
    case "checkbox":
      return (
        <label className="inline-flex items-center space-x-2">
          <input type="checkbox" />
          <span>{schema.label}</span>
        </label>
      );
    default:
      return null;
  }
};
