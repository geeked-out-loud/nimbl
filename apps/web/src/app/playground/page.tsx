'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Nav } from '@/components/Nav';
import { AuthModal } from '@/components/AuthModal';
import { useAuth } from '@/lib/auth';
import { useAutosave } from '@/lib/storage';
import { FormComponent, ComponentType } from './types';
import { findValidPosition } from './gridUtils';
import { Canvas } from './components/Canvas';
import { PageAndElementControls } from './components/PageAndElementControls';
import { Elements } from './components/Elements';
import { CANVAS_CONFIG, calculateZoomStep } from './config';

export default function PlaygroundPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [formTitle, setFormTitle] = useState('Untitled Form');
  const [components, setComponents] = useState<FormComponent[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showGrid, setShowGrid] = useState(false);
  const [zoom, setZoom] = useState<number>(CANVAS_CONFIG.ZOOM_DEFAULT);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  
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
  
  // Auto-save to IndexedDB
  const { saving } = useAutosave('playground-draft', {
    title: formTitle,
    components,
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
        body: JSON.stringify({
          title: formTitle,
          components,
        }),
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

  const handleAddComponent = (type: ComponentType) => {
    const newComponent: FormComponent = {
      id: crypto.randomUUID(),
      type,
      label: `${type.charAt(0).toUpperCase() + type.slice(1)} Field`,
      placeholder: '',
      required: false,
      options: type === 'select' || type === 'radio' || type === 'checkbox' ? ['Option 1', 'Option 2', 'Option 3'] : undefined,
      position: findValidPosition(components, { 
        x: 0, 
        y: 0, 
        w: CANVAS_CONFIG.DEFAULT_COMPONENT_WIDTH, 
        h: type === 'textarea' ? CANVAS_CONFIG.DEFAULT_TEXTAREA_HEIGHT : CANVAS_CONFIG.DEFAULT_COMPONENT_HEIGHT 
      }),
    };
    setComponents([...components, newComponent]);
    setSelectedId(newComponent.id);
  };

  const handleUpdateComponent = (updates: Partial<FormComponent>) => {
    if (!selectedId) return;
    setComponents(components.map(comp =>
      comp.id === selectedId ? { ...comp, ...updates } : comp
    ));
  };

  const handleDeleteComponent = () => {
    if (!selectedId) return;
    setComponents(components.filter(comp => comp.id !== selectedId));
    setSelectedId(null);
  };

  const handleDuplicateComponent = () => {
    if (!selectedId) return;
    const original = components.find(c => c.id === selectedId);
    if (!original) return;
    
    const duplicate: FormComponent = {
      ...original,
      id: crypto.randomUUID(),
      position: findValidPosition(components, original.position),
    };
    setComponents([...components, duplicate]);
    setSelectedId(duplicate.id);
  };

  // Handle zoom via wheel event
  const handleZoomChange = (newZoom: number) => {
    setZoom(newZoom);
  };

  const selectedComponent = selectedId ? components.find(c => c.id === selectedId) || null : null;

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
            components={components}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onUpdate={(id, updates) => {
              setComponents(components.map(comp =>
                comp.id === id ? { ...comp, position: { ...comp.position, ...updates } } : comp
              ));
            }}
            onDelete={handleDeleteComponent}
            showGrid={showGrid}
            zoom={zoom}
            pan={pan}
            onPanChange={setPan}
            onZoomChange={handleZoomChange}
          />

          {/* Floating Islands - Page & Element Controls */}
          <PageAndElementControls
            title={formTitle}
            onTitleChange={setFormTitle}
            saving={saving}
            onSave={handleSave}
            onPreview={() => {}}
            onShare={() => {}}
            zoom={zoom}
            onZoomIn={() => setZoom(calculateZoomStep(zoom, 'in'))}
            onZoomOut={() => setZoom(calculateZoomStep(zoom, 'out'))}
            showGrid={showGrid}
            onToggleGrid={() => setShowGrid(!showGrid)}
            onResetView={() => {
              setZoom(CANVAS_CONFIG.ZOOM_DEFAULT);
              setPan({ x: 0, y: 0 });
            }}
          />

          {/* Left Vertical Island - Elements */}
          <Elements
            onAddElement={() => {}}
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
