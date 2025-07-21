import React, { useState } from 'react';
import { X, Download, Filter, Search, Calendar, User, MapPin } from 'lucide-react';
import { format } from 'date-fns';

interface FormResponse {
  id: string;
  submittedBy: string;
  submittedAt: string;
  location?: string;
  responses: Record<string, any>;
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
  const responsesPerPage = 50;

  // Mock response data
  const mockResponses: FormResponse[] = [
    {
      id: 'resp-1',
      submittedBy: 'John Smith',
      submittedAt: '2025-01-15T14:30:00Z',
      location: 'Area A-101',
      responses: {
        'title_verification': 'Daily Equipment Check - Pump P-001',
        'form_type': 'General',
        'mandatory_check': true,
        'form_rating': 8,
        'form_category': 'Maintenance',
        'additional_comments': 'All parameters within normal range',
        'form_status': 'Completed',
        'geo_location': '53.5511, 9.9937'
      }
    },
    {
      id: 'resp-2',
      submittedBy: 'Sarah Johnson',
      submittedAt: '2025-01-15T10:15:00Z',
      location: 'Area B-205',
      responses: {
        'title_verification': 'Safety Inspection - Valve V-003',
        'form_type': 'Specific',
        'mandatory_check': true,
        'form_rating': 9,
        'form_category': 'Safety',
        'additional_comments': 'Minor leak detected, maintenance scheduled',
        'form_status': 'Requires Action',
        'geo_location': '53.5505, 9.9925'
      }
    },
    {
      id: 'resp-3',
      submittedBy: 'Mike Rodriguez',
      submittedAt: '2025-01-14T16:45:00Z',
      location: 'Area C-310',
      responses: {
        'title_verification': 'Process Deviation Report - Line 3',
        'form_type': 'Custom',
        'mandatory_check': false,
        'form_rating': 6,
        'form_category': 'Process',
        'additional_comments': 'Temperature spike observed at 14:30',
        'form_status': 'Under Review',
        'geo_location': '53.5520, 9.9945'
      }
    },
    {
      id: 'resp-4',
      submittedBy: 'Anna Schmidt',
      submittedAt: '2025-01-14T09:20:00Z',
      location: 'Area A-102',
      responses: {
        'title_verification': 'Equipment Calibration - Sensor S-007',
        'form_type': 'General',
        'mandatory_check': true,
        'form_rating': 10,
        'form_category': 'Calibration',
        'additional_comments': 'Calibration successful, all readings accurate',
        'form_status': 'Completed',
        'geo_location': '53.5515, 9.9940'
      }
    },
    {
      id: 'resp-5',
      submittedBy: 'David Kim',
      submittedAt: '2025-01-13T13:10:00Z',
      location: 'Area D-450',
      responses: {
        'title_verification': 'Quality Check - Batch QC-2025-001',
        'form_type': 'Specific',
        'mandatory_check': true,
        'form_rating': 7,
        'form_category': 'Quality',
        'additional_comments': 'Sample results pending lab analysis',
        'form_status': 'Pending',
        'geo_location': '53.5508, 9.9930'
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
      case 'slider':
        return `${value}/10`;
      case 'geo location':
        return value ? `📍 ${value}` : '-';
      default:
        return String(value);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'requires action':
        return 'bg-red-100 text-red-800';
      case 'under review':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isOpen || !form) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-7xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-500 transition-colors p-1 hover:bg-slate-100 rounded-md"
            >
              <X size={20} />
            </button>
            <div>
              <h2 className="text-xl font-semibold text-slate-900">{form.name} - Responses</h2>
              <p className="text-sm text-slate-600 mt-1">
                Plant: {form.plant} • {filteredResponses.length} responses
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="btn btn-secondary btn-sm flex items-center gap-2">
              <Filter size={16} />
              Filter
            </button>
            <button className="btn btn-secondary btn-sm flex items-center gap-2">
              <Download size={16} />
              Export
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 text-sm border border-slate-300 rounded-lg placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                placeholder="Search responses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                className="block w-48 pl-10 pr-3 py-2 text-sm border border-slate-300 rounded-lg placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                placeholder="Filter by user..."
                value={filterUser}
                onChange={(e) => setFilterUser(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="text-slate-400" size={16} />
              <input
                type="date"
                className="px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              />
              <span className="text-slate-400">to</span>
              <input
                type="date"
                className="px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Responses Table */}
        <div className="flex-1 overflow-auto">
          <table className="min-w-full">
            <thead className="bg-slate-100 sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider border-r border-slate-200 bg-slate-100 sticky left-0 z-20 min-w-[120px]">
                  Submitted By
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider border-r border-slate-200 bg-slate-100 sticky left-[120px] z-20 min-w-[140px]">
                  Submitted At
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider border-r border-slate-200 bg-slate-100 sticky left-[260px] z-20 min-w-[100px]">
                  Location
                </th>
                {form.questions.map((question) => (
                  <th
                    key={question.id}
                    className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider border-r border-slate-200 min-w-[200px]"
                  >
                    <div className="flex flex-col gap-1">
                      <span className="truncate">{question.name}</span>
                      <span className="text-xs font-normal text-slate-400 capitalize">
                        ({question.type})
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {paginatedResponses.map((response, index) => (
                <tr key={response.id} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                  <td className="px-4 py-3 text-sm font-medium text-slate-900 border-r border-slate-200 bg-white sticky left-0 z-10">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-primary">
                          {response.submittedBy.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <span>{response.submittedBy}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600 border-r border-slate-200 bg-white sticky left-[120px] z-10">
                    <div className="flex flex-col">
                      <span>{format(new Date(response.submittedAt), 'MMM d, yyyy')}</span>
                      <span className="text-xs text-slate-500">
                        {format(new Date(response.submittedAt), 'HH:mm')}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600 border-r border-slate-200 bg-white sticky left-[260px] z-10">
                    <div className="flex items-center gap-1">
                      <MapPin size={14} className="text-slate-400" />
                      <span>{response.location}</span>
                    </div>
                  </td>
                  {form.questions.map((question) => (
                    <td
                      key={question.id}
                      className="px-4 py-3 text-sm text-slate-600 border-r border-slate-200"
                    >
                      <div className="max-w-[180px]">
                        {question.name === 'Form Status' ? (
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(response.responses[question.id] || '')}`}>
                            {formatCellValue(response.responses[question.id], question.type)}
                          </span>
                        ) : (
                          <span className="truncate block" title={formatCellValue(response.responses[question.id], question.type)}>
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
            <div className="text-sm text-slate-700">
              Showing <span className="font-medium">{(currentPage - 1) * responsesPerPage + 1}</span> to{' '}
              <span className="font-medium">
                {Math.min(currentPage * responsesPerPage, filteredResponses.length)}
              </span>{' '}
              of <span className="font-medium">{filteredResponses.length}</span> responses
            </div>
            <div className="flex items-center gap-2">
              <button
                className="btn btn-secondary btn-sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                Previous
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + 1;
                return (
                  <button
                    key={page}
                    className={`btn btn-sm ${page === currentPage ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                );
              })}
              <button
                className="btn btn-secondary btn-sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FormResponsesViewer;