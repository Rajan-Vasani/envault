import {Form, Select} from 'antd';

export const LineConfig = props => {
  const {path = []} = props;
  return (
    <>
      <Form.Item name={[...path, 'step']} label="Step">
        <Select
          options={[
            {value: false, label: 'Disable'},
            {value: true, label: 'Enable'},
            {value: 'start', label: 'Start'},
            {value: 'middle', label: 'Middle'},
            {value: 'end', label: 'End'},
          ]}
        />
      </Form.Item>
      <Form.Item name={[...path, 'sampling']} label="Sampling">
        <Select
          options={[
            {value: 'lttb', label: 'LTTB (Largest-Triangle-Three-Buckets)'},
            {value: 'average', label: 'Average'},
            {value: 'min', label: 'Min'},
            {value: 'max', label: 'Max'},
            {value: 'minmax', label: 'MinMax'},
            {value: 'sum', label: 'Sum'},
          ]}
        />
      </Form.Item>
    </>
  );
};
