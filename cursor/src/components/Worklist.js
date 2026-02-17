import React, { useState, useEffect, useMemo } from 'react';
import './Worklist.css';

/**
 * Configurable Worklist Component
 * 
 * @param {Object} config - Configuration object
 * @param {Array} config.columns - Array of column definitions
 * @param {string} config.columns[].key - Unique key for the column
 * @param {string} config.columns[].label - Display label for the column
 * @param {string} config.columns[].dataSource - Database table/view and column (e.g., "users.name" or "orders.total")
 * @param {string} config.columns[].type - Data type: 'string', 'number', 'date', 'boolean'
 * @param {Function} config.columns[].render - Optional custom render function
 * @param {Function} config.dataSource - Function that fetches data based on filters/sorting
 * @param {number} config.pageSize - Number of items per page (default: 10)
 * @param {React.Component} statusLegend - Optional status legend component to display in header
 */
const Worklist = ({ config, statusLegend }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Sorting state
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: 'asc' // 'asc' or 'desc'
  });
  
  // Filtering state - one filter per column
  const [filters, setFilters] = useState({});
  
  // Global search state
  const [globalSearch, setGlobalSearch] = useState('');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = config.pageSize || 10;

  // Extract dataSource and columns from config for dependency tracking
  const { dataSource, columns } = config;

  // Fetch data from data source
  useEffect(() => {
    const fetchData = async () => {
      if (!dataSource) {
        setError('No data source provided');
        return;
      }

      setLoading(true);
      setError(null);
      
      try {
        const result = await dataSource({
          filters,
          sortConfig,
          globalSearch
        });
        setData(result);
      } catch (err) {
        setError(err.message || 'Failed to fetch data');
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dataSource, filters, sortConfig, globalSearch]);

  // Apply client-side filtering and sorting (if data is already fetched)
  // This is useful if the dataSource returns all data and we want client-side filtering
  const processedData = useMemo(() => {
    let result = [...data];

    // Apply global search
    if (globalSearch) {
      const searchLower = globalSearch.toLowerCase();
      result = result.filter(row => {
        return columns.some(column => {
          const value = getNestedValue(row, column.dataSource);
          return value != null && String(value).toLowerCase().includes(searchLower);
        });
      });
    }

    // Apply column filters
    Object.entries(filters).forEach(([columnKey, filterValue]) => {
      if (filterValue) {
        const column = columns.find(col => col.key === columnKey);
        if (column) {
          const filterLower = String(filterValue).toLowerCase();
          result = result.filter(row => {
            const value = getNestedValue(row, column.dataSource);
            return value != null && String(value).toLowerCase().includes(filterLower);
          });
        }
      }
    });

    // Apply sorting
    if (sortConfig.key) {
      const column = columns.find(col => col.key === sortConfig.key);
      if (column) {
        result.sort((a, b) => {
          const aValue = getNestedValue(a, column.dataSource);
          const bValue = getNestedValue(b, column.dataSource);
          
          let comparison = 0;
          
          if (aValue == null && bValue == null) return 0;
          if (aValue == null) return 1;
          if (bValue == null) return -1;
          
          switch (column.type) {
            case 'number':
              comparison = Number(aValue) - Number(bValue);
              break;
            case 'date':
              comparison = new Date(aValue) - new Date(bValue);
              break;
            case 'boolean':
              comparison = (aValue ? 1 : 0) - (bValue ? 1 : 0);
              break;
            default:
              comparison = String(aValue).localeCompare(String(bValue));
          }
          
          return sortConfig.direction === 'asc' ? comparison : -comparison;
        });
      }
    }

    return result;
  }, [data, filters, sortConfig, globalSearch, columns]);

  // Pagination
  const totalPages = Math.ceil(processedData.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedData = processedData.slice(startIndex, startIndex + pageSize);

  // Reset to first page when filters/search change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, globalSearch, sortConfig]);

  // Helper function to get nested values (e.g., "user.name" from object)
  const getNestedValue = (obj, path) => {
    if (!path) return null;
    const keys = path.split('.');
    let value = obj;
    for (const key of keys) {
      if (value == null) return null;
      value = value[key];
    }
    return value;
  };

  // Handle column header click for sorting
  const handleSort = (columnKey) => {
    setSortConfig(prev => {
      if (prev.key === columnKey) {
        // Toggle direction if same column
        return {
          key: columnKey,
          direction: prev.direction === 'asc' ? 'desc' : 'asc'
        };
      } else {
        // New column, default to ascending
        return {
          key: columnKey,
          direction: 'asc'
        };
      }
    });
  };

  // Handle filter change
  const handleFilterChange = (columnKey, value) => {
    setFilters(prev => ({
      ...prev,
      [columnKey]: value
    }));
  };

  // Render cell value
  const renderCell = (row, column) => {
    if (column.render) {
      return column.render(row, getNestedValue(row, column.dataSource));
    }
    
    const value = getNestedValue(row, column.dataSource);
    
    if (value == null) return <span className="null-value">—</span>;
    
    switch (column.type) {
      case 'date':
        return new Date(value).toLocaleDateString();
      case 'boolean':
        return value ? 'Yes' : 'No';
      case 'number':
        return typeof value === 'number' ? value.toLocaleString() : value;
      default:
        return String(value);
    }
  };

  return (
    <div className="worklist-container">
      <div className="worklist-header">
        <h2 className="worklist-title">Worklist</h2>
        
        <div className="worklist-header-right">
          {statusLegend && (
            <div className="worklist-status-legend-inline">
              {statusLegend}
            </div>
          )}
          
          {/* Global Search */}
          <div className="worklist-search">
            <input
              type="text"
              placeholder="Search across all columns..."
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              className="worklist-search-input"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="worklist-error">
          Error: {error}
        </div>
      )}

      {loading ? (
        <div className="worklist-loading">Loading...</div>
      ) : (
        <>
          <div className="worklist-table-wrapper">
            <table className="worklist-table">
              <thead>
                <tr>
                  {columns.map(column => (
                    <th key={column.key} className="worklist-th">
                      <div className="worklist-th-content">
                        <span
                          className="worklist-th-label"
                          onClick={() => column.dataSource && handleSort(column.key)}
                          style={{ cursor: column.dataSource ? 'pointer' : 'default' }}
                        >
                          {column.label}
                          {sortConfig.key === column.key && (
                            <span className="worklist-sort-indicator">
                              {sortConfig.direction === 'asc' ? ' ↑' : ' ↓'}
                            </span>
                          )}
                        </span>
                        {column.dataSource ? (
                          <input
                            type="text"
                            placeholder={`Filter ${column.label}...`}
                            value={filters[column.key] || ''}
                            onChange={(e) => handleFilterChange(column.key, e.target.value)}
                            className="worklist-filter-input"
                            onClick={(e) => e.stopPropagation()}
                          />
                        ) : (
                          <div className="worklist-filter-spacer"></div>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginatedData.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length} className="worklist-empty">
                      No data found
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((row, index) => (
                    <tr key={index} className="worklist-tr">
                      {columns.map(column => (
                        <td key={column.key} className="worklist-td">
                          {renderCell(row, column)}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="worklist-pagination">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="worklist-pagination-btn"
              >
                Previous
              </button>
              <span className="worklist-pagination-info">
                Page {currentPage} of {totalPages} ({processedData.length} total items)
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="worklist-pagination-btn"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Worklist;
