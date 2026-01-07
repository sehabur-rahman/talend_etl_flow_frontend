import { useState } from 'react'
import './App.css'
import data from '../data.json'
import DAGView from './components/DAGView'
import TableView from './components/TableView'

import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  MarkerType,
  ReactFlowProvider,
  useReactFlow
} from '@xyflow/react'

function App() {
  const [activeView, setActiveView] = useState('dag') // 'dag' or 'table'
  const [searchQuery, setSearchQuery] = useState('')
  const [finalsearchQuery, setfinalSearchQuery] = useState('')
  const [showSearch, setShowSearch] = useState(true)

  const handleSearch = (e) => {
    setSearchQuery(e.target.value)
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div className="header-left">
            <h1>Talend ETL Flow Visualizer</h1>
            <p>Interactive DAG visualization of ETL pipelines and workflows</p>
          </div>
          <div className="header-right">
            {activeView === 'dag' && (
              <>
                {/* <button
                  className="search-toggle-btn"
                  onClick={() => setShowSearch(!showSearch)}
                  aria-label="Toggle search"
                >
                  🔍
                </button> */}
                {showSearch && (
                  <div className="search-container">
                    <input
                      type="text"
                      className="search-input"
                      placeholder="Search tasks, jobs etc.."
                      value={searchQuery}
                      onChange={handleSearch}
                      autoFocus
                    />
                    <button
                        className="find-from-search"
                        onClick={() => setfinalSearchQuery(searchQuery)}
                      >
                        FIND
                    </button>
                    {searchQuery && (
                      <button
                        className="clear-search"
                        onClick={() => setSearchQuery('')}
                        aria-label="Clear search"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                )}
              </>
            )}
            <div className="view-tabs">
              <button
                className={`tab-button ${activeView === 'dag' ? 'active' : ''}`}
                onClick={() => setActiveView('dag')}
              >
                DAG View
              </button>
              <button
                className={`tab-button ${activeView === 'table' ? 'active' : ''}`}
                onClick={() => setActiveView('table')}
              >
                Table View
              </button>
            </div>
          </div>
        </div>
      </header>
      <ReactFlowProvider>
        {activeView === 'dag' ? (
          <DAGView data={data} searchQuery={searchQuery} finalsearchQuery={finalsearchQuery} />
        ) : (
          <TableView data={data} />
        )}
      </ReactFlowProvider>
    </div>
  )
}

export default App
