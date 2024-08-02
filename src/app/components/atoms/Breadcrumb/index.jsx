import {Breadcrumb, Space, Tag, Tooltip} from 'antd';
import {nodeDetails} from 'config/menu';
import {useNode} from 'hooks/useNode';
import {Link} from 'react-router-dom';
import {findAncestors} from 'utils/tree';

export const NodeBreadcrumb = props => {
  const {node} = props;
  const {data} = useNode({select: data => findAncestors(data, node?.id)});
  const ancestors = data?.reverse();
  const tag = nodeDetails.find(({value}) => node?.type === value);

  const breadcrumbItems = ancestors
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
          key: node?.id,
          title: (
            <Space>
              {node?.name}
              {tag && <Tag color={tag.color}>{node?.type}</Tag>}
            </Space>
          ),
        },
      ]
    : [{title: 'home'}];
  return <Breadcrumb items={breadcrumbItems} />;
};
export default NodeBreadcrumb;
