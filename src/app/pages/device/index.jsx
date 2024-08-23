import {Layout} from 'antd';
import {Outlet} from 'react-router-dom';
const {Content} = Layout;

export const Component = props => {
  return (
    <Content>
      <Outlet />
    </Content>
  );
};
Component.displayName = 'Device';
