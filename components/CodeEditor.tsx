'use client'

import { useState, useEffect, useRef } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { javascript } from '@codemirror/lang-javascript'
import * as acorn from 'acorn'
import { convertASTToHierarchy } from '@/utils/formatAST'
import ASTVisualizer from '@/components/ASTVisualizer'
import { toast } from 'react-toastify'
import { IconCheck, IconAlertTriangle, IconTrash, IconRun } from '@tabler/icons-react'
import { useHistoryStore } from '@/store/useHistoryStore'
import { debounce } from 'lodash'
import { loadCurrentCode, saveCurrentCode } from '@/utils/indexedDB' // Adjust the import path

export default function CodeEditor() {
  const [code, setCode] = useState('')
  const [ast, setAst] = useState<any>(null)
  const { history, loadHistory, saveHistory, deleteHistory } = useHistoryStore()

  // Debounced save function for current code
  const debouncedSaveCurrentCode = useRef(debounce((code: string) => {
    saveCurrentCode(code).catch(error => {
      console.error('Failed to save current code:', error);
    });
  }, 1000)).current;

  // Debounced parsing for AST visualization
  const debouncedParseCode = useRef(debounce((value: string) => {
    try {
      const parsedAst = acorn.parse(value, { ecmaVersion: 2020 })
      const hierarchy = convertASTToHierarchy(parsedAst)
      setAst(hierarchy)
    } catch (error) {
      setAst(null) // No toast here to avoid real-time interruptions
    }
  }, 500)).current;

  // Load current code and history on mount
  useEffect(() => {
    const init = async () => {
      try {
        const savedCode = await loadCurrentCode();
        setCode(savedCode);
        debouncedParseCode(savedCode); // Parse initially loaded code
      } catch (error) {
        console.error('Failed to load current code:', error);
        setCode('// Write JavaScript here...');
      }
      loadHistory();
    };
    init();
  }, []);

  // Save current code whenever it changes
  useEffect(() => {
    debouncedSaveCurrentCode(code);
  }, [code]);

  // Handle code changes with debounced parsing
  const handleCodeChange = (value: string) => {
    setCode(value)
    debouncedParseCode(value); // Trigger debounced parsing
  }

  // Validate code and show toast feedback
  const validateCode = () => {
    try {
      acorn.parse(code, { ecmaVersion: 2020 });
      toast.success('Code is valid!');
    } catch (error) {
      toast.error('Syntax Error: Invalid JavaScript!');
    }
  }

  // Save the current AST after validating
  const handleSave = () => {
    try {
      const parsedAst = acorn.parse(code, { ecmaVersion: 2020 });
      const hierarchy = convertASTToHierarchy(parsedAst);
      saveHistory(code, hierarchy);
      toast.success('Saved successfully!');
    } catch (error) {
      toast.error('Cannot save: Invalid JavaScript!');
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto mt-10 p-4 border rounded-lg bg-white shadow">
      <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
        <IconCheck className="text-green-600" />
        JavaScript Editor
      </h2>

      <CodeMirror
        value={code}
        height="300px"
        extensions={[javascript()]}
        onChange={handleCodeChange}
        className="border rounded-lg"
      />

      <div className="flex gap-2 mt-2">
        <button
          onClick={validateCode}
          className="px-4 py-2 bg-green-600 text-white rounded-lg flex items-center gap-2">
          <IconRun />
          Run
        </button>
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2">
          <IconCheck />
          Save Snapshot
        </button>
      </div>

      <h2 className="text-lg font-semibold mt-4 flex items-center gap-2">
        <IconAlertTriangle className="text-yellow-600" />
        AST Visualization
      </h2>
      <div className="border p-4 bg-gray-100 rounded-lg">
        {ast ? (
          <ASTVisualizer data={ast} />
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
          <li
            key={item.id}
            className="flex justify-between items-center p-2 border-b">
            <button
              onClick={() => {
                setCode(item.key)
                setAst(item.value)
              }}
              className="px-2 py-1 bg-green-600 text-white rounded flex items-center gap-2">
              <IconCheck />
              Load
            </button>
            <button
              onClick={() => deleteHistory(item.id!)}
              className="px-2 py-1 bg-red-600 text-white rounded flex items-center gap-2">
              <IconTrash />
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}