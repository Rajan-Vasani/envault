import {Button, Form} from 'antd';
import {createStyles} from 'antd-style';
import NodeBreadcrumb from 'components/atoms/Breadcrumb';
import Icon from 'components/atoms/Icon';
import {useNode} from 'hooks/useNode';
import DashboardContext from 'pages/dashboard/context';
import {useContext, useMemo} from 'react';

const useStyles = createStyles(({token, css}) => ({
  header: css`
    background-color: ${token.colorBgContainer};
    border-radius: ${token.borderRadius}px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  `,
}));

export default function WidgetHeader(props) {
  const {removeWidget} = props;
  const form = Form.useFormInstance();
  const type = Form.useWatch('type', {form, preserve: true}) ?? '';
  const widgetData = Form.useWatch('widgetData', {form, preserve: true});
  const {setEditWidget, isEdit} = useContext(DashboardContext);
  const {data: tree} = useNode();
  const styles = useStyles();

  const currentNode = useMemo(() => {
    if (widgetData?.id) {
      return tree.find(node => node.id === +widgetData?.id);
    }
  }, [tree, widgetData]);

  const handleEdit = () => {
    const widget = form.getFieldsValue();
    setEditWidget(widget);
  };

  if (!isEdit) return null;

  return (
    <div className={styles.header}>
      <NodeBreadcrumb node={currentNode} />
      <div>
        {type !== 'text' && (
          <Button type="default" onClick={handleEdit}>
            <Icon icon={'EditOutlined'} type={'ant'} />
          </Button>
        )}
        <Button type="primary" danger onClick={removeWidget}>
          <Icon icon={'DeleteOutlined'} type={'ant'} />
        </Button>
      </div>
    </div>
  );
}
