import {Flex, Tag} from 'antd';
import {Icon} from 'components/atoms/Icon';
import {routes} from 'constant/routes';
import {Link} from 'react-router-dom';

export const menuItemsHandler = items => {
  return items.map(item => ({
    ...item,
    icon: item?.icon ? <Icon {...item.icon} /> : '',
    label: item?.label?.path ? (
      <Link to={item.label.path}>
        {item.label.name} {item.label.tag && item.label.tag}
      </Link>
    ) : item?.label?.name ? (
      item.label.name
    ) : (
      ''
    ),
    ...(item?.children && {children: menuItemsHandler(item.children)}),
  }));
};

export const nodeDetails = [
  {
    value: 'group',
    title: 'Group',
    description: 'Organise your nodes with groups',
    icon: {icon: 'FolderOutlined', type: 'ant'},
    iconAlt: {icon: 'FolderOpenOutlined', type: 'ant'},
    color: 'magenta',
    draggable: true,
    label: {name: 'Group'},
  },
  {
    value: 'series',
    title: 'Series',
    description: 'Create a new timeseries data source',
    icon: {icon: 'DotChartOutlined', type: 'ant'},
    color: 'red',
    draggable: true,
    label: {name: 'Series'},
  },
  {
    value: 'chart',
    title: 'Chart',
    description: 'Visualise timeseries data with charts',
    icon: {icon: 'LineChartOutlined', type: 'ant'},
    draggable: true,
    color: 'volcano',
    label: {name: 'Chart'},
  },
  {
    value: 'timelapse',
    title: 'Timelapse',
    description: 'Create new timeseries image source',
    icon: {icon: 'CameraOutlined', type: 'ant'},
    color: 'orange',
    draggable: true,
    label: {name: 'Timelapse'},
  },
  {
    value: 'gallery',
    title: 'Gallery',
    description: 'Visualise timeseries images with galleries',
    icon: {icon: 'PictureOutlined', type: 'ant'},
    color: 'gold',
    draggable: true,
    label: {name: 'Gallery'},
  },
  {
    value: 'dashboard',
    title: 'Dashboard',
    icon: {icon: 'ReconciliationOutlined', type: 'ant'},
    color: 'lime',
    draggable: true,
    label: {name: 'Dashboard'},
  },
  {
    value: 'device',
    title: 'Device',
    icon: {icon: 'SlidersOutlined', type: 'ant'},
    color: 'green',
    draggable: true,
    label: {name: 'Device'},
  },
  {
    value: 'variable',
    title: 'Variable',
    icon: {icon: 'DeploymentUnitOutlined', type: 'ant'},
    color: 'cyan',
    draggable: true,
    label: {name: 'Variable'},
  },
  {
    value: 'task',
    title: 'Task',
    icon: {icon: 'ScheduleOutlined', type: 'ant'},
    color: 'blue',
    draggable: true,
    label: {name: 'Task'},
  },
  {
    value: 'notification',
    title: 'Notification',
    icon: {icon: 'BellOutlined', type: 'ant'},
    color: 'geekblue',
    draggable: true,
    label: {name: 'Notification'},
  },
];

export const nodeTypeOptions = nodeDetails.map(node => ({
  value: node.value,
  label: (
    <Flex align={'center'} gap={'middle'}>
      <Icon {...node.icon} />
      {node.title}
    </Flex>
  ),
}));

export const mainMenuItems = [
  {
    key: 'explore',
    icon: {icon: 'RocketOutlined', type: 'ant'},
    label: {path: routes.explore, name: 'Explore'},
  },
  {
    key: 'analyse',
    icon: {icon: 'LineChartOutlined', type: 'ant'},
    label: {
      path: routes.analyse,
      name: 'Analyse',
      tag: <Tag icon={<Icon icon={'ExperimentOutlined'} type={'ant'} style={{padding: '2px'}} />} color="green" />,
    },
  },
];

export const accountMenuItems = [
  {
    key: 'profile',
    icon: {icon: 'UserOutlined', type: 'ant'},
    label: {path: globalThis.envault.app, name: 'Account'},
  },
  {
    type: 'divider',
  },
  {
    key: 'logout',
    icon: {icon: 'LogoutOutlined', type: 'ant'},
    label: {path: routes.logout, name: 'Logout'},
  },
];
export const settingsMenuItems = [
  {
    key: 'action',
    icon: {icon: 'SlidersOutlined', type: 'ant'},
    label: {path: '/action', name: 'Actions'},
  },
  {
    key: 'device',
    icon: {icon: 'ApiOutlined', type: 'ant'},
    label: {path: '/device', name: 'Devices'},
  },
  {
    key: 'variable',
    icon: {icon: 'DeploymentUnitOutlined', type: 'ant'},
    label: {path: '/variable', name: 'Variables'},
  },
  {
    key: 'hub',
    icon: {icon: 'DeploymentUnitOutlined', type: 'ant'},
    label: {path: routes.hub, name: 'Hubs'},
  },
];

const initialMenu = {
  mainMenuItems,
  accountMenuItems,
  settingsMenuItems,
  nodeDetails,
};

export default initialMenu;
