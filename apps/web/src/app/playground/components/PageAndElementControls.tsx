import { Home, Eye, Save, Share2 } from 'lucide-react';
import Link from 'next/link';

type PageAndElementControlsProps = {
  title: string;
  onTitleChange: (title: string) => void;
  saving: boolean;
  onSave: () => void;
  onPreview: () => void;
  onShare: () => void;
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  showGrid: boolean;
  onToggleGrid: () => void;
  onResetView: () => void;
};

export function PageAndElementControls({
  title,
  onTitleChange,
  saving,
  onSave,
  onPreview,
  onShare,
  zoom,
  onZoomIn,
  onZoomOut,
  showGrid,
  onToggleGrid,
  onResetView,
}: PageAndElementControlsProps) {
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
          onClick={onZoomOut}
          className="px-2 py-1 text-text-secondary hover:text-text hover:bg-hover rounded text-sm"
          title="Zoom out (Ctrl + Scroll Down)"
        >
          −
        </button>
        <span className="text-sm font-medium text-text min-w-[50px] text-center">{zoom}%</span>
        <button
          onClick={onZoomIn}
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
