import {get} from 'lodash';

// Find descendants
const findDescendants = (array, id) => {
  let descendants = [];
  const children = array.filter(item => id.includes(item.parent));
  descendants.push(...children);
  children.forEach(child => {
    descendants = [...descendants, ...new Set(findDescendants(array, child.id))];
  });
  return descendants;
};

// Fold tree into nested structure
const arrayToTree = (array, parent = 'root') =>
  array
    .filter(item => item.parent === parent)
    .map(child => ({...child, children: arrayToTree(array, child.id)}));

// Pivot tree into selectable categories
const pivot = (data, pivoted = []) => {
  const keys = Object.keys(data.reduce((result, obj) => Object.assign(result, obj), {}));
  keys.forEach(key => {
    pivoted[key] = [...new Set(data.map(item => item[key]))].filter(x => x);
    if (pivoted[key].some(value => value.constructor === Object)) {
      pivoted[key] = pivot(pivoted[key]);
    }
  });
  return pivoted;
};

// Flatten a deeply nested array on children element
const flatten = (items = [], prefix = '') => {
  return items.reduce((flattened, item) => {
    item.path = prefix;
    flattened.push(item);
    if (item.children && item.children.length) {
      flattened.push(...flatten(item.children, `${item.path}/${item.name}`));
    }
    return flattened;
  }, []);
};

// Search a deeply nested array for matching object
const findSingleObject = (array = [], key, value) => {
  const start = array.find(node => node[key] === value);
  if (start) {
    return start;
  } else {
    for (const node in array) {
      if (array[node].children && array[node].children.length) {
        const search = findSingleObject(array[node].children, key, value);
        if (search) {
          return search;
        }
      }
    }
  }
};

// Search a deeply nested array for multiple objects
const findMultipleObjects = (targetArray, searchArray, searchKey) => {
  let results = [];
  for (const item in searchArray) {
    if ({}.hasOwnProperty.call(searchArray, item)) {
      results = [...results, findSingleObject(targetArray, searchKey, searchArray[item])];
    }
  }
  return results.filter(item => item);
};

// Apply filters to
const applyFilterOptions = (filterValue, options) => {
  let finalFilter = [];
  filterValue.map((f, idx) => {
    const filterKeys = f.key.split('.');
    const listToFilter = options.filter(item => get(item, filterKeys)); // needs checking for nested keys
    let currentResult = [];
    if (f.value.includes('all')) {
      // currentResult = listToFilter;
    } else {
      currentResult = options.filter(item => f.value.includes(get(item, filterKeys)));
    }

    switch (f.condition) {
      case 'not':
        currentResult = listToFilter.filter(x => !currentResult.includes(x));
        break;

      case 'like':
        currentResult = options.filter(item =>
          f.value.some(v => get(item, filterKeys).toLowerCase().includes(v.toLowerCase()))
        );
        break;

      default:
        break;
    }

    switch (f.relation) {
      case 'and':
        if (idx === 0) {
          finalFilter = [...finalFilter, ...currentResult];
        } else {
          finalFilter = [finalFilter, currentResult].reduce((p, c) => p.filter(e => c.includes(e)));
        }
        break;
      case 'or':
        finalFilter = [...finalFilter, ...currentResult].filter((v, i, a) => a.indexOf(v) == i);
        break;

      default:
        finalFilter = [...finalFilter, ...currentResult].filter((v, i, a) => a.indexOf(v) == i);
        break;
    }
  });
  return finalFilter;
};

const TreeReducer = (state, action) => {
  switch (action.type) {
    // case 'SET_VIEW_GROUP':
    //   return {
    //     ...state,
    //     viewGroup: action.payload,
    //   };
    case 'SET_FILTERS':
      const {filterItem = state.filterItem, searchItem = state.searchItem} = action.payload;
      // Find node objects of search targets
      const searchTargets = searchItem.length
        ? state.tree.filter(item => searchItem.includes(item.id))
        : [];
      // Search tree for targets and descendents
      const searchTree = searchTargets.length
        ? [...searchTargets, ...findDescendants(state.tree, searchItem)]
        : state.tree;
      // Check filters are valid and complete
      const completeFilters = filterItem.length
        ? filterItem.filter(f => f.key && f.condition && f.value && f.value.length)
        : [];
      // Apply filters
      const filterTargets = completeFilters.length
        ? applyFilterOptions(completeFilters, searchTree)
        : [];
      const filterTargetIds = filterTargets.length ? filterTargets.map(item => item.id) : [];
      // Find descendants of filter results
      const filterTree = filterTargetIds.length
        ? [...filterTargets, ...findDescendants(searchTree, filterTargetIds)]
        : searchTree;
      // Build the nested tree
      const treeRoots = filterTargets.length
        ? filterTargets.map(item => item.parent)
        : searchTargets.length
        ? searchTargets.map(item => item.parent)
        : ['root'];
      let filterNestedTree = [];
      treeRoots.forEach(treeRoot => {
        filterNestedTree = [...filterNestedTree, ...arrayToTree(filterTree, treeRoot)];
      });
      // Remove top level duplicates
      filterNestedTree = [...new Map(filterNestedTree.map(item => [item.id, item])).values()];
      const filterOptions = pivot(searchTree);

      return {
        ...state,
        searchItem: searchItem,
        searchTree: searchTree,
        filterItem: filterItem,
        filterTree: filterTree,
        filterNestedTree: filterNestedTree,
        filterOptions: filterOptions,
      };
    // case 'BUILD_TREE':
    //   const tree = action.payload;

    //   const treeWithIcon = tree.map(node => ({
    //     ...node,
    //     label: (
    //       <span>
    //         {tree.filter(d => d.parent === node.id) > 0 ? null : nodeIcons[node.type]} {node.name}
    //       </span>
    //     ),
    //     parent: node.parent ? node.parent : 'root',
    //   }));

    //   const nestedTree = arrayToTree(treeWithIcon);

    //   return {
    //     ...state,
    //     tree: treeWithIcon,
    //     nestedTree: nestedTree,
    //     series: tree.filter(node => node.type === 'series'),
    //   };

    default:
      return state;
  }
};

export default TreeReducer;
