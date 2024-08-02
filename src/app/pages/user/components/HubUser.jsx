import {Avatar, Skeleton} from 'antd';
import {useHubUser} from 'app/services/hooks/useHub';

const HubUser = ({id}) => {
  const {data: userData = [], isPending, isFetched} = useHubUser({hub: id});
  const maxDisplayNames = 4;

  const getUserInitials = userName => {
    const name = userName ? userName : 'ME';
    const names = name.split(' ');
    let initials = names[0].substring(0, 1).toUpperCase();
    if (names.length > 1) {
      initials += [...names].pop().substring(0, 1).toUpperCase();
    }
    return initials;
  };
  if (isPending)
    return (
      <Avatar.Group>
        <Skeleton.Avatar shape={'circle'} active />
        <Skeleton.Avatar shape={'circle'} active />
        <Skeleton.Avatar shape={'circle'} active />
      </Avatar.Group>
    );
  if (isFetched && !userData.length) return <p style={{margin: 0, display: 'inline-flex', height: '32px'}}>No user</p>;

  const displayNames =
    userData?.length <= maxDisplayNames
      ? userData
      : userData?.slice(0, maxDisplayNames)?.concat({id: 'extras', name: `+${userData.length - maxDisplayNames}`});

  return (
    <Avatar.Group>
      {displayNames.map(users => (
        <Avatar key={users.id}>{users.id !== 'extras' ? getUserInitials(users.name) : users.name}</Avatar>
      ))}
    </Avatar.Group>
  );
};
export default HubUser;
