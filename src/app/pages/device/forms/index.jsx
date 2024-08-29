import {useCallback} from 'react';
import {ArcConfig} from './arc';
import {CsiConfig} from './csi';
import {EnvoyConfig} from './envoy';
import {GenericConfig} from './generic';

export const DeviceTypeConfig = props => {
  const {type} = props;
  const getForm = useCallback(() => {
    switch (type) {
      case 'csi':
        return <CsiConfig {...props} />;
      case 'arc':
        return <ArcConfig {...props} />;
      case 'envoy':
        return <EnvoyConfig {...props} />;
      default:
        return <GenericConfig {...props} />;
    }
  }, [type, props]);
  return <>{getForm()}</>;
};
