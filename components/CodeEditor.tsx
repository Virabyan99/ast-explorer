"use client";

import { useState, useEffect, useRef } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import * as acorn from "acorn";
import { convertASTToHierarchy } from "@/utils/formatAST";
import ASTVisualizer from "@/components/ASTVisualizer";
import { toast } from "react-toastify";
import { IconCheck, IconAlertTriangle, IconTrash } from "@tabler/icons-react";
import { useHistoryStore } from "@/store/useHistoryStore";
import { debounce } from "lodash";
import { loadCurrentCode, saveCurrentCode } from "@/utils/indexedDB";
import { EditorView, Decoration } from "@codemirror/view";
import { StateField, StateEffect } from "@codemirror/state";

// Define state field and effect for managing highlights
const highlightField = StateField.define<{ from: number; to: number } | null>({
  create: () => null,
  update: (value, tr) => {
    for (let e of tr.effects) {
      if (e.is(setHighlight)) return e.value;
    }
    return value;
  },
  provide: (f) =>
    EditorView.decorations.from(f, (range) => {
      if (range) {
        return Decoration.set([
          Decoration.mark({
            attributes: { style: "background-color: yellow" },
          }).range(range.from, range.to),
        ]);
      }
      return Decoration.none;
    }),
});

const setHighlight = StateEffect.define<{ from: number; to: number } | null>();

export default function CodeEditor() {
  const [code, setCode] = useState("");
  const [ast, setAst] = useState<any>(null);
  const { history, loadHistory, saveHistory, deleteHistory } = useHistoryStore();
  const editorRef = useRef<any>(null);

  // Debounced save function for current code
  const debouncedSaveCurrentCode = useRef(
    debounce((code: string) => {
      saveCurrentCode(code).catch((error) => {
        console.error("Failed to save current code:", error);
      });
    }, 1000)
  ).current;

  // Load initial code and history
  useEffect(() => {
    const init = async () => {
      try {
        const savedCode = await loadCurrentCode();
        setCode(savedCode);
      } catch (error) {
        console.error("Failed to load current code:", error);
        setCode("// Write JavaScript here...");
      }
      loadHistory();
    };
    init();
  }, []);

  // Save code to IndexedDB on change
  useEffect(() => {
    debouncedSaveCurrentCode(code);
  }, [code]);

  // Handle code changes and update AST
  const handleCodeChange = (value: string) => {
    setCode(value);
    try {
      const parsedAst = acorn.parse(value, { ecmaVersion: 2020 });
      const hierarchy = convertASTToHierarchy(parsedAst);
      setAst(hierarchy);
    } catch (error) {
      setAst(null);
      toast.error("Syntax Error: Invalid JavaScript!");
    }
    // Clear highlight when code changes
    if (editorRef.current) {
      const view = editorRef.current.view;
      if (view) {
        view.dispatch({ effects: setHighlight.of(null) });
      }
    }
  };

  // Save current code and AST to history
  const handleSave = () => {
    saveHistory(code, ast);
    toast.success("Saved successfully!");
  };

  // Highlight code range when a node is clicked
  const handleNodeClick = (start: number, end: number) => {
    if (!editorRef.current) return;
    const view = editorRef.current.view;
    if (!view) return;
    view.dispatch({
      effects: setHighlight.of({ from: start, to: end }),
    });
  };

  return (
    <div className="w-full max-w-2xl mx-auto mt-10 p-4 border rounded-lg bg-white shadow">
      <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
        <IconCheck className="text-green-600" />
        JavaScript Editor
      </h2>

      <CodeMirror
        value={code}
        height="300px"
        extensions={[javascript(), highlightField]}
        onChange={handleCodeChange}
        ref={editorRef}
        className="border rounded-lg"
      />

      <button
        onClick={handleSave}
        className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2"
      >
        <IconCheck />
        Save Snapshot
      </button>

      <h2 className="text-lg font-semibold mt-4 flex items-center gap-2">
        <IconAlertTriangle className="text-yellow-600" />
        AST Visualization
      </h2>
      <div className="border p-4 bg-gray-100 rounded-lg">
        {ast ? (
          <ASTVisualizer data={ast} onNodeClick={handleNodeClick} />
        ) : (
          <p className="text-red-600">No valid AST generated.</p>
        )}
      </div>

      <h2 className="text-lg font-semibold mt-4 flex items-center gap-2">
        <IconTrash className="text-red-600" />
        Saved Snapshots
      </h2>
      <ul className="border p-2 rounded-lg bg-gray-200 max-h-40 overflow-auto">
        {history.map((item) => (
          <li key={item.id} className="flex justify-between items-center p-2 border-b">
            <button
              onClick={() => {
                setCode(item.key);
                setAst(item.value);
              }}
              className="px-2 py-1 bg-green-600 text-white rounded flex items-center gap-2"
            >
              <IconCheck />
              Load
            </button>
            <button
              onClick={() => deleteHistory(item.id!)}
              className="px-2 py-1 bg-red-600 text-white rounded flex items-center gap-2"
            >
              <IconTrash />
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}