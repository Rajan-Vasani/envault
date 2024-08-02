import {Skeleton, Space} from 'antd';

export const TreeSiderSkeleton = () => {
  return (
    <>
      <Skeleton.Button block active />
      <br />
      <br />
      <Space style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
        <Skeleton.Button active />
        <Skeleton.Button active />
      </Space>
      <br />
      <Skeleton.Button block active />
      <br />
      <br />
      <Skeleton.Button block active />
      <br />
      <br />
      <Skeleton.Button block active />
    </>
  );
};
