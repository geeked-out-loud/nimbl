import { useState, useRef, useCallback, useEffect } from 'react';
import { FormComponent, GridPosition, FieldNode, FrameNode, FormDefinition } from '../types';
import { 
  gridColToPx, 
  gridRowToPx, 
  pxToGridCol, 
  pxToGridRow,
  clampFieldPosition, 
  checkFieldOverlap,
  frameLocalToWorld,
  worldToFrameLocal
} from '../gridUtils';
import { GripVertical, Trash2 } from 'lucide-react';
import { CANVAS_CONFIG, isModifierKey, shouldPreventDefault } from '../config';
import { Camera, screenToWorld, worldToScreen, clampCamera, CAMERA_CONFIG } from '../camera';

type CanvasProps = {
  // New Frame/Field system
  formDefinition: FormDefinition;
  selectedFieldId: string | null;
  onFieldSelect: (id: string | null) => void;
  onFieldUpdate: (id: string, updates: Partial<FieldNode>) => void;
  onFieldDelete: () => void;
  
  // Camera
  camera: Camera;
  onCameraChange: (camera: Camera) => void;
  
  // Display
  showGrid: boolean;
  snapToGrid: boolean;
  
  // Legacy support (for gradual migration)
  components?: FormComponent[];
  selectedId?: string | null;
  onSelect?: (id: string | null) => void;
  onUpdate?: (id: string, updates: Partial<FormComponent>) => void;
  onDelete?: () => void;
  zoom?: number;
  pan?: { x: number; y: number };
  onPanChange?: (pan: { x: number; y: number }) => void;
  onZoomChange?: (zoom: number) => void;
};

