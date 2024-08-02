import {useOutletContext} from 'react-router-dom';
export const Component = props => {
  const {user} = useOutletContext();
  return <div>AdminUsers ...coming soon</div>;
};
Component.displayName = 'AppAdminUsers';
