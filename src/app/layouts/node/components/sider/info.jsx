import {ChartInfo} from 'pages/chart/forms/info';
import {DashboardInfo} from 'pages/dashboard/forms/info';
import {DeviceInfo} from 'pages/device/forms/info';
import {GalleryInfo} from 'pages/gallery/forms/info';
import {GroupInfo} from 'pages/group/forms/info';
import {NotificationInfo} from 'pages/notification/forms/info';
import {SeriesInfo} from 'pages/series/forms/info';
import {TaskInfo} from 'pages/task/forms/info';
import {TimelapseInfo} from 'pages/timelapse/forms/info';
import {VariableInfo} from 'pages/variable/forms/info';
import {useCallback} from 'react';

export const NodeInfo = props => {
  const {node} = props;
  const getForm = useCallback(() => {
    switch (node?.type) {
      case 'group':
        return <GroupInfo {...props} />;
      case 'series':
        return <SeriesInfo {...props} />;
      case 'chart':
        return <ChartInfo {...props} />;
      case 'timelapse':
        return <TimelapseInfo {...props} />;
      case 'gallery':
        return <GalleryInfo {...props} />;
      case 'dashboard':
        return <DashboardInfo {...props} />;
      case 'device':
        return <DeviceInfo {...props} />;
      case 'variable':
        return <VariableInfo {...props} />;
      case 'task':
        return <TaskInfo {...props} />;
      case 'notification':
        return <NotificationInfo {...props} />;
      default:
        return null;
    }
  }, [node, props]);

  return <>{getForm()}</>;
};
export default NodeInfo;
