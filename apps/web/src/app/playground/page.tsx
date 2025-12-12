'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Nav } from '@/components/Nav';
import { AuthModal } from '@/components/AuthModal';
import { useAuth } from '@/lib/auth';
import { useAutosave } from '@/lib/storage';
import { FormComponent, ComponentType, FormDefinition, FieldNode, FrameNode, FieldType } from './types';
import { findValidFieldPosition } from './gridUtils';
import { Canvas } from './components/Canvas';
import { PageAndElementControls } from './components/PageAndElementControls';
import { Elements } from './components/Elements';
import { CANVAS_CONFIG, calculateZoomStep } from './config';
import { Camera, fitCameraToFrame, CAMERA_CONFIG } from './camera';

export default function PlaygroundPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  // Initialize root frame
  const rootFrameId = 'root';
  const rootFrame: FrameNode = {
    id: rootFrameId,
    type: 'frame',
    name: 'Root Frame',
    parentId: null,
    layout: { x: 0, y: 0, w: 960, h: 1200 },
    grid: { columns: 20, rowUnit: 40 },
  };
  
  const [formDefinition, setFormDefinition] = useState<FormDefinition>({
    id: crypto.randomUUID(),
    title: 'Untitled Form',
    rootFrameId,
    frames: { [rootFrameId]: rootFrame },
    fields: {},
  });
  
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [showGrid, setShowGrid] = useState(true);
  const [showSnapping, setShowSnapping] = useState(true);
  const [camera, setCamera] = useState<Camera>(() => 
    fitCameraToFrame(0, 0, 960, 1200, { width: 1200, height: 800 })
  );
  
  // Legacy support during migration
  const [components, setComponents] = useState<FormComponent[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  
  // Prevent browser zoom globally on this page
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === '+' || e.key === '-' || e.key === '=')) {
        e.preventDefault();
      }
    };

    document.addEventListener('wheel', handleWheel, { passive: false });
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('wheel', handleWheel);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
  
  // Auto-save to IndexedDB (temporarily disabled during migration)
  // TODO: Update LocalForm type to support new FormDefinition
  const { saving } = useAutosave('playground-draft', {
    title: formDefinition.title,
    components: [],  // Legacy field, empty during migration
  });

  const handleSave = async () => {
    if (!user) {
      // Not authenticated - show auth modal
      setShowAuthModal(true);
      return;
    }

    // Authenticated - save to server
    try {
      const response = await fetch('/api/forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formDefinition),
      });

      if (response.ok) {
        const form = await response.json();
        router.push(`/editor/${form.id}`);
      }
    } catch (error) {
      console.error('Save failed:', error);
    }
  };

  const handleAuthSuccess = async () => {
    // After auth, save the form
    await handleSave();
  };

  const handleAddField = (type: string) => {
    const fieldId = crypto.randomUUID();
    const rootFrame = formDefinition.frames[formDefinition.rootFrameId];
    
    // Determine field dimensions in grid units
    const defaultW = 10; // Half width (10 of 20 columns)
    const defaultH = type === 'textarea' ? 4 : 2;
    
    // Find valid position
    const existingFields = Object.values(formDefinition.fields);
    const position = findValidFieldPosition(
      existingFields,
      formDefinition.rootFrameId,
      defaultW,
      defaultH,
      rootFrame.grid.columns
    );
    
    const newField: FieldNode = {
      id: fieldId,
      type: type as FieldType,
      parentId: null,
      props: {
        label: `${type.charAt(0).toUpperCase() + type.slice(1)} Field`,
        placeholder: '',
        required: false,
        options: type === 'select' || type === 'radio' || type === 'checkbox' 
          ? ['Option 1', 'Option 2', 'Option 3'] 
          : undefined,
      },
      layout: {
        frameId: formDefinition.rootFrameId,
        ...position,
      },
    };
    
    setFormDefinition({
      ...formDefinition,
      fields: {
        ...formDefinition.fields,
        [fieldId]: newField,
      },
    });
    setSelectedFieldId(fieldId);
  };

  const handleUpdateField = (fieldId: string, updates: Partial<FieldNode>) => {
    const field = formDefinition.fields[fieldId];
    if (!field) return;
    
    setFormDefinition({
      ...formDefinition,
      fields: {
        ...formDefinition.fields,
        [fieldId]: {
          ...field,
          ...updates,
          props: { ...field.props, ...(updates.props || {}) },
          layout: { ...field.layout, ...(updates.layout || {}) },
        },
      },
    });
  };

  const handleDeleteField = () => {
    if (!selectedFieldId) return;
    const { [selectedFieldId]: removed, ...remainingFields } = formDefinition.fields;
    setFormDefinition({
      ...formDefinition,
      fields: remainingFields,
    });
    setSelectedFieldId(null);
  };

  const handleDuplicateField = () => {
    if (!selectedFieldId) return;
    const original = formDefinition.fields[selectedFieldId];
    if (!original) return;
    
    const rootFrame = formDefinition.frames[formDefinition.rootFrameId];
    const existingFields = Object.values(formDefinition.fields);
    const position = findValidFieldPosition(
      existingFields,
      original.layout.frameId,
      original.layout.w,
      original.layout.h,
      rootFrame.grid.columns
    );
    
    const duplicateId = crypto.randomUUID();
    const duplicate: FieldNode = {
      ...original,
      id: duplicateId,
      layout: {
        ...original.layout,
        ...position,
      },
    };
    
    setFormDefinition({
      ...formDefinition,
      fields: {
        ...formDefinition.fields,
        [duplicateId]: duplicate,
      },
    });
    setSelectedFieldId(duplicateId);
  };

  const selectedField = selectedFieldId ? formDefinition.fields[selectedFieldId] || null : null;

  return (
    <div className="h-screen flex flex-col bg-surface overflow-hidden">
      {/* Nav - Add padding to account for fixed nav */}
      <div className="shrink-0">
        <Nav />
      </div>

      {/* Spacer for fixed nav */}
      <div className="h-[52px] shrink-0"></div>

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Canvas Area - Full Width */}
        <div className="flex-1 relative overflow-hidden">
          <Canvas
            formDefinition={formDefinition}
            selectedFieldId={selectedFieldId}
            onFieldSelect={setSelectedFieldId}
            onFieldUpdate={handleUpdateField}
            onFieldDelete={handleDeleteField}
            camera={camera}
            onCameraChange={setCamera}
            showGrid={showGrid}
            snapToGrid={showSnapping}
          />

          {/* Floating Islands - Page & Element Controls */}
          <PageAndElementControls
            title={formDefinition.title}
            onTitleChange={(title) => setFormDefinition({ ...formDefinition, title })}
            saving={saving}
            onSave={handleSave}
            onPreview={() => {}}
            onShare={() => {}}
            camera={camera}
            onCameraChange={setCamera}
            showGrid={showGrid}
            onToggleGrid={() => setShowGrid(!showGrid)}
            showSnapping={showSnapping}
            onToggleSnapping={() => setShowSnapping(!showSnapping)}
            onResetView={() => {
              const rootFrame = formDefinition.frames[formDefinition.rootFrameId];
              setCamera(fitCameraToFrame(
                rootFrame.layout.x,
                rootFrame.layout.y,
                rootFrame.layout.w,
                rootFrame.layout.h,
                { width: 1200, height: 800 }
              ));
            }}
            rootFrame={formDefinition.frames[formDefinition.rootFrameId]}
            onFrameSizeChange={(width, height) => {
              const rootFrame = formDefinition.frames[formDefinition.rootFrameId];
              const updatedFrame = {
                ...rootFrame,
                layout: { ...rootFrame.layout, w: width, h: height },
              };
              setFormDefinition({
                ...formDefinition,
                frames: {
                  ...formDefinition.frames,
                  [formDefinition.rootFrameId]: updatedFrame,
                },
              });
            }}
          />

          {/* Left Vertical Island - Elements */}
          <Elements
            onAddElement={handleAddField}
            onTemplates={() => {}}
          />
        </div>
      </div>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
}
