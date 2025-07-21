import React, { useState } from 'react';
import { 
  Plus, Play, Pause, RefreshCw, Clock, CheckCircle, XCircle, 
  Settings, ChevronDown, Search, Filter, Calendar, AlertCircle,
  ChevronRight, X, Eye, Info, ChevronUp
} from 'lucide-react';
import { format } from 'date-fns';
import { Card, Button, Badge, Input } from '../components/ui';
import { cn } from '../utils/cn';

type JobType = 'manual' | 'scheduled' | 'event-based';
type JobStatus = 'running' | 'success' | 'failed' | 'pending' | 'stopped';

interface SyncJob {
  id: string;
  name: string;
  type: JobType;
  tables: string[];
  filters: string[];
  schedule: string;
  lastRun: string;
  nextRun: string;
  status: JobStatus;
  scope: 'all' | 'incremental';
  enabled?: boolean;
  retryCount?: number;
  errorCount?: number;
  metrics?: {
    nodesUpserted: number;
    edgesUpserted: number;
    nodesDeleted: number;
    errorCount: number;
  };
  recentEvents?: Array<{
    time: string;
    message: string;
  }>;
}

interface TabFilters {
  searchTerm: string;
  statusFilter: string;
  tableFilter: string;
  sortOrder: string;
}

