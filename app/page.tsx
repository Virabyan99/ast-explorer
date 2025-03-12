import CodeEditor from "@/components/CodeEditor";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <h1 className="text-2xl font-bold mb-4">JavaScript AST Explorer</h1>
      <CodeEditor />
    </main>
  );
}
