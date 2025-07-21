import React, { useState } from 'react';
import { ArrowLeft, FileText, Smartphone, Plus, MoreHorizontal, Eye, Settings, Trash2 } from 'lucide-react';
import { cn } from '../../utils/cn';

interface FormField {
  id: string;
  name: string;
  type: string;
  description?: string;
  required?: boolean;
  enabled?: boolean;
  options?: string[];
  placeholder?: string;
}

interface FormMetadataEditorProps {
  isOpen: boolean;
  onClose: () => void;
  form: {
    id: string;
    name: string;
    type: string;
    description: string;
    plant: string;
    questions: FormField[];
  } | null;
  onSave: (updates: any) => void;
}

const FormMetadataEditor: React.FC<FormMetadataEditorProps> = ({
  isOpen,
  onClose,
  form,
  onSave
}) => {
  const [activeTab, setActiveTab] = useState<'details' | 'fields'>('details');
  const [formDescription, setFormDescription] = useState(form?.description || '');

  // Mock form fields based on the image
  const mockFormFields: FormField[] = [
    {
      id: 'title_verification',
      name: 'Form Title Verification',
      type: 'Text',
      required: true,
      enabled: true,
      placeholder: 'Enter'
    },
    {
      id: 'section_instructions',
      name: 'Section 1 Instructions',
      type: 'Instructions',
      enabled: true
    },
    {
      id: 'form_type',
      name: 'Embedded Form Type',
      type: 'Form Type',
      enabled: true
    },
    {
      id: 'mandatory_check',
      name: 'Is this form mandatory?',
      type: 'Toggle',
      enabled: true
    },
    {
      id: 'form_rating',
      name: 'Form Rating',
      type: 'Slider',
      enabled: true
    },
    {
      id: 'form_category',
      name: 'Form Category',
      type: 'Form Category',
      enabled: true
    },
    {
      id: 'additional_comments',
      name: 'Additional Comments',
      type: 'Text',
      enabled: true
    },
    {
      id: 'upload_document',
      name: 'Upload Document',
      type: 'Attachment',
      enabled: true
    },
    {
      id: 'form_status',
      name: 'Form Status',
      type: 'Form Status',
      enabled: true
    },
    {
      id: 'geo_location',
      name: 'Geo Location',
      type: 'Geo Location',
      enabled: true
    }
  ];

  const getFieldTypeIcon = (type: string) => {
    const iconClass = "w-4 h-4";
    switch (type.toLowerCase()) {
      case 'text':
        return <span className={`${iconClass} bg-orange-100 text-orange-600 rounded flex items-center justify-center text-xs font-bold`}>T</span>;
      case 'instructions':
        return <span className={`${iconClass} bg-orange-100 text-orange-600 rounded flex items-center justify-center text-xs font-bold`}>📋</span>;
      case 'form type':
        return <span className={`${iconClass} bg-blue-100 text-blue-600 rounded flex items-center justify-center text-xs font-bold`}>📝</span>;
      case 'toggle':
        return <span className={`${iconClass} bg-green-100 text-green-600 rounded flex items-center justify-center text-xs font-bold`}>🔘</span>;
      case 'slider':
        return <span className={`${iconClass} bg-purple-100 text-purple-600 rounded flex items-center justify-center text-xs font-bold`}>📊</span>;
      case 'form category':
        return <span className={`${iconClass} bg-blue-100 text-blue-600 rounded flex items-center justify-center text-xs font-bold`}>📂</span>;
      case 'attachment':
        return <span className={`${iconClass} bg-teal-100 text-teal-600 rounded flex items-center justify-center text-xs font-bold`}>📎</span>;
      case 'form status':
        return <span className={`${iconClass} bg-blue-100 text-blue-600 rounded flex items-center justify-center text-xs font-bold`}>📋</span>;
      case 'geo location':
        return <span className={`${iconClass} bg-yellow-100 text-yellow-600 rounded flex items-center justify-center text-xs font-bold`}>📍</span>;
      default:
        return <span className={`${iconClass} bg-gray-100 text-gray-600 rounded flex items-center justify-center text-xs font-bold`}>?</span>;
    }
  };

  const handleSave = () => {
    if (!form) return;
    
    onSave({
      ...form,
      description: formDescription,
    });
  };

  if (!isOpen || !form) return null;

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft size={20} />
              <span className="text-sm font-medium">Back to List</span>
            </button>
            
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-slate-900">{form.name}</h1>
                <p className="text-sm text-slate-500">Plant: {form.plant}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="px-4 py-2 text-sm font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors">
              Import Questions
            </button>
            <button 
              onClick={handleSave}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Publish
            </button>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">✓</span>
            </div>
            <span className="text-sm font-medium text-green-600">Form Details</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">2</span>
            </div>
            <span className="text-sm font-medium text-blue-600">Add Fields</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-120px)]">
        {/* Left Panel - Form Builder */}
        <div className="flex-1 overflow-y-auto bg-slate-50">
          <div className="p-6">
            {/* Page Info */}
            <div className="bg-white rounded-lg border border-slate-200 p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-slate-700">Page</span>
                </div>
                <span className="text-sm text-slate-500">10</span>
              </div>
            </div>

            {/* Form Section */}
            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden mb-6">
              {/* Section Header */}
              <div className="bg-blue-600 text-white px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-white/20 rounded flex items-center justify-center">
                    <span className="text-xs font-bold">:::</span>
                  </div>
                  <span className="font-medium">Embedded Form Section 1</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm">10</span>
                  <MoreHorizontal size={16} />
                </div>
              </div>

              {/* Form Fields */}
              <div className="divide-y divide-slate-200">
                {mockFormFields.map((field, index) => (
                  <div key={field.id} className="p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 text-slate-400 flex items-center justify-center">
                        <span className="text-xs">:::</span>
                      </div>
                      
                      <div className="flex-1 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-slate-900">{field.name}</span>
                          {field.required && (
                            <span className="text-red-500 text-sm">*</span>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-3">
                          {getFieldTypeIcon(field.type)}
                          <span className="text-sm text-slate-600 min-w-[80px]">{field.type}</span>
                          
                          <div className="flex items-center gap-1">
                            <button className="p-1 text-slate-400 hover:text-slate-600 rounded">
                              <Eye size={14} />
                            </button>
                            <button className="p-1 text-slate-400 hover:text-slate-600 rounded">
                              <Settings size={14} />
                            </button>
                            <button className="p-1 text-slate-400 hover:text-red-500 rounded">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Field Configuration Options */}
                    <div className="mt-3 ml-9 flex flex-wrap gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <input type="checkbox" className="rounded border-slate-300" />
                        Ask Question
                      </span>
                      <span className="flex items-center gap-1">
                        <input type="checkbox" className="rounded border-slate-300" />
                        Logic
                      </span>
                      <span className="flex items-center gap-1">
                        <input type="checkbox" className="rounded border-slate-300" />
                        Format
                      </span>
                      <span className="flex items-center gap-1">
                        <input type="checkbox" className="rounded border-slate-300" />
                        Short Text
                      </span>
                      <span className="flex items-center gap-1">
                        <input type="checkbox" className="rounded border-slate-300" />
                        Additional Details
                      </span>
                      <span className="flex items-center gap-1">
                        <input type="checkbox" className="rounded border-slate-300" />
                        Localisation
                      </span>
                      <span className="flex items-center gap-1">
                        <input type="checkbox" checked className="rounded border-slate-300" />
                        Enable
                      </span>
                      {field.required && (
                        <span className="flex items-center gap-1">
                          <input type="checkbox" checked className="rounded border-slate-300" />
                          Required
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Field Button */}
              <div className="p-4 border-t border-slate-200">
                <button className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors">
                  <Plus size={16} />
                  <span className="text-sm font-medium">Add Field</span>
                </button>
              </div>
            </div>

            {/* Add Section Button */}
            <button className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors">
              <Plus size={16} />
              <span className="text-sm font-medium">Add Section</span>
            </button>
          </div>
        </div>

        {/* Right Panel - Mobile Preview */}
        <div className="w-80 bg-white border-l border-slate-200 p-6">
          <div className="flex items-center justify-center mb-4">
            <Smartphone className="w-5 h-5 text-slate-400 mr-2" />
            <span className="text-sm font-medium text-slate-700">Mobile Preview</span>
          </div>

          {/* Mobile Frame */}
          <div className="mx-auto w-64 h-[500px] bg-black rounded-[2rem] p-2 shadow-xl">
            <div className="w-full h-full bg-white rounded-[1.5rem] overflow-hidden">
              {/* Mobile Status Bar */}
              <div className="bg-gray-100 px-4 py-2 flex items-center justify-between text-xs">
                <span className="font-medium">11:55</span>
                <div className="flex items-center gap-1">
                  <div className="flex gap-1">
                    <div className="w-1 h-1 bg-black rounded-full"></div>
                    <div className="w-1 h-1 bg-black rounded-full"></div>
                    <div className="w-1 h-1 bg-black rounded-full"></div>
                    <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                  </div>
                  <span className="ml-1">📶</span>
                  <span>🔋</span>
                </div>
              </div>

              {/* Mobile Content */}
              <div className="p-4 h-full overflow-y-auto">
                <div className="text-center mb-4">
                  <h3 className="text-sm font-semibold text-slate-900">{form.name}</h3>
                  <p className="text-xs text-slate-500 mt-1">Embedded Form Section 1 ⌄</p>
                </div>

                {/* Form Preview */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Form Title Verification*
                    </label>
                    <input 
                      type="text" 
                      placeholder="Enter"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md"
                    />
                  </div>

                  <div className="bg-slate-50 p-3 rounded-md">
                    <h4 className="text-xs font-medium text-slate-700 mb-2">Section 1 Instructions</h4>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Embedded Form Type*
                    </label>
                    <select className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md">
                      <option>General</option>
                      <option>Specific</option>
                      <option>Custom</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-700">Is this form mandatory?*</span>
                    <div className="w-10 h-6 bg-gray-200 rounded-full relative">
                      <div className="w-4 h-4 bg-white rounded-full absolute top-1 right-1 shadow-sm"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormMetadataEditor;