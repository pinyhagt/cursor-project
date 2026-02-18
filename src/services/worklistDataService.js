/**
 * Worklist Data Service
 * 
 * This service provides a flexible interface for fetching data from various sources.
 * You can customize this to work with your specific database/API setup.
 * 
 * Example implementations for different scenarios:
 * - Direct database queries (SQL)
 * - REST API calls
 * - GraphQL queries
 * - Mock data for development
 */

/**
 * Generic data source function that can be customized for your use case
 * 
 * @param {Object} params - Query parameters
 * @param {Object} params.filters - Column-specific filters { columnKey: filterValue }
 * @param {Object} params.sortConfig - Sorting configuration { key: columnKey, direction: 'asc'|'desc' }
 * @param {string} params.globalSearch - Global search term
 * @returns {Promise<Array>} Array of data objects
 */
export const createWorklistDataSource = (options = {}) => {
  const {
    // Data fetching function - customize this based on your backend
    fetchFunction,
    // Table/view name for SQL queries
    tableName,
    // Column mappings: { displayKey: 'database.column' }
    columnMappings,
    // Mock data for development/testing
    mockData
  } = options;

  return async ({ filters, sortConfig, globalSearch }) => {
    // If mock data is provided, use it for development
    if (mockData) {
      return filterAndSortMockData(mockData, filters, sortConfig, globalSearch, columnMappings);
    }

    // If custom fetch function is provided, use it
    if (fetchFunction) {
      return await fetchFunction({ filters, sortConfig, globalSearch });
    }

    // Example: SQL-based data source
    if (tableName) {
      return await fetchFromDatabase(tableName, filters, sortConfig, globalSearch, columnMappings);
    }

    throw new Error('No data source configured. Provide either mockData, fetchFunction, or tableName.');
  };
};

/**
 * Filter and sort mock data (for development/testing)
 */
const filterAndSortMockData = (data, filters, sortConfig, globalSearch, columnMappings) => {
  let result = [...data];

  // Apply global search
  if (globalSearch) {
    const searchLower = globalSearch.toLowerCase();
    result = result.filter(row => {
      return Object.values(columnMappings || {}).some(dataPath => {
        const value = getNestedValue(row, dataPath);
        return value != null && String(value).toLowerCase().includes(searchLower);
      });
    });
  }

  // Apply column filters
  if (filters && Object.keys(filters).length > 0) {
    Object.entries(filters).forEach(([columnKey, filterValue]) => {
      if (filterValue && columnMappings && columnMappings[columnKey]) {
        const dataPath = columnMappings[columnKey];
        const filterLower = String(filterValue).toLowerCase();
        result = result.filter(row => {
          const value = getNestedValue(row, dataPath);
          return value != null && String(value).toLowerCase().includes(filterLower);
        });
      }
    });
  }

  // Apply sorting
  if (sortConfig && sortConfig.key && columnMappings && columnMappings[sortConfig.key]) {
    const dataPath = columnMappings[sortConfig.key];
    result.sort((a, b) => {
      const aValue = getNestedValue(a, dataPath);
      const bValue = getNestedValue(b, dataPath);
      
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return 1;
      if (bValue == null) return -1;
      
      let comparison = String(aValue).localeCompare(String(bValue));
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        comparison = aValue - bValue;
      }
      
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });
  }

  return result;
};

/**
 * Fetch data from database (example implementation)
 * This is a placeholder - customize based on your database setup
 */
const fetchFromDatabase = async (tableName, filters, sortConfig, globalSearch, columnMappings) => {
  // TODO: Implement actual database query
  // Example SQL query structure:
  /*
  let query = `SELECT * FROM ${tableName} WHERE 1=1`;
  const params = [];
  
  // Add global search
  if (globalSearch) {
    const searchColumns = Object.values(columnMappings).map(m => m.split('.')[1]);
    query += ` AND (${searchColumns.map(col => `${col} LIKE ?`).join(' OR ')})`;
    params.push(`%${globalSearch}%`);
  }
  
  // Add column filters
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value && columnMappings[key]) {
        const column = columnMappings[key].split('.')[1];
        query += ` AND ${column} LIKE ?`;
        params.push(`%${value}%`);
      }
    });
  }
  
  // Add sorting
  if (sortConfig && sortConfig.key && columnMappings[sortConfig.key]) {
    const column = columnMappings[sortConfig.key].split('.')[1];
    query += ` ORDER BY ${column} ${sortConfig.direction.toUpperCase()}`;
  }
  
  // Execute query using your database client
  // return await db.query(query, params);
  */
  
  throw new Error('Database fetching not implemented. Use mockData or provide a custom fetchFunction.');
};

/**
 * Helper to get nested object values
 */
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

/**
 * Example: REST API data source
 */
export const createApiDataSource = (apiEndpoint) => {
  return async ({ filters, sortConfig, globalSearch }) => {
    const params = new URLSearchParams();
    
    if (globalSearch) {
      params.append('search', globalSearch);
    }
    
    if (sortConfig && sortConfig.key) {
      params.append('sortBy', sortConfig.key);
      params.append('sortOrder', sortConfig.direction);
    }
    
    Object.entries(filters || {}).forEach(([key, value]) => {
      if (value) {
        params.append(`filter[${key}]`, value);
      }
    });
    
    const response = await fetch(`${apiEndpoint}?${params.toString()}`);
    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }
    
    return await response.json();
  };
};
