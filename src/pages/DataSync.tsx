import React, { useState, useEffect } from 'react';
import { 
  Plus, Play, Pause, RefreshCw, Clock, CheckCircle, XCircle, 
  Settings, ChevronDown, Search, Filter, Calendar, AlertCircle,
  ChevronRight, X, Eye, Edit, Trash2, Download, ChevronUp, Info,
  ArrowLeft, ArrowRight, Check
} from 'lucide-react';
import { format } from 'date-fns';
import { Card, Button, Badge, Input } from '../components/ui';
import { cn } from '../utils/cn';

type JobType = 'manual' | 'scheduled' | 'event-based';
type JobStatus = 'running' | 'succeeded' | 'failed' | 'pending' | 'stopped' | 'retrying';

interface SyncJob {
  id: string;
  name: string;
  type: JobType;
  sourceCollection: string;
  schedule?: string;
  nextRun?: string;
  lastRun?: string;
  status: JobStatus;
  scope: 'full' | 'incremental';
  enabled?: boolean;
  eventsProcessed?: number;
  since?: string;
  retryCount?: number;
  errorCount?: number;
  logs: string[];
  metrics?: {
    nodesUpserted: number;
    edgesUpserted: number;
    deleted: number;
    errors: number;
  };
}

interface FilterState {
  searchTerm: string;
  statusFilter: string;
  sourceFilter: string;
  lastRunFilter: string;
}

interface NewJobWizardState {
  step: number;
  name: string;
  description: string;
  collection: string;
  mode: JobType;
  scope: 'full' | 'incremental';
  schedule: string;
  retryPolicy: string;
  notifications: {
    slack: boolean;
    email: boolean;
  };
}

