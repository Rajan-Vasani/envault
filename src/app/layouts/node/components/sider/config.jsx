import {ChartConfig} from 'pages/chart/forms/config';
import {GroupConfig} from 'pages/group/forms/config';
// import {DashboardConfig} from 'pages/dashboard/forms/config';
// import {DeviceConfig} from 'pages/device/forms/config';
// import {GalleryConfig} from 'pages/gallery/forms/config';
// import {SeriesConfig} from 'pages/series/forms/config';
// import {NotificationConfig} from 'pages/notification/forms/config';
// import {SeriesConfig} from 'pages/series/forms/config';
// import {TaskConfig} from 'pages/task/forms/config';
// import {TimelapseConfig} from 'pages/timelapse/forms/config';
// import {VariableConfig} from 'pages/variable/forms/config';
import {useCallback} from 'react';

export default function NodeConfig(props) {
  const {node} = props;

  const getForm = useCallback(() => {
    switch (node?.type) {
      case 'group':
        return <GroupConfig {...props} />;
      // case 'series':
      //   return <SeriesConfig {...props} />;
      case 'chart':
        return <ChartConfig {...props} />;
      // case 'timelapse':
      //   return <TimelapseConfig {...props} />;
      // case 'gallery':
      //   return <GalleryConfig {...props} />;
      // case 'dashboard':
      //   return <DashboardConfig {...props} />;
      // case 'device':
      //   return <DeviceConfig {...props} />;
      // case 'variable':
      //   return <VariableConfig {...props} />;
      // case 'task':
      //   return <TaskConfig {...props} />;
      // case 'notification':
      //   return <NotificationConfig {...props} />;
      default:
        return null;
    }
  }, [node, props]);

  return <>{getForm()}</>;
}
