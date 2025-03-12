export function formatAST(node: any, indent = 0): string {
    if (!node || typeof node !== "object") return "";
  
    // Create indentation
    const indentation = "  ".repeat(indent);
  
    // Start building the tree
    let result = `${indentation}${node.type}`;
  
    // If it's an identifier or literal, include its value
    if (node.type === "Identifier") {
      result += ` (${node.name})`;
    } else if (node.type === "Literal") {
      result += ` (${node.value})`;
    } else if (node.type === "VariableDeclaration") {
      result += ` (${node.kind})`;
    }
  
    // Process child nodes recursively
    for (const key in node) {
      if (Array.isArray(node[key])) {
        node[key].forEach((child) => {
          result += `\n${formatAST(child, indent + 1)}`;
        });
      } else if (typeof node[key] === "object" && node[key] !== null) {
        result += `\n${formatAST(node[key], indent + 1)}`;
      }
    }
  
    return result;
  }
  