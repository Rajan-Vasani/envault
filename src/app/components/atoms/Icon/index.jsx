import AntdIcon, * as AntdIcons from '@ant-design/icons';
import * as EchartsIcons from 'assets/icons/echarts';
import * as EnvaultIcons from 'assets/icons/envault';

export const Icon = props => {
  const {icon = 'QuestionCircleOutlined', type = 'ant', raw = false, ...rest} = props;
  switch (type) {
    case 'envault': {
      const EnvaultIcon = EnvaultIcons[icon];
      return raw ? <EnvaultIcon {...rest} /> : <AntdIcon component={EnvaultIcon} {...rest} />;
    }
    case 'echarts': {
      const EchartsIcon = EchartsIcons[icon];
      return raw ? <EchartsIcon {...rest} /> : <AntdIcon component={EchartsIcon} {...rest} />;
    }
    case 'ant': {
      const Ant = AntdIcons[icon];
      return <Ant {...rest} />;
    }
    default: {
      return <Icon {...rest} icon={'QuestionCircleOutlined'} type={'ant'} />;
    }
  }
};

export default Icon;
