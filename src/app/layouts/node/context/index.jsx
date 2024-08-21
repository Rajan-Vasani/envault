import {isArray, mergeWith, union} from 'lodash';
import {createContext, useContext, useEffect, useState} from 'react';

const NodeContext = createContext({
  setNodeParams: () => {},
  mergeNodeParams: () => {},
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
   * Merges the given parameters with the current node parameters.
   * @param {Object} newParams - The new parameters to merge.
   * @returns {void}
   */
  const mergeNodeParams = newParams => {
    setNodeParams(config =>
      structuredClone(
        mergeWith(config, newParams, (objValue, srcValue) => {
          if (isArray(objValue)) {
            return union(objValue, srcValue);
          }
        }),
      ),
    );
  };

  /**
   * Updates the node parameters at the specified index.
   * @param {number} index - The index of the node parameters to update.
   * @param {Function|any} updater - The updater function or value to apply to the node parameters.
   * @returns {void}
   */
  const updateNodeParams = (index, updater) => {
    setNodeParams(previousParams => {
      const updated = structuredClone(previousParams);
      updated[index] = typeof updater === 'function' ? updater(updated[index] ?? {}) : updater;
      return updated;
    });
  };

  const value = {
    node,
    nodeAttrs,
    nodeParams,
    setNodeParams,
    mergeNodeParams,
    updateNodeParams,
  };

  return <NodeContext.Provider value={value}>{children}</NodeContext.Provider>;
};
