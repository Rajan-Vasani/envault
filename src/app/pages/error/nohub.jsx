import {Button, Flex, Result} from 'antd';
import Icon from 'components/atoms/Icon';

export const NoHub = props => {
  const supportUrl = `mailto:support@envault.io?subject=Problem accessing the ${globalThis.envault.hub} Hub`;

  return (
    <Flex justify={'center'} align={'center'} style={{height: '100svh'}}>
      <Result
        status={props.error?.status || 404}
        title="This doesn't look right..."
        subTitle={`We cant reach the ${globalThis.envault.hub} Hub right now. Please contact support, or try again later`}
        extra={
          <Flex vertical gap="small" style={{width: '100%'}}>
            <Button
              type="primary"
              onClick={() => window.location.reload()}
              icon={<Icon icon="ReloadOutlined" type="ant" />}
              block
            >
              Try a page reload
            </Button>
            <Button href={globalThis.envault.app} icon={<Icon icon="EnvaultIcon" type="envault" />} block>
              Back to Envault
            </Button>
            <Button type="dashed" href={supportUrl} icon={<Icon icon="CommentOutlined" type="ant" />} block>
              Contact Support
            </Button>
          </Flex>
        }
      />
    </Flex>
  );
};
export default NoHub;
