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
  const {data: ancestors = []} = useNode({select: data => findAncestors(data, id)});
  const tag = nodeDetails.find(({value}) => type === value);

  const breadcrumbItems = [
    {
      key: 'home',
      title: <Icon icon={'HomeOutlined'} type={'ant'} />,
    },
    ...ancestors
      .map((parent, index) => {
        return {
          key: parent.id,
          title: (
            <Link to={`./${parent.type}/${parent.id}`} unstable_viewTransition>
              {index > 1 ? <Tooltip title={parent.name}>...</Tooltip> : parent.name}
            </Link>
          ),
        };
      })
      .reverse(),
    {
      key: id,
      title: (
        <Space>
          {name}
          {tag && <Tag color={tag.color}>{type}</Tag>}
        </Space>
      ),
    },
  ];
  return <Breadcrumb items={breadcrumbItems} />;
};
export default NodeBreadcrumb;
