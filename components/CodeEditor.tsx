"use client";

import { useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import * as acorn from "acorn";

export default function CodeEditor() {
  // Store code input & AST output
  const [code, setCode] = useState("// Write JavaScript here...");
  const [ast, setAst] = useState({});

  // Function to parse code into AST
  const handleCodeChange = (value: string) => {
    setCode(value);

    try {
      const parsedAst = acorn.parse(value, {
        ecmaVersion: 2020, // Support ES6+ syntax
      });
      setAst(parsedAst);
    } catch (error) {
      setAst({ error: "Invalid JavaScript syntax" });
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
      <h2 className="text-lg font-semibold mt-4">AST Output (JSON)</h2>
      <pre className="bg-gray-200 p-2 rounded text-sm overflow-auto h-60">
        {JSON.stringify(ast, null, 2)}
      </pre>
    </div>
  );
}
