import { useState, useRef, useCallback, useEffect } from 'react';
import { FormComponent, GridPosition } from '../types';
import { pixelToGrid, gridToPixel, clampPosition, checkOverlap } from '../gridUtils';
import { GripVertical, Trash2 } from 'lucide-react';
import { CANVAS_CONFIG, isModifierKey, shouldPreventDefault, clampZoom } from '../config';

const GRID_SIZE = CANVAS_CONFIG.GRID_SIZE;
const COLUMNS = CANVAS_CONFIG.GRID_COLUMNS;

type CanvasProps = {
  components: FormComponent[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onUpdate: (id: string, updates: Partial<FormComponent>) => void;
  onDelete: () => void;
  showGrid: boolean;
  zoom: number;
  pan: { x: number; y: number };
  onPanChange: (pan: { x: number; y: number }) => void;
  onZoomChange: (zoom: number) => void;
};

export function Canvas({ components, selectedId, onSelect, onUpdate, onDelete, showGrid, zoom, pan, onPanChange, onZoomChange }: CanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const workspaceRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState<{ id: string; offsetX: number; offsetY: number } | null>(null);
  const [resizing, setResizing] = useState<{ id: string; direction: string; startX: number; startY: number; startPos: GridPosition } | null>(null);
  const [panning, setPanning] = useState<{ startX: number; startY: number; startPan: { x: number; y: number } } | null>(null);

  const CANVAS_WIDTH = CANVAS_CONFIG.CANVAS_WIDTH;
  const CANVAS_HEIGHT = CANVAS_CONFIG.CANVAS_HEIGHT;

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (shouldPreventDefault(e, true)) {
        e.preventDefault();
      }

      // Delete selected component
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) {
        onDelete();
      }

      // Deselect
      if (e.key === 'Escape') {
        onSelect(null);
      }

      // Toggle grid
      if (isModifierKey(e) && e.key.toLowerCase() === 'g') {
        // Toggled via parent component
      }

      // Zoom shortcuts
      if (isModifierKey(e) && e.key === '0') {
        onPanChange({ x: 0, y: 0 });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedId, onDelete, onSelect, onPanChange]);

  // Handle mouse move for drag, resize, and pan
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (panning && canvasRef.current) {
        const dx = e.clientX - panning.startX;
        const dy = e.clientY - panning.startY;
        
        // Calculate new pan position
        const newPanX = panning.startPan.x + dx;
        const newPanY = panning.startPan.y + dy;
        
        // Get viewport dimensions
        const viewportWidth = canvasRef.current.clientWidth;
        const viewportHeight = canvasRef.current.clientHeight;
        
        // Calculate scaled canvas dimensions
        const scaledWidth = CANVAS_WIDTH * (zoom / 100);
        const scaledHeight = CANVAS_HEIGHT * (zoom / 100);
        
        // Calculate max pan limits (keep canvas within viewport)
        const maxPanX = (scaledWidth - viewportWidth) / 2;
        const maxPanY = (scaledHeight - viewportHeight) / 2;
        
        // Clamp pan to boundaries
        const clampedPanX = Math.min(maxPanX, Math.max(-maxPanX, newPanX));
        const clampedPanY = Math.min(maxPanY, Math.max(-maxPanY, newPanY));
        
        onPanChange({
          x: clampedPanX,
          y: clampedPanY,
        });
      } else if (dragging) {
        handleDrag(e);
      } else if (resizing) {
        handleResizeMove(e);
      }
    };

    const handleMouseUp = () => {
      setPanning(null);
      setDragging(null);
      setResizing(null);
    };

    if (panning || dragging || resizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [panning, dragging, resizing, components, onPanChange]);

  const handleDrag = (e: MouseEvent) => {
    if (!dragging || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    
    // Account for zoom and pan
    const mouseX = ((e.clientX - rect.left - pan.x) / (zoom / 100)) - dragging.offsetX;
    const mouseY = ((e.clientY - rect.top - pan.y) / (zoom / 100)) - dragging.offsetY;

    const { col, row } = pixelToGrid(mouseX, mouseY, CANVAS_WIDTH);

    const component = components.find(c => c.id === dragging.id);
    if (!component) return;

    let newPosition: GridPosition = {
      x: col,
      y: row,
      w: component.position.w,
      h: component.position.h,
    };

    newPosition = clampPosition(newPosition);

    const otherComponents = components.filter(c => c.id !== dragging.id);
    const hasOverlap = otherComponents.some(c => checkOverlap(newPosition, c.position));

    if (!hasOverlap) {
      onUpdate(dragging.id, { position: newPosition });
    }
  };

  const handleResizeMove = (e: MouseEvent) => {
    if (!resizing || !canvasRef.current) return;

    const component = components.find(c => c.id === resizing.id);
    if (!component) return;

    const deltaX = Math.round((e.clientX - resizing.startX) / GRID_SIZE / (zoom / 100));
    const deltaY = Math.round((e.clientY - resizing.startY) / GRID_SIZE / (zoom / 100));

    let newPosition = { ...resizing.startPos };

    if (resizing.direction.includes('e')) {
      newPosition.w = Math.max(2, resizing.startPos.w + deltaX);
    }
    if (resizing.direction.includes('w')) {
      const newW = Math.max(2, resizing.startPos.w - deltaX);
      const diff = resizing.startPos.w - newW;
      newPosition.x = resizing.startPos.x + diff;
      newPosition.w = newW;
    }
    if (resizing.direction.includes('s')) {
      newPosition.h = Math.max(2, resizing.startPos.h + deltaY);
    }
    if (resizing.direction.includes('n')) {
      const newH = Math.max(2, resizing.startPos.h - deltaY);
      const diff = resizing.startPos.h - newH;
      newPosition.y = resizing.startPos.y + diff;
      newPosition.h = newH;
    }

    newPosition = clampPosition(newPosition);

    const otherComponents = components.filter(c => c.id !== resizing.id);
    const hasOverlap = otherComponents.some(c => checkOverlap(newPosition, c.position));

    if (!hasOverlap) {
      onUpdate(resizing.id, { position: newPosition });
    }
  };

  const handleDragStart = (e: React.MouseEvent, component: FormComponent) => {
    e.stopPropagation();
    e.preventDefault();
    onSelect(component.id);

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const { x: compX } = gridToPixel(component.position.x, component.position.y, CANVAS_WIDTH);

    setDragging({
      id: component.id,
      offsetX: 0,
      offsetY: 0,
    });
  };

  const handleResizeStart = (e: React.MouseEvent, component: FormComponent, direction: string) => {
    e.stopPropagation();
    e.preventDefault();
    onSelect(component.id);

    setResizing({
      id: component.id,
      direction,
      startX: e.clientX,
      startY: e.clientY,
      startPos: { ...component.position },
    });
  };

  const renderComponent = (component: FormComponent) => {
    const { x, y } = gridToPixel(component.position.x, component.position.y, CANVAS_WIDTH);
    const width = (component.position.w / COLUMNS) * CANVAS_WIDTH;
    const height = component.position.h * GRID_SIZE;
    const isSelected = component.id === selectedId;

    return (
      <div
        key={component.id}
        style={{
          position: 'absolute',
          left: x,
          top: y,
          width,
          height,
        }}
        className={`group cursor-move ${isSelected ? 'z-10' : 'z-0'}`}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(component.id);
        }}
      >
        {/* Component Border */}
        <div className={`absolute inset-0 border-2 rounded-lg transition ${
          isSelected 
            ? 'border-primary bg-primary/5' 
            : 'border-border hover:border-primary/50'
        }`}>
          {/* Drag Handle */}
          {isSelected && (
            <div
              onMouseDown={(e) => handleDragStart(e, component)}
              className="absolute top-0 left-0 right-0 h-8 bg-primary flex items-center justify-between px-2 cursor-move rounded-t-md"
            >
              <GripVertical className="w-4 h-4 text-surface" />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="p-1 hover:bg-surface/20 rounded text-surface"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Component Content */}
          <div className={`p-3 ${isSelected ? 'pt-10' : ''}`}>
            <ComponentPreview component={component} />
          </div>

          {/* Resize Handles */}
          {isSelected && (
            <>
              {['nw', 'ne', 'sw', 'se', 'n', 's', 'e', 'w'].map((dir) => (
                <div
                  key={dir}
                  onMouseDown={(e) => handleResizeStart(e, component, dir)}
                  className={`absolute w-3 h-3 bg-primary border-2 border-surface rounded-sm ${
                    dir === 'nw' ? '-top-1.5 -left-1.5 cursor-nwse-resize' :
                    dir === 'ne' ? '-top-1.5 -right-1.5 cursor-nesw-resize' :
                    dir === 'sw' ? '-bottom-1.5 -left-1.5 cursor-nesw-resize' :
                    dir === 'se' ? '-bottom-1.5 -right-1.5 cursor-nwse-resize' :
                    dir === 'n' ? '-top-1.5 left-1/2 -translate-x-1/2 cursor-ns-resize' :
                    dir === 's' ? '-bottom-1.5 left-1/2 -translate-x-1/2 cursor-ns-resize' :
                    dir === 'e' ? 'top-1/2 -translate-y-1/2 -right-1.5 cursor-ew-resize' :
                    'top-1/2 -translate-y-1/2 -left-1.5 cursor-ew-resize'
                  }`}
                />
              ))}
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div
      ref={canvasRef}
      className="w-full h-full bg-surface-secondary relative overflow-hidden cursor-grab active:cursor-grabbing select-none custom-scrollbar"
      onClick={() => onSelect(null)}
      onMouseDown={(e) => {
        if (e.target === canvasRef.current || e.target === workspaceRef.current) {
          e.preventDefault();
          setPanning({
            startX: e.clientX,
            startY: e.clientY,
            startPan: { ...pan },
          });
        }
      }}
      onWheel={(e) => {
        // Zoom with mouse wheel (Ctrl/Cmd + scroll) - ONLY affects canvas, not browser
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault(); // Prevent browser zoom
          e.stopPropagation();
          
          const delta = e.deltaY > 0 ? -CANVAS_CONFIG.ZOOM_STEP : CANVAS_CONFIG.ZOOM_STEP;
          const newZoom = clampZoom(zoom + delta);
          
          // Update zoom
          onZoomChange(newZoom);
          
          // After zoom, clamp pan to new boundaries
          if (canvasRef.current) {
            const viewportWidth = canvasRef.current.clientWidth;
            const viewportHeight = canvasRef.current.clientHeight;
            const scaledWidth = CANVAS_WIDTH * (newZoom / 100);
            const scaledHeight = CANVAS_HEIGHT * (newZoom / 100);
            const maxPanX = (scaledWidth - viewportWidth) / 2;
            const maxPanY = (scaledHeight - viewportHeight) / 2;
            
            onPanChange({
              x: Math.min(maxPanX, Math.max(-maxPanX, pan.x)),
              y: Math.min(maxPanY, Math.max(-maxPanY, pan.y)),
            });
          }
        }
      }}
      tabIndex={0}
      style={{ outline: 'none' }}
    >
      {/* Infinite Canvas Workspace */}
      <div 
        ref={workspaceRef}
        className="absolute select-none"
        style={{
          width: `${CANVAS_WIDTH}px`,
          height: `${CANVAS_HEIGHT}px`,
          left: '50%',
          top: '50%',
          transform: `translate(-50%, -50%) translate(${pan.x}px, ${pan.y}px) scale(${zoom / 100})`,
          transformOrigin: 'center center',
          backgroundImage: showGrid
            ? `
              linear-gradient(var(--color-border) 1px, transparent 1px),
              linear-gradient(90deg, var(--color-border) 1px, transparent 1px)
            `
            : `radial-gradient(circle, var(--color-border) 2px, transparent 2px)`,
          backgroundSize: showGrid
            ? `${GRID_SIZE}px ${GRID_SIZE}px`
            : `${GRID_SIZE * 5}px ${GRID_SIZE * 5}px`,
          backgroundPosition: '0 0',
          backgroundColor: 'var(--color-surface)',
        }}
      >
        {components.map(renderComponent)}
      </div>
    </div>
  );
}

function ComponentPreview({ component }: { component: FormComponent }) {
  const baseClass = "w-full px-3 py-2 text-sm border border-border rounded-lg bg-surface text-text";

  switch (component.type) {
    case 'textarea':
      return (
        <div>
          <label className="block text-sm font-medium text-text mb-1">
            {component.label} {component.required && <span className="text-error">*</span>}
          </label>
          <textarea
            placeholder={component.placeholder}
            disabled
            className={`${baseClass} resize-none`}
            rows={3}
          />
        </div>
      );

    case 'select':
      return (
        <div>
          <label className="block text-sm font-medium text-text mb-1">
            {component.label} {component.required && <span className="text-error">*</span>}
          </label>
          <select disabled className={baseClass}>
            <option>{component.placeholder || 'Select an option'}</option>
            {component.options?.map((opt, i) => (
              <option key={i}>{opt}</option>
            ))}
          </select>
        </div>
      );

    case 'checkbox':
    case 'radio':
      return (
        <div>
          <label className="block text-sm font-medium text-text mb-2">
            {component.label} {component.required && <span className="text-error">*</span>}
          </label>
          <div className="space-y-2">
            {component.options?.map((opt, i) => (
              <label key={i} className="flex items-center gap-2">
                <input
                  type={component.type}
                  disabled
                  className="w-4 h-4 text-primary border-border"
                />
                <span className="text-sm text-text">{opt}</span>
              </label>
            ))}
          </div>
        </div>
      );

    case 'file':
      return (
        <div>
          <label className="block text-sm font-medium text-text mb-1">
            {component.label} {component.required && <span className="text-error">*</span>}
          </label>
          <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
            <div className="text-text-secondary text-sm">Click to upload or drag and drop</div>
          </div>
        </div>
      );

    default:
      return (
        <div>
          <label className="block text-sm font-medium text-text mb-1">
            {component.label} {component.required && <span className="text-error">*</span>}
          </label>
          <input
            type={component.type}
            placeholder={component.placeholder}
            disabled
            className={baseClass}
          />
        </div>
      );
  }
}