const DataSync: React.FC = () => {
  const [activeTab, setActiveTab] = useState<JobType>('manual');
  const [expandedJob, setExpandedJob] = useState<string | null>(null);
  const [showNewJobModal, setShowNewJobModal] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  // Per-tab filter state persistence
  const [tabFilters, setTabFilters] = useState<Record<JobType, TabFilters>>({
    manual: { searchTerm: '', statusFilter: 'all', tableFilter: 'all', sortOrder: 'newest' },
    scheduled: { searchTerm: '', statusFilter: 'all', tableFilter: 'all', sortOrder: 'newest' },
    'event-based': { searchTerm: '', statusFilter: 'all', tableFilter: 'all', sortOrder: 'newest' }
  });

  const currentFilters = tabFilters[activeTab];

  const updateFilters = (updates: Partial<TabFilters>) => {
    setTabFilters(prev => ({
      ...prev,
      [activeTab]: { ...prev[activeTab], ...updates }
    }));
  };

  // Humanize cron expressions
  const humanizeCron = (cronExpression: string): string => {
    const patterns: Record<string, string> = {
      '0 0 * * *': 'daily at midnight',
      '0 0 * * 0': 'weekly on Sunday at midnight',
      '0 0 1 * *': 'monthly on the 1st at midnight',
      '0 */6 * * *': 'every 6 hours',
      '*/15 * * * *': 'every 15 minutes',
      '0 9 * * 1-5': 'weekdays at 9:00 AM',
      '0 0 */2 * *': 'every 2 days at midnight'
    };
    return patterns[cronExpression] || 'custom schedule';
  };

  // Mock data with enhanced metrics and events
  const mockJobs: SyncJob[] = [
    {
      id: '1',
      name: 'Asset Master Full Sync',
      type: 'manual',
      tables: ['ASSET_MASTER', 'LOCATIONS'],
      filters: ['status = Active'],
      schedule: 'On-demand',
      lastRun: '2025-02-15T10:00:00Z',
      nextRun: 'N/A',
      status: 'success',
      scope: 'all',
      metrics: {
        nodesUpserted: 1250,
        edgesUpserted: 890,
        nodesDeleted: 12,
        errorCount: 0
      },
      recentEvents: [
        { time: '2025-02-15T10:08:12Z', message: 'Sync completed successfully' },
        { time: '2025-02-15T10:05:45Z', message: 'Processing LOCATIONS table' },
        { time: '2025-02-15T10:01:23Z', message: 'Processing ASSET_MASTER table' },
        { time: '2025-02-15T10:00:00Z', message: 'Starting sync job' }
      ]
    },
    {
      id: '2',
      name: 'Equipment Delta Sync',
      type: 'event-based',
      tables: ['EQUIPMENT'],
      filters: [],
      schedule: 'Real-time',
      lastRun: '2025-02-15T09:45:00Z',
      nextRun: 'Continuous',
      status: 'running',
      scope: 'incremental',
      metrics: {
        nodesUpserted: 45,
        edgesUpserted: 23,
        nodesDeleted: 2,
        errorCount: 0
      },
      recentEvents: [
        { time: '2025-02-15T09:45:12Z', message: 'Watching for changes...' },
        { time: '2025-02-15T09:45:00Z', message: 'Starting event-based sync' }
      ]
    },
    {
      id: '3',
      name: 'Work Orders Manual Sync',
      type: 'manual',
      tables: ['WORK_ORDERS'],
      filters: ['created_date > 2025-01-01'],
      schedule: 'On-demand',
      lastRun: '2025-02-15T08:30:00Z',
      nextRun: 'N/A',
      status: 'failed',
      scope: 'incremental',
      retryCount: 2,
      errorCount: 5,
      metrics: {
        nodesUpserted: 0,
        edgesUpserted: 0,
        nodesDeleted: 0,
        errorCount: 5
      },
      recentEvents: [
        { time: '2025-02-15T08:31:15Z', message: 'Sync failed - Connection timeout' },
        { time: '2025-02-15T08:31:15Z', message: 'Error: Connection timeout' },
        { time: '2025-02-15T08:30:00Z', message: 'Starting manual sync' }
      ]
    },
    {
      id: '4',
      name: 'Daily Equipment Check',
      type: 'scheduled',
      tables: ['EQUIPMENT', 'MAINTENANCE_LOGS'],
      filters: [],
      schedule: '0 0 * * *',
      lastRun: '2025-02-15T00:00:00Z',
      nextRun: '2025-02-16T00:00:00Z',
      status: 'success',
      scope: 'all',
      enabled: true,
      metrics: {
        nodesUpserted: 2340,
        edgesUpserted: 1560,
        nodesDeleted: 8,
        errorCount: 0
      },
      recentEvents: [
        { time: '2025-02-15T00:15:30Z', message: 'Sync completed successfully' },
        { time: '2025-02-15T00:10:15Z', message: 'Processing MAINTENANCE_LOGS table' },
        { time: '2025-02-15T00:05:20Z', message: 'Processing EQUIPMENT table' },
        { time: '2025-02-15T00:00:00Z', message: 'Starting scheduled sync' }
      ]
    },
    {
      id: '5',
      name: 'Weekly Reports Sync',
      type: 'scheduled',
      tables: ['REPORTS', 'ANALYTICS'],
      filters: [],
      schedule: '0 0 * * 0',
      lastRun: '2025-02-09T00:00:00Z',
      nextRun: '2025-02-16T00:00:00Z',
      status: 'success',
      scope: 'all',
      enabled: false,
      metrics: {
        nodesUpserted: 567,
        edgesUpserted: 234,
        nodesDeleted: 3,
        errorCount: 0
      },
      recentEvents: [
        { time: '2025-02-09T00:25:45Z', message: 'Sync completed successfully' },
        { time: '2025-02-09T00:15:30Z', message: 'Processing ANALYTICS table' },
        { time: '2025-02-09T00:05:10Z', message: 'Processing REPORTS table' },
        { time: '2025-02-09T00:00:00Z', message: 'Starting scheduled sync' }
      ]
    },
    {
      id: '6',
      name: 'Audit Log Stream',
      type: 'event-based',
      tables: ['AUDIT_LOGS'],
      filters: [],
      schedule: 'Real-time',
      lastRun: '2025-02-15T08:00:00Z',
      nextRun: 'Continuous',
      status: 'stopped',
      scope: 'incremental',
      metrics: {
        nodesUpserted: 12456,
        edgesUpserted: 8934,
        nodesDeleted: 45,
        errorCount: 2
      },
      recentEvents: [
        { time: '2025-02-15T08:30:00Z', message: 'Sync stopped by user' },
        { time: '2025-02-15T08:15:20Z', message: 'Processing change event batch' },
        { time: '2025-02-15T08:00:00Z', message: 'Event listener started' }
      ]
    }
  ];

  const filteredJobs = mockJobs.filter(job => {
    const matchesSearch = job.name.toLowerCase().includes(currentFilters.searchTerm.toLowerCase());
    const matchesType = activeTab === job.type;
    const matchesStatus = currentFilters.statusFilter === 'all' || job.status === currentFilters.statusFilter;
    const matchesTable = currentFilters.tableFilter === 'all' || 
      job.tables.some(table => table === currentFilters.tableFilter);
    return matchesSearch && matchesType && matchesStatus && matchesTable;
  });

  const getStatusIcon = (status: JobStatus) => {
    switch (status) {
      case 'success':
        return <CheckCircle size={16} className="text-green-500" aria-label="Job completed successfully" />;
      case 'failed':
        return <XCircle size={16} className="text-red-500" aria-label="Job failed" />;
      case 'running':
        return <RefreshCw size={16} className="text-blue-500 animate-spin" aria-label="Job currently running" />;
      case 'stopped':
        return <Pause size={16} className="text-gray-500" aria-label="Job stopped" />;
      default:
        return <Clock size={16} className="text-slate-500" aria-label="Job pending" />;
    }
  };

  const getStatusBadge = (status: JobStatus) => {
    switch (status) {
      case 'success':
        return <Badge variant="success">Success</Badge>;
      case 'failed':
        return <Badge variant="error">Failed</Badge>;
      case 'running':
        return <Badge variant="warning">Running</Badge>;
      case 'stopped':
        return <Badge variant="default">Stopped</Badge>;
      default:
        return <Badge variant="default">Pending</Badge>;
    }
  };

  const handleRunJob = (jobId: string) => {
    console.log('Running job:', jobId);
    // Update job status to running
  };

  const handleStopJob = (jobId: string) => {
    console.log('Stopping job:', jobId);
    // Update job status to stopped
  };

  const handleCancelJob = (jobId: string) => {
    console.log('Cancelling job:', jobId);
    // Cancel running job
  };

  const handleDeleteJob = (jobId: string) => {
    setShowDeleteConfirm(jobId);
  };

  const confirmDelete = () => {
    console.log('Deleting job:', showDeleteConfirm);
    setShowDeleteConfirm(null);
  };

  const handleTabChange = (tab: JobType) => {
    setActiveTab(tab);
    setExpandedJob(null); // Close any expanded job when switching tabs
  };

  const renderJobRow = (job: SyncJob) => {
    const isExpanded = expandedJob === job.id;
    const hasErrors = job.status === 'failed' || (job.retryCount && job.retryCount > 0);

    return (
      <div key={job.id} className="space-y-0">
        {/* Main Job Row */}
        <div 
          className={cn(
            "bg-white rounded-2xl shadow-sm border transition-all duration-200 hover:shadow-md",
            hasErrors && "border-l-4 border-l-red-500 bg-red-50",
            !hasErrors && "border-slate-200"
          )}
        >
          {activeTab === 'manual' && (
            <div className="grid grid-cols-5 gap-4 p-6 items-center">
              <div>
                <button
                  onClick={() => setExpandedJob(isExpanded ? null : job.id)}
                  className="text-left hover:text-blue-600 transition-colors font-semibold flex items-center gap-2"
                  aria-label={`${isExpanded ? 'Collapse' : 'Expand'} job details for ${job.name}`}
                >
                  {job.name}
                  {isExpanded ? <ChevronUp size={16} /> : <ChevronRight size={16} />}
                </button>
                {hasErrors && (
                  <div className="text-sm text-red-600 mt-1">
                    {job.retryCount && job.retryCount > 0 && `${job.retryCount} retries`}
                    {job.errorCount && job.errorCount > 0 && ` • ${job.errorCount} errors`}
                  </div>
                )}
              </div>
              <div className="text-slate-600">
                {job.tables.map(table => `plantDB.${table}`).join(', ')}
              </div>
              <div className="flex items-center gap-2">
                <div className="text-slate-900">
                  {format(new Date(job.lastRun), 'MMM d, yyyy HH:mm')}
                </div>
                <div className="flex items-center gap-1">
                  {getStatusIcon(job.status)}
                  {getStatusBadge(job.status)}
                </div>
              </div>
              <div className="relative group">
                <span className="text-slate-600">
                  {job.scope === 'all' ? 'All Records' : 'Only New & Updated Records'}
                </span>
                <Info 
                  size={14} 
                  className="ml-1 text-slate-400 cursor-help" 
                  title="All Records: process every row each run. Only New & Updated Records: process just the changes since the last successful run."
                />
              </div>
              <div className="flex space-x-2">
                {job.status === 'running' ? (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleStopJob(job.id)}
                    aria-label="Stop running job"
                  >
                    <Pause size={16} />
                    Stop
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleRunJob(job.id)}
                    aria-label="Run job now"
                  >
                    <Play size={16} />
                    Run Now
                  </Button>
                )}
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDeleteJob(job.id)}
                  aria-label="Delete job"
                >
                  Delete
                </Button>
              </div>
            </div>
          )}

          {activeTab === 'scheduled' && (
            <div className="grid grid-cols-7 gap-4 p-6 items-center">
              <div>
                <button
                  onClick={() => setExpandedJob(isExpanded ? null : job.id)}
                  className="text-left hover:text-blue-600 transition-colors font-semibold flex items-center gap-2"
                  aria-label={`${isExpanded ? 'Collapse' : 'Expand'} job details for ${job.name}`}
                >
                  {job.name}
                  {isExpanded ? <ChevronUp size={16} /> : <ChevronRight size={16} />}
                </button>
              </div>
              <div className="text-slate-600">
                {job.tables.map(table => `plantDB.${table}`).join(', ')}
              </div>
              <div>
                <code className="text-sm bg-slate-100 px-2 py-1 rounded">{job.schedule}</code>
                <div className="text-sm text-slate-500 mt-1">
                  {humanizeCron(job.schedule)}
                </div>
              </div>
              <div className="text-slate-600">
                {job.nextRun !== 'N/A' ? format(new Date(job.nextRun), 'MMM d, yyyy HH:mm') : 'N/A'}
              </div>
              <div className="flex items-center gap-2">
                <div className="text-slate-900">
                  {format(new Date(job.lastRun), 'MMM d, yyyy HH:mm')}
                </div>
                <div className="flex items-center gap-1">
                  {getStatusIcon(job.status)}
                  {getStatusBadge(job.status)}
                </div>
              </div>
              <div>
                <input
                  type="checkbox"
                  checked={job.enabled}
                  className="h-4 w-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                  aria-label={`${job.enabled ? 'Disable' : 'Enable'} scheduled job`}
                />
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="secondary"
                  size="sm"
                  aria-label="Edit job configuration"
                >
                  <Settings size={16} />
                  Edit
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleRunJob(job.id)}
                  aria-label="Run job now"
                >
                  <Play size={16} />
                  Run Now
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDeleteJob(job.id)}
                  aria-label="Delete job"
                >
                  Delete
                </Button>
              </div>
            </div>
          )}

          {activeTab === 'event-based' && (
            <div className="grid grid-cols-6 gap-4 p-6 items-center">
              <div>
                <button
                  onClick={() => setExpandedJob(isExpanded ? null : job.id)}
                  className="text-left hover:text-blue-600 transition-colors font-semibold flex items-center gap-2"
                  aria-label={`${isExpanded ? 'Collapse' : 'Expand'} job details for ${job.name}`}
                >
                  {job.name}
                  {isExpanded ? <ChevronUp size={16} /> : <ChevronRight size={16} />}
                </button>
              </div>
              <div className="text-slate-600">
                {job.tables.map(table => `plantDB.${table}`).join(', ')}
              </div>
              <div className="flex items-center gap-2">
                {getStatusIcon(job.status)}
                {getStatusBadge(job.status)}
              </div>
              <div className="text-slate-600">
                {format(new Date(job.lastRun), 'MMM d, HH:mm')}
              </div>
              <div className="text-slate-900 font-medium">
                {job.metrics?.nodesUpserted.toLocaleString() || '0'}
              </div>
              <div className="flex space-x-2">
                {job.status === 'running' ? (
                  <Button
                    variant="warning"
                    size="sm"
                    onClick={() => handleStopJob(job.id)}
                    aria-label="Stop event-based sync"
                  >
                    <Pause size={16} />
                    Stop
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleRunJob(job.id)}
                    aria-label="Start event-based sync"
                  >
                    <Play size={16} />
                    Start
                  </Button>
                )}
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDeleteJob(job.id)}
                  aria-label="Delete job"
                >
                  Delete
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Expanded Detail Panel */}
        {isExpanded && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 mt-2 overflow-hidden">
            <div className="p-6 space-y-6">
              {/* Error Summary for Failed Jobs */}
              {hasErrors && (
                <div 
                  className="bg-red-100 border border-red-300 text-red-800 p-4 rounded-lg" 
                  role="alert" 
                  aria-label="Job error summary"
                >
                  <strong>Errors:</strong> {job.errorCount || 0} failures in last run. 
                  <a href="#" className="underline ml-1">View details</a>
                </div>
              )}

              {/* Job Configuration */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="text-lg font-semibold text-slate-900">Configuration</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Mode:</span>
                      <span className="font-medium capitalize">{job.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Scope:</span>
                      <span className="font-medium">
                        {job.scope === 'all' ? 'All Records' : 'Only New & Updated Records'}
                      </span>
                    </div>
                    {job.type === 'scheduled' && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Schedule:</span>
                          <div className="text-right">
                            <code className="text-sm bg-slate-100 px-2 py-1 rounded">{job.schedule}</code>
                            <p className="text-sm text-slate-600 mt-1">
                              Runs <strong>{humanizeCron(job.schedule)}</strong>
                            </p>
                          </div>
                        </div>
                      </>
                    )}
                    <div className="flex justify-between">
                      <span className="text-slate-600">Retry Policy:</span>
                      <span className="font-medium">3 attempts, 5min delay</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-lg font-semibold text-slate-900">Notifications</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Email Alerts:</span>
                      <span className="font-medium">Enabled</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Slack Notifications:</span>
                      <span className="font-medium">Disabled</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Summary Metrics and Event Timeline */}
              <div className="grid grid-cols-2 gap-6">
                {/* Left: Summary Metrics */}
                <div className="space-y-3">
                  <h4 className="text-lg font-semibold text-slate-900">Last Run Summary</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Nodes Processed:</span>
                      <span className="font-medium text-green-600">{job.metrics?.nodesUpserted.toLocaleString() || '0'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Edges Processed:</span>
                      <span className="font-medium text-green-600">{job.metrics?.edgesUpserted.toLocaleString() || '0'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Records Deleted:</span>
                      <span className="font-medium text-slate-600">{job.metrics?.nodesDeleted || '0'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Errors:</span>
                      <span className={cn(
                        "font-medium",
                        (job.metrics?.errorCount || 0) > 0 ? "text-red-600" : "text-slate-600"
                      )}>
                        {job.metrics?.errorCount || '0'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Event Timeline */}
                <div className="space-y-3">
                  <h4 className="text-lg font-semibold text-slate-900">Recent Events</h4>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {job.recentEvents?.map((event, index) => (
                      <div key={index} className="text-sm text-slate-700 flex gap-2">
                        <span className="font-medium text-slate-500 flex-shrink-0">
                          {format(new Date(event.time), 'HH:mm:ss')}:
                        </span>
                        <span>{event.message}</span>
                      </div>
                    )) || (
                      <div className="text-sm text-slate-500 italic">No recent events</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between pt-4 border-t border-slate-200">
                <div className="flex space-x-3">
                  <Button variant="secondary" size="sm" aria-label="Download job logs">
                    <Eye size={16} />
                    Download Logs
                  </Button>
                  {job.status !== 'running' && (
                    <Button 
                      variant="primary" 
                      size="sm"
                      onClick={() => handleRunJob(job.id)}
                      aria-label="Rerun job"
                    >
                      <RefreshCw size={16} />
                      Rerun
                    </Button>
                  )}
                  {job.status === 'running' && job.type === 'manual' && (
                    <Button 
                      variant="secondary" 
                      size="sm"
                      onClick={() => handleCancelJob(job.id)}
                      aria-label="Cancel running job"
                      className="bg-slate-300 text-slate-800 hover:bg-slate-400"
                    >
                      <X size={16} />
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Sync Jobs</h1>
          <p className="mt-1 text-sm text-slate-600">
            Manage and monitor data synchronization jobs
          </p>
        </div>
        <Button 
          variant="primary" 
          onClick={() => setShowNewJobModal(true)}
          className="bg-blue-600 hover:bg-blue-700 rounded-2xl shadow-lg"
          aria-label="Create new sync job"
        >
          <Plus size={16} />
          New Job
        </Button>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'manual', label: 'Manual' },
            { id: 'scheduled', label: 'Scheduled' },
            { id: 'event-based', label: 'Event‑Based' }
          ].map((tab) => (
            <button
              key={tab.id}
              className={cn(
                'py-4 px-6 font-medium border-b-2 transition-colors',
                activeTab === tab.id
                  ? 'border-blue-600 text-slate-700'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              )}
              onClick={() => handleTabChange(tab.id as JobType)}
              aria-current={activeTab === tab.id ? 'page' : undefined}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search jobs..."
            value={currentFilters.searchTerm}
            onChange={(e) => updateFilters({ searchTerm: e.target.value })}
            className="w-full p-3 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <select
          value={currentFilters.statusFilter}
          onChange={(e) => updateFilters({ statusFilter: e.target.value })}
          className="p-3 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">All Statuses</option>
          <option value="running">Running</option>
          <option value="success">Succeeded</option>
          <option value="failed">Failed</option>
          <option value="stopped">Stopped</option>
        </select>
        <select
          value={currentFilters.tableFilter}
          onChange={(e) => updateFilters({ tableFilter: e.target.value })}
          className="p-3 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">All Tables</option>
          <option value="ASSET_MASTER">ASSET_MASTER</option>
          <option value="EQUIPMENT">EQUIPMENT</option>
          <option value="WORK_ORDERS">WORK_ORDERS</option>
          <option value="LOCATIONS">LOCATIONS</option>
        </select>
        <select
          value={currentFilters.sortOrder}
          onChange={(e) => updateFilters({ sortOrder: e.target.value })}
          className="p-3 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
        </select>
      </div>

      {/* Table Headers */}
      <div className="mb-4">
        {activeTab === 'manual' && (
          <div className="grid grid-cols-5 gap-4 text-sm font-medium text-slate-600 px-6">
            <div>Job Name</div>
            <div>Source Table</div>
            <div>Last Run</div>
            <div className="relative group">
              <span>Scope</span>
              <Info 
                size={14} 
                className="ml-1 text-slate-400 cursor-help" 
                title="All Records: process every row each run. Only New & Updated Records: process just the changes since the last successful run."
              />
            </div>
            <div>Actions</div>
          </div>
        )}

        {activeTab === 'scheduled' && (
          <div className="grid grid-cols-7 gap-4 text-sm font-medium text-slate-600 px-6">
            <div>Job Name</div>
            <div>Source Table</div>
            <div>Cron Schedule</div>
            <div>Next Run</div>
            <div>Last Run</div>
            <div>Enabled</div>
            <div>Actions</div>
          </div>
        )}

        {activeTab === 'event-based' && (
          <div className="grid grid-cols-6 gap-4 text-sm font-medium text-slate-600 px-6">
            <div>Job Name</div>
            <div>Source Table</div>
            <div>Listener Status</div>
            <div>Since</div>
            <div>Events Processed</div>
            <div>Actions</div>
          </div>
        )}
      </div>

      {/* Job Rows */}
      <div className="space-y-4">
        {filteredJobs.map(renderJobRow)}
      </div>

      {/* Pagination */}
      <div className="flex justify-end space-x-2 mt-6">
        <Button variant="secondary" size="sm" className="rounded-lg">
          Prev
        </Button>
        <Button variant="secondary" size="sm" className="rounded-lg">
          Next
        </Button>
      </div>

      {/* New Job Wizard Modal */}
      {showNewJobModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="flex h-[600px]">
              {/* Sidebar Progress */}
              <div className="w-64 bg-slate-50 p-6 border-r border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900 mb-6">Create New Job</h3>
                <ol className="space-y-4">
                  {[
                    { step: 1, title: 'Basic Info', desc: 'Name and description' },
                    { step: 2, title: 'Mode Selection', desc: 'Choose sync type' },
                    { step: 3, title: 'Scope & Schedule', desc: 'Configure timing' },
                    { step: 4, title: 'Error Settings', desc: 'Retry and notifications' },
                    { step: 5, title: 'Review', desc: 'Confirm and create' }
                  ].map((item) => (
                    <li key={item.step} className="flex items-start gap-3">
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                        wizardStep > item.step ? "bg-green-500 text-white" :
                        wizardStep === item.step ? "bg-blue-600 text-white" :
                        "bg-slate-200 text-slate-600"
                      )}>
                        {wizardStep > item.step ? '✓' : item.step}
                      </div>
                      <div>
                        <div className={cn(
                          "font-medium",
                          wizardStep >= item.step ? "text-slate-900" : "text-slate-500"
                        )}>
                          {item.title}
                        </div>
                        <div className="text-sm text-slate-500">{item.desc}</div>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Main Content */}
              <div className="flex-1 p-6 overflow-y-auto">
                {wizardStep === 1 && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-slate-900">Basic Information</h2>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Job Name *
                        </label>
                        <input
                          type="text"
                          className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter job name..."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Description
                        </label>
                        <textarea
                          rows={3}
                          className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Describe what this job does..."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Source Table *
                        </label>
                        <select className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                          <option value="">Select a table...</option>
                          <option value="ASSET_MASTER">ASSET_MASTER</option>
                          <option value="EQUIPMENT">EQUIPMENT</option>
                          <option value="WORK_ORDERS">WORK_ORDERS</option>
                          <option value="LOCATIONS">LOCATIONS</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {wizardStep === 2 && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-slate-900">Select Sync Mode</h2>
                    <div className="grid grid-cols-1 gap-4">
                      {[
                        { 
                          value: 'manual', 
                          title: 'Manual', 
                          desc: 'Run sync jobs on-demand when needed',
                          icon: <Play size={20} />
                        },
                        { 
                          value: 'scheduled', 
                          title: 'Scheduled', 
                          desc: 'Automatically run sync jobs on a schedule',
                          icon: <Clock size={20} />
                        },
                        { 
                          value: 'event-based', 
                          title: 'Event-Based', 
                          desc: 'Real-time sync based on database changes',
                          icon: <RefreshCw size={20} />
                        }
                      ].map((mode) => (
                        <label key={mode.value} className="flex items-center p-4 border border-slate-300 rounded-lg hover:bg-slate-50 cursor-pointer">
                          <input
                            type="radio"
                            name="syncMode"
                            value={mode.value}
                            className="h-4 w-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                          />
                          <div className="ml-4 flex items-center gap-3">
                            <div className="text-blue-600">{mode.icon}</div>
                            <div>
                              <div className="font-medium text-slate-900">{mode.title}</div>
                              <div className="text-sm text-slate-600">{mode.desc}</div>
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {wizardStep === 3 && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-slate-900">Scope & Schedule</h2>
                    <div className="space-y-4">
                      <div>
                        <label className="flex items-center space-x-2 text-sm font-medium text-slate-700 mb-2">
                          <span>Scope</span>
                          <Info 
                            size={14} 
                            className="text-slate-400 cursor-help" 
                            title="All Records: process every row each run. Only New & Updated Records: process just the changes since the last successful run."
                          />
                        </label>
                        <select className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                          <option value="all">All Records</option>
                          <option value="incremental">Only New & Updated Records</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Schedule (CRON Expression)
                        </label>
                        <input
                          type="text"
                          placeholder="0 0 * * *"
                          className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <p className="text-sm text-slate-500 mt-1">
                          Example: "0 0 * * *" (daily at midnight)
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {wizardStep === 4 && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-slate-900">Error & Notification Settings</h2>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Retry Policy
                        </label>
                        <select className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                          <option value="3">3 attempts, 5min delay</option>
                          <option value="5">5 attempts, 10min delay</option>
                          <option value="none">No retries</option>
                        </select>
                      </div>
                      <div className="space-y-3">
                        <label className="flex items-center space-x-2">
                          <input type="checkbox" className="h-4 w-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500" />
                          <span className="text-sm font-medium text-slate-700">Email notifications</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input type="checkbox" className="h-4 w-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500" />
                          <span className="text-sm font-medium text-slate-700">Slack notifications</span>
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {wizardStep === 5 && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-slate-900">Review & Confirm</h2>
                    <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Job Name:</span>
                        <span className="font-medium">Asset Master Sync</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Mode:</span>
                        <span className="font-medium">Scheduled</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Source Table:</span>
                        <span className="font-medium">ASSET_MASTER</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Scope:</span>
                        <span className="font-medium">All Records</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Schedule:</span>
                        <span className="font-medium">Daily at midnight</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-between">
              <Button
                variant="secondary"
                onClick={() => setShowNewJobModal(false)}
              >
                Cancel
              </Button>
              <div className="flex space-x-3">
                {wizardStep > 1 && (
                  <Button
                    variant="secondary"
                    onClick={() => setWizardStep(wizardStep - 1)}
                  >
                    Back
                  </Button>
                )}
                <Button
                  variant="primary"
                  onClick={() => {
                    if (wizardStep < 5) {
                      setWizardStep(wizardStep + 1);
                    } else {
                      setShowNewJobModal(false);
                      setWizardStep(1);
                    }
                  }}
                >
                  {wizardStep === 5 ? 'Create Job' : 'Next'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Delete Sync Job</h3>
            <p className="text-slate-600 mb-6">
              Are you sure you want to delete this sync job? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <Button
                variant="secondary"
                onClick={() => setShowDeleteConfirm(null)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={confirmDelete}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataSync;