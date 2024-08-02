const arrayToTree = (array, parents = []) => {
  if (!parents.length) {
    parents = [
      ...new Set(array.filter(node => !array.some(parent => parent.id === node.parent)).map(node => node.parent)),
    ];
  }
  return array
    .filter(node => parents.includes(node.parent))
    .map(child => ({...child, children: arrayToTree(array, [child.id])}));
};
