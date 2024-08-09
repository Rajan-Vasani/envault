import {useCallback} from 'react';
import {ArcConfig} from './arc';
import {CsiConfig} from './csi';

export const DeviceTypeConfig = props => {
  const {type} = props;
  const getForm = useCallback(() => {
    switch (type) {
      case 'csi':
        return <CsiConfig {...props} />;
      case 'arc':
        return <ArcConfig {...props} />;
      default:
        return null;
    }
  }, [type, props]);
  return <>{getForm()}</>;
};
