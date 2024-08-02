import initialState from 'config/tree.defaults';
import {createContext, useReducer} from 'react';
import TreeReducer from 'reducers/tree.reducer';

const TreeStore = props => {
  const [treeState, treeDispatch] = useReducer(TreeReducer, initialState);
  const contextValue = {treeState, treeDispatch};
  return <TreeContext.Provider value={contextValue}>{props.children}</TreeContext.Provider>;
};

export const TreeContext = createContext(initialState);

export default TreeStore;