const DataSync: React.FC = () => {
  const [activeTab, setActiveTab] = useState<JobType>('manual');
  const [expandedJob, setExpandedJob] = useState<string | null>(null);
  const [showNewJobModal, setShowNewJobModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  
  // Filter state persistence per tab
  const [filterStates, setFilterStates] = useState<Record<JobType, FilterState>>({
    manual: { searchTerm: '', statusFilter: 'all', sourceFilter: 'all', lastRunFilter: 'newest' },
    scheduled: { searchTerm: '', statusFilter: 'all', sourceFilter: 'all', lastRunFilter: 'newest' },
    'event-based': { searchTerm: '', statusFilter: 'all', sourceFilter: 'all', lastRunFilter: 'newest' }
  });

  // New Job Wizard State
  const [wizardState, setWizardState] = useState<NewJobWizardState>({
    step: 1,
    name: '',
    description: '',
    collection: '',
    mode: 'manual',
    scope: 'full',
    schedule: '',
    retryPolicy: '3',
    notifications: { slack: false, email: false }
  });

  const currentFilters = filterStates[activeTab];

  // Update filter state for current tab
  const updateFilter = (key: keyof FilterState, value: string) => {
    setFilterStates(prev => ({
      ...prev,
      [activeTab]: {
        ...prev[activeTab],
        [key]: value
      }
    }));
  };

  // Humanize cron expression
  const humanizeCron = (cronExpression: string): string => {
    const cronMap: Record<string, string> = {
      '0 0 * * *': 'daily at midnight',
      '0 * * * *': 'every hour',
      '0 0 * * 0': 'weekly on Sunday at midnight',
      '0 6 * * *': 'daily at 6:00 AM',
      '0 0 1 * *': 'monthly on the 1st at midnight',
      '*/15 * * * *': 'every 15 minutes',
      '0 */6 * * *': 'every 6 hours'
    };
    return cronMap[cronExpression] || 'custom schedule';
  };

  // Mock data with error states
  const mockJobs: Record<JobType, SyncJob[]> = {
    manual: [
      {
        id: 'manual-1',
        name: 'Ad-hoc Reload',
        type: 'manual',
        sourceCollection: 'plantDB.workOrders',
        lastRun: '2025-01-20T14:12:00Z',
        status: 'succeeded',
        scope: 'full',
        logs: [
          '[2025-01-20 14:12:00] Starting manual sync',
          '[2025-01-20 14:12:15] Processing workOrders collection',
          '[2025-01-20 14:15:30] Sync completed successfully'
        ],
        metrics: { nodesUpserted: 1250, edgesUpserted: 890, deleted: 12, errors: 0 }
      },
      {
        id: 'manual-2',
        name: 'Equipment Master Sync',
        type: 'manual',
        sourceCollection: 'plantDB.equipmentMasters',
        lastRun: '2025-01-19T10:30:00Z',
        status: 'running',
        scope: 'incremental',
        logs: [
          '[2025-01-19 10:30:00] Starting manual sync',
          '[2025-01-19 10:30:12] Processing equipmentMasters collection',
          '[2025-01-19 10:32:45] Processing records...'
        ],
        metrics: { nodesUpserted: 450, edgesUpserted: 320, deleted: 5, errors: 0 }
      },
      {
        id: 'manual-3',
        name: 'Asset Registry Update',
        type: 'manual',
        sourceCollection: 'plantDB.assetRegistry',
        lastRun: '2025-01-18T16:45:00Z',
        status: 'failed',
        scope: 'full',
        errorCount: 3,
        logs: [
          '[2025-01-18 16:45:00] Starting manual sync',
          '[2025-01-18 16:45:12] Processing assetRegistry collection',
          '[2025-01-18 16:47:30] Error: Connection timeout',
          '[2025-01-18 16:47:30] Sync failed'
        ],
        metrics: { nodesUpserted: 0, edgesUpserted: 0, deleted: 0, errors: 3 }
      },
      {
        id: 'manual-4',
        name: 'Location Hierarchy Sync',
        type: 'manual',
        sourceCollection: 'plantDB.locations',
        lastRun: '2025-01-17T11:20:00Z',
        status: 'retrying',
        scope: 'incremental',
        retryCount: 2,
        logs: [
          '[2025-01-17 11:20:00] Starting manual sync',
          '[2025-01-17 11:20:08] Processing locations collection',
          '[2025-01-17 11:21:15] Retry attempt 2/3'
        ],
        metrics: { nodesUpserted: 180, edgesUpserted: 95, deleted: 2, errors: 1 }
      }
    ],
    scheduled: [
      {
        id: 'scheduled-1',
        name: 'Nightly Sync',
        type: 'scheduled',
        sourceCollection: 'plantDB.equipmentMasters',
        schedule: '0 0 * * *',
        nextRun: '2025-01-22T00:00:00Z',
        lastRun: '2025-01-21T00:00:00Z',
        status: 'succeeded',
        scope: 'full',
        enabled: true,
        logs: [
          '[2025-01-21 00:00:00] Starting scheduled sync',
          '[2025-01-21 00:00:15] Processing equipmentMasters collection',
          '[2025-01-21 00:05:30] Sync completed successfully'
        ],
        metrics: { nodesUpserted: 2100, edgesUpserted: 1450, deleted: 25, errors: 0 }
      },
      {
        id: 'scheduled-2',
        name: 'Hourly Work Orders',
        type: 'scheduled',
        sourceCollection: 'plantDB.workOrders',
        schedule: '0 * * * *',
        nextRun: '2025-01-21T15:00:00Z',
        lastRun: '2025-01-21T14:00:00Z',
        status: 'failed',
        scope: 'incremental',
        enabled: true,
        errorCount: 2,
        logs: [
          '[2025-01-21 14:00:00] Starting scheduled sync',
          '[2025-01-21 14:00:05] Processing workOrders collection',
          '[2025-01-21 14:02:15] Error: Invalid data format'
        ],
        metrics: { nodesUpserted: 340, edgesUpserted: 280, deleted: 8, errors: 2 }
      },
      {
        id: 'scheduled-3',
        name: 'Weekly Asset Sync',
        type: 'scheduled',
        sourceCollection: 'plantDB.assetRegistry',
        schedule: '0 0 * * 0',
        nextRun: '2025-01-26T00:00:00Z',
        lastRun: '2025-01-19T00:00:00Z',
        status: 'succeeded',
        scope: 'full',
        enabled: true,
        logs: [
          '[2025-01-19 00:00:00] Starting scheduled sync',
          '[2025-01-19 00:00:20] Processing assetRegistry collection',
          '[2025-01-19 00:08:45] Sync completed successfully'
        ],
        metrics: { nodesUpserted: 1800, edgesUpserted: 1200, deleted: 15, errors: 0 }
      },
      {
        id: 'scheduled-4',
        name: 'Daily Maintenance Sync',
        type: 'scheduled',
        sourceCollection: 'plantDB.maintenanceRecords',
        schedule: '0 6 * * *',
        nextRun: '2025-01-22T06:00:00Z',
        lastRun: '2025-01-21T06:00:00Z',
        status: 'failed',
        scope: 'incremental',
        enabled: false,
        errorCount: 5,
        logs: [
          '[2025-01-21 06:00:00] Starting scheduled sync',
          '[2025-01-21 06:00:12] Processing maintenanceRecords collection',
          '[2025-01-21 06:02:30] Error: Database connection lost',
          '[2025-01-21 06:02:30] Sync failed'
        ],
        metrics: { nodesUpserted: 0, edgesUpserted: 0, deleted: 0, errors: 5 }
      }
    ],
    'event-based': [
      {
        id: 'event-1',
        name: 'Real-Time Sync',
        type: 'event-based',
        sourceCollection: 'plantDB.auditLogs',
        status: 'running',
        scope: 'incremental',
        since: '2025-01-21T08:00:00Z',
        eventsProcessed: 12345,
        logs: [
          '[2025-01-21 08:00:00] Starting event-based sync',
          '[2025-01-21 08:00:05] Listening for changes on auditLogs',
          '[2025-01-21 14:30:12] Processing change event...',
          '[2025-01-21 14:30:15] Event processed successfully'
        ],
        metrics: { nodesUpserted: 8900, edgesUpserted: 6200, deleted: 45, errors: 2 }
      },
      {
        id: 'event-2',
        name: 'Work Order Changes',
        type: 'event-based',
        sourceCollection: 'plantDB.workOrders',
        status: 'failed',
        scope: 'incremental',
        since: '2025-01-20T12:00:00Z',
        eventsProcessed: 8756,
        errorCount: 4,
        logs: [
          '[2025-01-20 12:00:00] Starting event-based sync',
          '[2025-01-20 12:00:08] Listening for changes on workOrders',
          '[2025-01-21 14:25:30] Error: Event processing failed',
          '[2025-01-21 14:25:33] Listener stopped due to errors'
        ],
        metrics: { nodesUpserted: 5600, edgesUpserted: 4100, deleted: 28, errors: 4 }
      },
      {
        id: 'event-3',
        name: 'Equipment Status Monitor',
        type: 'event-based',
        sourceCollection: 'plantDB.equipmentStatus',
        status: 'stopped',
        scope: 'incremental',
        since: '2025-01-19T14:30:00Z',
        eventsProcessed: 4523,
        logs: [
          '[2025-01-19 14:30:00] Starting event-based sync',
          '[2025-01-19 14:30:10] Listening for changes on equipmentStatus',
          '[2025-01-21 10:15:20] Sync stopped by user',
          '[2025-01-21 10:15:20] Event listener stopped'
        ],
        metrics: { nodesUpserted: 3200, edgesUpserted: 2800, deleted: 12, errors: 0 }
      }
    ]
  };

  const currentJobs = mockJobs[activeTab] || [];

  const filteredJobs = currentJobs.filter(job => {
    const matchesSearch = job.name.toLowerCase().includes(currentFilters.searchTerm.toLowerCase()) ||
                         job.sourceCollection.toLowerCase().includes(currentFilters.searchTerm.toLowerCase());
    const matchesStatus = currentFilters.statusFilter === 'all' || job.status === currentFilters.statusFilter;
    const matchesSource = currentFilters.sourceFilter === 'all' || job.sourceCollection.includes(currentFilters.sourceFilter);
    
    return matchesSearch && matchesStatus && matchesSource;
  });

  const getStatusIcon = (status: JobStatus) => {
    switch (status) {
      case 'succeeded':
        return <CheckCircle size={16} className="text-green-500" aria-label="Job succeeded" />;
      case 'failed':
        return <XCircle size={16} className="text-red-500" aria-label="Job failed" />;
      case 'running':
        return <RefreshCw size={16} className="text-blue-500 animate-spin" aria-label="Job running" />;
      case 'retrying':
        return <RefreshCw size={16} className="text-yellow-500 animate-spin" aria-label="Job retrying" />;
      case 'stopped':
        return <Pause size={16} className="text-yellow-500" aria-label="Job stopped" />;
      default:
        return <Clock size={16} className="text-slate-500" aria-label="Job pending" />;
    }
  };

  const getStatusBadge = (status: JobStatus) => {
    switch (status) {
      case 'succeeded':
        return <Badge variant="success">Succeeded</Badge>;
      case 'failed':
        return <Badge variant="error">Failed</Badge>;
      case 'running':
        return <Badge variant="warning">Running</Badge>;
      case 'retrying':
        return <Badge variant="warning">Retrying</Badge>;
      case 'stopped':
        return <Badge variant="default">Stopped</Badge>;
      default:
        return <Badge variant="default">Pending</Badge>;
    }
  };

  const handleRunJob = (jobId: string) => {
    console.log('Running job:', jobId);
  };

  const handleStopJob = (jobId: string) => {
    console.log('Stopping job:', jobId);
  };

  const handleCancelJob = (jobId: string) => {
    console.log('Cancelling job:', jobId);
  };

  const handleEditJob = (jobId: string) => {
    console.log('Editing job:', jobId);
    setShowNewJobModal(true);
  };

  const handleDeleteJob = (jobId: string) => {
    setShowDeleteConfirm(jobId);
  };

  const handleToggleEnabled = (jobId: string) => {
    console.log('Toggling enabled status for job:', jobId);
  };

  const formatSchedule = (schedule: string) => {
    const scheduleMap: Record<string, string> = {
      '0 0 * * *': 'Daily at 00:00',
      '0 * * * *': 'Every hour',
      '0 0 * * 0': 'Weekly on Sunday',
      '0 6 * * *': 'Daily at 06:00'
    };
    return scheduleMap[schedule] || schedule;
  };

  const isJobInErrorState = (job: SyncJob) => {
    return job.status === 'failed' || (job.status === 'retrying' && (job.retryCount || 0) > 0);
  };

  const getJobRowClasses = (job: SyncJob) => {
    const baseClasses = "bg-white rounded-2xl shadow-sm border border-slate-200 transition-all duration-200";
    if (isJobInErrorState(job)) {
      return `${baseClasses} border-l-4 border-l-red-500 bg-red-50`;
    }
    return baseClasses;
  };

  // New Job Wizard Component
  const NewJobWizard = () => {
    const steps = [
      { id: 1, title: 'Basic Info', description: 'Job name and description' },
      { id: 2, title: 'Mode Selection', description: 'Choose sync mode' },
      { id: 3, title: 'Scope & Schedule', description: 'Configure execution' },
      { id: 4, title: 'Error & Notifications', description: 'Set up alerts' },
      { id: 5, title: 'Review & Confirm', description: 'Confirm settings' }
    ];

    const isStepValid = (step: number) => {
      switch (step) {
        case 1: return wizardState.name.trim() !== '' && wizardState.collection !== '';
        case 2: return wizardState.mode !== '';
        case 3: return wizardState.scope !== '' && (wizardState.mode !== 'scheduled' || wizardState.schedule !== '');
        case 4: return true;
        case 5: return true;
        default: return false;
      }
    };

    const nextStep = () => {
      if (wizardState.step < 5 && isStepValid(wizardState.step)) {
        setWizardState(prev => ({ ...prev, step: prev.step + 1 }));
      }
    };

    const prevStep = () => {
      if (wizardState.step > 1) {
        setWizardState(prev => ({ ...prev, step: prev.step - 1 }));
      }
    };

    const renderStepContent = () => {
      switch (wizardState.step) {
        case 1:
          return (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Job Name *</label>
                <input
                  type="text"
                  value={wizardState.name}
                  onChange={(e) => setWizardState(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter job name..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                <textarea
                  value={wizardState.description}
                  onChange={(e) => setWizardState(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Describe this sync job..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Source Collection *</label>
                <select
                  value={wizardState.collection}
                  onChange={(e) => setWizardState(prev => ({ ...prev, collection: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select collection...</option>
                  <option value="plantDB.workOrders">plantDB.workOrders</option>
                  <option value="plantDB.equipmentMasters">plantDB.equipmentMasters</option>
                  <option value="plantDB.assetRegistry">plantDB.assetRegistry</option>
                  <option value="plantDB.auditLogs">plantDB.auditLogs</option>
                </select>
              </div>
            </div>
          );
        case 2:
          return (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-slate-900 mb-4">Select Sync Mode</h3>
              <div className="space-y-3">
                {[
                  { value: 'manual', title: 'Manual', description: 'Run on-demand when needed' },
                  { value: 'scheduled', title: 'Scheduled', description: 'Run automatically on a schedule' },
                  { value: 'event-based', title: 'Event-Based', description: 'Run in real-time when data changes' }
                ].map((mode) => (
                  <label key={mode.value} className="flex items-start space-x-3 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">
                    <input
                      type="radio"
                      name="mode"
                      value={mode.value}
                      checked={wizardState.mode === mode.value}
                      onChange={(e) => setWizardState(prev => ({ ...prev, mode: e.target.value as JobType }))}
                      className="mt-1"
                    />
                    <div>
                      <div className="font-medium text-slate-900">{mode.title}</div>
                      <div className="text-sm text-slate-600">{mode.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          );
        case 3:
          return (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Scope</label>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="scope"
                      value="full"
                      checked={wizardState.scope === 'full'}
                      onChange={(e) => setWizardState(prev => ({ ...prev, scope: e.target.value as 'full' | 'incremental' }))}
                    />
                    <span>Full - Sync entire collection</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="scope"
                      value="incremental"
                      checked={wizardState.scope === 'incremental'}
                      onChange={(e) => setWizardState(prev => ({ ...prev, scope: e.target.value as 'full' | 'incremental' }))}
                    />
                    <span>Incremental - Only sync changes</span>
                  </label>
                </div>
              </div>
              {wizardState.mode === 'scheduled' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Schedule (Cron Expression)</label>
                  <input
                    type="text"
                    value={wizardState.schedule}
                    onChange={(e) => setWizardState(prev => ({ ...prev, schedule: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                    placeholder="0 0 * * *"
                  />
                  <p className="text-sm text-slate-600 mt-1">
                    Example: "0 0 * * *" runs daily at midnight
                  </p>
                </div>
              )}
            </div>
          );
        case 4:
          return (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Retry Policy</label>
                <select
                  value={wizardState.retryPolicy}
                  onChange={(e) => setWizardState(prev => ({ ...prev, retryPolicy: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="0">No retries</option>
                  <option value="3">3 attempts</option>
                  <option value="5">5 attempts</option>
                  <option value="exponential">Exponential backoff</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Notifications</label>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={wizardState.notifications.slack}
                      onChange={(e) => setWizardState(prev => ({ 
                        ...prev, 
                        notifications: { ...prev.notifications, slack: e.target.checked }
                      }))}
                    />
                    <span>Send Slack notifications</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={wizardState.notifications.email}
                      onChange={(e) => setWizardState(prev => ({ 
                        ...prev, 
                        notifications: { ...prev.notifications, email: e.target.checked }
                      }))}
                    />
                    <span>Send email notifications</span>
                  </label>
                </div>
              </div>
            </div>
          );
        case 5:
          return (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-slate-900 mb-4">Review Job Configuration</h3>
              <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-600">Name:</span>
                  <span className="font-medium">{wizardState.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Collection:</span>
                  <span className="font-medium">{wizardState.collection}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Mode:</span>
                  <span className="font-medium capitalize">{wizardState.mode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Scope:</span>
                  <span className="font-medium capitalize">{wizardState.scope}</span>
                </div>
                {wizardState.mode === 'scheduled' && (
                  <div className="flex justify-between">
                    <span className="text-slate-600">Schedule:</span>
                    <span className="font-medium font-mono">{wizardState.schedule}</span>
                  </div>
                )}
              </div>
            </div>
          );
        default:
          return null;
      }
    };

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
          <div className="flex">
            {/* Sidebar */}
            <div className="w-64 bg-slate-50 p-6 border-r border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900 mb-6">Create New Job</h3>
              <ol className="space-y-4">
                {steps.map((step) => (
                  <li key={step.id} className="flex items-start space-x-3">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                      wizardState.step === step.id 
                        ? "bg-blue-600 text-white" 
                        : wizardState.step > step.id 
                        ? "bg-green-600 text-white" 
                        : "bg-slate-200 text-slate-600"
                    )}>
                      {wizardState.step > step.id ? <Check size={16} /> : step.id}
                    </div>
                    <div>
                      <div className={cn(
                        "text-sm font-medium",
                        wizardState.step >= step.id ? "text-slate-900" : "text-slate-500"
                      )}>
                        {step.title}
                      </div>
                      <div className="text-xs text-slate-500">{step.description}</div>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            {/* Content */}
            <div className="flex-1 p-6">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-slate-900">{steps[wizardState.step - 1].title}</h2>
                <p className="text-slate-600">{steps[wizardState.step - 1].description}</p>
              </div>

              <div className="mb-8">
                {renderStepContent()}
              </div>

              {/* Navigation */}
              <div className="flex justify-between">
                <Button
                  variant="secondary"
                  onClick={prevStep}
                  disabled={wizardState.step === 1}
                  icon={<ArrowLeft size={16} />}
                >
                  Back
                </Button>
                <div className="flex space-x-2">
                  <Button
                    variant="secondary"
                    onClick={() => setShowNewJobModal(false)}
                  >
                    Cancel
                  </Button>
                  {wizardState.step === 5 ? (
                    <Button
                      variant="primary"
                      onClick={() => {
                        console.log('Creating job:', wizardState);
                        setShowNewJobModal(false);
                      }}
                    >
                      Create Job
                    </Button>
                  ) : (
                    <Button
                      variant="primary"
                      onClick={nextStep}
                      disabled={!isStepValid(wizardState.step)}
                      icon={<ArrowRight size={16} />}
                    >
                      Next
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderManualTab = () => (
    <div className="space-y-4">
      {/* Table Header */}
      <div className="grid grid-cols-5 gap-4 text-sm font-medium text-slate-600 px-4">
        <div className="relative group">
          Job Name
          <Info size={12} className="inline ml-1 text-slate-400" title="Name of the sync job" />
        </div>
        <div className="relative group">
          Source Collection
          <Info size={12} className="inline ml-1 text-slate-400" title="MongoDB collection to sync from" />
        </div>
        <div>Last Run</div>
        <div className="relative group">
          Scope
          <Info size={12} className="inline ml-1 text-slate-400" title="Full = entire collection; Incremental = only changed since last run" />
        </div>
        <div>Actions</div>
      </div>

      {/* Table Rows */}
      <div className="space-y-3">
        {filteredJobs.map((job) => (
          <div key={job.id} className={getJobRowClasses(job)}>
            <div 
              className="grid grid-cols-5 gap-4 p-4 items-center cursor-pointer hover:bg-slate-50 transition-colors"
              onClick={() => setExpandedJob(expandedJob === job.id ? null : job.id)}
            >
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-900">{job.name}</span>
                {expandedJob === job.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
              <div className="text-slate-600">{job.sourceCollection}</div>
              <div className="flex items-center gap-2">
                {job.lastRun ? (
                  <>
                    <span className="text-slate-900">
                      {format(new Date(job.lastRun), 'MMM d, yyyy HH:mm')}
                    </span>
                    {getStatusBadge(job.status)}
                  </>
                ) : (
                  <span className="text-slate-500">Never run</span>
                )}
              </div>
              <div>
                <Badge variant="default">{job.scope}</Badge>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRunJob(job.id);
                  }}
                  disabled={job.status === 'running'}
                  aria-label={`Run ${job.name} sync job`}
                >
                  {job.status === 'running' ? 'Running...' : 'Run Now'}
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteJob(job.id);
                  }}
                  aria-label={`Delete ${job.name} sync job`}
                >
                  Delete
                </Button>
              </div>
            </div>

            {/* Expanded Details */}
            {expandedJob === job.id && (
              <div className="border-t border-slate-200 p-4 bg-slate-50 rounded-b-2xl">
                {/* Error Summary for failed jobs */}
                {isJobInErrorState(job) && (
                  <div className="bg-red-100 border border-red-300 text-red-800 p-3 rounded-lg mb-4" role="alert" aria-label="Job error summary">
                    <strong>Errors:</strong> {job.errorCount || job.retryCount || 0} failures in last run. 
                    <a href="#" className="underline ml-1">View details</a>
                  </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Job Details */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-slate-900">Job Configuration</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Mode:</span>
                        <span className="font-medium">Manual</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Scope:</span>
                        <span className="font-medium">{job.scope}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Retry Policy:</span>
                        <span className="font-medium">3 attempts</span>
                      </div>
                    </div>

                    {/* Metrics */}
                    {job.metrics && (
                      <div className="space-y-2">
                        <h5 className="font-medium text-slate-900">Last Run Metrics</h5>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-slate-600">Nodes Upserted:</span>
                            <span className="font-medium text-green-600">{job.metrics.nodesUpserted.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">Edges Upserted:</span>
                            <span className="font-medium text-green-600">{job.metrics.edgesUpserted.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">Deleted:</span>
                            <span className="font-medium text-red-600">{job.metrics.deleted}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">Errors:</span>
                            <span className="font-medium text-red-600">{job.metrics.errors}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Live Logs */}
                  <div className="space-y-2">
                    <h5 className="font-medium text-slate-900">Recent Logs</h5>
                    <div className="bg-slate-900 rounded-lg p-3 font-mono text-sm text-slate-300 h-32 overflow-y-auto">
                      {job.logs.map((log, index) => (
                        <div key={index} className="mb-1">{log}</div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-2 mt-4 pt-4 border-t border-slate-200">
                  <Button variant="secondary" size="sm" aria-label="Download job logs">
                    <Download size={16} className="mr-1" />
                    Download Logs
                  </Button>
                  {job.status === 'running' && (
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      onClick={() => handleCancelJob(job.id)}
                      aria-label="Cancel running job"
                    >
                      Cancel
                    </Button>
                  )}
                  <Button variant="primary" size="sm" onClick={() => handleRunJob(job.id)}>
                    Rerun
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderScheduledTab = () => (
    <div className="space-y-4">
      {/* Table Header */}
      <div className="grid grid-cols-7 gap-4 text-sm font-medium text-slate-600 px-4">
        <div>Job Name</div>
        <div>Source Collection</div>
        <div className="relative group">
          Cron Schedule
          <Info size={12} className="inline ml-1 text-slate-400" title="Cron expression defining when the job runs" />
        </div>
        <div>Next Run</div>
        <div>Last Run</div>
        <div>Enabled</div>
        <div>Actions</div>
      </div>

      {/* Table Rows */}
      <div className="space-y-3">
        {filteredJobs.map((job) => (
          <div key={job.id} className={getJobRowClasses(job)}>
            <div 
              className={cn(
                "grid grid-cols-7 gap-4 p-4 items-center cursor-pointer hover:bg-slate-50 transition-colors",
                !job.enabled && "opacity-50"
              )}
              onClick={() => setExpandedJob(expandedJob === job.id ? null : job.id)}
            >
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-900">{job.name}</span>
                {expandedJob === job.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
              <div className="text-slate-600">{job.sourceCollection}</div>
              <div className="font-mono text-sm">
                <code className="bg-slate-100 px-2 py-1 rounded">{job.schedule}</code>
                <div className="text-xs text-slate-500 mt-1">
                  {job.schedule && formatSchedule(job.schedule)}
                </div>
              </div>
              <div className="text-slate-900">
                {job.nextRun && format(new Date(job.nextRun), 'MMM d, yyyy HH:mm')}
              </div>
              <div className="flex items-center gap-2">
                {job.lastRun ? (
                  <>
                    <span className="text-slate-900">
                      {format(new Date(job.lastRun), 'MMM d, yyyy HH:mm')}
                    </span>
                    {getStatusBadge(job.status)}
                  </>
                ) : (
                  <span className="text-slate-500">Never run</span>
                )}
              </div>
              <div>
                <input
                  type="checkbox"
                  checked={job.enabled}
                  onChange={(e) => {
                    e.stopPropagation();
                    handleToggleEnabled(job.id);
                  }}
                  className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                  aria-label={`${job.enabled ? 'Disable' : 'Enable'} ${job.name} job`}
                />
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditJob(job.id);
                  }}
                  aria-label={`Edit ${job.name} job`}
                >
                  Edit
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRunJob(job.id);
                  }}
                  aria-label={`Run ${job.name} job now`}
                >
                  Run Now
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteJob(job.id);
                  }}
                  aria-label={`Delete ${job.name} job`}
                >
                  Delete
                </Button>
              </div>
            </div>

            {/* Expanded Details */}
            {expandedJob === job.id && (
              <div className="border-t border-slate-200 p-4 bg-slate-50 rounded-b-2xl">
                {/* Error Summary for failed jobs */}
                {isJobInErrorState(job) && (
                  <div className="bg-red-100 border border-red-300 text-red-800 p-3 rounded-lg mb-4" role="alert" aria-label="Job error summary">
                    <strong>Errors:</strong> {job.errorCount || 0} failures in last run. 
                    <a href="#" className="underline ml-1">View details</a>
                  </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Job Details */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-slate-900">Job Configuration</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Mode:</span>
                        <span className="font-medium">Scheduled</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Scope:</span>
                        <span className="font-medium">{job.scope}</span>
                      </div>
                      <div className="flex flex-col space-y-1">
                        <div className="flex justify-between">
                          <span className="text-slate-600">Cron:</span>
                          <code className="font-mono text-xs bg-slate-100 px-2 py-1 rounded">{job.schedule}</code>
                        </div>
                        <p className="text-sm text-slate-600">
                          Runs <strong>{humanizeCron(job.schedule || '')}</strong>
                        </p>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Notifications:</span>
                        <span className="font-medium">On failure</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Retry Policy:</span>
                        <span className="font-medium">3 attempts</span>
                      </div>
                    </div>

                    {/* Metrics */}
                    {job.metrics && (
                      <div className="space-y-2">
                        <h5 className="font-medium text-slate-900">Last Run Metrics</h5>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-slate-600">Nodes Upserted:</span>
                            <span className="font-medium text-green-600">{job.metrics.nodesUpserted.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">Edges Upserted:</span>
                            <span className="font-medium text-green-600">{job.metrics.edgesUpserted.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">Deleted:</span>
                            <span className="font-medium text-red-600">{job.metrics.deleted}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">Errors:</span>
                            <span className="font-medium text-red-600">{job.metrics.errors}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Live Logs */}
                  <div className="space-y-2">
                    <h5 className="font-medium text-slate-900">Recent Logs</h5>
                    <div className="bg-slate-900 rounded-lg p-3 font-mono text-sm text-slate-300 h-32 overflow-y-auto">
                      {job.logs.map((log, index) => (
                        <div key={index} className="mb-1">{log}</div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-2 mt-4 pt-4 border-t border-slate-200">
                  <Button variant="secondary" size="sm">
                    <Download size={16} className="mr-1" />
                    Download Logs
                  </Button>
                  <Button variant="primary" size="sm" onClick={() => handleRunJob(job.id)}>
                    Rerun
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderEventBasedTab = () => (
    <div className="space-y-4">
      {/* Table Header */}
      <div className="grid grid-cols-6 gap-4 text-sm font-medium text-slate-600 px-4">
        <div>Job Name</div>
        <div>Source Collection</div>
        <div className="relative group">
          Listener Status
          <Info size={12} className="inline ml-1 text-slate-400" title="Current status of the change stream listener" />
        </div>
        <div>Since</div>
        <div>Events Processed</div>
        <div>Actions</div>
      </div>

      {/* Table Rows */}
      <div className="space-y-3">
        {filteredJobs.map((job) => (
          <div key={job.id} className={getJobRowClasses(job)}>
            <div 
              className="grid grid-cols-6 gap-4 p-4 items-center cursor-pointer hover:bg-slate-50 transition-colors"
              onClick={() => setExpandedJob(expandedJob === job.id ? null : job.id)}
            >
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-900">{job.name}</span>
                {expandedJob === job.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
              <div className="text-slate-600">{job.sourceCollection}</div>
              <div className="flex items-center gap-2">
                {getStatusIcon(job.status)}
                {getStatusBadge(job.status)}
              </div>
              <div className="text-slate-900">
                {job.since && format(new Date(job.since), 'MMM d, yyyy HH:mm')}
              </div>
              <div className="font-medium text-slate-900">
                {job.eventsProcessed?.toLocaleString()}
              </div>
              <div className="flex space-x-2">
                {job.status === 'running' ? (
                  <Button
                    variant="warning"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStopJob(job.id);
                    }}
                    aria-label={`Stop ${job.name} event listener`}
                  >
                    Stop
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRunJob(job.id);
                    }}
                    aria-label={`Start ${job.name} event listener`}
                  >
                    Start
                  </Button>
                )}
                <Button
                  variant="danger"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteJob(job.id);
                  }}
                  aria-label={`Delete ${job.name} job`}
                >
                  Delete
                </Button>
              </div>
            </div>

            {/* Expanded Details */}
            {expandedJob === job.id && (
              <div className="border-t border-slate-200 p-4 bg-slate-50 rounded-b-2xl">
                {/* Error Summary for failed jobs */}
                {isJobInErrorState(job) && (
                  <div className="bg-red-100 border border-red-300 text-red-800 p-3 rounded-lg mb-4" role="alert" aria-label="Job error summary">
                    <strong>Errors:</strong> {job.errorCount || 0} failures detected. 
                    <a href="#" className="underline ml-1">View details</a>
                  </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Job Details */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-slate-900">Job Configuration</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Mode:</span>
                        <span className="font-medium">Event-Based</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Scope:</span>
                        <span className="font-medium">{job.scope}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Notifications:</span>
                        <span className="font-medium">On error</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Retry Policy:</span>
                        <span className="font-medium">Exponential backoff</span>
                      </div>
                    </div>

                    {/* Metrics */}
                    {job.metrics && (
                      <div className="space-y-2">
                        <h5 className="font-medium text-slate-900">Total Metrics</h5>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-slate-600">Nodes Upserted:</span>
                            <span className="font-medium text-green-600">{job.metrics.nodesUpserted.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">Edges Upserted:</span>
                            <span className="font-medium text-green-600">{job.metrics.edgesUpserted.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">Deleted:</span>
                            <span className="font-medium text-red-600">{job.metrics.deleted}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">Errors:</span>
                            <span className="font-medium text-red-600">{job.metrics.errors}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Live Logs */}
                  <div className="space-y-2">
                    <h5 className="font-medium text-slate-900">Live Log Tail</h5>
                    <div className="bg-slate-900 rounded-lg p-3 font-mono text-sm text-slate-300 h-32 overflow-y-auto">
                      {job.logs.map((log, index) => (
                        <div key={index} className="mb-1">{log}</div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-2 mt-4 pt-4 border-t border-slate-200">
                  <Button variant="secondary" size="sm">
                    <Download size={16} className="mr-1" />
                    Download Logs
                  </Button>
                  {job.status === 'running' && (
                    <Button variant="danger" size="sm" onClick={() => handleStopJob(job.id)}>
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Sync Jobs</h1>
        <Button 
          variant="primary" 
          onClick={() => setShowNewJobModal(true)}
          className="rounded-2xl shadow-lg hover:shadow-xl transition-shadow"
          aria-label="Create new sync job"
        >
          <Plus size={16} className="mr-2" />
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
                'py-4 px-6 border-b-2 font-medium transition-colors',
                activeTab === tab.id
                  ? 'border-blue-600 text-slate-700'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              )}
              onClick={() => setActiveTab(tab.id as JobType)}
              aria-current={activeTab === tab.id ? 'page' : undefined}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="flex-1 min-w-[300px]">
          <input
            type="text"
            placeholder="Search jobs..."
            value={currentFilters.searchTerm}
            onChange={(e) => updateFilter('searchTerm', e.target.value)}
            className="w-full p-3 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>
        <select
          value={currentFilters.statusFilter}
          onChange={(e) => updateFilter('statusFilter', e.target.value)}
          className="p-3 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
        >
          <option value="all">All Statuses</option>
          <option value="running">Running</option>
          <option value="succeeded">Succeeded</option>
          <option value="failed">Failed</option>
          <option value="stopped">Stopped</option>
          <option value="retrying">Retrying</option>
        </select>
        <select
          value={currentFilters.sourceFilter}
          onChange={(e) => updateFilter('sourceFilter', e.target.value)}
          className="p-3 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
        >
          <option value="all">All Collections</option>
          <option value="workOrders">workOrders</option>
          <option value="equipmentMasters">equipmentMasters</option>
          <option value="assetRegistry">assetRegistry</option>
          <option value="auditLogs">auditLogs</option>
        </select>
        <select
          value={currentFilters.lastRunFilter}
          onChange={(e) => updateFilter('lastRunFilter', e.target.value)}
          className="p-3 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
        </select>
      </div>

      {/* Tab Panels */}
      <div className="space-y-4">
        {activeTab === 'manual' && renderManualTab()}
        {activeTab === 'scheduled' && renderScheduledTab()}
        {activeTab === 'event-based' && renderEventBasedTab()}
      </div>

      {/* Pagination */}
      <div className="flex justify-end space-x-2 mt-6">
        <Button variant="secondary" size="sm" className="rounded-lg shadow-sm">
          Prev
        </Button>
        <Button variant="secondary" size="sm" className="rounded-lg shadow-sm">
          Next
        </Button>
      </div>

      {/* New Job Wizard Modal */}
      {showNewJobModal && <NewJobWizard />}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Delete Sync Job</h3>
            <p className="text-slate-600 mb-4">
              Are you sure you want to delete this sync job? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-2">
              <Button
                variant="secondary"
                onClick={() => setShowDeleteConfirm(null)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  console.log('Deleting job:', showDeleteConfirm);
                  setShowDeleteConfirm(null);
                }}
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