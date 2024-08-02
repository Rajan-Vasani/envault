import {useQueryClient} from '@tanstack/react-query';
import {App, Form, Input, Layout} from 'antd';
import NodeHeader from 'app/layouts/node/header';
import {API_QUERY} from 'constant/query';
import {useNode, useNodeSaveMutation} from 'hooks/useNode';
import {createContext, useEffect, useRef, useState} from 'react';
import {useOutletContext, useParams} from 'react-router-dom';
import GridStackControl from './DashboardPreview/GridStackControl';
import DashboardDetailBuilder from './components/builder';
import {DashboardProvider} from './context';
const {Content} = Layout;

export const Component = props => {
  const {previousData} = props;
  const {nodeId: _nodeId} = useParams();
  const nodeId = +_nodeId;
  const {hub} = useOutletContext();
  const {mutate: saveNode} = useNodeSaveMutation();
  const {data: node = {}} = useNode({select: data => data.find(n => n.id === nodeId)});
  const {message} = App.useApp();
  const queryClient = useQueryClient();
  const contentRef = useRef(null);

  const [form] = Form.useForm();
  const [widgets, setWidgets] = useState([]);

  const dashboard = createContext();
  dashboard.type = 'dashboard';
  dashboard.previousData = node || previousData;

  useEffect(() => {
    setWidgets(dashboard.previousData?.widgets ?? []);
  }, [dashboard.previousData]);

  const onDashboardSave = allFormValue => {
    message.info('Saving your dashboard');
    const {layout} = allFormValue;
    const widgetData = widgets.map(item => {
      return {
        ...item,
        gridstack: layout?.gridstack[item.id],
        ...allFormValue[item.id],
      };
    });

    const dashboardPayload = {
      ...allFormValue['form-dashboard'],
      hub: hub?.id,
      type: 'dashboard',
      widgets: widgetData,
      // config: {timeRange: []},
    };
    console.log('allFormValue', dashboardPayload);

    saveNode(
      {type: 'dashboard', data: dashboardPayload},
      {
        onSuccess: () => {
          message.success('Dashboard save success!');
          queryClient.invalidateQueries({queryKey: [API_QUERY.NODE_DATA]});
        },
      },
    );
  };
  const onFormChange = (name, {forms}) => {
    // console.log('onFormChange', name, forms);
    // console.log('onFormChange', name, forms[name].getFieldsValue(true));
  };
  const onFormFinish = async (name, {forms}) => {
    // Wait for all validations to complete
    await Promise.all(Object.keys(forms).map(formName => forms[formName].validateFields()));
    // Check for errors in all forms
    const errors = Object.keys(forms).reduce((acc, formName) => {
      const formErrors = forms[formName].getFieldsError().filter(({errors}) => errors.length > 0);
      return [...acc, ...formErrors];
    }, []);

    if (errors.length > 0) {
      console.log('There are error fields in the forms:', errors);
      throw new Error('Validation failed');
    } else {
      if (name === 'general') {
        const {value} = forms[name].getFieldsValue(true);
        if (value && value?.clear) {
          Object.keys(forms).forEach(item => {
            forms[item].resetFields();
          });
        }
      }
      if (name === 'dashboardSave') {
        try {
          // Wait for all validations to complete
          await Promise.all(Object.keys(forms).map(formName => forms[formName].validateFields()));
          // Check for errors in all forms
          const errors = Object.keys(forms).reduce((acc, formName) => {
            const formErrors = forms[formName].getFieldsError().filter(({errors}) => errors.length > 0);
            return [...acc, ...formErrors];
          }, []);
          if (errors.length > 0) {
            console.log('There are error fields in the forms:', errors);
            throw new Error('Validation failed');
          } else {
            const allFormValue = await Object.keys(forms).reduce(
              (a, v) => ({...a, [v.replace('formWidget-', '')]: forms[v].getFieldsValue(true)}),
              {},
            );
            onDashboardSave(allFormValue);
          }
        } catch (errInfo) {
          console.log('Validate Failed:', errInfo);
        }
        return;
      }
      if (name.includes('widgetData')) {
        console.log(name);
        console.log(forms);
        const widgetId = name.replace('widgetData', 'formWidget-');
        const dataFromWidget = forms[name].getFieldsValue(true);
        console.log(dataFromWidget);
        const currentFormValue = forms[widgetId].getFieldsValue(true);
        forms[widgetId].setFieldsValue({...currentFormValue, widgetData: dataFromWidget});
        forms[widgetId].validateFields();
        forms[name].resetFields();
        return;
      }
    }
  };

  const handleWidgetRemove = widgetId => {
    setWidgets(widgets.filter(item => item.id !== widgetId));
  };

  const handleWidgetAdd = data => {
    setWidgets([...widgets, data]);
  };
  const clearWidget = () => {
    setWidgets([]);
    form.setFieldsValue({clear: true});
    form.submit();
  };

  return (
    <Layout style={{height: '100%'}}>
      <DashboardProvider values={dashboard}>
        <Form.Provider onFormFinish={onFormFinish} onFormChange={onFormChange}>
          <Form form={form} style={{display: 'none'}} name={'general'}>
            <Form.Item name="clear">
              <Input />
            </Form.Item>
          </Form>
          <NodeHeader node={node} />
          <Layout>
            <Content ref={contentRef} style={{overflowY: 'auto', flex: '1 1 auto'}}>
              <GridStackControl widgetItems={widgets} removeWidget={handleWidgetRemove} addWidget={handleWidgetAdd} />
            </Content>
            <NodeSider
              node={node}
              hub={hub}
              type={'dashboard'}
              clearWidget={clearWidget}
              addWidget={data => setWidgets([...widgets, data])}
            />
          </Layout>
          <DashboardDetailBuilder widgets={widgets} />
        </Form.Provider>
      </DashboardProvider>
    </Layout>
  );
};
Component.displayName = 'Dashboard';
