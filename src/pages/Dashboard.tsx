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
    // Contextualisation Coverage Gauge
    contextualisationCoverage: 67, // (624 + 1234 + 100) / (1000 + 12230 + 100) * 100
    
    // KG Conversion Rate
    kgConversionRate: 58, // Average of all conversion rates
    
    // Daily Contextualisations (30-day sparkline)
    dailyContextualisations: [
      12, 15, 8, 22, 18, 25, 14, 19, 23, 16,
      20, 17, 24, 13, 21, 26, 18, 15, 19, 22,
      16, 28, 24, 20, 17, 23, 19, 25, 21, 18
    ],
    
    // Top 10 Metadata-Hungry Entities
    metadataHungryEntities: [
      { name: 'WORK_ORDERS', type: 'Table', usage: 15000, completion: 25 },
      { name: 'ASSET_STATUS', type: 'Field', usage: 12000, completion: 30 },
      { name: 'EQUIPMENT_TYPE', type: 'Field', usage: 10500, completion: 35 },
      { name: 'MAINTENANCE_LOG', type: 'Table', usage: 9800, completion: 20 },
      { name: 'LOCATION_CODE', type: 'Field', usage: 8900, completion: 40 },
      { name: 'INVENTORY', type: 'Table', usage: 8200, completion: 45 },
      { name: 'PRIORITY_LEVEL', type: 'Field', usage: 7500, completion: 25 },
      { name: 'SUPPLIER_INFO', type: 'Table', usage: 7100, completion: 30 },
      { name: 'COST_CENTER', type: 'Field', usage: 6800, completion: 35 },
      { name: 'SAFETY_NOTES', type: 'Field', usage: 6200, completion: 20 }
    ],
    
    // Relationship Adoption Breakdown
    relationshipAdoption: [
      { label: 'Existing', value: 45, color: '#3B82F6' },
      { label: 'Inverse', value: 25, color: '#10B981' },
      { label: 'Indirect', value: 20, color: '#F59E0B' },
      { label: 'Self', value: 10, color: '#8B5CF6' }
    ],
    
    // Active Users Leaderboard
    topContextualisers: [
      { rank: 1, name: 'Sarah Chen', avatar: 'SC', edits: 47 },
      { rank: 2, name: 'Mike Rodriguez', avatar: 'MR', edits: 42 },
      { rank: 3, name: 'Emily Johnson', avatar: 'EJ', edits: 38 },
      { rank: 4, name: 'David Kim', avatar: 'DK', edits: 35 },
      { rank: 5, name: 'Lisa Wang', avatar: 'LW', edits: 31 }
    ]
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
        {/* Contextualisation Coverage Gauge */}
        <div className="p-4 bg-white rounded-2xl shadow-sm flex flex-col hover:shadow-md transition-shadow duration-200">
          <h3 className="text-lg font-semibold mb-4 text-slate-900">Overall Contextualisation Coverage</h3>
          <div className="flex-1 flex items-center justify-center">
            <RadialGauge 
              value={widgetData.contextualisationCoverage}
              label=""
              className="tooltip"
              title="Percentage of all entities (tables, fields, relationships) that have at least one description or alias."
            />
          </div>
        </div>

        {/* KG Conversion Rate Meter */}
        <div className="p-4 bg-white rounded-2xl shadow-sm flex flex-col hover:shadow-md transition-shadow duration-200">
          <h3 className="text-lg font-semibold mb-4 text-slate-900">KG Conversion Rate</h3>
          <div className="flex-1 flex items-center">
            <ProgressBar 
              value={widgetData.kgConversionRate}
              label=""
              className="tooltip"
              title="Of all fully-contextualised entities, how many have been published into the live Knowledge Graph."
            />
          </div>
        </div>

        {/* Contextualisation Velocity Sparkline */}
        <div className="p-4 bg-white rounded-2xl shadow-sm flex flex-col hover:shadow-md transition-shadow duration-200">
          <h3 className="text-lg font-semibold mb-4 text-slate-900">Daily Contextualisations (30-day)</h3>
          <div className="flex-1 flex items-center">
            <SparklineChart 
              data={widgetData.dailyContextualisations}
              className="w-full tooltip"
              color="#3B82F6"
              title="Daily contextualisation activity over the past 30 days"
            />
          </div>
          <div className="mt-2 text-sm text-slate-600 text-center">
            Avg: {Math.round(widgetData.dailyContextualisations.reduce((a, b) => a + b, 0) / widgetData.dailyContextualisations.length)} edits/day
          </div>
        </div>

        {/* Top 10 Metadata-Hungry Entities */}
        <div className="p-4 bg-white rounded-2xl shadow-sm flex flex-col hover:shadow-md transition-shadow duration-200">
          <h3 className="text-lg font-semibold mb-4 text-slate-900">Top Metadata-Hungry Entities</h3>
          <div className="flex-1 overflow-hidden">
            <div className="max-h-64 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-white">
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-2 text-slate-600 font-medium">Entity</th>
                    <th className="text-left py-2 text-slate-600 font-medium">Type</th>
                    <th className="text-right py-2 text-slate-600 font-medium">Usage</th>
                    <th className="text-right py-2 text-slate-600 font-medium">Complete</th>
                    <th className="text-center py-2 text-slate-600 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {widgetData.metadataHungryEntities.map((entity, index) => (
                    <tr 
                      key={index} 
                      className={`${index % 2 === 0 ? 'bg-slate-50' : 'bg-white'} hover:bg-blue-50 transition-colors duration-150`}
                    >
                      <td className="py-2 font-medium text-slate-900 truncate">{entity.name}</td>
                      <td className="py-2 text-slate-600">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          entity.type === 'Table' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                        }`}>
                          {entity.type}
                        </span>
                      </td>
                      <td className="py-2 text-right text-slate-600">{entity.usage.toLocaleString()}</td>
                      <td className="py-2 text-right">
                        <span className={`font-medium ${
                          entity.completion < 30 ? 'text-red-600' : 
                          entity.completion < 60 ? 'text-yellow-600' : 'text-green-600'
                        }`}>
                          {entity.completion}%
                        </span>
                      </td>
                      <td className="py-2 text-center">
                        <button 
                          className="px-2 py-1 text-xs bg-primary text-white rounded hover:bg-primary-dark transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-primary/30"
                          onClick={() => {/* Navigate to contextualise */}}
                          aria-label={`Contextualise ${entity.name}`}
                        >
                          Go
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Relationship Adoption Breakdown */}
        <div className="p-4 bg-white rounded-2xl shadow-sm flex flex-col hover:shadow-md transition-shadow duration-200">
          <h3 className="text-lg font-semibold mb-4 text-slate-900">Advanced Relationship Adoption</h3>
          <div className="flex-1 flex items-center justify-center">
            <DonutChart 
              data={widgetData.relationshipAdoption}
              className="tooltip"
              title="Breakdown of relationship types by contextualisation percentage"
            />
          </div>
        </div>

        {/* Active Users Leaderboard */}
        <div className="p-4 bg-white rounded-2xl shadow-sm flex flex-col hover:shadow-md transition-shadow duration-200">
          <h3 className="text-lg font-semibold mb-4 text-slate-900">Top Contextualisers (This Week)</h3>
          <div className="flex-1 space-y-3">
            {widgetData.topContextualisers.map((user) => (
              <div 
                key={user.rank} 
                className={`flex items-center gap-3 p-2 rounded-lg transition-all duration-200 hover:bg-slate-50 hover:transform hover:-translate-y-0.5 ${
                  user.rank === 1 ? 'bg-yellow-50 border border-yellow-200' : ''
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-bold w-6 text-center ${
                    user.rank === 1 ? 'text-yellow-600' : 'text-slate-600'
                  }`}>
                    {user.rank === 1 ? '🏆' : user.rank}
                  </span>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium text-white ${
                    user.rank === 1 ? 'bg-yellow-500' : 'bg-primary'
                  }`}>
                    {user.avatar}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-slate-900 truncate">{user.name}</div>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-bold ${
                    user.rank === 1 ? 'text-yellow-600' : 'text-slate-900'
                  }`}>
                    {user.edits}
                  </div>
                  <div className="text-xs text-slate-500">edits</div>
                </div>
              </div>
            ))}
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
        mode={selectedTableForEdit ? 'edit' : 'add'}
      />
    </div>
  );
};

export default Dashboard;