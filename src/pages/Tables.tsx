import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTableStore } from '../hooks/useTableStore';
import { 
  Plus, Search, Filter, Download, RefreshCw, Edit, 
  Eye, Database, Check, AlertCircle,
  ArrowDownUp, Info, X, ChevronDown 
} from 'lucide-react';
import { TableMetadataEditor } from '../components/modals/TableMetadataEditor';
import { ConversionModal } from '../components/modals/ConversionModal';
import BulkTableEditor from '../components/modals/BulkTableEditor';
import { Button, Input, Select, Badge, Card } from '../components/ui';
import { TableData } from '../types';
import { cn } from '../utils/cn';

const Tables: React.FC = () => {
  const { tables, selectedTables, toggleTableSelection, setSelectedTables, updateTable } = useTableStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSource, setFilterSource] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortField, setSortField] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTableForEdit, setSelectedTableForEdit] = useState<TableData | null>(null);
  const [showConversionModal, setShowConversionModal] = useState(false);
  const [showBulkEditor, setShowBulkEditor] = useState(false);
  const [showSourceDropdown, setShowSourceDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const itemsPerPage = 10;

  // Filter and sort tables
  const filteredTables = tables.filter(table => {
    const matchesSearch = 
      table.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (table.alternateNames || []).some(name => name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (table.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSource = filterSource === 'all' || table.source === filterSource;
    const matchesStatus = filterStatus === 'all' || table.kgStatus === filterStatus;
    return matchesSearch && matchesSource && matchesStatus;
  }).sort((a, b) => {
    if (sortField === 'name') {
      return sortDirection === 'asc' 
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    } else if (sortField === 'records') {
      return sortDirection === 'asc' 
        ? (a.records || 0) - (b.records || 0)
        : (b.records || 0) - (a.records || 0);
    }
    return 0;
  });

  const totalPages = Math.ceil(filteredTables.length / itemsPerPage);
  const paginatedTables = filteredTables.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const sources = [
    { value: 'all', label: 'All Sources' },
    { value: 'Innovapptive', label: 'Innovapptive' },
    { value: 'SAP', label: 'SAP' },
    { value: 'Maximo', label: 'Maximo' },
    { value: 'AVEVA', label: 'AVEVA PI' },
    { value: 'GE', label: 'GE Proficy' }
  ];

  const statuses = [
    { value: 'all', label: 'All Statuses' },
    { value: 'mapped', label: 'Added to KG' },
    { value: 'partially_mapped', label: 'Partially Added' },
    { value: 'pending', label: 'Not Added' },
    { value: 'error', label: 'Error' }
  ];

  const toggleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleEditMetadata = (table: TableData) => {
    setSelectedTableForEdit(table);
  };

  const handleMetadataUpdate = (tableId: string, updates: Partial<TableData>) => {
    updateTable(tableId, updates);
    setSelectedTableForEdit(null);
  };

  const handleBulkEdit = () => {
    setShowBulkEditor(true);
  };

  const handleBulkUpdate = (updates: Partial<TableData>[]) => {
    updates.forEach(update => {
      if (update.id) {
        updateTable(update.id, update);
      }
    });
    setShowBulkEditor(false);
  };

  const handleConvertSelected = () => {
    setShowConversionModal(true);
  };

  const getStatusBadge = (status: string, table: TableData) => {
    switch (status) {
      case 'mapped':
        return (
          <Badge variant="success" icon={<Check size={12} />}>
            Added to KG
          </Badge>
        );
      case 'partially_mapped':
        return (
          <Badge variant="warning" icon={<Info size={12} />}>
            Partially Added ({table.kgRecords?.toLocaleString() ?? 0} of {table.records?.toLocaleString() ?? 0})
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="warning" icon={<Info size={12} />}>
            Not Added
          </Badge>
        );
      case 'error':
        return (
          <Badge variant="error" icon={<AlertCircle size={12} />}>
            Error
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Tables</h1>
          <p className="mt-1 text-sm text-slate-600">
            Manage table metadata and knowledge graph conversion settings
          </p>
        </div>
        <div className="flex items-center gap-2">
          {selectedTables.length > 0 && (
            <Button
              variant="secondary"
              icon={<Edit size={16} />}
              onClick={handleBulkEdit}
            >
              Bulk Edit ({selectedTables.length})
            </Button>
          )}
          <Button
            variant="primary"
            icon={<Plus size={16} />}
            disabled={selectedTables.length === 0}
            onClick={handleConvertSelected}
          >
            Convert Selected ({selectedTables.length})
          </Button>
        </div>
      </div>

      {/* Search and filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md leading-5 bg-white placeholder-slate-500 focus:outline-none focus:placeholder-slate-400 focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm"
            placeholder="Search tables by name, description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Source Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowSourceDropdown(!showSourceDropdown);
              setShowStatusDropdown(false);
            }}
            className="inline-flex items-center justify-between w-48 px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <span>{sources.find(s => s.value === filterSource)?.label}</span>
            <ChevronDown size={16} className="ml-2 text-slate-400" />
          </button>
          
          {showSourceDropdown && (
            <div className="absolute z-10 w-48 mt-1 bg-white rounded-md shadow-lg border border-slate-200">
              <div className="py-1">
                {sources.map((source) => (
                  <button
                    key={source.value}
                    onClick={() => {
                      setFilterSource(source.value);
                      setShowSourceDropdown(false);
                    }}
                    className={cn(
                      "block w-full px-4 py-2 text-sm text-left hover:bg-slate-50",
                      filterSource === source.value ? "text-primary font-medium" : "text-slate-700"
                    )}
                  >
                    {source.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Status Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowStatusDropdown(!showStatusDropdown);
              setShowSourceDropdown(false);
            }}
            className="inline-flex items-center justify-between w-48 px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <span>{statuses.find(s => s.value === filterStatus)?.label}</span>
            <ChevronDown size={16} className="ml-2 text-slate-400" />
          </button>
          
          {showStatusDropdown && (
            <div className="absolute z-10 w-48 mt-1 bg-white rounded-md shadow-lg border border-slate-200">
              <div className="py-1">
                {statuses.map((status) => (
                  <button
                    key={status.value}
                    onClick={() => {
                      setFilterStatus(status.value);
                      setShowStatusDropdown(false);
                    }}
                    className={cn(
                      "block w-full px-4 py-2 text-sm text-left hover:bg-slate-50",
                      filterStatus === status.value ? "text-primary font-medium" : "text-slate-700"
                    )}
                  >
                    {status.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tables List */}
      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="w-12 px-3 py-3">
                  <input
                    type="checkbox"
                    className="rounded border-slate-300 text-primary focus:ring-primary"
                    checked={selectedTables.length === filteredTables.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedTables(filteredTables.map(t => t.id));
                      } else {
                        setSelectedTables([]);
                      }
                    }}
                  />
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  <button 
                    className="flex items-center gap-1 hover:text-slate-700"
                    onClick={() => toggleSort('name')}
                  >
                    Table Name {sortField === 'name' && <ArrowDownUp size={14} />}
                  </button>
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Alternative Names
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Source
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Fields
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  <button 
                    className="flex items-center gap-1 hover:text-slate-700"
                    onClick={() => toggleSort('records')}
                  >
                    Records {sortField === 'records' && <ArrowDownUp size={14} />}
                  </button>
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  KG Status
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {paginatedTables.map((table) => (
                <tr key={table.id} className="hover:bg-slate-50">
                  <td className="px-3 py-4">
                    <input
                      type="checkbox"
                      className="rounded border-slate-300 text-primary focus:ring-primary"
                      checked={selectedTables.includes(table.id)}
                      onChange={() => toggleTableSelection(table.id)}
                    />
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-sm font-medium text-slate-900">
                      {table.name}
                    </div>
                    {table.description && (
                      <div className="text-xs text-slate-500 mt-1">
                        {table.description}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-1">
                      {table.alternateNames?.map((name, index) => (
                        <Badge key={index} variant="default">
                          {name}
                        </Badge>
                      )) || (
                        <span className="text-sm text-slate-400 italic">
                          Not set
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1.5 text-sm text-slate-600">
                      <Database size={14} />
                      {table.source}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-slate-600">
                    {table.fields}
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-sm text-slate-600">
                      {table.records?.toLocaleString() ?? 0}
                    </div>
                    {(table.kgStatus === 'mapped' || table.kgStatus === 'partially_mapped') && table.kgRecords && (
                      <div className="text-xs text-green-600 mt-0.5">
                        {table.kgRecords?.toLocaleString() ?? 0} in KG
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    {getStatusBadge(table.kgStatus, table)}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1">
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={<Edit size={16} />}
                        onClick={() => handleEditMetadata(table)}
                        title="Edit Metadata"
                      />
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={<Eye size={16} />}
                        title="Preview Records"
                      />
                      {table.kgStatus !== 'mapped' && (
                        <Button
                          variant="secondary"
                          size="sm"
                          icon={<RefreshCw size={16} />}
                          onClick={() => {
                            setSelectedTables([table.id]);
                            handleConvertSelected();
                          }}
                          title="Convert to Knowledge Graph"
                        />
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <Card.Footer className="flex items-center justify-between">
            <div className="text-sm text-slate-700">
              Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredTables.length)}</span> of <span className="font-medium">{filteredTables.length}</span> results
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                Previous
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={page === currentPage ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Button>
              ))}
              <Button
                variant="secondary"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                Next
              </Button>
            </div>
          </Card.Footer>
        )}
      </Card>

      {/* Table Metadata Editor Modal */}
      {selectedTableForEdit && (
        <TableMetadataEditor
          isOpen={!!selectedTableForEdit}
          onClose={() => setSelectedTableForEdit(null)}
          table={selectedTableForEdit}
          onSave={(updates) => handleMetadataUpdate(selectedTableForEdit.id, updates)}
        />
      )}

      {/* Bulk Table Editor Modal */}
      <BulkTableEditor
        isOpen={showBulkEditor}
        onClose={() => setShowBulkEditor(false)}
        tables={tables.filter(table => selectedTables.includes(table.id))}
        onSave={handleBulkUpdate}
      />

      {/* Conversion Modal */}
      {showConversionModal && (
        <ConversionModal
          isOpen={showConversionModal}
          onClose={() => setShowConversionModal(false)}
          tables={tables.filter(table => selectedTables.includes(table.id))}
        />
      )}
    </div>
  );
};

export default Tables;