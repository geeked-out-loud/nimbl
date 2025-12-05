// packages/ui/src/Panel.tsx
import React from "react";

export const Panel = ({ title, children }: { title?: string; children?: React.ReactNode }) => {
  return (
    <div className="bg-[#0F0F0F] border border-[#2A2A2A] rounded-lg p-4 shadow-sm">
      {title && <div className="text-xs uppercase tracking-wider text-[#3A3A3A] mb-2">{title}</div>}
      <div>{children}</div>
    </div>
  );
};
