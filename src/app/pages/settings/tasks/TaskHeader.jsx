import {Button, Col, Flex, Form, Input, Layout, Row, Select, Switch, TreeSelect} from 'antd';
import {createStyles} from 'antd-style';
import Icon from 'app/components/atoms/Icon';
import {FormSchedule} from 'app/components/molecules/FormSchedule';
import {useUser} from 'app/services/hooks/useUser';
import dayjs from 'dayjs';
import isToday from 'dayjs/plugin/isToday';
import {useNode} from 'hooks/useNode';
import {useEffect} from 'react';
dayjs.extend(isToday);
const {Header} = Layout;

const useStyles = createStyles(({css, token}) => ({
  header: css`
    background: ${token.colorBgLayout};
    border-bottom: 1px solid ${token.colorBorder};
    display: flex;
    align-items: center;
    height: auto;
    padding: 10px;
  `,
  breadcrumb: css`
    display: flex;
    flex-direction: row;
    align-items: center;
  `,
  config: css`
    display: flex;
    justify-content: end;
  `,
  content: css`
    width: 100%;
  `,
}));

export default function TaskHeader(props) {
  const {id, ownerData = [], task, onClose, hub} = props;
  const {data: tree} = useNode({hub});
  const {data: user = []} = useUser();
  const [form] = Form.useForm();
  const [actionForm] = Form.useForm();
  const {styles} = useStyles();

  useEffect(() => {
    if (task) {
      const {id, parent, name, owner = user[0]?.id, schedule, active} = task;
      form.setFieldsValue({id, parent, name});
      const {at, value, ...rest} = schedule || {};
      let scheduleFormValue = {
        owner,
        active,
        schedule,
      };
      if (at && typeof at === 'string') {
        scheduleFormValue.schedule.at = dayjs(at, 'HH:mm');
      }
      if (value && typeof value === 'string') {
        const match = value.match(/^(\d+)\s(minutes|hours|days)$/);
        scheduleFormValue.schedule.value = +match[1];
        scheduleFormValue.schedule.unit = match[2];
      }
      actionForm.setFieldsValue(scheduleFormValue);
    }
  }, [form, actionForm, task]);

  return (
    <Header className={styles.header}>
      <Row align={'middle'} justify={'space-between'} className={styles.content}>
        <Col className={styles.breadcrumb}>
          <Form className={styles.content} form={form} layout="inline" name="taskInfo" requiredMark={false}>
            <Form.Item
              label="Task"
              name="parent"
              rules={[{required: true, message: 'Please input parent name!'}]}
              labelCol={{flex: 1, style: {padding: 0}}}
              wrapperCol={{flex: 1, style: {padding: 0}}}
            >
              <TreeSelect
                placeholder="Parent"
                treeData={tree}
                treeDataSimpleMode={{
                  id: 'id',
                  pId: 'parent',
                  rootPId: null,
                }}
                showSearch
                fieldNames={{value: 'id', label: 'name'}}
                treeIcon
                treeLine={true}
                listHeight={500}
                treeNodeFilterProp="name"
                style={{textAlign: 'center'}}
                variant={'borderless'}
                dropdownStyle={{minWidth: '200px'}}
              />
            </Form.Item>
            <span> / </span>
            <Form.Item
              name="name"
              rules={[{required: true, message: 'Please input task name!'}]}
              style={{marginBottom: 0}}
            >
              <Input variant={'borderless'} placeholder="Name" />
            </Form.Item>
            <Form.Item name="id" hidden>
              <Input />
            </Form.Item>
          </Form>
        </Col>
        <Col className={styles.config}>
          <Form className={styles.content} form={actionForm} layout="inline" name="taskSubmit" requiredMark={false}>
            <Flex wrap="wrap" gap="small">
              <Form.Item noStyle name="owner" rules={[{required: true, message: 'Owner is required!'}]}>
                <Select
                  placeholder="Owner"
                  style={{width: 160}}
                  options={ownerData}
                  fieldNames={{label: 'name', value: 'id'}}
                />
              </Form.Item>
              <Form.Item label="Enable" valuePropName={'checked'} name="active" style={{margin: 0}}>
                <Switch />
              </Form.Item>
              <FormSchedule />
              <Form.Item noStyle>
                <Button type="primary" htmlType="submit">
                  {id ? 'Update' : 'Save'}
                </Button>
              </Form.Item>
              {onClose && (
                <Button onClick={onClose}>
                  <Icon icon={'CloseOutlined'} type={'ant'} />
                </Button>
              )}
            </Flex>
          </Form>
        </Col>
      </Row>
    </Header>
  );
}
