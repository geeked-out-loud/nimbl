// packages/ui/src/Canvas.tsx
import React from "react";
import { Field } from "./Field";
import type { FieldSchema } from "./types";

export const Canvas = ({ fields }: { fields: FieldSchema[] }) => {
  return (
    <div className="min-h-[400px] border-dashed border-2 border-[#2A2A2A] rounded p-4 bg-[#0B0B0B]">
      {fields.length === 0 ? (
        <div className="text-sm text-[#3A3A3A]">Canvas is empty. Drag fields here (WIP).</div>
      ) : (
        <div className="space-y-3">
          {fields.map((f) => (
            <div key={f.id}>
              <Field schema={f} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
