"use client";

import { useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import * as acorn from "acorn";
import { formatAST } from "@/utils/formatAST";

export default function CodeEditor() {
  // Store code input, AST JSON, and formatted AST
  const [code, setCode] = useState("// Write JavaScript here...");
  const [ast, setAst] = useState({});
  const [formattedAst, setFormattedAst] = useState("");

  // Function to parse JavaScript into AST and format it
  const handleCodeChange = (value: string) => {
    setCode(value);

    try {
      const parsedAst = acorn.parse(value, { ecmaVersion: 2020 });
      setAst(parsedAst);
      setFormattedAst(formatAST(parsedAst)); // Format AST as a tree
    } catch (error) {
      setAst({ error: "Invalid JavaScript syntax" });
      setFormattedAst("Invalid JavaScript syntax.");
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto mt-10 p-4 border rounded-lg bg-white shadow">
      <h2 className="text-xl font-semibold mb-2">JavaScript Editor</h2>
      <CodeMirror
        value={code}
        height="300px"
        extensions={[javascript()]}
        onChange={handleCodeChange}
        className="border rounded-lg"
      />

      <h2 className="text-lg font-semibold mt-4">Formatted AST</h2>
      <pre className="bg-gray-200 p-2 rounded text-sm overflow-auto h-60">
        {formattedAst}
      </pre>
    </div>
  );
}
