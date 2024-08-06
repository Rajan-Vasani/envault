import {Breadcrumb, Space, Tag, Tooltip} from 'antd';
import Icon from 'components/atoms/Icon';
import {nodeDetails} from 'config/menu';
import {useNode} from 'hooks/useNode';
import {Link} from 'react-router-dom';
import {findAncestors} from 'utils/tree';

export const NodeBreadcrumb = props => {
  const {
    node: {type, id, name},
  } = props;
  const {data} = useNode({select: data => findAncestors(data, id)});
  const ancestors = data?.reverse() || [];
  const tag = nodeDetails.find(({value}) => type === value);

  const breadcrumbItems =
    type && id
      ? [
          ...ancestors.map((parent, index) => {
            return {
              key: parent.id,
              title: (
                <Link to={`./${parent.type}/${parent.id}`}>
                  {index < 2 ? parent.name : <Tooltip title={parent.name}>...</Tooltip>}
                </Link>
              ),
            };
          }),
          {
            key: id,
            title: (
              <Space>
                {name}
                {tag && <Tag color={tag.color}>{type}</Tag>}
              </Space>
            ),
          },
        ]
      : [
          {
            key: 'home',
            title: (
              <Tag color={'green'} icon={<Icon icon={'HomeOutlined'} type={'ant'} />}>
                Home
              </Tag>
            ),
          },
        ];
  return <Breadcrumb items={breadcrumbItems} />;
};
export default NodeBreadcrumb;
