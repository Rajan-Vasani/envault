import {Button, Layout, Result} from 'antd';
const {Content} = Layout;

export const Component = props => {
  return (
    <Content>
      <Result
        status="warning"
        title="We couldn't route this request."
        extra={
          <Button type="primary" onClick={() => window.history.back()}>
            Go Back
          </Button>
        }
      />
    </Content>
  );
};
Component.displayName = 'NotFound';
export default Component;
