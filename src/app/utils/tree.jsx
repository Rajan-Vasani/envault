import {union} from 'lodash';

/**
 * Converts a flat array of nodes into a nested tree structure.
 * @param {Array} data - The array of nodes to convert.
 * @param {Array} parents - The parent nodes.
 * @returns {Array} The nested tree structure.
 */
export const arrayToTree = (data, parents = []) => {
  if (!parents.length) {
    parents = [
      ...new Set(data.filter(node => !data.some(parent => parent.id === node.parent)).map(node => node.parent)),
    ];
  }
  return data
    .filter(node => parents.includes(node.parent))
    .map(child => ({...child, children: arrayToTree(data, [child.id])}));
};

/**
 * Finds all descendants of a node in a tree structure.
 * @param {Array} array - The array of nodes to search.
 * @param {string|number} id - The id of the node to find descendants for.
 * @param {Array} [descendants=[]] - An array to accumulate the descendants.
 * @returns {Array} The descendants of the node.
 */
export const findDescendants = (array, id, descendants = []) => {
  const children = array.filter(node => node.parent === id);
  children.forEach(child => {
    descendants = union(descendants, findDescendants(array, child.id, children));
  });
  return descendants;
};

/**
 * Finds the ancestors of a given node in an array of objects.
 * @param {Array} array - The array of objects to search in.
 * @param {string} id - The id of the node to find ancestors for.
 * @returns {Array} - An array containing the names of the ancestors in the order from parent to child.
 */
/**
 * Finds the ancestors of a given node in an array of objects.
 * @param {Array} array - The array of objects to search in.
 * @param {string|number} id - The id of the node to find ancestors for.
 * @param {Array} [ancestors=[]] - An array to accumulate the ancestors.
 * @returns {Array} - An array containing the ancestors in the order from parent to child.
 */
export const findAncestors = (array, id, ancestors = []) => {
  const node = array.find(node => node.id === id);
  if (!node?.parent) {
    return ancestors;
  }
  const parent = array.find(item => item.id === node.parent);
  ancestors = [...ancestors, parent];
  return findAncestors(array, parent.id, ancestors);
};

/**
 * Pivots the given data based on its keys.
 *
 * @param {Array} data - The data to be pivoted.
 * @param {Array} [pivoted=[]] - The array to store the pivoted data.
 * @returns {Array} - The pivoted data.
 */
export const pivot = (data, pivoted = []) => {
  const keys = Object.keys(data.reduce((result, obj) => Object.assign(result, obj), {}));
  keys.forEach(key => {
    pivoted[key] = [...new Set(data.map(item => item[key]))].filter(x => x);
    if (pivoted[key].some(value => value.constructor === Object)) {
      pivoted[key] = pivot(pivoted[key]);
    }
  });
  return pivoted;
};

/**
 * Filters nodes by type.
 * @param {Array} data - The array of nodes to filter.
 * @param {Array} type - The types to filter by.
 * @returns {Array} The filtered array of nodes.
 */
export const nodeTypeFilter = (data, type = ['all']) => {
  if (type.includes('all')) {
    return data;
  } else {
    return data.filter(node => type.includes(node.type));
  }
};

/**
 * Searches for a nested object in the data based on the provided condition.
 * @param {Array} data - The data array to search in.
 * @param {Function} condition - The condition function to match the object.
 * @param {string} childrenKey - The key to access children in the nested objects.
 * @returns {Object|undefined} - The found object or undefined if not found.
 */
export const searchNested = (data, condition, childrenKey = 'children') => {
  for (const item of data) {
    if (condition(item)) {
      return item;
    }
    if (item[childrenKey]) {
      const result = searchNested(item[childrenKey], condition, childrenKey);
      if (result) {
        return result;
      }
    }
  }
  return undefined;
};
