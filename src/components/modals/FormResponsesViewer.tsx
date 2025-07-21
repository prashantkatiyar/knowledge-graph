import React, { useState } from 'react';
import { X, Download, Filter, Search, Calendar, User, MapPin, Eye, TrendingUp, Users, Clock, BarChart3, FileText, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';

interface FormResponse {
  id: string;
  submittedBy: string;
  submittedAt: string;
  location?: string;
  responses: Record<string, any>;
  deviceType?: 'mobile' | 'tablet' | 'desktop';
  submissionTime?: number; // in seconds
}

interface FormQuestion {
  id: string;
  name: string;
  type: string;
}

interface FormResponsesViewerProps {
  isOpen: boolean;
  onClose: () => void;
  form: {
    id: string;
    name: string;
    plant: string;
    questions: FormQuestion[];
  } | null;
}

const FormResponsesViewer: React.FC<FormResponsesViewerProps> = ({
  isOpen,
  onClose,
  form
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterUser, setFilterUser] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [showColumnSelector, setShowColumnSelector] = useState(false);
  const responsesPerPage = 15;

  // Realistic form questions for equipment inspection
  const formQuestions: FormQuestion[] = [
    { id: 'equipment_id', name: 'Equipment ID', type: 'text' },
    { id: 'inspector_name', name: 'Inspector Name', type: 'text' },
    { id: 'inspection_date', name: 'Inspection Date', type: 'date' },
    { id: 'equipment_condition', name: 'Overall Equipment Condition', type: 'select' },
    { id: 'temperature_reading', name: 'Temperature Reading (°C)', type: 'number' },
    { id: 'pressure_reading', name: 'Pressure Reading (PSI)', type: 'number' },
    { id: 'vibration_level', name: 'Vibration Level', type: 'select' },
    { id: 'lubrication_status', name: 'Lubrication Status', type: 'select' },
    { id: 'safety_devices', name: 'Safety Devices Functional', type: 'toggle' },
    { id: 'maintenance_required', name: 'Maintenance Required', type: 'toggle' },
    { id: 'priority_level', name: 'Priority Level', type: 'select' },
    { id: 'estimated_downtime', name: 'Estimated Downtime (hours)', type: 'number' },
    { id: 'spare_parts_needed', name: 'Spare Parts Needed', type: 'multiselect' },
    { id: 'inspection_notes', name: 'Inspection Notes', type: 'textarea' },
    { id: 'follow_up_required', name: 'Follow-up Required', type: 'toggle' },
    { id: 'next_inspection_date', name: 'Next Inspection Date', type: 'date' },
    { id: 'inspector_signature', name: 'Inspector Signature', type: 'signature' },
    { id: 'photo_attachments', name: 'Photo Attachments', type: 'file' }
  ];

  // Comprehensive mock response data with realistic equipment inspection data
  const mockResponses: FormResponse[] = [
    {
      id: 'resp-001',
      submittedBy: 'John Smith',
      submittedAt: '2025-01-15T14:30:00Z',
      location: 'Plant A - Pump Station',
      deviceType: 'mobile',
      submissionTime: 420,
      responses: {
        'equipment_id': 'PUMP-001',
        'inspector_name': 'John Smith',
        'inspection_date': '2025-01-15',
        'equipment_condition': 'Good',
        'temperature_reading': 75,
        'pressure_reading': 145,
        'vibration_level': 'Normal',
        'lubrication_status': 'Adequate',
        'safety_devices': true,
        'maintenance_required': false,
        'priority_level': 'Low',
        'estimated_downtime': 0,
        'spare_parts_needed': 'None',
        'inspection_notes': 'Equipment operating within normal parameters. All safety systems functional. Minor wear on coupling noted but within acceptable limits.',
        'follow_up_required': false,
        'next_inspection_date': '2025-02-15',
        'inspector_signature': 'J.Smith',
        'photo_attachments': '3 photos uploaded'
      }
    },
    {
      id: 'resp-002',
      submittedBy: 'Sarah Johnson',
      submittedAt: '2025-01-15T09:45:00Z',
      location: 'Plant B - Compressor Room',
      deviceType: 'tablet',
      submissionTime: 380,
      responses: {
        'equipment_id': 'COMP-002',
        'inspector_name': 'Sarah Johnson',
        'inspection_date': '2025-01-15',
        'equipment_condition': 'Fair',
        'temperature_reading': 82,
        'pressure_reading': 160,
        'vibration_level': 'Slightly High',
        'lubrication_status': 'Low',
        'safety_devices': true,
        'maintenance_required': true,
        'priority_level': 'Medium',
        'estimated_downtime': 4,
        'spare_parts_needed': 'Oil Filter, Gasket Set',
        'inspection_notes': 'Compressor showing signs of wear. Oil levels low and filter needs replacement. Vibration slightly elevated but not critical.',
        'follow_up_required': true,
        'next_inspection_date': '2025-01-22',
        'inspector_signature': 'S.Johnson',
        'photo_attachments': '5 photos uploaded'
      }
    },
    {
      id: 'resp-003',
      submittedBy: 'Mike Rodriguez',
      submittedAt: '2025-01-14T16:20:00Z',
      location: 'Plant C - Boiler House',
      deviceType: 'mobile',
      submissionTime: 450,
      responses: {
        'equipment_id': 'BOILER-003',
        'inspector_name': 'Mike Rodriguez',
        'inspection_date': '2025-01-14',
        'equipment_condition': 'Poor',
        'temperature_reading': 95,
        'pressure_reading': 180,
        'vibration_level': 'High',
        'lubrication_status': 'Critical',
        'safety_devices': false,
        'maintenance_required': true,
        'priority_level': 'High',
        'estimated_downtime': 12,
        'spare_parts_needed': 'Pressure Relief Valve, Thermostat, Insulation',
        'inspection_notes': 'URGENT: Safety relief valve not functioning properly. Temperature running high. Immediate maintenance required before next operation.',
        'follow_up_required': true,
        'next_inspection_date': '2025-01-16',
        'inspector_signature': 'M.Rodriguez',
        'photo_attachments': '8 photos uploaded'
      }
    },
    {
      id: 'resp-004',
      submittedBy: 'Anna Schmidt',
      submittedAt: '2025-01-14T11:30:00Z',
      location: 'Plant A - Generator Room',
      deviceType: 'desktop',
      submissionTime: 360,
      responses: {
        'equipment_id': 'GEN-004',
        'inspector_name': 'Anna Schmidt',
        'inspection_date': '2025-01-14',
        'equipment_condition': 'Excellent',
        'temperature_reading': 68,
        'pressure_reading': 120,
        'vibration_level': 'Normal',
        'lubrication_status': 'Excellent',
        'safety_devices': true,
        'maintenance_required': false,
        'priority_level': 'Low',
        'estimated_downtime': 0,
        'spare_parts_needed': 'None',
        'inspection_notes': 'Generator in excellent condition. Recent maintenance completed. All systems operating optimally. No issues detected.',
        'follow_up_required': false,
        'next_inspection_date': '2025-03-14',
        'inspector_signature': 'A.Schmidt',
        'photo_attachments': '2 photos uploaded'
      }
    },
    {
      id: 'resp-005',
      submittedBy: 'David Kim',
      submittedAt: '2025-01-13T15:45:00Z',
      location: 'Plant D - Cooling Tower',
      deviceType: 'mobile',
      submissionTime: 390,
      responses: {
        'equipment_id': 'COOL-005',
        'inspector_name': 'David Kim',
        'inspection_date': '2025-01-13',
        'equipment_condition': 'Good',
        'temperature_reading': 45,
        'pressure_reading': 85,
        'vibration_level': 'Normal',
        'lubrication_status': 'Good',
        'safety_devices': true,
        'maintenance_required': true,
        'priority_level': 'Medium',
        'estimated_downtime': 2,
        'spare_parts_needed': 'Fan Belt, Water Treatment Chemicals',
        'inspection_notes': 'Cooling tower operating well. Fan belt showing wear and should be replaced during next scheduled maintenance. Water quality good.',
        'follow_up_required': false,
        'next_inspection_date': '2025-02-13',
        'inspector_signature': 'D.Kim',
        'photo_attachments': '4 photos uploaded'
      }
    },
    {
      id: 'resp-006',
      submittedBy: 'Lisa Chen',
      submittedAt: '2025-01-12T14:15:00Z',
      location: 'Plant E - Heat Exchanger',
      deviceType: 'tablet',
      submissionTime: 410,
      responses: {
        'equipment_id': 'HEX-006',
        'inspector_name': 'Lisa Chen',
        'inspection_date': '2025-01-12',
        'equipment_condition': 'Fair',
        'temperature_reading': 88,
        'pressure_reading': 155,
        'vibration_level': 'Normal',
        'lubrication_status': 'Fair',
        'safety_devices': true,
        'maintenance_required': true,
        'priority_level': 'Medium',
        'estimated_downtime': 6,
        'spare_parts_needed': 'Tube Bundle, Gaskets',
        'inspection_notes': 'Heat exchanger efficiency declining. Tube bundle shows fouling. Cleaning and gasket replacement recommended.',
        'follow_up_required': true,
        'next_inspection_date': '2025-01-19',
        'inspector_signature': 'L.Chen',
        'photo_attachments': '6 photos uploaded'
      }
    },
    {
      id: 'resp-007',
      submittedBy: 'Robert Wilson',
      submittedAt: '2025-01-12T10:30:00Z',
      location: 'Plant F - Motor Control Center',
      deviceType: 'mobile',
      submissionTime: 340,
      responses: {
        'equipment_id': 'MCC-007',
        'inspector_name': 'Robert Wilson',
        'inspection_date': '2025-01-12',
        'equipment_condition': 'Good',
        'temperature_reading': 55,
        'pressure_reading': 0,
        'vibration_level': 'Low',
        'lubrication_status': 'N/A',
        'safety_devices': true,
        'maintenance_required': false,
        'priority_level': 'Low',
        'estimated_downtime': 0,
        'spare_parts_needed': 'None',
        'inspection_notes': 'All electrical connections secure. No overheating detected. Control panels functioning properly. Routine cleaning completed.',
        'follow_up_required': false,
        'next_inspection_date': '2025-04-12',
        'inspector_signature': 'R.Wilson',
        'photo_attachments': '3 photos uploaded'
      }
    },
    {
      id: 'resp-008',
      submittedBy: 'Maria Garcia',
      submittedAt: '2025-01-11T16:00:00Z',
      location: 'Plant G - Conveyor System',
      deviceType: 'tablet',
      submissionTime: 480,
      responses: {
        'equipment_id': 'CONV-008',
        'inspector_name': 'Maria Garcia',
        'inspection_date': '2025-01-11',
        'equipment_condition': 'Poor',
        'temperature_reading': 70,
        'pressure_reading': 0,
        'vibration_level': 'High',
        'lubrication_status': 'Poor',
        'safety_devices': true,
        'maintenance_required': true,
        'priority_level': 'High',
        'estimated_downtime': 8,
        'spare_parts_needed': 'Drive Belt, Roller Bearings, Chain Links',
        'inspection_notes': 'Conveyor belt showing significant wear. Drive mechanism needs immediate attention. Safety guards in place but belt tracking issues present.',
        'follow_up_required': true,
        'next_inspection_date': '2025-01-13',
        'inspector_signature': 'M.Garcia',
        'photo_attachments': '7 photos uploaded'
      }
    },
    {
      id: 'resp-009',
      submittedBy: 'James Thompson',
      submittedAt: '2025-01-11T09:15:00Z',
      location: 'Plant H - Valve Station',
      deviceType: 'mobile',
      submissionTime: 320,
      responses: {
        'equipment_id': 'VALVE-009',
        'inspector_name': 'James Thompson',
        'inspection_date': '2025-01-11',
        'equipment_condition': 'Good',
        'temperature_reading': 62,
        'pressure_reading': 200,
        'vibration_level': 'Normal',
        'lubrication_status': 'Good',
        'safety_devices': true,
        'maintenance_required': false,
        'priority_level': 'Low',
        'estimated_downtime': 0,
        'spare_parts_needed': 'None',
        'inspection_notes': 'All valves operating smoothly. Pressure readings within specification. Actuators responding correctly to control signals.',
        'follow_up_required': false,
        'next_inspection_date': '2025-02-11',
        'inspector_signature': 'J.Thompson',
        'photo_attachments': '4 photos uploaded'
      }
    },
    {
      id: 'resp-010',
      submittedBy: 'Emily Davis',
      submittedAt: '2025-01-10T13:45:00Z',
      location: 'Plant I - Separator Unit',
      deviceType: 'desktop',
      submissionTime: 440,
      responses: {
        'equipment_id': 'SEP-010',
        'inspector_name': 'Emily Davis',
        'inspection_date': '2025-01-10',
        'equipment_condition': 'Fair',
        'temperature_reading': 78,
        'pressure_reading': 175,
        'vibration_level': 'Slightly High',
        'lubrication_status': 'Fair',
        'safety_devices': true,
        'maintenance_required': true,
        'priority_level': 'Medium',
        'estimated_downtime': 3,
        'spare_parts_needed': 'Separator Plates, O-Ring Kit',
        'inspection_notes': 'Separator efficiency reduced. Internal plates need cleaning. Some O-rings showing wear. Performance still acceptable but maintenance recommended.',
        'follow_up_required': true,
        'next_inspection_date': '2025-01-17',
        'inspector_signature': 'E.Davis',
        'photo_attachments': '5 photos uploaded'
      }
    },
    {
      id: 'resp-011',
      submittedBy: 'Carlos Martinez',
      submittedAt: '2025-01-10T08:30:00Z',
      location: 'Plant J - Turbine Hall',
      deviceType: 'tablet',
      submissionTime: 520,
      responses: {
        'equipment_id': 'TURB-011',
        'inspector_name': 'Carlos Martinez',
        'inspection_date': '2025-01-10',
        'equipment_condition': 'Excellent',
        'temperature_reading': 85,
        'pressure_reading': 220,
        'vibration_level': 'Normal',
        'lubrication_status': 'Excellent',
        'safety_devices': true,
        'maintenance_required': false,
        'priority_level': 'Low',
        'estimated_downtime': 0,
        'spare_parts_needed': 'None',
        'inspection_notes': 'Turbine operating at peak efficiency. Recent overhaul completed successfully. All monitoring systems showing optimal readings.',
        'follow_up_required': false,
        'next_inspection_date': '2025-04-10',
        'inspector_signature': 'C.Martinez',
        'photo_attachments': '3 photos uploaded'
      }
    },
    {
      id: 'resp-012',
      submittedBy: 'Jennifer Lee',
      submittedAt: '2025-01-09T15:20:00Z',
      location: 'Plant K - Reactor Vessel',
      deviceType: 'mobile',
      submissionTime: 460,
      responses: {
        'equipment_id': 'REACT-012',
        'inspector_name': 'Jennifer Lee',
        'inspection_date': '2025-01-09',
        'equipment_condition': 'Good',
        'temperature_reading': 92,
        'pressure_reading': 185,
        'vibration_level': 'Normal',
        'lubrication_status': 'Good',
        'safety_devices': true,
        'maintenance_required': true,
        'priority_level': 'Low',
        'estimated_downtime': 1,
        'spare_parts_needed': 'Temperature Sensor',
        'inspection_notes': 'Reactor vessel in good condition. One temperature sensor reading slightly off calibration. Replacement sensor ordered.',
        'follow_up_required': false,
        'next_inspection_date': '2025-02-09',
        'inspector_signature': 'J.Lee',
        'photo_attachments': '4 photos uploaded'
      }
    },
    {
      id: 'resp-013',
      submittedBy: 'Thomas Anderson',
      submittedAt: '2025-01-09T11:10:00Z',
      location: 'Plant L - Distillation Column',
      deviceType: 'tablet',
      submissionTime: 380,
      responses: {
        'equipment_id': 'DIST-013',
        'inspector_name': 'Thomas Anderson',
        'inspection_date': '2025-01-09',
        'equipment_condition': 'Fair',
        'temperature_reading': 105,
        'pressure_reading': 165,
        'vibration_level': 'Normal',
        'lubrication_status': 'Fair',
        'safety_devices': true,
        'maintenance_required': true,
        'priority_level': 'Medium',
        'estimated_downtime': 5,
        'spare_parts_needed': 'Packing Material, Tray Supports',
        'inspection_notes': 'Column efficiency declining. Packing material needs replacement. Some tray supports showing corrosion. Scheduled maintenance required.',
        'follow_up_required': true,
        'next_inspection_date': '2025-01-16',
        'inspector_signature': 'T.Anderson',
        'photo_attachments': '6 photos uploaded'
      }
    },
    {
      id: 'resp-014',
      submittedBy: 'Rachel Green',
      submittedAt: '2025-01-08T14:50:00Z',
      location: 'Plant M - Control Room',
      deviceType: 'desktop',
      submissionTime: 300,
      responses: {
        'equipment_id': 'CTRL-014',
        'inspector_name': 'Rachel Green',
        'inspection_date': '2025-01-08',
        'equipment_condition': 'Excellent',
        'temperature_reading': 22,
        'pressure_reading': 0,
        'vibration_level': 'None',
        'lubrication_status': 'N/A',
        'safety_devices': true,
        'maintenance_required': false,
        'priority_level': 'Low',
        'estimated_downtime': 0,
        'spare_parts_needed': 'None',
        'inspection_notes': 'Control room systems all operational. HVAC maintaining proper temperature. All displays and controls functioning correctly.',
        'follow_up_required': false,
        'next_inspection_date': '2025-07-08',
        'inspector_signature': 'R.Green',
        'photo_attachments': '2 photos uploaded'
      }
    },
    {
      id: 'resp-015',
      submittedBy: 'Kevin Brown',
      submittedAt: '2025-01-08T10:25:00Z',
      location: 'Plant N - Storage Tank',
      deviceType: 'mobile',
      submissionTime: 350,
      responses: {
        'equipment_id': 'TANK-015',
        'inspector_name': 'Kevin Brown',
        'inspection_date': '2025-01-08',
        'equipment_condition': 'Good',
        'temperature_reading': 35,
        'pressure_reading': 15,
        'vibration_level': 'None',
        'lubrication_status': 'N/A',
        'safety_devices': true,
        'maintenance_required': false,
        'priority_level': 'Low',
        'estimated_downtime': 0,
        'spare_parts_needed': 'None',
        'inspection_notes': 'Storage tank in good condition. Level indicators working properly. No signs of corrosion or leakage detected.',
        'follow_up_required': false,
        'next_inspection_date': '2025-03-08',
        'inspector_signature': 'K.Brown',
        'photo_attachments': '3 photos uploaded'
      }
    }
  ];

  const filteredResponses = mockResponses.filter(response => {
    const matchesSearch = Object.values(response.responses).some(value => 
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    ) || response.submittedBy.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesUser = !filterUser || response.submittedBy.toLowerCase().includes(filterUser.toLowerCase());
    
    return matchesSearch && matchesUser;
  });

  const totalPages = Math.ceil(filteredResponses.length / responsesPerPage);
  const paginatedResponses = filteredResponses.slice(
    (currentPage - 1) * responsesPerPage,
    currentPage * responsesPerPage
  );

  const formatCellValue = (value: any, questionType: string) => {
    if (value === null || value === undefined) return '-';
    
    switch (questionType.toLowerCase()) {
      case 'toggle':
        return value ? 'Yes' : 'No';
      case 'number':
        return typeof value === 'number' ? value.toString() : value;
      case 'select':
        return String(value);
      case 'multiselect':
        return String(value);
      case 'textarea':
        return String(value);
      case 'date':
        return value ? format(new Date(value), 'MMM d, yyyy') : '-';
      default:
        return String(value);
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'excellent':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'good':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'fair':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'poor':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'medium':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case 'mobile': return '📱';
      case 'tablet': return '📱';
      case 'desktop': return '💻';
      default: return '📱';
    }
  };

  const renderTableView = () => (
    <div className="flex-1 overflow-auto max-h-[calc(100vh-280px)]">
      <div className="min-w-full">
        <table className="w-full border-collapse">
          <thead className="bg-gradient-to-r from-slate-100 to-slate-50 sticky top-0 z-10 border-b-2 border-slate-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider border-r border-slate-200 bg-slate-100 sticky left-0 z-20 min-w-[140px]">
                <div className="flex items-center gap-2">
                  <User size={14} />
                  Submitted By
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider border-r border-slate-200 bg-slate-100 sticky left-[140px] z-20 min-w-[160px]">
                <div className="flex items-center gap-2">
                  <Calendar size={14} />
                  Submitted At
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider border-r border-slate-200 bg-slate-100 sticky left-[300px] z-20 min-w-[120px]">
                <div className="flex items-center gap-2">
                  <MapPin size={14} />
                  Location
                </div>
              </th>
              {formQuestions.map((question) => (
                <th
                  key={question.id}
                  className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider border-r border-slate-200 min-w-[180px]"
                >
                  <div className="flex flex-col gap-2">
                    <span className="font-medium text-slate-900">{question.name}</span>
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-slate-200 text-slate-700 capitalize">
                      {question.type}
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white">
            {paginatedResponses.map((response, index) => (
              <tr 
                key={response.id} 
                className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${
                  index % 2 === 0 ? 'bg-white' : 'bg-slate-25'
                }`}
              >
                <td className="px-6 py-4 border-r border-slate-200 bg-white sticky left-0 z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-medium shadow-md">
                      {response.submittedBy.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{response.submittedBy}</p>
                      <p className="text-xs text-slate-500 flex items-center gap-1">
                        {getDeviceIcon(response.deviceType || 'mobile')} 
                        {Math.round((response.submissionTime || 0) / 60)}m
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 border-r border-slate-200 bg-white sticky left-[140px] z-10">
                  <div className="flex flex-col">
                    <span className="font-medium text-slate-900">
                      {format(new Date(response.submittedAt), 'MMM d, yyyy')}
                    </span>
                    <span className="text-sm text-slate-500">
                      {format(new Date(response.submittedAt), 'HH:mm')}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 border-r border-slate-200 bg-white sticky left-[300px] z-10">
                  <div className="flex items-center gap-2">
                    <MapPin size={14} className="text-slate-400" />
                    <span className="font-medium text-slate-900">{response.location}</span>
                  </div>
                </td>
                {formQuestions.map((question) => (
                  <td
                    key={question.id}
                    className="px-6 py-4 border-r border-slate-200"
                  >
                    <div className="max-w-[160px]">
                      {question.id === 'equipment_condition' ? (
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getConditionColor(response.responses[question.id] || '')}`}>
                          {formatCellValue(response.responses[question.id], question.type)}
                        </span>
                      ) : question.id === 'priority_level' ? (
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getPriorityColor(response.responses[question.id] || '')}`}>
                          {formatCellValue(response.responses[question.id], question.type)}
                        </span>
                      ) : question.type.toLowerCase() === 'textarea' && response.responses[question.id]?.length > 50 ? (
                        <div className="group relative">
                          <span className="truncate block cursor-help">
                            {String(response.responses[question.id]).substring(0, 50)}...
                          </span>
                          <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block z-30">
                            <div className="bg-slate-900 text-white text-sm rounded-lg p-3 max-w-xs shadow-xl">
                              {response.responses[question.id]}
                            </div>
                          </div>
                        </div>
                      ) : question.type.toLowerCase() === 'toggle' ? (
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${
                          response.responses[question.id] ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200'
                        }`}>
                          {formatCellValue(response.responses[question.id], question.type)}
                        </span>
                      ) : (
                        <span className="font-medium text-slate-900">
                          {formatCellValue(response.responses[question.id], question.type)}
                        </span>
                      )}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  if (!isOpen || !form) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[95vw] max-h-[95vh] overflow-hidden">
        {/* Enhanced Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-slate-200 bg-gradient-to-r from-white to-slate-50">
          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 transition-colors p-2 hover:bg-slate-100 rounded-lg"
            >
              <X size={24} />
            </button>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">{form.name}</h2>
                <p className="text-sm text-slate-600 mt-1">
                  Plant: <span className="font-medium text-slate-800">{form.plant}</span> • 
                  <span className="ml-1 font-medium text-blue-600">{filteredResponses.length} responses</span>
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <button className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-2">
                <Filter size={16} />
                Advanced Filters
              </button>
              <button className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-lg transition-all shadow-lg hover:shadow-xl flex items-center gap-2">
                <Download size={16} />
                Export Data
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Filters */}
        <div className="px-8 py-4 bg-gradient-to-r from-slate-50 to-white border-b border-slate-200">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                className="block w-full pl-11 pr-4 py-3 text-sm border border-slate-300 rounded-xl placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white shadow-sm"
                placeholder="Search across all responses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                className="block w-56 pl-11 pr-4 py-3 text-sm border border-slate-300 rounded-xl placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white shadow-sm"
                placeholder="Filter by user..."
                value={filterUser}
                onChange={(e) => setFilterUser(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-3 bg-white rounded-xl border border-slate-300 px-4 py-3 shadow-sm">
              <Calendar className="text-slate-400" size={18} />
              <input
                type="date"
                className="text-sm border-0 focus:outline-none focus:ring-0 bg-transparent"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              />
              <span className="text-slate-400">to</span>
              <input
                type="date"
                className="text-sm border-0 focus:outline-none focus:ring-0 bg-transparent"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden">
          {renderTableView()}
        </div>

        {/* Enhanced Pagination */}
        {totalPages > 1 && (
          <div className="px-8 py-4 bg-gradient-to-r from-slate-50 to-white border-t border-slate-200 flex items-center justify-between">
            <div className="text-sm text-slate-700">
              Showing <span className="font-semibold text-slate-900">{(currentPage - 1) * responsesPerPage + 1}</span> to{' '}
              <span className="font-semibold text-slate-900">
                {Math.min(currentPage * responsesPerPage, filteredResponses.length)}
              </span>{' '}
              of <span className="font-semibold text-slate-900">{filteredResponses.length}</span> responses
            </div>
            <div className="flex items-center gap-2">
              <button
                className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                <ChevronLeft size={16} />
                Previous
              </button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
                  let page;
                  if (totalPages <= 7) {
                    page = i + 1;
                  } else if (currentPage <= 4) {
                    page = i + 1;
                  } else if (currentPage >= totalPages - 3) {
                    page = totalPages - 6 + i;
                  } else {
                    page = currentPage - 3 + i;
                  }
                  
                  return (
                    <button
                      key={page}
                      className={`w-10 h-10 text-sm font-medium rounded-lg transition-all ${
                        page === currentPage 
                          ? 'bg-blue-600 text-white shadow-lg' 
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>
              
              <button
                className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                Next
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FormResponsesViewer;