import {get, set} from 'lodash';
import {createContext, useContext, useEffect, useState} from 'react';

const NodeContext = createContext({
  setNodeParams: () => {},
  updateNodeParams: () => {},
});

export const useNodeContext = () => {
  return useContext(NodeContext);
};

export const NodeProvider = ({children, node}) => {
  const {id, parent, hub, type, name, permission, deleted, meta, ...params} = node;
  const nodeAttrs = {id, parent, hub, type, name, permission, deleted, meta};

  /**
   * Getter and Setter for the node parameters.
   */
  const [nodeParams, setNodeParams] = useState(params || {});

  /**
   * Updates nodeParams when node changes.
   * Use node as dependency to avoid infinite loop, as the reference to params changes on every render.
   */
  useEffect(() => setNodeParams(params), [node]);

  /**
   * Updates the node parameters at the specified index.
   * @param {string} path - The path to the node property to update.
   * @param {Function|any} updater - The updater function or value to apply to the node parameters.
   * @returns {void}
   */
  const updateNodeParams = (path, updater) => {
    setNodeParams(previousParams => {
      const updated = structuredClone(previousParams);
      const currentValue = get(updated, path);
      const newValue = typeof updater === 'function' ? updater(currentValue ?? {}) : updater;
      set(updated, path, newValue);
      return updated;
    });
  };

  const value = {
    node,
    nodeAttrs,
    nodeParams,
    setNodeParams,
    updateNodeParams,
  };

  return <NodeContext.Provider value={value}>{children}</NodeContext.Provider>;
};
