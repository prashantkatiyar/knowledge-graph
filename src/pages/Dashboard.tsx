import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, Search, FilterX, Filter, Download, RefreshCw, 
  Edit, Eye, Database, AlertCircle, ArrowDownUp,
  Calendar, ChevronDown, CheckCircle, Clock, X, GitBranch,
  ChevronLeft, ChevronRight, BarChart3, Layers, FileText,
  Users, Settings, Activity, Edit2, ClipboardList
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import Onboarding from './Onboarding';
import TableMetadataEditor from '../components/modals/TableMetadataEditor';
import RadialGauge from '../components/dashboard/RadialGauge';
import ProgressBar from '../components/dashboard/ProgressBar';
import SparklineChart from '../components/dashboard/SparklineChart';
import DonutChart from '../components/dashboard/DonutChart';

const Dashboard: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPlatform, setFilterPlatform] = useState('native');
  const [dateRange, setDateRange] = useState<[string, string]>(['', '']);
  const [selectedTables, setSelectedTables] = useState<string[]>([]);
  const [showConvertWizard, setShowConvertWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [showIntegrationBanner, setShowIntegrationBanner] = useState(true);
  const [showFormsConversionBanner, setShowFormsConversionBanner] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showTableMetadataEditor, setShowTableMetadataEditor] = useState(false);
  const [selectedTableForEdit, setSelectedTableForEdit] = useState<any>(null);
  
  // Mock summary data
  const summary = {
    // Tables metrics
    totalTables: 1000,
    contextualisedTables: 624,
    tablesConvertedToKG: Math.round(624 * 0.75), // 75% of contextualised tables
    tablesConversionRate: 75,
    
    // Fields metrics
    totalFields: 12230,
    contextualisedFields: 1234,
    fieldsConvertedToKG: Math.round(1234 * 0.40), // 40% of contextualised fields
    fieldsConversionRate: 40,
    
    // Relationships metrics
    totalRelationships: 100,
    contextualisedRelationships: 100,
    relationshipsConvertedToKG: Math.round(100 * 0.40), // 40% of contextualised relationships
    relationshipsConversionRate: 40,
    
    // Forms metrics
    totalForms: 100,
    contextualisedForms: 87,
    formsConvertedToKG: Math.round(87 * 0.40), // 40% of contextualised forms
    formsConversionRate: 40
  };

  // Mock forms data
  const formsInsights = {
    categories: [
      { name: 'Embedded Forms', total: 45, converted: 38 },
      { name: 'Round Templates', total: 32, converted: 28 },
      { name: 'Permit Templates', total: 28, converted: 25 },
      { name: 'JHA Templates', total: 15, converted: 12 },
      { name: 'Inspection', total: 40, converted: 35 },
      { name: 'Generic Forms', total: 20, converted: 15 }
    ],
    totalResponses: 425000,
    convertedResponses: 320000,
    newForms: [
      { name: 'Equipment Inspection Round', category: 'Round Templates' },
      { name: 'Hot Work Permit', category: 'Permit Templates' },
      { name: 'Safety Observation', category: 'Generic Forms' }
    ]
  };

  // Platform conversion data and other existing mock data...
  const platformProgress = [
    { name: 'SAP ERP', converted: 85, total: 100, records: 15000, errors: 2 },
    { name: 'Maximo', converted: 45, total: 50, records: 8000, errors: 0 },
    { name: 'Oracle', converted: 30, total: 40, records: 5000, errors: 1 },
    { name: 'AVEVA PI', converted: 20, total: 30, records: 3000, errors: 0 }
  ];

  // Rest of your existing mock data...

  // Mock data for new widgets
  const widgetData = {
    // High-Value Table Coverage Map
    highValueTables: [
      { 
        name: 'ASSET_MASTER', 
        recordVolume: 1500000, 
        queryFrequency: 8500,
        coverage: {
          description: 100,
          alias: 80,
          example: 60,
          sampleData: 40
        }
      },
      { 
        name: 'WORK_ORDERS', 
        recordVolume: 3200000, 
        queryFrequency: 12000,
        coverage: {
          description: 90,
          alias: 70,
          example: 30,
          sampleData: 20
        }
      },
      { 
        name: 'EQUIPMENT', 
        recordVolume: 850000, 
        queryFrequency: 7200,
        coverage: {
          description: 100,
          alias: 100,
          example: 80,
          sampleData: 60
        }
      },
      { 
        name: 'LOCATIONS', 
        recordVolume: 120000, 
        queryFrequency: 6800,
        coverage: {
          description: 100,
          alias: 90,
          example: 70,
          sampleData: 50
        }
      },
      { 
        name: 'MATERIALS', 
        recordVolume: 950000, 
        queryFrequency: 5400,
        coverage: {
          description: 80,
          alias: 60,
          example: 40,
          sampleData: 20
        }
      },
      { 
        name: 'MAINTENANCE_LOGS', 
        recordVolume: 4500000, 
        queryFrequency: 4900,
        coverage: {
          description: 70,
          alias: 50,
          example: 20,
          sampleData: 10
        }
      },
      { 
        name: 'EMPLOYEES', 
        recordVolume: 85000, 
        queryFrequency: 4200,
        coverage: {
          description: 100,
          alias: 90,
          example: 60,
          sampleData: 40
        }
      },
      { 
        name: 'INVENTORY', 
        recordVolume: 1200000, 
        queryFrequency: 3800,
        coverage: {
          description: 60,
          alias: 40,
          example: 20,
          sampleData: 0
        }
      },
      { 
        name: 'SUPPLIERS', 
        recordVolume: 45000, 
        queryFrequency: 3200,
        coverage: {
          description: 90,
          alias: 70,
          example: 50,
          sampleData: 30
        }
      },
      { 
        name: 'PURCHASE_ORDERS', 
        recordVolume: 750000, 
        queryFrequency: 2900,
        coverage: {
          description: 80,
          alias: 60,
          example: 30,
          sampleData: 10
        }
      }
    ],
    
    // Metadata Quality Scorecard
    metadataQuality: {
      tables: {
        score: 78,
        descriptionLength: 85,
        aliasUniqueness: 92,
        examplePresence: 58
      },
      fields: {
        score: 62,
        descriptionLength: 70,
        aliasUniqueness: 85,
        examplePresence: 32
      },
      relationships: {
        score: 84,
        descriptionLength: 90,
        aliasUniqueness: 95,
        examplePresence: 68
      }
    },
    
    // Graph Connectivity Gauge
    graphConnectivity: {
      reachableNodes: 82, // percentage
      totalNodes: 1500,
      connectedNodes: 1230,
      orphanedNodes: 270
    },
    
    // AI-Suggestion Adoption Rate
    aiSuggestionAdoption: {
      accepted: 68,
      overridden: 22,
      ignored: 10,
      totalSuggestions: 1250,
      byEntityType: {
        tables: { accepted: 72, overridden: 18, ignored: 10 },
        fields: { accepted: 65, overridden: 25, ignored: 10 },
        relationships: { accepted: 78, overridden: 15, ignored: 7 }
      }
    },
    
    // Contextualisation Backlog by Age
    contextualisationBacklog: {
      recent: { label: '0-7 days', count: 145 },
      medium: { label: '8-14 days', count: 87 },
      older: { label: '15-30 days', count: 62 },
      stale: { label: '30+ days', count: 38 }
    },
    
    // Top Orphan Fields & Relationships
    orphanEntities: [
      { name: 'ASSET_STATUS', type: 'Field', table: 'ASSET_MASTER', queriesPerDay: 1250 },
      { name: 'PRIORITY_CODE', type: 'Field', table: 'WORK_ORDERS', queriesPerDay: 980 },
      { name: 'LOCATED_AT', type: 'Relationship', fromTable: 'EQUIPMENT', toTable: 'LOCATIONS', queriesPerDay: 875 },
      { name: 'SERIAL_NUMBER', type: 'Field', table: 'EQUIPMENT', queriesPerDay: 820 },
      { name: 'ASSIGNED_TO', type: 'Relationship', fromTable: 'WORK_ORDERS', toTable: 'EMPLOYEES', queriesPerDay: 760 },
      { name: 'COST_CENTER', type: 'Field', table: 'MAINTENANCE_LOGS', queriesPerDay: 720 },
      { name: 'CREATED_BY', type: 'Field', table: 'PURCHASE_ORDERS', queriesPerDay: 680 }
    ],
    
    // Knowledge Graph Query Heatmap
    kgQueryHeatmap: {
      // Last 4 weeks of data (28 days)
      data: [
        [45, 52, 58, 42, 65, 48, 32], // Week 1
        [56, 78, 45, 42, 36, 25, 28], // Week 2
        [65, 68, 75, 82, 64, 36, 42], // Week 3
        [85, 120, 132, 105, 92, 75, 68] // Week 4 (most recent)
      ],
      maxValue: 132,
      totalQueries: 1842
    },
    
    // Relationship Path-Length Distribution
    relationshipPathLengths: {
      oneHop: { count: 850, percentage: 65 },
      twoHop: { count: 320, percentage: 25 },
      threeHop: { count: 130, percentage: 10 },
      total: 1300
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
        <div className="flex items-center gap-3">
          <button 
            className="btn btn-secondary flex items-center"
            onClick={() => {/* Handle graph preview */}}
            disabled={summary.convertedToKG === 0}
          >
            <Eye size={16} className="mr-1.5" />
            Preview Knowledge Graph
          </button>
          <Link to="/integration" className="btn btn-primary flex items-center">
            <Plus size={16} className="mr-1.5" />
            Add Integrations
          </Link>
        </div>
      </div>

      {/* Forms Conversion Banner */}
      {showFormsConversionBanner && (
        <div className="bg-amber-50 border border-amber-100 rounded-lg p-4 flex items-start animate-slide-down">
          <ClipboardList size={20} className="text-amber-500 mr-3 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-amber-800">
              New forms detected: {formsInsights.newForms.length} forms need to be converted
            </p>
            <div className="mt-1 text-xs text-amber-700 space-y-1">
              {formsInsights.newForms.map((form, index) => (
                <p key={index}>• {form.name} ({form.category})</p>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3 ml-4">
            <Link 
              to="/forms"
              className="btn btn-primary btn-sm"
            >
              Convert Forms
            </Link>
            <button 
              className="text-sm text-amber-600 hover:text-amber-800"
              onClick={() => setShowFormsConversionBanner(false)}
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Integration Banner */}
      {showIntegrationBanner && (
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-start animate-slide-down">
          <AlertCircle size={20} className="text-blue-500 mr-3 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-blue-800">
              New platforms integrated:  Factry Historian, Oracle Fusion Cloud ERP, and SAP HANA ERP
            </p>
            <p className="text-xs text-blue-600 mt-1">
              Would you like to convert their tables to the Knowledge Graph?
            </p>
          </div>
          <div className="flex items-center gap-3 ml-4">
            <button 
              className="btn btn-primary btn-sm"
              onClick={() => setShowOnboarding(true)}
            >
              Convert
            </button>
            <button 
              className="text-sm text-blue-600 hover:text-blue-800"
              onClick={() => setShowIntegrationBanner(false)}
            >
              Do it Later
            </button>
          </div>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Tables */}
        <div className="bg-white rounded-lg border border-slate-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Tables</p>
              <h3 className="text-2xl font-semibold text-slate-900 mt-1">
                {summary.contextualisedTables.toLocaleString()}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                of {summary.totalTables.toLocaleString()} contextualised
              </p>
            </div>
            <div className="h-12 w-12 bg-blue-50 rounded-lg flex items-center justify-center">
              <Database className="h-6 w-6 text-blue-500" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-green-500 flex items-center">
              <BarChart3 size={14} className="mr-1" />
              {summary.tablesConversionRate}% converted to KG
            </span>
            <span className="text-slate-500 ml-2">
              ({summary.tablesConvertedToKG} tables)
            </span>
          </div>
        </div>

        {/* Total Fields */}
        <div className="bg-white rounded-lg border border-slate-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Fields</p>
              <h3 className="text-2xl font-semibold text-slate-900 mt-1">
                {summary.contextualisedFields.toLocaleString()}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                of {summary.totalFields.toLocaleString()} contextualised
              </p>
            </div>
            <div className="h-12 w-12 bg-purple-50 rounded-lg flex items-center justify-center">
              <Layers className="h-6 w-6 text-purple-500" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-green-500 flex items-center">
              <BarChart3 size={14} className="mr-1" />
              {summary.fieldsConversionRate}% converted to KG
            </span>
            <span className="text-slate-500 ml-2">
              ({summary.fieldsConvertedToKG} fields)
            </span>
          </div>
        </div>

        {/* Total Relationships */}
        <div className="bg-white rounded-lg border border-slate-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Relationships</p>
              <h3 className="text-2xl font-semibold text-slate-900 mt-1">
                {summary.contextualisedRelationships.toLocaleString()}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                of {summary.totalRelationships.toLocaleString()} contextualised
              </p>
            </div>
            <div className="h-12 w-12 bg-orange-50 rounded-lg flex items-center justify-center">
              <GitBranch className="h-6 w-6 text-orange-500" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-green-500 flex items-center">
              <BarChart3 size={14} className="mr-1" />
              {summary.relationshipsConversionRate}% converted to KG
            </span>
            <span className="text-slate-500 ml-2">
              ({summary.relationshipsConvertedToKG} relationships)
            </span>
          </div>
        </div>

        {/* Total Forms */}
        <div className="bg-white rounded-lg border border-slate-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Forms</p>
              <h3 className="text-2xl font-semibold text-slate-900 mt-1">
                {summary.contextualisedForms.toLocaleString()}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                of {summary.totalForms.toLocaleString()} contextualised
              </p>
            </div>
            <div className="h-12 w-12 bg-green-50 rounded-lg flex items-center justify-center">
              <ClipboardList className="h-6 w-6 text-green-500" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-green-500 flex items-center">
              <BarChart3 size={14} className="mr-1" />
              {summary.formsConversionRate}% converted to KG
            </span>
            <span className="text-slate-500 ml-2">
              ({summary.formsConvertedToKG} forms)
            </span>
          </div>
        </div>
      </div>

      {/* New Widget Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        {/* 1. High-Value Table Coverage Map */}
        <div className="p-4 bg-white rounded-2xl shadow-sm flex flex-col hover:shadow-md transition-shadow duration-200">
          <h3 className="text-lg font-semibold mb-4 text-slate-900">High-Value Table Coverage Map</h3>
          <div className="flex-1 overflow-hidden">
            <div className="max-h-64 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-white">
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-2 text-slate-600 font-medium">Table</th>
                    <th className="text-center py-2 text-slate-600 font-medium">Desc</th>
                    <th className="text-center py-2 text-slate-600 font-medium">Alias</th>
                    <th className="text-center py-2 text-slate-600 font-medium">Example</th>
                    <th className="text-center py-2 text-slate-600 font-medium">Sample</th>
                  </tr>
                </thead>
                <tbody>
                  {widgetData.highValueTables.map((table, index) => (
                    <tr 
                      key={index} 
                      className={`${index % 2 === 0 ? 'bg-slate-50' : 'bg-white'} hover:bg-blue-50 transition-colors duration-150`}
                    >
                      <td className="py-2 font-medium text-slate-900 truncate">
                        <div className="flex items-center">
                          <span className="mr-2 text-xs text-slate-500">{index + 1}</span>
                          <span>{table.name}</span>
                        </div>
                        <div className="text-xs text-slate-500">
                          {table.recordVolume.toLocaleString()} records
                        </div>
                      </td>
                      <td className="py-2 text-center">
                        <div className={`w-6 h-6 mx-auto rounded-full flex items-center justify-center ${
                          table.coverage.description >= 80 ? 'bg-green-100 text-green-800' : 
                          table.coverage.description >= 50 ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-red-100 text-red-800'
                        }`}>
                          {table.coverage.description === 100 ? '✓' : `${table.coverage.description}%`}
                        </div>
                      </td>
                      <td className="py-2 text-center">
                        <div className={`w-6 h-6 mx-auto rounded-full flex items-center justify-center ${
                          table.coverage.alias >= 80 ? 'bg-green-100 text-green-800' : 
                          table.coverage.alias >= 50 ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-red-100 text-red-800'
                        }`}>
                          {table.coverage.alias === 100 ? '✓' : `${table.coverage.alias}%`}
                        </div>
                      </td>
                      <td className="py-2 text-center">
                        <div className={`w-6 h-6 mx-auto rounded-full flex items-center justify-center ${
                          table.coverage.example >= 80 ? 'bg-green-100 text-green-800' : 
                          table.coverage.example >= 50 ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-red-100 text-red-800'
                        }`}>
                          {table.coverage.example === 100 ? '✓' : `${table.coverage.example}%`}
                        </div>
                      </td>
                      <td className="py-2 text-center">
                        <div className={`w-6 h-6 mx-auto rounded-full flex items-center justify-center ${
                          table.coverage.sampleData >= 80 ? 'bg-green-100 text-green-800' : 
                          table.coverage.sampleData >= 50 ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-red-100 text-red-800'
                        }`}>
                          {table.coverage.sampleData === 100 ? '✓' : `${table.coverage.sampleData}%`}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* 2. Metadata Quality Scorecard */}
        <div className="p-4 bg-white rounded-2xl shadow-sm flex flex-col hover:shadow-md transition-shadow duration-200">
          <h3 className="text-lg font-semibold mb-4 text-slate-900">Metadata Quality Scorecard</h3>
          <div className="flex-1 space-y-6">
            {Object.entries(widgetData.metadataQuality).map(([entityType, data]) => (
              <div key={entityType} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-900 capitalize">{entityType}</span>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    data.score >= 80 ? 'bg-green-100 text-green-800' : 
                    data.score >= 60 ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-red-100 text-red-800'
                  }`}>
                    Score: {data.score}/100
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="bg-slate-50 p-2 rounded">
                    <div className="text-slate-500">Description</div>
                    <div className={`font-medium ${
                      data.descriptionLength >= 80 ? 'text-green-600' : 
                      data.descriptionLength >= 60 ? 'text-yellow-600' : 
                      'text-red-600'
                    }`}>
                      {data.descriptionLength}%
                    </div>
                  </div>
                  <div className="bg-slate-50 p-2 rounded">
                    <div className="text-slate-500">Alias</div>
                    <div className={`font-medium ${
                      data.aliasUniqueness >= 80 ? 'text-green-600' : 
                      data.aliasUniqueness >= 60 ? 'text-yellow-600' : 
                      'text-red-600'
                    }`}>
                      {data.aliasUniqueness}%
                    </div>
                  </div>
                  <div className="bg-slate-50 p-2 rounded">
                    <div className="text-slate-500">Examples</div>
                    <div className={`font-medium ${
                      data.examplePresence >= 80 ? 'text-green-600' : 
                      data.examplePresence >= 60 ? 'text-yellow-600' : 
                      'text-red-600'
                    }`}>
                      {data.examplePresence}%
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Graph Connectivity Gauge */}
        <div className="p-4 bg-white rounded-2xl shadow-sm flex flex-col hover:shadow-md transition-shadow duration-200">
          <h3 className="text-lg font-semibold mb-4 text-slate-900">Graph Connectivity Gauge</h3>
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="relative w-32 h-32">
              <svg viewBox="0 0 100 100" className="transform -rotate-90">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="transparent"
                  stroke="#E5E7EB"
                  strokeWidth="8"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="transparent"
                  stroke={widgetData.graphConnectivity.reachableNodes >= 80 ? '#10B981' : 
                          widgetData.graphConnectivity.reachableNodes >= 50 ? '#F59E0B' : '#EF4444'}
                  strokeWidth="8"
                  strokeDasharray={`${2 * Math.PI * 45 * widgetData.graphConnectivity.reachableNodes / 100} ${2 * Math.PI * 45}`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-3xl font-bold text-slate-900">{widgetData.graphConnectivity.reachableNodes}%</span>
                <span className="text-xs text-slate-500">connected</span>
              </div>
            </div>
            <div className="mt-4 text-center">
              <div className="text-sm text-slate-600">
                {widgetData.graphConnectivity.connectedNodes.toLocaleString()} of {widgetData.graphConnectivity.totalNodes.toLocaleString()} nodes reachable
              </div>
              <div className="text-xs text-slate-500 mt-1">
                {widgetData.graphConnectivity.orphanedNodes.toLocaleString()} orphaned nodes
              </div>
            </div>
          </div>
        </div>

        {/* 4. AI-Suggestion Adoption Rate */}
        <div className="p-4 bg-white rounded-2xl shadow-sm flex flex-col hover:shadow-md transition-shadow duration-200">
          <h3 className="text-lg font-semibold mb-4 text-slate-900">AI-Suggestion Adoption Rate</h3>
          <div className="flex-1 flex flex-col">
            <div className="flex-1 flex items-center justify-center">
              <div className="w-full">
                <div className="flex h-8 rounded-lg overflow-hidden">
                  <div 
                    className="bg-green-500 flex items-center justify-center text-xs font-medium text-white"
                    style={{ width: `${widgetData.aiSuggestionAdoption.accepted}%` }}
                  >
                    {widgetData.aiSuggestionAdoption.accepted}%
                  </div>
                  <div 
                    className="bg-yellow-500 flex items-center justify-center text-xs font-medium text-white"
                    style={{ width: `${widgetData.aiSuggestionAdoption.overridden}%` }}
                  >
                    {widgetData.aiSuggestionAdoption.overridden}%
                  </div>
                  <div 
                    className="bg-red-500 flex items-center justify-center text-xs font-medium text-white"
                    style={{ width: `${widgetData.aiSuggestionAdoption.ignored}%` }}
                  >
                    {widgetData.aiSuggestionAdoption.ignored}%
                  </div>
                </div>
                <div className="flex text-xs text-slate-600 mt-2 justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-1"></div>
                    Accepted
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full mr-1"></div>
                    Overridden
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-red-500 rounded-full mr-1"></div>
                    Ignored
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <div className="text-sm text-center text-slate-600">
                {widgetData.aiSuggestionAdoption.totalSuggestions.toLocaleString()} total AI suggestions
              </div>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {Object.entries(widgetData.aiSuggestionAdoption.byEntityType).map(([type, data]) => (
                  <div key={type} className="bg-slate-50 p-2 rounded text-xs">
                    <div className="text-slate-500 capitalize">{type}</div>
                    <div className="font-medium text-green-600">{data.accepted}% accepted</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 5. Contextualisation Backlog by Age */}
        <div className="p-4 bg-white rounded-2xl shadow-sm flex flex-col hover:shadow-md transition-shadow duration-200">
          <h3 className="text-lg font-semibold mb-4 text-slate-900">Contextualisation Backlog by Age</h3>
          <div className="flex-1 flex flex-col justify-center">
            <div className="space-y-4">
              {Object.values(widgetData.contextualisationBacklog).map((bucket, index) => {
                const maxCount = Math.max(
                  widgetData.contextualisationBacklog.recent.count,
                  widgetData.contextualisationBacklog.medium.count,
                  widgetData.contextualisationBacklog.older.count,
                  widgetData.contextualisationBacklog.stale.count
                );
                const percentage = (bucket.count / maxCount) * 100;
                
                return (
                  <div key={index} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-slate-900">{bucket.label}</span>
                      <span className="text-slate-600">{bucket.count} items</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          index === 3 ? 'bg-red-500' : 
                          index === 2 ? 'bg-yellow-500' : 
                          index === 1 ? 'bg-blue-500' : 
                          'bg-green-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 text-center text-sm text-slate-600">
              Total: {Object.values(widgetData.contextualisationBacklog).reduce((sum, bucket) => sum + bucket.count, 0)} pending items
            </div>
          </div>
        </div>

        {/* 6. Top "Orphan" Fields & Relationships */}
        <div className="p-4 bg-white rounded-2xl shadow-sm flex flex-col hover:shadow-md transition-shadow duration-200">
          <h3 className="text-lg font-semibold mb-4 text-slate-900">Top "Orphan" Fields & Relationships</h3>
          <div className="flex-1 overflow-hidden">
            <div className="max-h-64 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-white">
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-2 text-slate-600 font-medium">Name</th>
                    <th className="text-left py-2 text-slate-600 font-medium">Type</th>
                    <th className="text-right py-2 text-slate-600 font-medium">Queries/Day</th>
                    <th className="text-center py-2 text-slate-600 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {widgetData.orphanEntities.map((entity, index) => (
                    <tr 
                      key={index} 
                      className={`${index % 2 === 0 ? 'bg-slate-50' : 'bg-white'} hover:bg-blue-50 transition-colors duration-150`}
                    >
                      <td className="py-2 font-medium text-slate-900">
                        <div>{entity.name}</div>
                        <div className="text-xs text-slate-500">
                          {entity.table || `${entity.fromTable} → ${entity.toTable}`}
                        </div>
                      </td>
                      <td className="py-2 text-slate-600">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          entity.type === 'Relationship' ? 'bg-orange-100 text-orange-800' : 
                          entity.type === 'Table' ? 'bg-blue-100 text-blue-800' : 
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {entity.type}
                        </span>
                      </td>
                      <td className="py-2 text-right text-slate-600 font-medium">
                        {entity.queriesPerDay.toLocaleString()}
                      </td>
                      <td className="py-2 text-center">
                        <button 
                          className="px-2 py-1 text-xs bg-primary text-white rounded hover:bg-primary-dark transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-primary/30"
                          onClick={() => {/* Navigate to contextualise */}}
                        >
                          Fix
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* 7. Knowledge Graph Query Heatmap */}
        <div className="p-4 bg-white rounded-2xl shadow-sm flex flex-col hover:shadow-md transition-shadow duration-200">
          <h3 className="text-lg font-semibold mb-4 text-slate-900">Knowledge Graph Query Heatmap</h3>
          <div className="flex-1 flex flex-col justify-center">
            <div className="grid grid-cols-7 gap-1">
              {widgetData.kgQueryHeatmap.data.map((week, weekIndex) => (
                week.map((day, dayIndex) => {
                  const intensity = (day / widgetData.kgQueryHeatmap.maxValue) * 100;
                  return (
                    <div 
                      key={`${weekIndex}-${dayIndex}`} 
                      className="aspect-square rounded-sm tooltip"
                      style={{ 
                        backgroundColor: `rgba(59, 130, 246, ${intensity / 100})`,
                        border: '1px solid rgba(59, 130, 246, 0.1)'
                      }}
                      title={`${day} queries on Day ${dayIndex + 1} of Week ${weekIndex + 1}`}
                    ></div>
                  );
                })
              ))}
            </div>
            <div className="mt-4 flex justify-between items-center text-xs text-slate-500">
              <div>4 weeks ago</div>
              <div className="text-center text-sm text-slate-600 font-medium">
                {widgetData.kgQueryHeatmap.totalQueries.toLocaleString()} total queries
              </div>
              <div>Today</div>
            </div>
            <div className="mt-2 flex justify-center items-center">
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 rounded-sm bg-blue-100 border border-blue-200"></div>
                <div className="w-3 h-3 rounded-sm bg-blue-300 border border-blue-400"></div>
                <div className="w-3 h-3 rounded-sm bg-blue-500 border border-blue-600"></div>
                <div className="w-3 h-3 rounded-sm bg-blue-700 border border-blue-800"></div>
                <span className="text-xs text-slate-500 ml-1">Less → More queries</span>
              </div>
            </div>
          </div>
        </div>

        {/* 8. Relationship Path-Length Distribution */}
        <div className="p-4 bg-white rounded-2xl shadow-sm flex flex-col hover:shadow-md transition-shadow duration-200">
          <h3 className="text-lg font-semibold mb-4 text-slate-900">Relationship Path-Length Distribution</h3>
          <div className="flex-1 flex flex-col justify-center">
            <div className="space-y-4">
              {Object.entries(widgetData.relationshipPathLengths)
                .filter(([key]) => key !== 'total')
                .map(([key, data]) => (
                <div key={key} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-slate-900">
                      {key === 'oneHop' ? '1-Hop (Direct)' : 
                       key === 'twoHop' ? '2-Hop (Indirect)' : 
                       '3-Hop (Extended)'}
                    </span>
                    <span className="text-slate-600">{data.count.toLocaleString()} relationships</span>
                  </div>
                  <div className="h-8 bg-slate-100 rounded-lg overflow-hidden relative">
                    <div 
                      className={`h-full ${
                        key === 'oneHop' ? 'bg-blue-500' : 
                        key === 'twoHop' ? 'bg-purple-500' : 
                        'bg-indigo-500'
                      }`}
                      style={{ width: `${data.percentage}%` }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">
                      {data.percentage}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 text-center text-sm text-slate-600">
              Total: {widgetData.relationshipPathLengths.total.toLocaleString()} active relationships
            </div>
          </div>
        </div>
      </div>

      {/* Forms Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form Categories Card */}
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-medium text-slate-900">Form Categories</h2>
            <Link to="/forms" className="text-sm text-primary hover:text-primary-dark font-medium">
              View All
            </Link>
          </div>
          <div className="space-y-4">
            {formsInsights.categories.map((category, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-900">{category.name}</span>
                  <span className="text-slate-600">
                    {category.converted} of {category.total} forms converted to KG
                  </span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary rounded-full transition-all duration-500"
                    style={{ width: `${(category.converted / category.total) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Form Responses Card */}
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-medium text-slate-900">Form Responses</h2>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600">Last 30 days</span>
            </div>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                <h3 className="text-sm font-medium text-slate-600">Total Responses</h3>
                <div className="mt-2 flex items-end gap-2">
                  <span className="text-2xl font-semibold text-slate-900">
                    {formsInsights.totalResponses.toLocaleString()}
                  </span>
                  <span className="text-sm text-green-600 mb-1">+12%</span>
                </div>
              </div>

              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                <h3 className="text-sm font-medium text-slate-600">Converted to KG</h3>
                <div className="mt-2 flex items-end gap-2">
                  <span className="text-2xl font-semibold text-slate-900">
                    {formsInsights.convertedResponses.toLocaleString()}
                  </span>
                  <span className="text-sm text-green-600 mb-1">
                    {Math.round((formsInsights.convertedResponses / formsInsights.totalResponses) * 100)}%
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <h3 className="text-sm font-medium text-slate-900 mb-3">Conversion Progress</h3>
              <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ 
                    width: `${(formsInsights.convertedResponses / formsInsights.totalResponses) * 100}%` 
                  }}
                />
              </div>
              <div className="mt-2 text-xs text-slate-600">
                {formsInsights.convertedResponses.toLocaleString()} of {formsInsights.totalResponses.toLocaleString()} responses converted
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Platform Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Conversion Progress */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-medium text-slate-900">Conversion Progress</h2>
            <div className="flex items-center gap-2">
              <button className="text-sm text-slate-600 hover:text-slate-900">Last 7 days</button>
              <button className="text-sm font-medium text-primary">Last 30 days</button>
              <button className="text-sm text-slate-600 hover:text-slate-900">Last 90 days</button>
            </div>
          </div>

          <div className="space-y-6">
            {platformProgress.map((platform) => (
              <div key={platform.name} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-900">{platform.name}</span>
                    {platform.errors > 0 && (
                      <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700 rounded-full">
                        {platform.errors} errors
                      </span>
                    )}
                  </div>
                  <span className="text-slate-600">
                    {platform.converted} of {platform.total} tables
                  </span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary rounded-full transition-all duration-500"
                    style={{ width: `${(platform.converted / platform.total) * 100}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>{platform.records.toLocaleString()} records processed</span>
                  <span>{((platform.converted / platform.total) * 100).toFixed(1)}% complete</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <div className="bg-white rounded-lg border border-slate-200 p-6 hover:border-primary transition-colors cursor-pointer">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <Database className="h-5 w-5 text-blue-500" />
              </div>
              <h3 className="text-lg font-medium text-slate-900">Convert Tables</h3>
            </div>
            <p className="text-sm text-slate-600">
              Convert your data tables to knowledge graph format
            </p>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-6 hover:border-primary transition-colors cursor-pointer">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 bg-purple-50 rounded-lg flex items-center justify-center">
                <Settings className="h-5 w-5 text-purple-500" />
              </div>
              <h3 className="text-lg font-medium text-slate-900">Manage Mappings</h3>
            </div>
            <p className="text-sm text-slate-600">
              Update field mappings and relationships
            </p>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-6 hover:border-primary transition-colors cursor-pointer">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 bg-green-50 rounded-lg flex items-center justify-center">
                <Eye className="h-5 w-5 text-green-500" />
              </div>
              <h3 className="text-lg font-medium text-slate-900">View Graph</h3>
            </div>
            <p className="text-sm text-slate-600">
              Explore your knowledge graph visualization
            </p>
          </div>
        </div>
      </div>

      {/* Existing modals */}
      {showOnboarding && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <Onboarding onClose={() => setShowOnboarding(false)} />
          </div>
        </div>
      )}

      <TableMetadataEditor
        isOpen={showTableMetadataEditor}
        onClose={() => {
          setShowTableMetadataEditor(false);
          setSelectedTableForEdit(null);
        }}
        table={selectedTableForEdit}
        onSave={() => {}}
      />
    </div>
  );
};

export default Dashboard;