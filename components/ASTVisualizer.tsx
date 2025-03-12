"use client";

import * as d3 from "d3";
import { useEffect, useRef } from "react";

interface ASTVisualizerProps {
  data: any;
  onNodeClick?: (start: number, end: number) => void;
}

export default function ASTVisualizer({ data, onNodeClick }: ASTVisualizerProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!data || !data.name) return;

    const width = 600;
    const height = 400;

    // Clear previous SVG content
    d3.select(svgRef.current).selectAll("*").remove();

    // Create zoom behavior
    const zoom = d3.zoom().scaleExtent([0.5, 2]).on("zoom", (event) => {
      d3.select(svgRef.current).select("g").attr("transform", event.transform);
    });

    // Apply zoom to SVG
    d3.select(svgRef.current).call(zoom);

    // Create a D3 hierarchy
    const root = d3.hierarchy(data);

    // Create a tree layout
    const treeLayout = d3.tree().size([width - 50, height - 50]);
    treeLayout(root);

    // Create an SVG container
    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", "translate(40, 20)");

    // Create links (connecting lines)
    svg.selectAll("path")
      .data(root.links())
      .enter()
      .append("path")
      .attr("fill", "none")
      .attr("stroke", "#555")
      .attr("stroke-width", 1.5)
      .attr("d", d3.linkHorizontal()
        .x(d => (d as any).y)
        .y(d => (d as any).x));

    // Create nodes
    const nodes = svg.selectAll("g.node")
      .data(root.descendants())
      .enter()
      .append("g")
      .attr("transform", d => `translate(${d.y},${d.x})`)
      .on("click", (event, d) => onNodeClick?.(d.data.start, d.data.end)); // Handle click event

    // Add circles for nodes
    nodes.append("circle")
      .attr("r", 6)
      .attr("fill", "#007BFF");

    // Add labels
    nodes.append("text")
      .attr("dy", 3)
      .attr("x", d => d.children ? -10 : 10)
      .style("text-anchor", d => d.children ? "end" : "start")
      .text(d => d.data.name);
  }, [data]);

  return <svg ref={svgRef} className="border rounded-lg bg-white shadow-lg" />;
}
