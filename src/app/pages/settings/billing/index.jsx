import {Card, Col, Row, Statistic, Typography} from 'antd';
import Icon from 'app/components/atoms/Icon';
import {nodeDetails} from 'config/menu';
import {useNode} from 'hooks/useNode';

export const Component = props => {
  const {data: nodes, isSuccess} = useNode({hub: globalThis.envault.hub});

  return (
    <div>
      <Typography.Title level={2}>Usage Summary</Typography.Title>
      <Row gutter={[16, 16]}>
        {nodeDetails.map(({value, icon, label}) => (
          <Col
            key={value}
            xs={{flex: '100%'}}
            sm={{flex: '50%'}}
            md={{flex: '40%'}}
            lg={{flex: '20%'}}
            xl={{flex: '20%'}}
          >
            <Card style={{height: '100%'}}>
              <Statistic
                title={label.name}
                prefix={<Icon {...icon} />}
                value={nodes?.filter(n => n.type === value).length}
                loading={!isSuccess}
              />
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};
Component.displayName = 'BillingManagement';
