import { Home, Eye, Save, Share2, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { Camera, clampCamera, fitCameraToFrame } from '../camera';
import { FrameNode } from '../types';

type PageAndElementControlsProps = {
  title: string;
  onTitleChange: (title: string) => void;
  saving: boolean;
  onSave: () => void;
  onPreview: () => void;
  onShare: () => void;
  camera: Camera;
  onCameraChange: (camera: Camera) => void;
  showGrid: boolean;
  onToggleGrid: () => void;
  showSnapping: boolean;
  onToggleSnapping: () => void;
  onResetView: () => void;
  rootFrame: FrameNode;
  onFrameSizeChange: (width: number, height: number) => void;
};

export function PageAndElementControls({
  title,
  onTitleChange,
  saving,
  onSave,
  onPreview,
  onShare,
  camera,
  onCameraChange,
  showGrid,
  onToggleGrid,
  showSnapping,
  onToggleSnapping,
  onResetView,
  rootFrame,
  onFrameSizeChange,
}: PageAndElementControlsProps) {
  const [showSizeDropdown, setShowSizeDropdown] = useState(false);
  const [showCustomInputs, setShowCustomInputs] = useState(false);
  const [customWidth, setCustomWidth] = useState(rootFrame.layout.w.toString());
  const [customHeight, setCustomHeight] = useState(rootFrame.layout.h.toString());

  const presetSizes = [
    { label: 'Small (600x800)', w: 600, h: 800 },
    { label: 'Medium (960x1200)', w: 960, h: 1200 },
    { label: 'Large (1200x1600)', w: 1200, h: 1600 },
    { label: 'Custom', w: 0, h: 0 },
  ];

  const handleZoomIn = () => {
    const newZoom = Math.min(2.0, camera.zoom + 0.1);
    onCameraChange(clampCamera({ ...camera, zoom: newZoom }, rootFrame));
  };

  const handleZoomOut = () => {
    const newZoom = Math.max(0.2, camera.zoom - 0.1);
    onCameraChange(clampCamera({ ...camera, zoom: newZoom }, rootFrame));
  };

  const handleSizeSelect = (w: number, h: number) => {
    if (w === 0 && h === 0) {
      setShowCustomInputs(true);
    } else {
      setShowCustomInputs(false);
      onFrameSizeChange(w, h);
      setShowSizeDropdown(false);
    }
  };

  const handleCustomApply = () => {
    const w = parseInt(customWidth);
    const h = parseInt(customHeight);
    if (!isNaN(w) && !isNaN(h) && w > 0 && h > 0) {
      onFrameSizeChange(w, h);
      setShowCustomInputs(false);
      setShowSizeDropdown(false);
    }
  };

  const zoomPercent = Math.round(camera.zoom * 100);
  return (
    <>
      {/* Top Left Island - Home & Title */}
      <div className="absolute top-4 left-4 bg-surface border border-border rounded-lg shadow-lg px-3 py-2 flex items-center gap-3 z-10">
        <Link 
          href="/"
          className="p-1.5 hover:bg-hover rounded-lg transition text-text-secondary hover:text-text"
          title="Home"
        >
          <Home className="w-4 h-4" />
        </Link>

        <div className="w-px h-5 bg-border"></div>

        <input
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          className="text-sm font-medium bg-transparent border-none focus:outline-none focus:bg-hover px-2 py-1 rounded-lg text-text min-w-[180px]"
          placeholder="Untitled Form"
        />

        <div className="w-px h-5 bg-border"></div>

        {/* Frame Size Controller */}
        <div className="relative">
          <button
            onClick={() => setShowSizeDropdown(!showSizeDropdown)}
            className="flex items-center gap-1.5 px-2 py-1 text-xs text-text-secondary hover:text-text hover:bg-hover rounded-lg transition"
          >
            <span>{rootFrame.layout.w}×{rootFrame.layout.h}</span>
            <ChevronDown className="w-3 h-3" />
          </button>

          {showSizeDropdown && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => {
                  setShowSizeDropdown(false);
                  setShowCustomInputs(false);
                }}
              />
              <div className="absolute top-full mt-1 left-0 bg-surface border border-border rounded-lg shadow-lg py-1 z-20 min-w-[180px]">
                {presetSizes.map((size, i) => (
                  <button
                    key={i}
                    onClick={() => handleSizeSelect(size.w, size.h)}
                    className="w-full px-3 py-1.5 text-left text-sm text-text hover:bg-hover transition"
                  >
                    {size.label}
                  </button>
                ))}
                
                {showCustomInputs && (
                  <div className="px-3 py-2 border-t border-border space-y-2">
                    <input
                      type="number"
                      value={customWidth}
                      onChange={(e) => setCustomWidth(e.target.value)}
                      placeholder="Width"
                      className="w-full px-2 py-1 text-xs bg-surface-secondary border border-border rounded text-text"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <input
                      type="number"
                      value={customHeight}
                      onChange={(e) => setCustomHeight(e.target.value)}
                      placeholder="Height"
                      className="w-full px-2 py-1 text-xs bg-surface-secondary border border-border rounded text-text"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <button
                      onClick={handleCustomApply}
                      className="w-full px-2 py-1 text-xs bg-primary text-surface rounded hover:bg-primary-hover transition"
                    >
                      Apply
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {saving && (
          <span className="text-xs text-text-secondary">Saving...</span>
        )}
      </div>

      {/* Top Right Island - Share & Publish */}
      <div className="absolute top-4 right-4 bg-surface border border-border rounded-lg shadow-lg px-2 py-2 flex items-center gap-2 z-10">
        <button
          onClick={onShare}
          className="px-3 py-1.5 text-sm hover:bg-hover rounded-lg transition flex items-center gap-2 text-text"
        >
          <Share2 className="w-4 h-4" />
          <span className="hidden sm:inline">Share</span>
        </button>

        <button
          onClick={onSave}
          className="px-3 py-1.5 bg-primary text-surface rounded-lg text-sm font-medium hover:bg-primary-hover transition flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          <span className="hidden sm:inline">Publish</span>
        </button>
      </div>

      {/* Bottom Center Island - Zoom & Controls */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-surface border border-border rounded-lg shadow-lg px-3 py-2 flex items-center gap-2 z-10">
        <button
          onClick={handleZoomOut}
          className="px-2 py-1 text-text-secondary hover:text-text hover:bg-hover rounded text-sm"
          title="Zoom out (Ctrl + Scroll Down)"
        >
          −
        </button>
        <span className="text-sm font-medium text-text min-w-[50px] text-center">{zoomPercent}%</span>
        <button
          onClick={handleZoomIn}
          className="px-2 py-1 text-text-secondary hover:text-text hover:bg-hover rounded text-sm"
          title="Zoom in (Ctrl + Scroll Up)"
        >
          +
        </button>
        <div className="w-px h-4 bg-border mx-1"></div>
        <button
          onClick={onToggleGrid}
          className={`px-3 py-1 rounded text-sm transition ${
            showGrid ? 'bg-primary text-surface' : 'text-text-secondary hover:bg-hover'
          }`}
          title="Toggle grid (Ctrl + G)"
        >
          Grid
        </button>
        <button
          onClick={onToggleSnapping}
          className={`px-3 py-1 rounded text-sm transition ${
            showSnapping ? 'bg-primary text-surface' : 'text-text-secondary hover:bg-hover'
          }`}
          title="Toggle snapping"
        >
          Snap
        </button>
        <button
          onClick={onResetView}
          className="px-3 py-1 rounded text-sm text-text-secondary hover:bg-hover transition"
          title="Reset view (Ctrl + 0)"
        >
          Reset
        </button>
        <div className="w-px h-4 bg-border mx-1"></div>
        <button
          onClick={onPreview}
          className="px-3 py-1 rounded text-sm text-text-secondary hover:bg-hover transition flex items-center gap-1.5"
          title="Preview form"
        >
          <Eye className="w-3.5 h-3.5" />
          Preview
        </button>
      </div>
    </>
  );
}
