import { Container, Plus, LayoutPanelTop, Type, Mail, Phone, Calendar, FileText, CheckSquare, List, Hash } from 'lucide-react';
import { useState } from 'react';

type ElementsProps = {
  onAddElement: (type: string) => void;
  onTemplates: () => void;
};

// Dummy data for elements - will come from @nimbl/ui later
const ELEMENT_TYPES = [
  {id: 'container', name: 'Container', icon: Container },
  { id: 'text', name: 'Text Input', icon: Type },
  { id: 'email', name: 'Email', icon: Mail },
  { id: 'phone', name: 'Phone', icon: Phone },
  { id: 'date', name: 'Date', icon: Calendar },
  { id: 'textarea', name: 'Text Area', icon: FileText },
  { id: 'checkbox', name: 'Checkbox', icon: CheckSquare },
  { id: 'select', name: 'Dropdown', icon: List },
  { id: 'number', name: 'Number', icon: Hash },
];

// Dummy data for templates - will come from @nimbl/ui later
const TEMPLATES = [
  { id: 'contact', name: 'Contact Form', description: 'Name, email, message' },
  { id: 'survey', name: 'Survey', description: 'Multiple choice questions' },
  { id: 'registration', name: 'Registration', description: 'User signup form' },
  { id: 'feedback', name: 'Feedback', description: 'Collect user feedback' },
  { id: 'booking', name: 'Booking', description: 'Appointment booking' },
];

export function Elements({
  onAddElement,
  onTemplates,
}: ElementsProps) {
  const [showElements, setShowElements] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);

  const handleElementClick = () => {
    setShowElements(!showElements);
    setShowTemplates(false);
  };

  const handleTemplateClick = () => {
    setShowTemplates(!showTemplates);
    setShowElements(false);
  };

  const handleSelectElement = (elementId: string) => {
    console.log('Selected element:', elementId);
    onAddElement(elementId);
    setShowElements(false);
  };

  const handleSelectTemplate = (templateId: string) => {
    console.log('Selected template:', templateId);
    onTemplates();
    setShowTemplates(false);
  };

  return (
    <>
      {/* Main Vertical Island */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 bg-surface border border-border rounded-lg shadow-lg p-2 flex flex-col gap-2 z-10">
        <button
          onClick={handleElementClick}
          className={`p-2.5 hover:bg-hover rounded-lg transition ${
            showElements ? 'bg-primary text-surface' : 'text-text-secondary hover:text-text'
          }`}
          title="Add Element"
        >
          <Plus className="w-5 h-5" />
        </button>
        
        <div className="w-full h-px bg-border"></div>
        
        <button
          onClick={handleTemplateClick}
          className={`p-2.5 hover:bg-hover rounded-lg transition ${
            showTemplates ? 'bg-primary text-surface' : 'text-text-secondary hover:text-text'
          }`}
          title="Templates"
        >
          <LayoutPanelTop className="w-5 h-5" />
        </button>
      </div>

      {/* Elements Selection Menu */}
      {showElements && (
        <div className="absolute left-20 top-1/2 -translate-y-1/2 bg-surface border border-border rounded-lg shadow-lg w-64 max-h-96 overflow-hidden z-20">
          <div className="p-3 border-b border-border">
            <h3 className="text-sm font-semibold text-text">Elements</h3>
            <p className="text-xs text-text-secondary mt-0.5">Add form components</p>
          </div>
          <div className="overflow-y-auto max-h-80 custom-scrollbar">
            <div className="p-2 space-y-1">
              {ELEMENT_TYPES.map((element) => {
                const Icon = element.icon;
                return (
                  <button
                    key={element.id}
                    onClick={() => handleSelectElement(element.id)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-hover transition text-left group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition">
                      <Icon className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-sm font-medium text-text">{element.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Templates Selection Menu */}
      {showTemplates && (
        <div className="absolute left-20 top-1/2 -translate-y-1/2 bg-surface border border-border rounded-lg shadow-lg w-72 max-h-96 overflow-hidden z-20">
          <div className="p-3 border-b border-border">
            <h3 className="text-sm font-semibold text-text">Templates</h3>
            <p className="text-xs text-text-secondary mt-0.5">Start with a pre-built form</p>
          </div>
          <div className="overflow-y-auto max-h-80 custom-scrollbar">
            <div className="p-2 space-y-2">
              {TEMPLATES.map((template) => (
                <button
                  key={template.id}
                  onClick={() => handleSelectTemplate(template.id)}
                  className="w-full flex flex-col gap-1 px-3 py-3 rounded-lg hover:bg-hover transition text-left border border-border-subtle hover:border-primary"
                >
                  <span className="text-sm font-medium text-text">{template.name}</span>
                  <span className="text-xs text-text-secondary">{template.description}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
