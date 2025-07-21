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
  const [viewMode, setViewMode] = useState<'table' | 'analytics'>('table');
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [showColumnSelector, setShowColumnSelector] = useState(false);
  const responsesPerPage = 25;

  // Enhanced mock response data with more realistic details
  const mockResponses: FormResponse[] = [
    {
      id: 'resp-1',
      submittedBy: 'John Smith',
      submittedAt: '2025-01-15T14:30:00Z',
      location: 'Area A-101',
      deviceType: 'mobile',
      submissionTime: 180,
      responses: {
        'title_verification': 'Daily Equipment Check - Pump P-001',
        'form_type': 'General',
        'mandatory_check': true,
        'form_rating': 8,
        'form_category': 'Maintenance',
        'additional_comments': 'All parameters within normal range. Slight vibration noticed but within acceptable limits.',
        'form_status': 'Completed',
        'geo_location': '53.5511, 9.9937'
      }
    },
    {
      id: 'resp-2',
      submittedBy: 'Sarah Johnson',
      submittedAt: '2025-01-15T10:15:00Z',
      location: 'Area B-205',
      deviceType: 'tablet',
      submissionTime: 240,
      responses: {
        'title_verification': 'Safety Inspection - Valve V-003',
        'form_type': 'Specific',
        'mandatory_check': true,
        'form_rating': 9,
        'form_category': 'Safety',
        'additional_comments': 'Minor leak detected at connection point. Maintenance team notified and work order created.',
        'form_status': 'Requires Action',
        'geo_location': '53.5505, 9.9925'
      }
    },
    {
      id: 'resp-3',
      submittedBy: 'Mike Rodriguez',
      submittedAt: '2025-01-14T16:45:00Z',
      location: 'Area C-310',
      deviceType: 'mobile',
      submissionTime: 320,
      responses: {
        'title_verification': 'Process Deviation Report - Line 3',
        'form_type': 'Custom',
        'mandatory_check': false,
        'form_rating': 6,
        'form_category': 'Process',
        'additional_comments': 'Temperature spike observed at 14:30. Cooling system responded appropriately. Monitoring continues.',
        'form_status': 'Under Review',
        'geo_location': '53.5520, 9.9945'
      }
    },
    {
      id: 'resp-4',
      submittedBy: 'Anna Schmidt',
      submittedAt: '2025-01-14T09:20:00Z',
      location: 'Area A-102',
      deviceType: 'desktop',
      submissionTime: 420,
      responses: {
        'title_verification': 'Equipment Calibration - Sensor S-007',
        'form_type': 'General',
        'mandatory_check': true,
        'form_rating': 10,
        'form_category': 'Calibration',
        'additional_comments': 'Calibration completed successfully. All readings within specification. Certificate updated in system.',
        'form_status': 'Completed',
        'geo_location': '53.5515, 9.9940'
      }
    },
    {
      id: 'resp-5',
      submittedBy: 'David Kim',
      submittedAt: '2025-01-13T13:10:00Z',
      location: 'Area D-450',
      deviceType: 'mobile',
      submissionTime: 280,
      responses: {
        'title_verification': 'Quality Check - Batch QC-2025-001',
        'form_type': 'Specific',
        'mandatory_check': true,
        'form_rating': 7,
        'form_category': 'Quality',
        'additional_comments': 'Sample collected and sent to lab. Results expected within 24 hours. Visual inspection passed.',
        'form_status': 'Pending',
        'geo_location': '53.5508, 9.9930'
      }
    },
    {
      id: 'resp-6',
      submittedBy: 'Lisa Chen',
      submittedAt: '2025-01-13T08:45:00Z',
      location: 'Area A-103',
      deviceType: 'tablet',
      submissionTime: 195,
      responses: {
        'title_verification': 'Environmental Check - Air Quality Monitor',
        'form_type': 'General',
        'mandatory_check': true,
        'form_rating': 9,
        'form_category': 'Environmental',
        'additional_comments': 'All air quality parameters normal. Filter replacement due next week.',
        'form_status': 'Completed',
        'geo_location': '53.5512, 9.9935'
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
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'pending':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'requires action':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'under review':
        return 'bg-blue-100 text-blue-800 border-blue-200';
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

  const getAnalytics = () => {
    const totalResponses = filteredResponses.length;
    const avgRating = filteredResponses.reduce((sum, r) => sum + (r.responses.form_rating || 0), 0) / totalResponses;
    const avgTime = filteredResponses.reduce((sum, r) => sum + (r.submissionTime || 0), 0) / totalResponses;
    const statusCounts = filteredResponses.reduce((acc, r) => {
      const status = r.responses.form_status || 'Unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return { totalResponses, avgRating, avgTime, statusCounts };
  };

  const analytics = getAnalytics();

  const renderAnalyticsView = () => (
    <div className="p-8 space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total Responses</p>
              <p className="text-3xl font-bold text-blue-900 mt-2">{analytics.totalResponses}</p>
            </div>
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-6 border border-emerald-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-emerald-600">Avg Rating</p>
              <p className="text-3xl font-bold text-emerald-900 mt-2">{analytics.avgRating.toFixed(1)}/10</p>
            </div>
            <div className="w-12 h-12 bg-emerald-500 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Avg Time</p>
              <p className="text-3xl font-bold text-purple-900 mt-2">{Math.round(analytics.avgTime / 60)}m</p>
            </div>
            <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">Unique Users</p>
              <p className="text-3xl font-bold text-orange-900 mt-2">{new Set(filteredResponses.map(r => r.submittedBy)).size}</p>
            </div>
            <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Status Distribution */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-6">Response Status Distribution</h3>
        <div className="space-y-4">
          {Object.entries(analytics.statusCounts).map(([status, count]) => (
            <div key={status} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(status)}`}>
                  {status}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-32 bg-slate-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(count / analytics.totalResponses) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-slate-900 w-12 text-right">
                  {count} ({Math.round((count / analytics.totalResponses) * 100)}%)
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-6">Recent Submissions</h3>
        <div className="space-y-4">
          {filteredResponses.slice(0, 5).map((response) => (
            <div key={response.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                  {response.submittedBy.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <p className="font-medium text-slate-900">{response.submittedBy}</p>
                  <p className="text-sm text-slate-600">{response.location}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-slate-900">
                  {format(new Date(response.submittedAt), 'MMM d, HH:mm')}
                </p>
                <p className="text-xs text-slate-500 flex items-center gap-1">
                  {getDeviceIcon(response.deviceType || 'mobile')} {Math.round((response.submissionTime || 0) / 60)}m
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderTableView = () => (
    <div className="flex-1 overflow-auto">
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
              {form?.questions.map((question) => (
                <th
                  key={question.id}
                  className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider border-r border-slate-200 min-w-[220px]"
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
                {form?.questions.map((question) => (
                  <td
                    key={question.id}
                    className="px-6 py-4 border-r border-slate-200"
                  >
                    <div className="max-w-[200px]">
                      {question.name === 'Form Status' ? (
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(response.responses[question.id] || '')}`}>
                          {formatCellValue(response.responses[question.id], question.type)}
                        </span>
                      ) : question.type.toLowerCase() === 'text' && response.responses[question.id]?.length > 50 ? (
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
            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('table')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                  viewMode === 'table' 
                    ? 'bg-white text-slate-900 shadow-sm' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Eye size={16} className="mr-2 inline" />
                Table View
              </button>
              <button
                onClick={() => setViewMode('analytics')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                  viewMode === 'analytics' 
                    ? 'bg-white text-slate-900 shadow-sm' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <BarChart3 size={16} className="mr-2 inline" />
                Analytics
              </button>
            </div>

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
        {viewMode === 'table' && (
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
        )}

        {/* Content Area */}
        <div className="flex-1 overflow-hidden">
          {viewMode === 'analytics' ? renderAnalyticsView() : renderTableView()}
        </div>

        {/* Enhanced Pagination */}
        {viewMode === 'table' && totalPages > 1 && (
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