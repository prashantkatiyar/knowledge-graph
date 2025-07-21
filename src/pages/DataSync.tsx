import React, { useState } from 'react';
import { 
  Plus, Play, Pause, RefreshCw, Clock, CheckCircle, XCircle, 
  Settings, ChevronDown, Search, Filter, Calendar, AlertCircle,
  ChevronRight, X, Eye, Edit, Trash2, Download, ChevronUp
} from 'lucide-react';
import { format } from 'date-fns';
import { Card, Button, Badge, Input } from '../components/ui';
import { cn } from '../utils/cn';

type JobType = 'manual' | 'scheduled' | 'event-based';
type JobStatus = 'running' | 'succeeded' | 'failed' | 'pending' | 'stopped';

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
  logs: string[];
  metrics?: {
    nodesUpserted: number;
    edgesUpserted: number;
    deleted: number;
    errors: number;
  };
}

const DataSync: React.FC = () => {
  const [activeTab, setActiveTab] = useState<JobType>('manual');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [lastRunFilter, setLastRunFilter] = useState('newest');
  const [expandedJob, setExpandedJob] = useState<string | null>(null);
  const [showNewJobModal, setShowNewJobModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  // Mock data for different job types
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
        metrics: {
          nodesUpserted: 1250,
          edgesUpserted: 890,
          deleted: 12,
          errors: 0
        }
      },
      {
        id: 'manual-2',
        name: 'Equipment Master Sync',
        type: 'manual',
        sourceCollection: 'plantDB.equipmentMasters',
        lastRun: '2025-01-19T10:30:00Z',
        status: 'succeeded',
        scope: 'incremental',
        logs: [
          '[2025-01-19 10:30:00] Starting manual sync',
          '[2025-01-19 10:30:12] Processing equipmentMasters collection',
          '[2025-01-19 10:32:45] Sync completed successfully'
        ],
        metrics: {
          nodesUpserted: 450,
          edgesUpserted: 320,
          deleted: 5,
          errors: 0
        }
      },
      {
        id: 'manual-3',
        name: 'Asset Registry Update',
        type: 'manual',
        sourceCollection: 'plantDB.assetRegistry',
        lastRun: '2025-01-18T16:45:00Z',
        status: 'failed',
        scope: 'full',
        logs: [
          '[2025-01-18 16:45:00] Starting manual sync',
          '[2025-01-18 16:45:12] Processing assetRegistry collection',
          '[2025-01-18 16:47:30] Error: Connection timeout',
          '[2025-01-18 16:47:30] Sync failed'
        ],
        metrics: {
          nodesUpserted: 0,
          edgesUpserted: 0,
          deleted: 0,
          errors: 1
        }
      },
      {
        id: 'manual-4',
        name: 'Location Hierarchy Sync',
        type: 'manual',
        sourceCollection: 'plantDB.locations',
        lastRun: '2025-01-17T11:20:00Z',
        status: 'succeeded',
        scope: 'incremental',
        logs: [
          '[2025-01-17 11:20:00] Starting manual sync',
          '[2025-01-17 11:20:08] Processing locations collection',
          '[2025-01-17 11:21:15] Sync completed successfully'
        ],
        metrics: {
          nodesUpserted: 180,
          edgesUpserted: 95,
          deleted: 2,
          errors: 0
        }
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
        metrics: {
          nodesUpserted: 2100,
          edgesUpserted: 1450,
          deleted: 25,
          errors: 0
        }
      },
      {
        id: 'scheduled-2',
        name: 'Hourly Work Orders',
        type: 'scheduled',
        sourceCollection: 'plantDB.workOrders',
        schedule: '0 * * * *',
        nextRun: '2025-01-21T15:00:00Z',
        lastRun: '2025-01-21T14:00:00Z',
        status: 'succeeded',
        scope: 'incremental',
        enabled: true,
        logs: [
          '[2025-01-21 14:00:00] Starting scheduled sync',
          '[2025-01-21 14:00:05] Processing workOrders collection',
          '[2025-01-21 14:02:15] Sync completed successfully'
        ],
        metrics: {
          nodesUpserted: 340,
          edgesUpserted: 280,
          deleted: 8,
          errors: 0
        }
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
        metrics: {
          nodesUpserted: 1800,
          edgesUpserted: 1200,
          deleted: 15,
          errors: 0
        }
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
        logs: [
          '[2025-01-21 06:00:00] Starting scheduled sync',
          '[2025-01-21 06:00:12] Processing maintenanceRecords collection',
          '[2025-01-21 06:02:30] Error: Database connection lost',
          '[2025-01-21 06:02:30] Sync failed'
        ],
        metrics: {
          nodesUpserted: 0,
          edgesUpserted: 0,
          deleted: 0,
          errors: 1
        }
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
        metrics: {
          nodesUpserted: 8900,
          edgesUpserted: 6200,
          deleted: 45,
          errors: 2
        }
      },
      {
        id: 'event-2',
        name: 'Work Order Changes',
        type: 'event-based',
        sourceCollection: 'plantDB.workOrders',
        status: 'running',
        scope: 'incremental',
        since: '2025-01-20T12:00:00Z',
        eventsProcessed: 8756,
        logs: [
          '[2025-01-20 12:00:00] Starting event-based sync',
          '[2025-01-20 12:00:08] Listening for changes on workOrders',
          '[2025-01-21 14:25:30] Processing change event...',
          '[2025-01-21 14:25:33] Event processed successfully'
        ],
        metrics: {
          nodesUpserted: 5600,
          edgesUpserted: 4100,
          deleted: 28,
          errors: 1
        }
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
        metrics: {
          nodesUpserted: 3200,
          edgesUpserted: 2800,
          deleted: 12,
          errors: 0
        }
      }
    ]
  };

  const currentJobs = mockJobs[activeTab] || [];

  const filteredJobs = currentJobs.filter(job => {
    const matchesSearch = job.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.sourceCollection.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
    const matchesSource = sourceFilter === 'all' || job.sourceCollection.includes(sourceFilter);
    
    return matchesSearch && matchesStatus && matchesSource;
  });

  const getStatusIcon = (status: JobStatus) => {
    switch (status) {
      case 'succeeded':
        return <CheckCircle size={16} className="text-green-500" />;
      case 'failed':
        return <XCircle size={16} className="text-red-500" />;
      case 'running':
        return <RefreshCw size={16} className="text-blue-500 animate-spin" />;
      case 'stopped':
        return <Pause size={16} className="text-yellow-500" />;
      default:
        return <Clock size={16} className="text-slate-500" />;
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
      case 'stopped':
        return <Badge variant="default">Stopped</Badge>;
      default:
        return <Badge variant="default">Pending</Badge>;
    }
  };

  const handleRunJob = (jobId: string) => {
    console.log('Running job:', jobId);
    // Show toast notification
  };

  const handleStopJob = (jobId: string) => {
    console.log('Stopping job:', jobId);
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

  const renderManualTab = () => (
    <div className="space-y-4">
      {/* Table Header */}
      <div className="grid grid-cols-5 gap-4 text-sm font-medium text-slate-600 px-4">
        <div>Job Name</div>
        <div>Source Collection</div>
        <div>Last Run</div>
        <div>Scope</div>
        <div>Actions</div>
      </div>

      {/* Table Rows */}
      <div className="space-y-3">
        {filteredJobs.map((job) => (
          <div key={job.id} className="bg-white rounded-2xl shadow-sm border border-slate-200">
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
                >
                  Delete
                </Button>
              </div>
            </div>

            {/* Expanded Details */}
            {expandedJob === job.id && (
              <div className="border-t border-slate-200 p-4 bg-slate-50 rounded-b-2xl">
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

  const renderScheduledTab = () => (
    <div className="space-y-4">
      {/* Table Header */}
      <div className="grid grid-cols-7 gap-4 text-sm font-medium text-slate-600 px-4">
        <div>Job Name</div>
        <div>Source Collection</div>
        <div>Cron Schedule</div>
        <div>Next Run</div>
        <div>Last Run</div>
        <div>Enabled</div>
        <div>Actions</div>
      </div>

      {/* Table Rows */}
      <div className="space-y-3">
        {filteredJobs.map((job) => (
          <div key={job.id} className="bg-white rounded-2xl shadow-sm border border-slate-200">
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
                >
                  Delete
                </Button>
              </div>
            </div>

            {/* Expanded Details */}
            {expandedJob === job.id && (
              <div className="border-t border-slate-200 p-4 bg-slate-50 rounded-b-2xl">
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
                      <div className="flex justify-between">
                        <span className="text-slate-600">Cron:</span>
                        <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded">{job.schedule}</span>
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
        <div>Listener Status</div>
        <div>Since</div>
        <div>Events Processed</div>
        <div>Actions</div>
      </div>

      {/* Table Rows */}
      <div className="space-y-3">
        {filteredJobs.map((job) => (
          <div key={job.id} className="bg-white rounded-2xl shadow-sm border border-slate-200">
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
                >
                  Delete
                </Button>
              </div>
            </div>

            {/* Expanded Details */}
            {expandedJob === job.id && (
              <div className="border-t border-slate-200 p-4 bg-slate-50 rounded-b-2xl">
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
            { id: 'event-based', label: 'Event-Based' }
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
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-3 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="p-3 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
        >
          <option value="all">All Statuses</option>
          <option value="running">Running</option>
          <option value="succeeded">Succeeded</option>
          <option value="failed">Failed</option>
          <option value="stopped">Stopped</option>
        </select>
        <select
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value)}
          className="p-3 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
        >
          <option value="all">All Collections</option>
          <option value="workOrders">workOrders</option>
          <option value="equipmentMasters">equipmentMasters</option>
          <option value="assetRegistry">assetRegistry</option>
          <option value="auditLogs">auditLogs</option>
        </select>
        <select
          value={lastRunFilter}
          onChange={(e) => setLastRunFilter(e.target.value)}
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