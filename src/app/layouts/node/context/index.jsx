import {isArray, mergeWith, union} from 'lodash';
import {createContext, useContext, useEffect, useState} from 'react';

const NodeContext = createContext({
  setConfig: () => {},
  mergeConfig: () => {},
});

export const useNodeContext = () => {
  return useContext(NodeContext);
};

export const NodeProvider = ({children, node}) => {
  const {id, parent, hub, type, name, permission, deleted, meta, ...nodeParams} = node;
  const nodeAttrs = {id, parent, hub, type, name, permission, deleted, meta};

  // config state is the shared config of the node
  const [nodeConfig, setNodeConfig] = useState(nodeParams.config || {});

  // update config state when node or route params change
  useEffect(() => {
    if (nodeParams.config) {
      return setNodeConfig(structuredClone(nodeParams.config));
    } else {
      setNodeConfig({});
    }
  }, [nodeParams.config]);

  const mergeNodeConfig = newConfig => {
    setNodeConfig(config =>
      structuredClone(
        mergeWith(config, newConfig, (objValue, srcValue) => {
          if (isArray(objValue)) {
            return union(objValue, srcValue);
          }
        }),
      ),
    );
  };

  const value = {
    node,
    nodeAttrs,
    nodeParams,
    nodeConfig,
    setNodeConfig,
    mergeNodeConfig,
  };

  return <NodeContext.Provider value={value}>{children}</NodeContext.Provider>;
};
