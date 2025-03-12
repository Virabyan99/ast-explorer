"use client";

import { useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { EditorView, Decoration, DecorationSet } from "@codemirror/view";
import * as acorn from "acorn";
import { convertASTToHierarchy } from "@/utils/formatAST";
import ASTVisualizer from "@/components/ASTVisualizer";

export default function CodeEditor() {
  const [code, setCode] = useState("// Write JavaScript here...");
  const [ast, setAst] = useState<any>(null);
  const [highlights, setHighlights] = useState<DecorationSet>(Decoration.none);

  // Function to highlight text in Codemirror
  const highlightRange = (start: number, end: number) => {
    const highlightDecoration = Decoration.mark({ class: "bg-yellow-300" });
    setHighlights(Decoration.set([highlightDecoration.range(start, end)]));
  };

  // Parse JavaScript and convert to D3 format
  const handleCodeChange = (value: string) => {
    setCode(value);

    try {
      const parsedAst = acorn.parse(value, { ecmaVersion: 2020, locations: true });
      const hierarchy = convertASTToHierarchy(parsedAst);
      setAst(hierarchy);
    } catch (error) {
      setAst(null);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto mt-10 p-4 border rounded-lg bg-white shadow">
      <h2 className="text-xl font-semibold mb-2">JavaScript Editor</h2>
      <CodeMirror
        value={code}
        height="300px"
        extensions={[javascript(), EditorView.decorations.of(() => highlights)]}
        onChange={handleCodeChange}
        className="border rounded-lg"
      />

      <h2 className="text-lg font-semibold mt-4">AST Visualization</h2>
      <div className="border p-4 bg-gray-100 rounded-lg">
        {ast ? <ASTVisualizer data={ast} onNodeClick={highlightRange} /> : <p>No AST generated yet.</p>}
      </div>
    </div>
  );
}
