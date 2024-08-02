import {Button, Input} from 'antd';
import Icon from 'app/components/atoms/Icon';
import {useState} from 'react';
import {CirclePicker} from 'react-color';

export const ColorPicker = ({
  initValue,
  prefix,
  size,
  placeholder,
  onColorChange = () => {},
  onKeyPress,
  onBlur,
  circlePickerWidth,
  ...props
}) => {
  const initColor = props.form?.current?.getFieldValue().indicator_color;
  const initIcon = props.form?.current?.getFieldValue().indicator_type;
  const [colorHex, setColorHex] = useState(initValue ? initValue : initColor ? initColor : '');

  const handleColorChange = color => {
    onColorChange(color.hex);
    setColorHex(color.hex);
  };

  const randomColor = () => {
    const randomColor = '#' + Math.floor(Math.random() * 16777215).toString(16);
    onColorChange(randomColor);
    setColorHex(randomColor);
  };

  const userInput = e => {
    const userColor = e.target.value;
    onColorChange(userColor);
    setColorHex(userColor);
  };

  const icon = initIcon !== 'icon' && initIcon !== 'pinpoint' ? initIcon : 'Sync';

  return (
    <>
      <div style={{display: 'flex', alignItems: 'center'}}>
        <Button
          style={{marginRight: '6px', background: colorHex, width: '28px'}}
          shape="circle"
          icon={initIcon ? <Icon icon={icon} type={'ant'} color="white" /> : ' '}
          onClick={randomColor}
        />
        <Input
          className="aqua-input"
          onKeyPress={onKeyPress}
          onBlur={onBlur}
          prefix={prefix}
          placeholder={placeholder}
          size={size}
          autoComplete="off"
          onChange={userInput}
        />
      </div>
      <br />
      <CirclePicker
        onChangeComplete={handleColorChange}
        {...(circlePickerWidth ? {width: circlePickerWidth} : null)}
      />
    </>
  );
};