export function Canvas({ 
  formDefinition,
  selectedFieldId,
  onFieldSelect,
  onFieldUpdate,
  onFieldDelete,
  camera,
  onCameraChange,
  showGrid,
  snapToGrid,
  // Legacy props
  components = [],
  selectedId = null,
  onSelect = () => {},
  onUpdate = () => {},
  onDelete = () => {},
}: CanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<HTMLDivElement>(null);
  
  const [dragging, setDragging] = useState<{ 
    fieldId: string; 
    frameId: string;
    offsetX: number; 
    offsetY: number;
  } | null>(null);
  
  const [resizing, setResizing] = useState<{ 
    fieldId: string; 
    frameId: string;
    direction: string; 
    startX: number; 
    startY: number; 
    startLayout: { x: number; y: number; w: number; h: number };
  } | null>(null);
  
  const [panning, setPanning] = useState<{ 
    startX: number; 
    startY: number; 
    startCamera: Camera;
  } | null>(null);

  // Get root frame
  const rootFrame = formDefinition.frames[formDefinition.rootFrameId];
  if (!rootFrame) {
    return <div className="w-full h-full flex items-center justify-center text-text-secondary">
      No root frame defined
    </div>;
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (shouldPreventDefault(e, true)) {
        e.preventDefault();
      }

      // Delete selected field
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedFieldId) {
        onFieldDelete();
      }

      // Deselect
      if (e.key === 'Escape') {
        onFieldSelect(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedFieldId, onFieldDelete, onFieldSelect]);

  // Handle mouse move for drag, resize, and pan
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (panning && canvasRef.current) {
        // Pan camera
        const dx = (e.clientX - panning.startX) / camera.zoom;
        const dy = (e.clientY - panning.startY) / camera.zoom;
        
        const newCamera: Camera = {
          x: panning.startCamera.x - dx,
          y: panning.startCamera.y - dy,
          zoom: camera.zoom,
        };
        
        onCameraChange(clampCamera(newCamera, rootFrame));
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
  }, [panning, dragging, resizing, camera, rootFrame, onCameraChange]);

  const handleDrag = (e: MouseEvent) => {
    if (!dragging || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const frame = formDefinition.frames[dragging.frameId];
    if (!frame) return;

    // Convert screen to world coordinates
    const worldPos = screenToWorld(
      e.clientX - rect.left,
      e.clientY - rect.top,
      camera,
      { width: rect.width, height: rect.height }
    );

    // Convert world to frame-local coordinates
    const frameLocal = worldToFrameLocal(worldPos.x, worldPos.y, frame);

    // Convert frame-local pixels to grid units
    let gridX: number;
    let gridY: number;
    
    if (snapToGrid) {
      gridX = pxToGridCol(frameLocal.x - dragging.offsetX, frame.layout.w, frame.grid.columns);
      gridY = pxToGridRow(frameLocal.y - dragging.offsetY, frame.grid.rowUnit);
    } else {
      // No snapping - use precise pixel-to-grid conversion
      gridX = (frameLocal.x - dragging.offsetX) / (frame.layout.w / frame.grid.columns);
      gridY = (frameLocal.y - dragging.offsetY) / frame.grid.rowUnit;
    }

    const field = formDefinition.fields[dragging.fieldId];
    if (!field) return;

    let newLayout = {
      frameId: field.layout.frameId,
      x: gridX,
      y: gridY,
      w: field.layout.w,
      h: field.layout.h,
    };

    // Clamp to frame bounds
    const clamped = clampFieldPosition(
      { x: newLayout.x, y: newLayout.y, w: newLayout.w, h: newLayout.h },
      frame.grid.columns
    );
    newLayout = { ...newLayout, ...clamped };

    // Check for overlaps with other fields in the same frame
    const otherFields = Object.values(formDefinition.fields).filter(
      f => f.id !== dragging.fieldId && f.layout.frameId === dragging.frameId
    );
    
    const hasOverlap = otherFields.some(f => 
      checkFieldOverlap(newLayout, f.layout)
    );

    if (!hasOverlap) {
      onFieldUpdate(dragging.fieldId, { layout: newLayout });
    }
  };

  const handleResizeMove = (e: MouseEvent) => {
    if (!resizing || !canvasRef.current) return;

    const frame = formDefinition.frames[resizing.frameId];
    if (!frame) return;

    // Calculate delta in grid units
    const deltaX = Math.round((e.clientX - resizing.startX) / camera.zoom / (frame.layout.w / frame.grid.columns));
    const deltaY = Math.round((e.clientY - resizing.startY) / camera.zoom / frame.grid.rowUnit);

    let newLayout = { ...resizing.startLayout };

    // Apply resize based on direction
    if (resizing.direction.includes('e')) {
      newLayout.w = Math.max(2, resizing.startLayout.w + deltaX);
    }
    if (resizing.direction.includes('w')) {
      const newW = Math.max(2, resizing.startLayout.w - deltaX);
      const diff = resizing.startLayout.w - newW;
      newLayout.x = resizing.startLayout.x + diff;
      newLayout.w = newW;
    }
    if (resizing.direction.includes('s')) {
      newLayout.h = Math.max(2, resizing.startLayout.h + deltaY);
    }
    if (resizing.direction.includes('n')) {
      const newH = Math.max(2, resizing.startLayout.h - deltaY);
      const diff = resizing.startLayout.h - newH;
      newLayout.y = resizing.startLayout.y + diff;
      newLayout.h = newH;
    }

    // Clamp to frame bounds (preserve frameId)
    const clamped = clampFieldPosition(
      { x: newLayout.x, y: newLayout.y, w: newLayout.w, h: newLayout.h },
      frame.grid.columns
    );
    const finalLayout = { 
      frameId: resizing.frameId,
      ...clamped 
    };

    // Check for overlaps
    const otherFields = Object.values(formDefinition.fields).filter(
      f => f.id !== resizing.fieldId && f.layout.frameId === resizing.frameId
    );
    
    const hasOverlap = otherFields.some(f => 
      checkFieldOverlap(finalLayout, f.layout)
    );

    if (!hasOverlap) {
      onFieldUpdate(resizing.fieldId, { layout: finalLayout });
    }
  };

  const handleDragStart = (e: React.MouseEvent, field: FieldNode, frame: FrameNode) => {
    e.stopPropagation();
    e.preventDefault();
    onFieldSelect(field.id);

    if (!canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    
    // Convert screen to world
    const worldPos = screenToWorld(
      e.clientX - rect.left,
      e.clientY - rect.top,
      camera,
      { width: rect.width, height: rect.height }
    );

    // Convert world to frame-local
    const frameLocal = worldToFrameLocal(worldPos.x, worldPos.y, frame);

    // Field position in frame-local pixels
    const fieldX = gridColToPx(field.layout.x, frame.layout.w, frame.grid.columns);
    const fieldY = gridRowToPx(field.layout.y, frame.grid.rowUnit);

    setDragging({
      fieldId: field.id,
      frameId: field.layout.frameId,
      offsetX: frameLocal.x - fieldX,
      offsetY: frameLocal.y - fieldY,
    });
  };

  const handleResizeStart = (
    e: React.MouseEvent, 
    field: FieldNode, 
    frame: FrameNode, 
    direction: string
  ) => {
    e.stopPropagation();
    e.preventDefault();
    onFieldSelect(field.id);

    setResizing({
      fieldId: field.id,
      frameId: field.layout.frameId,
      direction,
      startX: e.clientX,
      startY: e.clientY,
      startLayout: { ...field.layout },
    });
  };

  // Render a field within a frame
  const renderField = (field: FieldNode, frame: FrameNode) => {
    const isSelected = field.id === selectedFieldId;

    // Field position and size in frame-local pixels
    const x = gridColToPx(field.layout.x, frame.layout.w, frame.grid.columns);
    const y = gridRowToPx(field.layout.y, frame.grid.rowUnit);
    const w = gridColToPx(field.layout.w, frame.layout.w, frame.grid.columns);
    const h = gridRowToPx(field.layout.h, frame.grid.rowUnit);

    return (
      <div
        key={field.id}
        style={{
          position: 'absolute',
          left: x,
          top: y,
          width: w,
          height: h,
        }}
        className={`group cursor-move ${isSelected ? 'z-10' : 'z-0'}`}
        onClick={(e) => {
          e.stopPropagation();
          onFieldSelect(field.id);
        }}
      >
        {/* Field Border */}
        <div className={`absolute inset-0 border-2 rounded-lg transition ${
          isSelected 
            ? 'border-primary bg-primary/5' 
            : 'border-border hover:border-primary/50'
        }`}>
          {/* Drag Handle */}
          {isSelected && (
            <div
              onMouseDown={(e) => handleDragStart(e, field, frame)}
              className="absolute top-0 left-0 right-0 h-8 bg-primary flex items-center justify-between px-2 cursor-move rounded-t-md"
            >
              <GripVertical className="w-4 h-4 text-surface" />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onFieldDelete();
                }}
                className="p-1 hover:bg-surface/20 rounded text-surface"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Field Content */}
          <div className={`p-3 ${isSelected ? 'pt-10' : ''}`}>
            <FieldPreview field={field} />
          </div>

          {/* Resize Handles */}
          {isSelected && (
            <>
              {['nw', 'ne', 'sw', 'se', 'n', 's', 'e', 'w'].map((dir) => (
                <div
                  key={dir}
                  onMouseDown={(e) => handleResizeStart(e, field, frame, dir)}
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

  // Render a frame
  const renderFrame = (frame: FrameNode) => {
    // Get fields in this frame
    const fieldsInFrame = Object.values(formDefinition.fields).filter(
      f => f.layout.frameId === frame.id
    );

    return (
      <div
        key={frame.id}
        style={{
          position: 'absolute',
          left: frame.layout.x,
          top: frame.layout.y,
          width: frame.layout.w,
          height: frame.layout.h,
          backgroundImage: showGrid
            ? `radial-gradient(circle, var(--color-border) 1.5px, transparent 1.5px)`
            : 'none',
          backgroundSize: showGrid
            ? `${frame.layout.w / frame.grid.columns}px ${frame.grid.rowUnit}px`
            : '0 0',
          backgroundColor: 'var(--color-surface)',
        }}
        className="border border-border rounded-lg overflow-hidden"
      >
        {fieldsInFrame.map(field => renderField(field, frame))}
      </div>
    );
  };

  return (
    <div
      ref={canvasRef}
      className="w-full h-full bg-primary/15 relative overflow-hidden cursor-grab active:cursor-grabbing select-none custom-scrollbar"
      onClick={() => onFieldSelect(null)}
      onMouseDown={(e) => {
        if (e.target === canvasRef.current || e.target === worldRef.current) {
          e.preventDefault();
          setPanning({
            startX: e.clientX,
            startY: e.clientY,
            startCamera: { ...camera },
          });
        }
      }}
      onWheel={(e) => {
        // Zoom with mouse wheel (Ctrl/Cmd + scroll)
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          e.stopPropagation();
          
          const delta = e.deltaY > 0 ? -0.1 : 0.1;
          const newZoom = Math.max(
            CAMERA_CONFIG.MIN_ZOOM,
            Math.min(CAMERA_CONFIG.MAX_ZOOM, camera.zoom + delta)
          );
          
          // Zoom towards mouse position
          if (canvasRef.current) {
            const rect = canvasRef.current.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            
            // World position before zoom
            const worldBefore = screenToWorld(mouseX, mouseY, camera, { width: rect.width, height: rect.height });
            
            // Update zoom
            const newCamera = { ...camera, zoom: newZoom };
            
            // World position after zoom (if we don't adjust camera position)
            const worldAfter = screenToWorld(mouseX, mouseY, newCamera, { width: rect.width, height: rect.height });
            
            // Adjust camera to keep mouse over same world point
            newCamera.x += worldBefore.x - worldAfter.x;
            newCamera.y += worldBefore.y - worldAfter.y;
            
            onCameraChange(clampCamera(newCamera, rootFrame));
          }
        }
      }}
      tabIndex={0}
      style={{ outline: 'none' }}
    >
      {/* World container with camera transform */}
      <div 
        ref={worldRef}
        className="absolute select-none"
        style={{
          left: '50%',
          top: '50%',
          transform: `translate(-50%, -50%) translate(${-camera.x * camera.zoom}px, ${-camera.y * camera.zoom}px) scale(${camera.zoom})`,
          transformOrigin: '0 0',
        }}
      >
        {/* Render all frames */}
        {Object.values(formDefinition.frames).map(renderFrame)}
      </div>
    </div>
  );
}

function FieldPreview({ field }: { field: FieldNode }) {
  const baseClass = "w-full px-3 py-2 text-sm border border-border rounded-lg bg-surface text-text";

  // Use field.type directly
  const fieldType = field.type;

  if (fieldType === 'textarea') {
    return (
      <div>
        <label className="block text-sm font-medium text-text mb-1">
          {field.props.label} {field.props.required && <span className="text-error">*</span>}
        </label>
        <textarea
          placeholder={field.props.placeholder}
          disabled
          className={`${baseClass} resize-none`}
          rows={3}
        />
      </div>
    );
  }

  if (fieldType === 'select') {
    return (
      <div>
        <label className="block text-sm font-medium text-text mb-1">
          {field.props.label} {field.props.required && <span className="text-error">*</span>}
        </label>
        <select disabled className={baseClass}>
          <option>{field.props.placeholder || 'Select an option'}</option>
          {field.props.options?.map((opt, i) => (
            <option key={i}>{opt}</option>
          ))}
        </select>
      </div>
    );
  }

  if (fieldType === 'checkbox' || fieldType === 'radio') {
    return (
      <div>
        <label className="block text-sm font-medium text-text mb-2">
          {field.props.label} {field.props.required && <span className="text-error">*</span>}
        </label>
        <div className="space-y-2">
          {field.props.options?.map((opt, i) => (
            <label key={i} className="flex items-center gap-2">
              <input
                type={fieldType}
                disabled
                className="w-4 h-4 text-primary border-border"
              />
              <span className="text-sm text-text">{opt}</span>
            </label>
          ))}
        </div>
      </div>
    );
  }

  if (fieldType === 'file') {
    return (
      <div>
        <label className="block text-sm font-medium text-text mb-1">
          {field.props.label} {field.props.required && <span className="text-error">*</span>}
        </label>
        <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
          <div className="text-text-secondary text-sm">Click to upload or drag and drop</div>
        </div>
      </div>
    );
  }

  // Default input field
  return (
    <div>
      <label className="block text-sm font-medium text-text mb-1">
        {field.props.label} {field.props.required && <span className="text-error">*</span>}
      </label>
      <input
        type={fieldType}
        placeholder={field.props.placeholder}
        disabled
        className={baseClass}
      />
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
