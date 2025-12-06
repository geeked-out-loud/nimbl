import { useState } from 'react';
import { FormComponent } from '../types';
import { Trash2, Copy } from 'lucide-react';

type PropertiesPanelProps = {
  component: FormComponent | null;
  onUpdate: (updates: Partial<FormComponent>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
};

export function PropertiesPanel({ component, onUpdate, onDelete, onDuplicate }: PropertiesPanelProps) {
  if (!component) {
    return null;
  }

  const [options, setOptions] = useState(component.options?.join('\n') || '');

  const handleOptionsChange = (value: string) => {
    setOptions(value);
    onUpdate({ options: value.split('\n').filter(o => o.trim()) });
  };

  const needsOptions = ['select', 'radio', 'checkbox'].includes(component.type);

  return (
    <div className="h-full bg-surface flex flex-col">
      {/* Header */}
      <div className="h-14 border-b border-border flex items-center justify-between px-4 shrink-0">
        <h3 className="font-semibold text-text">Properties</h3>
        <div className="flex gap-1">
          <button
            onClick={onDuplicate}
            className="p-2 text-text-secondary hover:text-text hover:bg-hover rounded-lg transition"
            title="Duplicate"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-text-secondary hover:text-error hover:bg-error/10 rounded-lg transition"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {/* Label */}
        <div>
          <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2">
            Label
          </label>
          <input
            type="text"
            value={component.label}
            onChange={(e) => onUpdate({ label: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-surface text-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="Enter label"
          />
        </div>

        {/* Placeholder */}
        <div>
          <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2">
            Placeholder
          </label>
          <input
            type="text"
            value={component.placeholder || ''}
            onChange={(e) => onUpdate({ placeholder: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-surface text-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="Enter placeholder"
          />
        </div>

        {/* Required Toggle */}
        <div className="flex items-center justify-between py-2">
          <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide">
            Required
          </label>
          <button
            onClick={() => onUpdate({ required: !component.required })}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
              component.required ? 'bg-primary' : 'bg-border'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-surface transition ${
                component.required ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Options */}
        {needsOptions && (
          <div>
            <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2">
              Options (one per line)
            </label>
            <textarea
              value={options}
              onChange={(e) => handleOptionsChange(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-surface text-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none font-mono"
              rows={6}
              placeholder="Option 1&#10;Option 2&#10;Option 3"
            />
          </div>
        )}

        {/* Position & Size */}
        <div className="pt-4 border-t border-border">
          <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-3">
            Layout
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-surface-secondary rounded-lg p-3">
              <div className="text-xs text-text-secondary mb-1">Position</div>
              <div className="font-mono text-sm text-text">
                {component.position.x}, {component.position.y}
              </div>
            </div>
            <div className="bg-surface-secondary rounded-lg p-3">
              <div className="text-xs text-text-secondary mb-1">Size</div>
              <div className="font-mono text-sm text-text">
                {component.position.w} × {component.position.h}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
