export function convertASTToHierarchy(node: any): any {
    if (!node || typeof node !== "object") return null;
  
    // Convert AST node to hierarchical format
    let treeNode: any = {
      name: node.type,
      start: node.start || 0, // Store position data
      end: node.end || 0,
      children: [],
    };
  
    // If it's an identifier or literal, include its value
    if (node.type === "Identifier") {
      treeNode.name += ` (${node.name})`;
    } else if (node.type === "Literal") {
      treeNode.name += ` (${node.value})`;
    }
  
    // Recursively process child nodes
    for (const key in node) {
      if (Array.isArray(node[key])) {
        node[key].forEach((child) => {
          let childNode = convertASTToHierarchy(child);
          if (childNode) treeNode.children.push(childNode);
        });
      } else if (typeof node[key] === "object" && node[key] !== null) {
        let childNode = convertASTToHierarchy(node[key]);
        if (childNode) treeNode.children.push(childNode);
      }
    }
  
    return treeNode;
  }
  