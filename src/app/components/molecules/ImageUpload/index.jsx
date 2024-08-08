import {PlusOutlined} from '@ant-design/icons';
import {App, Upload} from 'antd';
import {createStyles} from 'antd-style';
import {useEffect, useState} from 'react';

const getBase64 = file =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
    reader.onloadend = function () {
      return reader.result;
    };
  });

const useStyles = createStyles(({css}, {size}) => ({
  upload: css`
    .ant-upload.ant-upload-select {
      display: block;
      width: ${size && `${size?.w}px !important`};
      height: ${size && `${size?.h}px !important`};
      margin: 0;
    }
  `,
}));

const ImageUpload = ({label, name, onImageSelect, initialValues, disabled, size, warping}) => {
  const {message} = App.useApp();
  const [imageUrl, setImageUrl] = useState();
  const {styles} = useStyles({size});

  const handleChange = async file => {
    await getBase64(file).then(base64Url => {
      setImageUrl(base64Url);
      onImageSelect({[name]: base64Url});
    });
  };

  const beforeUpload = file => {
    const imageType = ['image/jpeg', 'image/png', 'image/svg+xml'];
    const isImage = imageType.includes(file.type);
    const isLt2M = file.size / 1024 / 1024 < 1;
    if (!isImage) {
      alert('You can only upload image file!');
      message.error('You can only upload image file!');
      return false;
    }
    if (!isLt2M) {
      alert('Image must smaller than 1MB!');
      message.error('Image must smaller than 1MB!');
      return false;
    }
    if (isImage && isLt2M) {
      handleChange(file);
    }
    return false;
  };

  useEffect(() => {
    setImageUrl(initialValues);
  }, [initialValues]);

  const uploadButton = (
    <div>
      <PlusOutlined />
      <div
        style={{
          marginTop: 8,
        }}
      >
        Upload
      </div>
    </div>
  );
  return (
    <>
      <label style={{textAlign: 'left', display: 'block'}}>{label}</label>
      <Upload
        name="logo"
        listType="picture-card"
        showUploadList={false}
        beforeUpload={beforeUpload}
        disabled={disabled}
        className={styles.upload}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt="avatar"
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              width: warping ? '100%' : 'auto',
              height: warping ? '100%' : 'auto',
            }}
          />
        ) : (
          uploadButton
        )}
      </Upload>
    </>
  );
};
export default ImageUpload;
