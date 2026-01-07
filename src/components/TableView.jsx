import { useMemo, useState } from 'react'
import DataTable from 'react-data-table-component'
import './TableView.css'

function TableView({ data }) {
  const [planNameFilter, setPlanNameFilter] = useState('')
  const [taskNameFilter, setTaskNameFilter] = useState('')
  const [jobNameFilter, setJobNameFilter] = useState('')

  // Helper function to find the deepest job in the hierarchy
  const findJobs = (item, taskName = '', taskType = '', taskWorkspace = '', taskDesc = '') => {
    const results = []
    
    // If this is a JOB type, add it to results
    if (item.type === 'JOB') {
      results.push({
        taskName: taskName || item.name,
        taskType: taskType || item.type,
        taskWorkspace: taskWorkspace || item.workspace || '',
        taskDesc: taskDesc || item.description || '',
        jobName: item.name,
        jobType: item.type,
        jobWorkspace: item.workspace || '',
        jobDesc: item.description || '',
      })
    } else if (item.children && item.children.length > 0) {
      // If not a job, recursively process children
      const currentTaskName = (item.type === 'CYCLE' || item.type === 'PROCESS') ? item.name : taskName
      const currentTaskType = (item.type === 'CYCLE' || item.type === 'PROCESS') ? item.type : taskType
      const currentTaskWorkspace = (item.type === 'CYCLE' || item.type === 'PROCESS') ? (item.workspace || '') : taskWorkspace
      const currentTaskDesc = (item.type === 'CYCLE' || item.type === 'PROCESS') ? (item.description || '') : taskDesc
      
      item.children.forEach((child) => {
        results.push(...findJobs(child, currentTaskName, currentTaskType, currentTaskWorkspace, currentTaskDesc))
      })
    }
    
    return results
  }

  // Flatten data to show plan -> task -> job paths
  const flattenData = useMemo(() => {
    const result = []
    
    data.forEach((plan) => {
      const planName = plan.name
      const planType = plan.type
      const planWorkspace = plan.workspace || ''
      const planDesc = plan.description || ''
      
      // If plan has no children, add a row with just the plan
      if (!plan.children || plan.children.length === 0) {
        result.push({
          planName,
          planType,
          planWorkspace,
          planDesc,
          taskName: '',
          taskType: '',
          taskWorkspace: '',
          taskDesc: '',
          jobName: '',
          jobType: '',
          jobWorkspace: '',
          jobDesc: '',
          id: `plan-${planName}`,
        })
      } else {
        // Find all jobs in the hierarchy
        plan.children.forEach((child) => {
          const jobs = findJobs(child)
          if (jobs.length === 0) {
            // No jobs found, add row with plan and task
            result.push({
              planName,
              planType,
              planWorkspace,
              planDesc,
              taskName: child.name,
              taskType: child.type,
              taskWorkspace: child.workspace || '',
              taskDesc: child.description || '',
              jobName: '',
              jobType: '',
              jobWorkspace: '',
              jobDesc: '',
              id: `plan-${planName}-task-${child.name}`,
            })
          } else {
            // Add a row for each job
            jobs.forEach((job) => {
              result.push({
                planName,
                planType,
                planWorkspace,
                planDesc,
                taskName: job.taskName,
                taskType: job.taskType,
                taskWorkspace: job.taskWorkspace,
                taskDesc: job.taskDesc,
                jobName: job.jobName,
                jobType: job.jobType,
                jobWorkspace: job.jobWorkspace,
                jobDesc: job.jobDesc,
                id: `plan-${planName}-task-${job.taskName}-job-${job.jobName}`,
              })
            })
          }
        })
      }
    })
    
    return result
  }, [data])

  // Filter data based on column filters
  const filteredData = useMemo(() => {
    return flattenData.filter((row) => {
      const planMatch = !planNameFilter || 
        row.planName.toLowerCase().includes(planNameFilter.toLowerCase()) ||
        row.planDesc.toLowerCase().includes(planNameFilter.toLowerCase())
      
      const taskMatch = !taskNameFilter || 
        (row.taskName && row.taskName.toLowerCase().includes(taskNameFilter.toLowerCase())) ||
        (row.taskDesc && row.taskDesc.toLowerCase().includes(taskNameFilter.toLowerCase()))
      
      const jobMatch = !jobNameFilter || 
        (row.jobName && row.jobName.toLowerCase().includes(jobNameFilter.toLowerCase())) ||
        (row.jobDesc && row.jobDesc.toLowerCase().includes(jobNameFilter.toLowerCase()))
      
      return planMatch && taskMatch && jobMatch
    })
  }, [flattenData, planNameFilter, taskNameFilter, jobNameFilter])

  const columns = [
    {
      name: 'Plan Name',
      selector: (row) => row.planName,
      sortable: true,
      cell: (row) => (
        <div>
          <strong>{row.planName || '-'}</strong>
          {row.planDesc && (
            <div className="cell-desc">{row.planDesc}</div>
          )}
        </div>
      ),
      minWidth: '200px',
    },
    {
      name: 'Task Name',
      selector: (row) => row.taskName,
      sortable: true,
      cell: (row) => (
        <div>
          {row.taskName ? (
            <>
              <strong>{row.taskName}</strong>
              {row.taskDesc && (
                <div className="cell-desc">{row.taskDesc}</div>
              )}
            </>
          ) : (
            <span style={{ color: '#95A5A6' }}>-</span>
          )}
        </div>
      ),
      minWidth: '200px',
    },
    {
      name: 'Job Name',
      selector: (row) => row.jobName,
      sortable: true,
      cell: (row) => (
        <div>
          {row.jobName ? (
            <>
              <strong>{row.jobName}</strong>
              {row.jobDesc && (
                <div className="cell-desc">{row.jobDesc}</div>
              )}
            </>
          ) : (
            <span style={{ color: '#95A5A6' }}>-</span>
          )}
        </div>
      ),
      minWidth: '200px',
    },
  ]

  const customStyles = {
    headRow: {
      style: {
        backgroundColor: '#667eea',
        color: 'white',
        fontWeight: 'bold',
        fontSize: '14px',
      },
    },
    headCells: {
      style: {
        fontSize: '14px',
        fontWeight: 'bold',
        textTransform: 'uppercase',
      },
    },
    rows: {
      style: {
        minHeight: '60px',
        '&:nth-of-type(odd)': {
          backgroundColor: '#f8f9fa',
        },
        '&:hover': {
          backgroundColor: '#e9ecef',
          cursor: 'pointer',
        },
      },
    },
    cells: {
      style: {
        fontSize: '14px',
        padding: '12px',
      },
    },
  }

  const paginationComponentOptions = {
    rowsPerPageText: 'Rows per page:',
    rangeSeparatorText: 'of',
    selectAllRowsItem: true,
    selectAllRowsItemText: 'All',
  }

  const clearFilters = () => {
    setPlanNameFilter('')
    setTaskNameFilter('')
    setJobNameFilter('')
  }

  return (
    <div className="table-view-container">
      <div className="column-filters">
        <div className="filter-group">
          <label>Filter Plan Name:</label>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              className="column-filter-input"
              placeholder="Search plan name..."
              value={planNameFilter}
              onChange={(e) => setPlanNameFilter(e.target.value)}
            />
            {planNameFilter && (
              <button
                className="clear-filter-btn"
                onClick={() => setPlanNameFilter('')}
                aria-label="Clear plan filter"
              >
                ✕
              </button>
            )}
          </div>
        </div>
        <div className="filter-group">
          <label>Filter Task Name:</label>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              className="column-filter-input"
              placeholder="Search task name..."
              value={taskNameFilter}
              onChange={(e) => setTaskNameFilter(e.target.value)}
            />
            {taskNameFilter && (
              <button
                className="clear-filter-btn"
                onClick={() => setTaskNameFilter('')}
                aria-label="Clear task filter"
              >
                ✕
              </button>
            )}
          </div>
        </div>
        <div className="filter-group">
          <label>Filter Job Name:</label>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              className="column-filter-input"
              placeholder="Search job name..."
              value={jobNameFilter}
              onChange={(e) => setJobNameFilter(e.target.value)}
            />
            {jobNameFilter && (
              <button
                className="clear-filter-btn"
                onClick={() => setJobNameFilter('')}
                aria-label="Clear job filter"
              >
                ✕
              </button>
            )}
          </div>
        </div>
        {(planNameFilter || taskNameFilter || jobNameFilter) && (
          <button className="clear-all-filters-btn" onClick={clearFilters}>
            Clear All Filters
          </button>
        )}
      </div>
      <DataTable
        columns={columns}
        data={filteredData}
        customStyles={customStyles}
        pagination
        paginationComponentOptions={paginationComponentOptions}
        paginationPerPage={10}
        paginationRowsPerPageOptions={[10, 20, 30, 50, 100]}
        highlightOnHover
        pointerOnHover
        striped
        responsive
        subHeader
        subHeaderComponent={
          <div className="table-header-info">
            <span>Total Records: {filteredData.length} {filteredData.length !== flattenData.length && `(filtered from ${flattenData.length})`}</span>
          </div>
        }
        persistTableHead
      />
    </div>
  )
}

export default TableView
