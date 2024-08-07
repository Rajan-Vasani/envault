import {App, Button, Card, Col, ColorPicker, Form, Input, QRCode, Row, Select, Space, Typography} from 'antd';
import {ThemeProvider, useTheme} from 'antd-style';
import ImageUpload from 'app/components/molecules/ImageUpload';
import Icon from 'components/atoms/Icon';
import {useHubUpdateMutation} from 'hooks/useHub';
import {useEffect, useState} from 'react';
import {useOutletContext} from 'react-router-dom';

const {Text, Link} = Typography;

export const Component = params => {
  const {message} = App.useApp();
  const [formHubValue, setFormHubValue] = useState();
  const theme = useTheme();
  const {user, hub} = useOutletContext();
  const [disabled, setDisabled] = useState(true);
  const [form] = Form.useForm();

  const initHubValue = {
    name: '',
    full_name: '',
    config: {
      theme: 'light',
      colorPrimary: theme.colorPrimary,
      logoInlineLight: undefined,
      logoInlineDark: undefined,
      logoStackedLight: undefined,
      logoStackedDark: undefined,
      favicon: undefined,
    },
  };

  const {mutate: saveHub} = useHubUpdateMutation();

  const onFinish = values => {
    message.info('Saving your hub');
    const {colorPrimary = theme.colorPrimary} = values.config;
    values.config.colorPrimary = typeof colorPrimary === 'string' ? colorPrimary : colorPrimary.toHexString();
    saveHub(values, {
      onSuccess: () => {
        message.success(`Hub ${globalThis.envault.hub ? 'edit' : 'create'} success!`);
      },
      onError: error => {
        const errorMessage =
          error.status === 409 ? 'This name already exists' : 'Can not save your hub. Please try again later!';
        message.error(errorMessage);
      },
    });
  };

  const onFinishFailed = errorInfo => {
    console.log('Failed:', errorInfo);
  };

  const handleFieldChange = () => {
    const hubValue = form.getFieldsValue();
    setFormHubValue(hubValue);
  };

  const handleImageSelect = imageConfig => {
    form.setFieldsValue({config: imageConfig});
  };

  const downloadQRCode = () => {
    const canvas = document.getElementById('myqrcode')?.querySelector('canvas');
    if (canvas) {
      const url = canvas.toDataURL();
      const a = document.createElement('a');
      a.download = 'QRCode.png';
      a.href = url;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const handleDisabled = () => {
    setDisabled(disabled => !disabled);
  };

  useEffect(() => {
    if (hub) {
      const {id, name, full_name, config} = hub;
      form.setFieldsValue({id, name, full_name, config});
      setFormHubValue({id, name, full_name, config});
    } else {
      form.setFieldsValue(initHubValue);
    }
  }, [hub]);

  return (
    <>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        onChange={handleFieldChange}
        onFinishFailed={onFinishFailed}
        autoComplete="off"
        style={{paddingBottom: '12px'}}
        initialValues={initHubValue}
      >
        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" disabled={disabled}>
              Save
            </Button>
            <Button
              onClick={handleDisabled}
              icon={<Icon icon={disabled ? 'LockOutlined' : 'UnlockOutlined'} type={'ant'} />}
            />
          </Space>
        </Form.Item>
        <Form.Item
          name="full_name"
          label="Name"
          getValueFromEvent={value => {
            const full_name = value?.target?.value;
            if (full_name) {
              form.setFields([{name: 'name', value: full_name.toLowerCase().replace(/[\W_]/g, '').slice(0, 18)}]);
              return full_name;
            }
          }}
          rules={[
            {required: true, message: '* please enter a hub name'},
            {min: 2, message: '* must be at least 2 characters'},
            {type: 'string'},
          ]}
        >
          <Input placeholder="hub name" disabled={disabled} />
        </Form.Item>
        <Form.Item
          name="name"
          label="Domain Name"
          rules={[
            {
              required: true,
              message: '* please enter a hub domain',
            },
            {type: 'string'},
            {
              min: 2,
              message: '* must be at least 2 characters',
            },
            {
              max: 18,
              message: '* must be at most 18 characters',
            },
            {
              pattern: /^[a-z0-9]+$/,
              message: '* must be lowercase and contain only letters and numbers',
            },
            {
              validator: async (rule, value) => {
                if (value && user.hubs.some(hub => hub.name === value && hub.name !== form.getFieldValue('name'))) {
                  throw new Error('Hub domain already exists');
                }
              },
            },
          ]}
        >
          <Input placeholder="hub name" disabled={disabled} />
        </Form.Item>
        <Form.Item label="Access Portal">
          <Row gutter={16}>
            <Col>
              <Link href={globalThis.envault.getOrigin(formHubValue?.name)}>
                {globalThis.envault.getOrigin(formHubValue?.name)}
              </Link>
              <div id="myqrcode">
                <Button onClick={downloadQRCode} style={{height: '100%', padding: theme.padding}}>
                  <QRCode value={globalThis.envault.getOrigin(formHubValue?.name)} />
                </Button>
              </div>
            </Col>
          </Row>
        </Form.Item>
        <Form.Item name={['config', 'colorPrimary']} label="Primary Colour">
          <ColorPicker
            showText
            value={hub?.config?.colorPrimary || theme.colorPrimary}
            defaultFormat="hex"
            disabled={disabled}
          />
        </Form.Item>
        <Form.Item name={['config', 'theme']} label="Theme">
          <Select
            options={[
              {value: 'dark', label: 'Dark'},
              {value: 'light', label: 'Light'},
              {value: 'auto', label: 'System'},
            ]}
            disabled={disabled}
          />
        </Form.Item>
        <Text>Logo Inline (recommended at least 200 x 40)</Text>
        <Row gutter={16}>
          <Col>
            <ThemeProvider themeMode={'light'}>
              <Form.Item name={['config', 'logoInlineLight']}>
                <Card>
                  <ImageUpload
                    label="Light"
                    name="logoInlineLight"
                    onImageSelect={handleImageSelect}
                    initialValues={hub?.config?.logoInlineLight}
                    disabled={disabled}
                    size={{w: 200, h: 40}}
                  />
                </Card>
              </Form.Item>
            </ThemeProvider>
          </Col>
          <Col>
            <ThemeProvider themeMode={'dark'}>
              <Form.Item name={['config', 'logoInlineDark']}>
                <Card>
                  <ImageUpload
                    label="Dark"
                    name="logoInlineDark"
                    onImageSelect={handleImageSelect}
                    initialValues={hub?.config?.logoInlineDark}
                    disabled={disabled}
                    size={{w: 200, h: 40}}
                  />
                </Card>
              </Form.Item>
            </ThemeProvider>
          </Col>
        </Row>
        <Text>Logo Stacked (recommended at least 200 x 200)</Text>
        <Row gutter={16}>
          <Col>
            <ThemeProvider themeMode={'light'}>
              <Form.Item name={['config', 'logoStackedLight']}>
                <Card>
                  <ImageUpload
                    label="Light"
                    name="logoStackedLight"
                    onImageSelect={handleImageSelect}
                    initialValues={hub?.config?.logoStackedLight}
                    disabled={disabled}
                    size={{w: 200, h: 200}}
                  />
                </Card>
              </Form.Item>
            </ThemeProvider>
          </Col>
          <Col>
            <ThemeProvider themeMode={'dark'}>
              <Form.Item name={['config', 'logoStackedDark']}>
                <Card>
                  <ImageUpload
                    label="Dark"
                    name="logoStackedDark"
                    onImageSelect={handleImageSelect}
                    initialValues={hub?.config?.logoStackedDark}
                    disabled={disabled}
                    size={{w: 200, h: 200}}
                  />
                </Card>
              </Form.Item>
            </ThemeProvider>
          </Col>
        </Row>
        <Text>Favicon (recommended at least 32 x 32)</Text>
        <Row gutter={16}>
          <Col>
            <Form.Item name={['config', 'favicon']}>
              <Card>
                <ImageUpload
                  name="favicon"
                  onImageSelect={handleImageSelect}
                  initialValues={hub?.config?.['favicon']}
                  disabled={disabled}
                  size={{w: 32, h: 32}}
                  warping={true}
                />
              </Card>
            </Form.Item>
          </Col>
        </Row>
        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" disabled={disabled}>
              Save
            </Button>
            <Button
              onClick={handleDisabled}
              icon={<Icon icon={disabled ? 'LockOutlined' : 'UnlockOutlined'} type={'ant'} />}
            />
          </Space>
        </Form.Item>
      </Form>
    </>
  );
};

Component.displayName = 'HubManagement';
