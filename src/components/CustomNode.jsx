import { Handle, Position } from "@xyflow/react";
import "./CustomNode.css";

function CustomNode({ data, selected }) {
  const getTypeColor = () => {
    switch (data.type) {
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

  const nodeColor = getTypeColor();
  const isHighlighted = data.highlighted;

  return (
    <div
      className={`custom-node ${selected ? "selected" : ""} ${
        isHighlighted ? "highlighted" : ""
      }`}
      style={{ "--node-color": nodeColor }}
    >
      <Handle type="target" position={Position.Left} />

      <div className="node-body">
        <div className="node-name">
          {data?.label?.replace("__duplicate", "")}
        </div>
        {/* {data.desc && (
          <div className="node-desc">{data.desc}</div>
        )} */}
      </div>
      <div className="node-subheader">
        <span
          className="node-type-badge"
          style={{ backgroundColor: nodeColor }}
        >
          {data.type || "N/A"}
        </span>
        {data.workspace && (
          <span className="node-type-workspace" title={data.workspace}>
            {data.workspace}
          </span>
        )}
      </div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

export default CustomNode;
