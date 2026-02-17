import React from 'react';
import './App.css';
import Worklist from './components/Worklist';
import { createWorklistDataSource } from './services/worklistDataService';

// Data collection forms
const FORM_NAMES = [
  'Demographics',
  'Surgical History',
  'CMR',
  'CCT',
  'Echo',
  'Cath',
  'Stress Test',
  'Pt. Outcomes'
];

// Form status types
const FORM_STATUS = {
  INCOMPLETE: 'Incomplete',
  UNVERIFIED: 'Unverified',
  COMPLETE: 'Complete'
};

// Helper function to get status color
const getStatusColor = (status) => {
  switch (status) {
    case FORM_STATUS.INCOMPLETE:
      return { bg: '#fee', color: '#c33', border: '#fcc' }; // Red
    case FORM_STATUS.UNVERIFIED:
      return { bg: '#ffebcd', color: '#856404', border: '#ffd700' }; // Yellow
    case FORM_STATUS.COMPLETE:
      return { bg: '#d4edda', color: '#155724', border: '#c3e6cb' }; // Green
    default:
      return { bg: '#f8f9fa', color: '#666', border: '#ddd' };
  }
};

// Forms that can have multiple instances (used by FormStatusTags when Status column is shown)
// eslint-disable-next-line no-unused-vars
const MULTI_INSTANCE_FORMS = ['CCT', 'CMR', 'Cath', 'Echo', 'Stress Test'];

// Helper function to generate random 6-letter string
const generateRandomLetters = () => {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += letters.charAt(Math.floor(Math.random() * letters.length));
  }
  return result;
};

// Helper function to generate FORCE ID in format BCH-XXXXXX-1
const generateForceId = () => {
  const randomLetters = generateRandomLetters();
  return `BCH-${randomLetters}-1`;
};

// Icon components for actions
const ViewIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
    <circle cx="12" cy="12" r="3"></circle>
  </svg>
);

const EditIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
  </svg>
);

// Actions component for each row
const ActionsCell = ({ row }) => {
  const handleView = (e) => {
    e.stopPropagation();
    console.log('View record:', row);
    // Add your view logic here
    alert(`Viewing record: ${row.orderNumber}`);
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    console.log('Edit record:', row);
    // Add your edit logic here
    alert(`Editing record: ${row.orderNumber}`);
  };

  return (
    <div className="actions-cell">
      <button 
        className="action-btn view-btn" 
        onClick={handleView}
        title="View"
        aria-label="View record"
      >
        <ViewIcon />
      </button>
      <button 
        className="action-btn edit-btn" 
        onClick={handleEdit}
        title="Edit"
        aria-label="Edit record"
      >
        <EditIcon />
      </button>
    </div>
  );
};

