import { useState } from "react";
import "./App.css";
import data from "../data.json";
import DAGView from "./components/DAGView";
import TableView from "./components/TableView";
import CustomNode from "./components/CustomNode";

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
  useReactFlow,
} from "@xyflow/react";

const getTypeColor = (type = "") => {
  switch (type) {
    case "PLAN":
      return "#FF5C00";
    case "TASK":
      return "#7B61FF";
    case "CYCLE":
      return "#50C878";
    case "PROCESS":
      return "#9B59B6";
    case "JOB":
      return "#4A90E2";
    default:
      return "#95A5A6";
  }
};

function App() {
  const [activeView, setActiveView] = useState("dag"); // 'dag' or 'table'
  const [searchQuery, setSearchQuery] = useState("");
  const [finalsearchQuery, setfinalSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(true);
  const [seachedNodes, setSeachedNodes] = useState([]);
  const [selectedNodes, setSelectedNodes] = useState({});

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const getFilteredNodes = (nodes) => {
    setSeachedNodes(nodes);
  };

  const handleSearchedItemClick = (data) => {
    setSelectedNodes({
      name: data?.name,
      type: data?.type,
      workspace: data?.workspace,
    });
    setSeachedNodes([]);
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div className="header-left">
            <h1>Talend ETL Flow Visualizer</h1>
            <p>Interactive DAG visualization of ETL pipelines and workflows</p>
          </div>
          <div className="header-right">
            {activeView === "dag" && (
              <>
                {/* <button
                  className="search-toggle-btn"
                  onClick={() => setShowSearch(!showSearch)}
                  aria-label="Toggle search"
                >
                  🔍
                </button> */}
                {showSearch && (
                  <div>
                    <div className="search-container">
                      <input
                        type="text"
                        className="search-input"
                        placeholder="Search tasks, jobs etc.."
                        value={searchQuery}
                        onChange={handleSearch}
                        autoFocus
                      />
                      {/* <button
                        className="find-from-search"
                        onClick={() => setfinalSearchQuery(searchQuery)}
                      >
                        FIND
                    </button> */}
                      {searchQuery && (
                        <button
                          className="clear-search"
                          onClick={() => setSearchQuery("")}
                          aria-label="Clear search"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
            <div className="view-tabs">
              <button
                className={`tab-button ${activeView === "dag" ? "active" : ""}`}
                onClick={() => setActiveView("dag")}
              >
                DAG View
              </button>
              <button
                className={`tab-button ${
                  activeView === "table" ? "active" : ""
                }`}
                onClick={() => setActiveView("table")}
              >
                Table View
              </button>
            </div>
          </div>
        </div>
        {seachedNodes.length > 0 && searchQuery != "" && (
          <div class="search-modal">
            {seachedNodes?.slice(0, 100).map((data) => {
              return (
                <div
                  className="searched-node"
                  onClick={() => handleSearchedItemClick(data)}
                >
                  <div className="node-body" style={{ paddingBottom: "4px" }}>
                    <div className="node-name">
                      {data?.name?.replace("__duplicate", "")}
                    </div>
                  </div>
                  <div className="node-subheader" style={{ paddingTop: "0px" }}>
                    <span
                      className="node-type-badge"
                      style={{ backgroundColor: getTypeColor(data?.type) }}
                    >
                      {data?.type || "N/A"}
                    </span>
                    {data.workspace && (
                      <span
                        className="node-type-workspace"
                        title={data.workspace}
                      >
                        {data?.workspace}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </header>

      <ReactFlowProvider>
        {activeView === "dag" ? (
          <DAGView
            data={data}
            selectedNodes={selectedNodes}
            searchQuery={searchQuery}
            finalsearchQuery={finalsearchQuery}
            getFilteredNodes={getFilteredNodes}
          />
        ) : (
          <TableView data={data} />
        )}
      </ReactFlowProvider>
    </div>
  );
}

export default App;
