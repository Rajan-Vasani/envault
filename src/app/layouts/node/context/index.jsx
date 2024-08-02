import {useQueryClient} from '@tanstack/react-query';
import {API_QUERY} from 'constant/query';
import {useNode} from 'hooks/useNode';
import {isArray, mergeWith, union} from 'lodash';
import {createContext, useContext, useEffect, useState} from 'react';
import {useMatch} from 'react-router-dom';

const NodeContext = createContext({
  node: {},
  config: {},
  setConfig: () => {},
  mergeConfig: () => {},
});

export const useNodeContext = () => {
  return useContext(NodeContext);
};

export const NodeProvider = ({children}) => {
  // fetch route params
  const {params: {nodeType, nodeId} = {}} = useMatch('hub/explore/node/:nodeType?/:nodeId?');
  // fetch node data, preload with route params
  const queryClient = useQueryClient();
  const cachedNode = queryClient
    .getQueryData([API_QUERY.NODE_DATA, globalThis.envault.hub, 'node'])
    ?.find(node => node.id === +nodeId);
  const {data: [freshNode] = []} = useNode({type: nodeType, id: +nodeId, enabled: !!(nodeType && nodeId != -1)});
  const node = freshNode || cachedNode;

  // config state is the shared config of the node
  const [config, setConfig] = useState({});
  // update config state when node or route params change
  useEffect(() => {
    if (node?.config) {
      return setConfig(structuredClone(node.config));
    }
    setConfig({});
  }, [node, nodeId, nodeType]);

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
