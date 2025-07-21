import React, { useState } from 'react';
import { ArrowLeft, FileText, Smartphone, Plus, MoreHorizontal, Eye, Settings, Trash2, ChevronDown, Check } from 'lucide-react';
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
  const [expandedField, setExpandedField] = useState<string | null>(null);

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
    const baseClass = "w-5 h-5 rounded-md flex items-center justify-center text-xs font-semibold";
    switch (type.toLowerCase()) {
      case 'text':
        return <div className={`${baseClass} bg-orange-100 text-orange-700`}>T</div>;
      case 'instructions':
        return <div className={`${baseClass} bg-amber-100 text-amber-700`}>📋</div>;
      case 'form type':
        return <div className={`${baseClass} bg-blue-100 text-blue-700`}>📝</div>;
      case 'toggle':
        return <div className={`${baseClass} bg-green-100 text-green-700`}>🔘</div>;
      case 'slider':
        return <div className={`${baseClass} bg-purple-100 text-purple-700`}>📊</div>;
      case 'form category':
        return <div className={`${baseClass} bg-indigo-100 text-indigo-700`}>📂</div>;
      case 'attachment':
        return <div className={`${baseClass} bg-teal-100 text-teal-700`}>📎</div>;
      case 'form status':
        return <div className={`${baseClass} bg-cyan-100 text-cyan-700`}>📋</div>;
      case 'geo location':
        return <div className={`${baseClass} bg-yellow-100 text-yellow-700`}>📍</div>;
      default:
        return <div className={`${baseClass} bg-gray-100 text-gray-700`}>?</div>;
    }
  };

  const getFieldTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'text': return 'bg-orange-50 border-orange-200 text-orange-800';
      case 'instructions': return 'bg-amber-50 border-amber-200 text-amber-800';
      case 'form type': return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'toggle': return 'bg-green-50 border-green-200 text-green-800';
      case 'slider': return 'bg-purple-50 border-purple-200 text-purple-800';
      case 'form category': return 'bg-indigo-50 border-indigo-200 text-indigo-800';
      case 'attachment': return 'bg-teal-50 border-teal-200 text-teal-800';
      case 'form status': return 'bg-cyan-50 border-cyan-200 text-cyan-800';
      case 'geo location': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-800';
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
      {/* Enhanced Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button
              onClick={onClose}
              className="flex items-center gap-3 text-slate-600 hover:text-slate-900 transition-colors group"
            >
              <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm font-medium">Back to List</span>
            </button>
            
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">{form.name}</h1>
                <p className="text-sm text-slate-600 mt-1">Plant: <span className="font-medium text-slate-800">{form.plant}</span></p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="px-6 py-2.5 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors">
              Import Questions
            </button>
            <button 
              onClick={handleSave}
              className="px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl"
            >
              Publish
            </button>
          </div>
        </div>

        {/* Enhanced Progress Steps */}
        <div className="flex items-center gap-8 mt-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-md">
              <Check className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-semibold text-green-600">Form Details</span>
          </div>
          <div className="w-16 h-0.5 bg-green-200"></div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center shadow-md">
              <span className="text-white text-sm font-bold">2</span>
            </div>
            <span className="text-sm font-semibold text-blue-600">Add Fields</span>
          </div>
        </div>
      </div>

      {/* Enhanced Main Content */}
      <div className="flex h-[calc(100vh-140px)]">
        {/* Left Panel - Enhanced Form Builder */}
        <div className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-50 to-slate-100">
          <div className="p-8">
            {/* Enhanced Page Info */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 mb-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                    <span className="text-sm font-bold text-slate-600">📄</span>
                  </div>
                  <span className="text-lg font-semibold text-slate-800">Page</span>
                </div>
                <div className="px-3 py-1 bg-slate-100 rounded-full">
                  <span className="text-sm font-medium text-slate-700">10</span>
                </div>
              </div>
            </div>

            {/* Enhanced Form Section */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
              {/* Enhanced Section Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                    <span className="text-sm font-bold">:::</span>
                  </div>
                  <span className="font-semibold text-lg">Embedded Form Section 1</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="px-3 py-1 bg-white/20 rounded-full backdrop-blur-sm">
                    <span className="text-sm font-medium">10</span>
                  </div>
                  <button className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                    <MoreHorizontal size={18} />
                  </button>
                </div>
              </div>

              {/* Enhanced Form Fields */}
              <div className="divide-y divide-slate-100">
                {mockFormFields.map((field, index) => (
                  <div 
                    key={field.id} 
                    className="p-6 hover:bg-slate-50 transition-all duration-200 group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 text-slate-400 flex items-center justify-center cursor-grab hover:text-slate-600 transition-colors">
                        <span className="text-lg font-bold">:::</span>
                      </div>
                      
                      <div className="flex-1 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-3">
                            <span className="text-base font-semibold text-slate-900">{field.name}</span>
                            {field.required && (
                              <span className="text-red-500 text-lg font-bold">*</span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          {getFieldTypeIcon(field.type)}
                          <div className={`px-3 py-1.5 rounded-lg border text-sm font-medium ${getFieldTypeColor(field.type)}`}>
                            {field.type}
                          </div>
                          
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                              <Eye size={16} />
                            </button>
                            <button 
                              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                              onClick={() => setExpandedField(expandedField === field.id ? null : field.id)}
                            >
                              <Settings size={16} />
                            </button>
                            <button className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Enhanced Field Configuration Options */}
                    <div className={cn(
                      "mt-4 ml-12 transition-all duration-300 overflow-hidden",
                      expandedField === field.id ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
                    )}>
                      <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {[
                            { label: 'Ask Question', checked: true },
                            { label: 'Logic', checked: false },
                            { label: 'Format', checked: false },
                            { label: 'Short Text', checked: false },
                            { label: 'Additional Details', checked: false },
                            { label: 'Localisation', checked: false },
                            { label: 'Enable', checked: field.enabled },
                            { label: 'Required', checked: field.required }
                          ].map((option, idx) => (
                            <label key={idx} className="flex items-center gap-2 text-sm cursor-pointer hover:text-slate-900 transition-colors">
                              <input 
                                type="checkbox" 
                                checked={option.checked}
                                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" 
                              />
                              <span className={option.checked ? 'text-slate-900 font-medium' : 'text-slate-600'}>
                                {option.label}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Enhanced Add Field Button */}
              <div className="p-6 border-t border-slate-100 bg-slate-50">
                <button className="flex items-center gap-3 text-blue-600 hover:text-blue-700 transition-colors group">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                    <Plus size={16} />
                  </div>
                  <span className="text-sm font-semibold">Add Field</span>
                </button>
              </div>
            </div>

            {/* Enhanced Add Section Button */}
            <div className="mt-8">
              <button className="flex items-center gap-3 text-blue-600 hover:text-blue-700 transition-colors group">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                  <Plus size={16} />
                </div>
                <span className="text-sm font-semibold">Add Section</span>
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Right Panel - Mobile Preview */}
        <div className="w-96 bg-white border-l border-slate-200 p-8 shadow-lg">
          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center gap-3 px-4 py-2 bg-slate-100 rounded-full">
              <Smartphone className="w-5 h-5 text-slate-600" />
              <span className="text-sm font-semibold text-slate-700">Mobile Preview</span>
            </div>
          </div>

          {/* Enhanced Mobile Frame */}
          <div className="mx-auto w-72 h-[580px] bg-gradient-to-b from-gray-800 to-black rounded-[2.5rem] p-3 shadow-2xl">
            <div className="w-full h-full bg-white rounded-[2rem] overflow-hidden relative">
              {/* Enhanced Mobile Status Bar */}
              <div className="bg-gray-50 px-6 py-3 flex items-center justify-between text-sm border-b border-gray-100">
                <span className="font-semibold text-gray-900">11:55</span>
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-gray-900 rounded-full"></div>
                    <div className="w-1.5 h-1.5 bg-gray-900 rounded-full"></div>
                    <div className="w-1.5 h-1.5 bg-gray-900 rounded-full"></div>
                    <div className="w-1.5 h-1.5 bg-gray-300 rounded-full"></div>
                  </div>
                  <span className="ml-2 text-gray-700">📶</span>
                  <span className="text-gray-700">🔋</span>
                </div>
              </div>

              {/* Enhanced Mobile Content */}
              <div className="p-6 h-full overflow-y-auto bg-gradient-to-b from-white to-gray-50">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-bold text-slate-900">{form.name}</h3>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <span className="text-sm text-slate-600">Embedded Form Section 1</span>
                    <ChevronDown size={14} className="text-slate-400" />
                  </div>
                </div>

                {/* Enhanced Form Preview */}
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-800 mb-2">
                      Form Title Verification*
                    </label>
                    <input 
                      type="text" 
                      placeholder="Enter"
                      className="w-full px-4 py-3 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h4 className="text-sm font-semibold text-blue-800 mb-1">Section 1 Instructions</h4>
                    <p className="text-xs text-blue-600">Please fill out all required fields</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-800 mb-2">
                      Embedded Form Type*
                    </label>
                    <div className="relative">
                      <select className="w-full px-4 py-3 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none bg-white">
                        <option>General</option>
                        <option>Specific</option>
                        <option>Custom</option>
                      </select>
                      <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <span className="text-sm font-semibold text-slate-800">Is this form mandatory?*</span>
                    <div className="w-12 h-6 bg-blue-500 rounded-full relative shadow-inner">
                      <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 right-0.5 shadow-md transition-transform"></div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-800 mb-2">
                      Form Rating
                    </label>
                    <div className="w-full h-2 bg-gray-200 rounded-full">
                      <div className="w-3/4 h-2 bg-purple-500 rounded-full relative">
                        <div className="w-4 h-4 bg-purple-600 rounded-full absolute -top-1 right-0 shadow-md"></div>
                      </div>
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