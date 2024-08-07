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
  // config state is the shared config of the node
  const [config, setConfig] = useState(node.config || {});

  // update config state when node or route params change
  useEffect(() => {
    if (node.config) {
      return setConfig(structuredClone(node.config));
    } else {
      setConfig({});
    }
  }, [node.config]);

  const mergeConfig = newConfig => {
    setConfig(config =>
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
    config,
    setConfig,
    mergeConfig,
  };

  return <NodeContext.Provider value={value}>{children}</NodeContext.Provider>;
};