// Status Legend Component
const StatusLegend = () => {
  const statuses = [
    { label: 'Incomplete', status: FORM_STATUS.INCOMPLETE },
    { label: 'Unverified', status: FORM_STATUS.UNVERIFIED },
    { label: 'Complete', status: FORM_STATUS.COMPLETE }
  ];

  return (
    <div className="status-legend-inline">
      <span className="status-legend-label">Status Legend:</span>
      <div className="status-legend-items">
        {statuses.map(({ label, status }) => {
          const colors = getStatusColor(status);
          return (
            <div key={status} className="status-legend-item">
              <span
                className="status-legend-tag"
                style={{
                  backgroundColor: colors.bg,
                  color: colors.color,
                  borderColor: colors.border
                }}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Helper component to render form status tags (used when Status column is in config)
// eslint-disable-next-line no-unused-vars
const FormStatusTags = ({ formStatuses }) => {
  if (!formStatuses || typeof formStatuses !== 'object') {
    return <span className="null-value">—</span>;
  }

  // Collect all tags (handling both single and multiple instances)
  const tags = FORM_NAMES.flatMap(formName => {
    const status = formStatuses[formName];
    if (!status) return [];
    
    // Handle array of statuses (multiple instances)
    if (Array.isArray(status)) {
      return status.map((statusValue, index) => {
        if (!statusValue) return null;
        const colors = getStatusColor(statusValue);
        const displayName = `${formName}${index + 1}`;
        return {
          key: `${formName}-${index}`,
          displayName,
          statusValue,
          colors
        };
      }).filter(Boolean);
    }
    
    // Handle single status (string)
    const colors = getStatusColor(status);
    return [{
      key: formName,
      displayName: formName,
      statusValue: status,
      colors
    }];
  });

  return (
    <div className="form-status-tags-container">
      {tags.map(tag => (
        <span
          key={tag.key}
          className="form-status-tag"
          style={{
            backgroundColor: tag.colors.bg,
            color: tag.colors.color,
            borderColor: tag.colors.border
          }}
          title={`${tag.displayName}: ${tag.statusValue}`}
        >
          {tag.displayName}
        </span>
      ))}
    </div>
  );
};

// Helper to count statuses from formStatuses (handles single values and arrays)
const countStatuses = (formStatuses) => {
  const counts = {
    [FORM_STATUS.INCOMPLETE]: 0,
    [FORM_STATUS.UNVERIFIED]: 0,
    [FORM_STATUS.COMPLETE]: 0
  };
  if (!formStatuses || typeof formStatuses !== 'object') return counts;

  FORM_NAMES.forEach(formName => {
    const status = formStatuses[formName];
    if (!status) return;
    const statuses = Array.isArray(status) ? status : [status];
    statuses.forEach(s => {
      if (s && counts.hasOwnProperty(s)) counts[s]++;
    });
  });
  return counts;
};

// Helper to get tag display names grouped by status
const getTagsByStatus = (formStatuses) => {
  const byStatus = {
    [FORM_STATUS.INCOMPLETE]: [],
    [FORM_STATUS.UNVERIFIED]: [],
    [FORM_STATUS.COMPLETE]: []
  };
  if (!formStatuses || typeof formStatuses !== 'object') return byStatus;

  FORM_NAMES.forEach(formName => {
    const status = formStatuses[formName];
    if (!status) return;
    if (Array.isArray(status)) {
      status.forEach((s, index) => {
        if (s && byStatus[s]) {
          byStatus[s].push(`${formName}${index + 1}`);
        }
      });
    } else if (byStatus[status]) {
      byStatus[status].push(formName);
    }
  });
  return byStatus;
};

// Dot colors for count circles (red, orange, green)
const COUNT_DOT_COLORS = {
  [FORM_STATUS.INCOMPLETE]: { bg: '#fee', color: '#c33', border: '#fcc' },
  [FORM_STATUS.UNVERIFIED]: { bg: '#ffebcd', color: '#856404', border: '#ffd700' },
  [FORM_STATUS.COMPLETE]: { bg: '#d4edda', color: '#155724', border: '#c3e6cb' }
};

// Component to show 3 colored dots with tag counts; hover reveals specific tags
const TagCountDots = ({ formStatuses }) => {
  const [expandedStatus, setExpandedStatus] = React.useState(null);
  const counts = countStatuses(formStatuses);
  const tagsByStatus = getTagsByStatus(formStatuses);
  const statusOrder = [FORM_STATUS.INCOMPLETE, FORM_STATUS.UNVERIFIED, FORM_STATUS.COMPLETE];

  return (
    <div className="tag-count-dots-wrapper">
      <div className="tag-count-dots">
        {statusOrder.map(status => {
          const colors = COUNT_DOT_COLORS[status];
          const count = counts[status];
          const isExpanded = expandedStatus === status;
          const hasTags = count > 0;
          return (
            <div
              key={status}
              className="tag-count-dot-group"
              onMouseEnter={() => hasTags && setExpandedStatus(status)}
              onMouseLeave={() => setExpandedStatus(null)}
            >
              <span
                className={`tag-count-dot ${isExpanded ? 'tag-count-dot-expanded' : ''} ${!hasTags ? 'tag-count-dot-empty' : ''}`}
                style={{
                  backgroundColor: colors.bg,
                  color: colors.color,
                  borderColor: colors.border
                }}
                title={hasTags ? `Hover to show ${status} tags` : `${status}: ${count}`}
              >
                {count}
              </span>
              {isExpanded && tagsByStatus[status].length > 0 && (
                <div
                  className="tag-count-dots-reveal"
                  style={{
                    borderColor: COUNT_DOT_COLORS[status].border,
                    backgroundColor: COUNT_DOT_COLORS[status].bg
                  }}
                >
                  <div className="tag-count-dots-reveal-title">{status}</div>
                  <ul className="tag-count-dots-reveal-list">
                    {tagsByStatus[status].map(name => (
                      <li key={name}>{name}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Generate FORCE IDs for mock data
const forceIds = Array.from({ length: 10 }, () => generateForceId());

// Example mock data - replace with your actual data source
const mockOrdersData = [
  { 
    id: 1, 
    orderNumber: forceIds[0], 
    customer: { name: 'John Doe', email: 'john@example.com' }, 
    amount: 1250.50, 
    orderDate: '2024-01-15',
    formStatuses: {
      'Demographics': FORM_STATUS.COMPLETE,
      'Surgical History': FORM_STATUS.UNVERIFIED,
      'CMR': [FORM_STATUS.INCOMPLETE, FORM_STATUS.COMPLETE],
      'CCT': FORM_STATUS.COMPLETE,
      'Echo': [FORM_STATUS.INCOMPLETE, FORM_STATUS.UNVERIFIED],
      'Cath': FORM_STATUS.INCOMPLETE,
      'Stress Test': FORM_STATUS.INCOMPLETE,
      'Pt. Outcomes': FORM_STATUS.INCOMPLETE
    }
  },
  { 
    id: 2, 
    orderNumber: forceIds[1], 
    customer: { name: 'Jane Smith', email: 'jane@example.com' }, 
    amount: 850.00, 
    orderDate: '2024-01-14',
    formStatuses: {
      'Demographics': FORM_STATUS.COMPLETE,
      'Surgical History': FORM_STATUS.COMPLETE,
      'CMR': FORM_STATUS.COMPLETE,
      'CCT': [FORM_STATUS.COMPLETE, FORM_STATUS.COMPLETE],
      'Echo': FORM_STATUS.COMPLETE,
      'Cath': [FORM_STATUS.UNVERIFIED, FORM_STATUS.COMPLETE],
      'Stress Test': [FORM_STATUS.COMPLETE, FORM_STATUS.UNVERIFIED],
      'Pt. Outcomes': FORM_STATUS.INCOMPLETE
    }
  },
  { 
    id: 3, 
    orderNumber: forceIds[2], 
    customer: { name: 'Bob Johnson', email: 'bob@example.com' }, 
    amount: 2100.75, 
    orderDate: '2024-01-16',
    formStatuses: {
      'Demographics': FORM_STATUS.INCOMPLETE,
      'Surgical History': FORM_STATUS.INCOMPLETE,
      'CMR': FORM_STATUS.INCOMPLETE,
      'CCT': FORM_STATUS.INCOMPLETE,
      'Echo': FORM_STATUS.INCOMPLETE,
      'Cath': FORM_STATUS.INCOMPLETE,
      'Stress Test': FORM_STATUS.INCOMPLETE,
      'Pt. Outcomes': FORM_STATUS.INCOMPLETE
    }
  },
  { 
    id: 4, 
    orderNumber: forceIds[3], 
    customer: { name: 'Alice Williams', email: 'alice@example.com' }, 
    amount: 450.25, 
    orderDate: '2024-01-13',
    formStatuses: {
      'Demographics': FORM_STATUS.COMPLETE,
      'Surgical History': FORM_STATUS.UNVERIFIED,
      'CMR': [FORM_STATUS.UNVERIFIED, FORM_STATUS.COMPLETE, FORM_STATUS.INCOMPLETE],
      'CCT': FORM_STATUS.COMPLETE,
      'Echo': FORM_STATUS.INCOMPLETE,
      'Cath': [FORM_STATUS.COMPLETE, FORM_STATUS.UNVERIFIED],
      'Stress Test': FORM_STATUS.INCOMPLETE,
      'Pt. Outcomes': FORM_STATUS.UNVERIFIED
    }
  },
  { 
    id: 5, 
    orderNumber: forceIds[4], 
    customer: { name: 'Charlie Brown', email: 'charlie@example.com' }, 
    amount: 3200.00, 
    orderDate: '2024-01-12',
    formStatuses: {
      'Demographics': FORM_STATUS.COMPLETE,
      'Surgical History': FORM_STATUS.COMPLETE,
      'CMR': FORM_STATUS.COMPLETE,
      'CCT': FORM_STATUS.COMPLETE,
      'Echo': FORM_STATUS.COMPLETE,
      'Cath': FORM_STATUS.COMPLETE,
      'Stress Test': FORM_STATUS.COMPLETE,
      'Pt. Outcomes': FORM_STATUS.COMPLETE
    }
  },
  { 
    id: 6, 
    orderNumber: forceIds[5], 
    customer: { name: 'Diana Prince', email: 'diana@example.com' }, 
    amount: 675.50, 
    orderDate: '2024-01-17',
    formStatuses: {
      'Demographics': FORM_STATUS.UNVERIFIED,
      'Surgical History': FORM_STATUS.INCOMPLETE,
      'CMR': FORM_STATUS.INCOMPLETE,
      'CCT': [FORM_STATUS.UNVERIFIED, FORM_STATUS.INCOMPLETE],
      'Echo': [FORM_STATUS.INCOMPLETE, FORM_STATUS.COMPLETE, FORM_STATUS.UNVERIFIED],
      'Cath': FORM_STATUS.INCOMPLETE,
      'Stress Test': [FORM_STATUS.INCOMPLETE, FORM_STATUS.COMPLETE],
      'Pt. Outcomes': FORM_STATUS.INCOMPLETE
    }
  },
  { 
    id: 7, 
    orderNumber: forceIds[6], 
    customer: { name: 'Edward Norton', email: 'edward@example.com' }, 
    amount: 1890.25, 
    orderDate: '2024-01-11',
    formStatuses: {
      'Demographics': FORM_STATUS.COMPLETE,
      'Surgical History': FORM_STATUS.COMPLETE,
      'CMR': [FORM_STATUS.UNVERIFIED, FORM_STATUS.COMPLETE],
      'CCT': FORM_STATUS.COMPLETE,
      'Echo': [FORM_STATUS.COMPLETE, FORM_STATUS.UNVERIFIED],
      'Cath': [FORM_STATUS.UNVERIFIED, FORM_STATUS.COMPLETE, FORM_STATUS.INCOMPLETE],
      'Stress Test': FORM_STATUS.COMPLETE,
      'Pt. Outcomes': FORM_STATUS.UNVERIFIED
    }
  },
  { 
    id: 8, 
    orderNumber: forceIds[7], 
    customer: { name: 'Fiona Apple', email: 'fiona@example.com' }, 
    amount: 950.00, 
    orderDate: '2024-01-10',
    formStatuses: {
      'Demographics': FORM_STATUS.COMPLETE,
      'Surgical History': FORM_STATUS.COMPLETE,
      'CMR': FORM_STATUS.COMPLETE,
      'CCT': FORM_STATUS.COMPLETE,
      'Echo': FORM_STATUS.COMPLETE,
      'Cath': FORM_STATUS.COMPLETE,
      'Stress Test': FORM_STATUS.COMPLETE,
      'Pt. Outcomes': FORM_STATUS.COMPLETE
    }
  },
  { 
    id: 9, 
    orderNumber: forceIds[8], 
    customer: { name: 'George Lucas', email: 'george@example.com' }, 
    amount: 2750.00, 
    orderDate: '2024-01-18',
    formStatuses: {
      'Demographics': FORM_STATUS.INCOMPLETE,
      'Surgical History': FORM_STATUS.INCOMPLETE,
      'CMR': FORM_STATUS.INCOMPLETE,
      'CCT': FORM_STATUS.INCOMPLETE,
      'Echo': FORM_STATUS.INCOMPLETE,
      'Cath': FORM_STATUS.INCOMPLETE,
      'Stress Test': FORM_STATUS.INCOMPLETE,
      'Pt. Outcomes': FORM_STATUS.INCOMPLETE
    }
  },
  { 
    id: 10, 
    orderNumber: forceIds[9], 
    customer: { name: 'Helen Mirren', email: 'helen@example.com' }, 
    amount: 1125.75, 
    orderDate: '2024-01-09',
    formStatuses: {
      'Demographics': FORM_STATUS.COMPLETE,
      'Surgical History': FORM_STATUS.COMPLETE,
      'CMR': FORM_STATUS.UNVERIFIED,
      'CCT': [FORM_STATUS.UNVERIFIED, FORM_STATUS.COMPLETE],
      'Echo': FORM_STATUS.COMPLETE,
      'Cath': [FORM_STATUS.INCOMPLETE, FORM_STATUS.UNVERIFIED],
      'Stress Test': [FORM_STATUS.COMPLETE, FORM_STATUS.COMPLETE, FORM_STATUS.UNVERIFIED],
      'Pt. Outcomes': FORM_STATUS.UNVERIFIED
    }
  },
];

// Example configuration for Orders worklist
const ordersWorklistConfig = {
  columns: [
    {
      key: 'actions',
      label: 'Actions',
      dataSource: null, // Not used for actions column
      type: 'string',
      render: (row) => <ActionsCell row={row} />
    },
    {
      key: 'orderNumber',
      label: 'FORCE ID',
      dataSource: 'orderNumber', // Direct property
      type: 'string'
    },
    {
      key: 'tagCounts',
      label: 'Tag Counts',
      dataSource: 'formStatuses',
      type: 'object',
      render: (row, value) => <TagCountDots formStatuses={value} />
    },
    {
      key: 'orderDate',
      label: 'Last Updated',
      dataSource: 'orderDate',
      type: 'date'
    }
  ],
  dataSource: createWorklistDataSource({
    mockData: mockOrdersData,
    // For real database usage, uncomment and configure:
    // tableName: 'orders',
    // columnMappings: {
    //   orderNumber: 'orders.order_number',
    //   customerName: 'customers.name',
    //   customerEmail: 'customers.email',
    //   amount: 'orders.amount',
    //   status: 'orders.status',
    //   orderDate: 'orders.order_date'
    // }
  }),
  pageSize: 10
};

function App() {
  return (
    <div className="App">
      <Worklist config={ordersWorklistConfig} statusLegend={<StatusLegend />} />
    </div>
  );
}

export default App;
