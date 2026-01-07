import { useState, useMemo, useCallback, useEffect } from 'react'
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
import '@xyflow/react/dist/style.css'
import CustomNode from './CustomNode'
import '../App.css'

const nodeTypes = {
  custom: CustomNode,
}

function DAGView({ data, searchQuery, finalsearchQuery }) {
  const [selectedNode, setSelectedNode] = useState(null)
  const [selectedNodeId, setSelectedNodeId] = useState(null)
  const { setCenter, getNodes, setViewport } = useReactFlow();

  // Convert JSON data to React Flow nodes and edges
  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
    const nodes = []
    const edges = []
    let nodeIdCounter = 0
    const nodeMap = new Map() // Map original node name to React Flow node ID

    // Calculate positions for hierarchical layout (left to right)
    const calculateLayout = (dataItems, level = 0, startY = 0) => {
      let currentY = startY
      const levelSpacing = { x: 350, y: 120 } // Horizontal and vertical spacing
      const nodeHeight = 100

      dataItems.forEach((item, index) => {
        const nodeId = `node-${nodeIdCounter++}`
        const x = level * levelSpacing.x + 50
        let y = currentY

        // Store mapping
        nodeMap.set(item.name, nodeId)

        // If has children, calculate their total height first
        let childrenHeight = 0
        if (item.children && item.children.length > 0) {
          // Calculate total height needed for children
          childrenHeight = item.children.length * levelSpacing.y
          // Center parent vertically relative to its children
          y = currentY + (childrenHeight - nodeHeight) / 2
        }

        // Create node
        nodes.push({
          id: nodeId,
          type: 'custom',
          position: { x, y },
          data: {
            label: item.name,
            type: item.type,
            desc: item.description || item.desc || '',
            workspace: item.workspace || '',
            originalData: item,
          },
        })

        // If has children, recursively process them
        if (item.children && item.children.length > 0) {
          const childStartY = currentY
          const childResults = calculateLayout(
            item.children,
            level + 1,
            childStartY
          )
          currentY = childResults.nextY

          // Create edges to children
          item.children.forEach((child) => {
            const childNodeId = nodeMap.get(child.name)
            if (childNodeId) {
              edges.push({
                id: `edge-${nodeId}-${childNodeId}`,
                source: nodeId,
                target: childNodeId,
                type: 'smoothstep',
                markerEnd: {
                  type: MarkerType.ArrowClosed,
                  color: '#BDC3C7',
                },
                style: {
                  stroke: '#BDC3C7',
                  strokeWidth: 2,
                },
              })
            }
          })
        } else {
          currentY += levelSpacing.y
        }
      })

      return { nextY: currentY }
    }

    // Layout each plan separately
    let globalY = 0
    data.forEach((plan) => {
      const result = calculateLayout([plan], 0, globalY)
      globalY = result.nextY + 150 // Add spacing between plans
    })

    return { nodes, edges }
  }, [data])

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  // Get node color based on type
  const getNodeColor = (nodeType) => {
    switch (nodeType) {
      case 'PLAN':
        return '#FF5C00'
      case 'TASK':
        return '#7B61FF'
      case 'CYCLE':
        return '#50C878'
      case 'PROCESS':
        return '#9B59B6'
      case 'JOB':
        return '#4A90E2'
      default:
        return '#95A5A6'
    }
  }

  // Update edges when a node is selected
  const updateEdgesForSelectedNode = useCallback((nodeId, nodeType) => {
    if (!nodeId) {
      // Reset all edges to gray
      setEdges((eds) =>
        eds.map((edge) => ({
          ...edge,
          style: {
            stroke: '#95A5A6',
            strokeWidth: 1.5,
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: '#95A5A6',
          },
        }))
      )
      return
    }

    const nodeColor = getNodeColor(nodeType)

    // Update edges connected to the selected node
    setEdges((eds) =>
      eds.map((edge) => {
        const isConnected = edge.source === nodeId || edge.target === nodeId
        return {
          ...edge,
          style: {
            stroke: isConnected ? nodeColor : '#95A5A6',
            strokeWidth: isConnected ? 2.5 : 1.5,
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: isConnected ? nodeColor : '#95A5A6',
          },
        }
      })
    )
  }, [setEdges])

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  )

  // Flatten all nodes for search
  const flattenNodes = (nodes) => {
    let result = []
    nodes.forEach((node) => {
      result.push(node)
      if (node.children) {
        result = result.concat(flattenNodes(node.children))
      }
    })
    return result
  }

  const allNodes = useMemo(() => flattenNodes(data), [data])

  // Filter and highlight nodes based on search
  const filteredNodes = useMemo(() => {
    if (!searchQuery.trim()) return nodes

    const query = searchQuery.toLowerCase()
    const matchingNodeNames = allNodes
      .filter(
        (node) =>
          node.name.toLowerCase().includes(query) ||
          node.type.toLowerCase().includes(query) ||
          (node.desc && node.desc.toLowerCase().includes(query))
      )
      .map((node) => node.name)

    return nodes.map((node) => ({
      ...node,
      data: {
        ...node.data,
        highlighted: matchingNodeNames.includes(node.data.label),
      },
    }))
  }, [searchQuery, nodes, allNodes])


  const onNodeClick = useCallback((event, node) => {
    setSelectedNode(node.data.originalData)
    setSelectedNodeId(node.id)
    updateEdgesForSelectedNode(node.id, node.data.type)
  }, [updateEdgesForSelectedNode])

  // Reset edges when clicking on background
  const onPaneClick = useCallback(() => {
    setSelectedNode(null)
    setSelectedNodeId(null)
    updateEdgesForSelectedNode(null, null)
  }, [updateEdgesForSelectedNode])

  useEffect(() => {
    if (finalsearchQuery && finalsearchQuery != "") {
      const nodes = getNodes();

      const query = finalsearchQuery.toLowerCase()

      const matchingNode = nodes.find((node) => 
        node.data.label.toLowerCase().includes(query) ||
        node.data.originalData.description.toLowerCase().includes(query)
      );

      if (matchingNode) {
        // jump to the node coordinates
        // zoom level 1.2 provides a nice close-up
        setCenter(matchingNode.position.x, matchingNode.position.y, { 
          zoom: 1, 
          duration: 800 // Smooth transition in milliseconds
        });
        
        // Optional: Auto-select it to show the sidebar
        setSelectedNode(matchingNode.data.originalData);
        setSelectedNodeId(matchingNode.id);
        updateEdgesForSelectedNode(matchingNode.id, matchingNode.data.type);
      }
    }
  }, [finalsearchQuery])

  // useEffect(() => {
  //   console.log('aaa')
  //   setViewport({ x: 100, y: 50, zoom: 0.8 }, { duration: 0 });
  // }, [])

  return (
    <>
      <div className="dag-container">
        <ReactFlow
          nodes={searchQuery ? filteredNodes : nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{
            padding: 0,
            includeHiddenNodes: false,
            minZoom: 0.5,
            maxZoom: 0.7,
            nodes: [{ id: 'node-2' }] 
          }}
          attributionPosition="bottom-left"
        >
          <Background />
          <Controls />
          <MiniMap />
        </ReactFlow>
      </div>

      {selectedNode && (
        <div className="node-details" >
        <button 
          className="close-button" 
          onClick={onPaneClick} // Replace with your close function logic
          aria-label="Close"
        >
          &times;
        </button>
          <h3>{selectedNode.name}</h3>
          {/* <div className="detail-item">
            <strong>Name:</strong> {selectedNode.name}
          </div> */}
          <div className="detail-item">
            <strong>Type:</strong>{' '}
            <span className={`type-badge type-${selectedNode.type}`} style={{fontSize: '14px'}}>
              {selectedNode.type}
            </span>
          </div>
          <div className="detail-item">
            <strong>Workspace:</strong> {selectedNode.workspace}
          </div>
          <div className="detail-item">
            <strong>Description:</strong> {selectedNode.description}
          </div>
          {selectedNode.schedule && (
            <>
              <div className="detail-item">
                <strong>Trigger type:</strong> {selectedNode.schedule.trigger_type}
              </div>
              <div className="detail-item">
                <strong>Trigger details:</strong> {selectedNode.schedule.trigger_details}
              </div>
            </>
          )}
          {selectedNode?.dependency && selectedNode?.dependency != "" && (
            <>
              <div className="detail-item">
                <strong>Dependency:</strong> {selectedNode.dependency}
              </div>
              
            </>
          )}
          {selectedNode.artifact && (
            <>
              <div className="detail-item">
                <strong>Talend studio project:</strong> {selectedNode.artifact.talend_studio_project}
              </div>
              <div className="detail-item">
                <strong>Github repo:</strong> {selectedNode.artifact.git_repo_name}
              </div>
              <div className="detail-item">
                <strong>Repo last update:</strong> {selectedNode.artifact.repo_last_update}
              </div>
            </>
          )}

        </div>
      )}
    </>
  )
}

export default DAGView

