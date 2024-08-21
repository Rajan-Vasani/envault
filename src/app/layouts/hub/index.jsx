import {Layout} from 'antd';
import {useThemeMode} from 'antd-style';
import {HubHeaderSkeleton} from 'components/molecules/Skeleton';
import Cookies from 'js-cookie';
import {NoHub} from 'pages/error/nohub';
import {Suspense, lazy, useEffect, useTransition} from 'react';
import {Outlet, useOutletContext} from 'react-router-dom';
const Header = lazy(() => import('layouts/hub/components/header'));
const Footer = lazy(() => import('layouts/hub/components/footer'));

export const Component = props => {
  const {hub, user, isPublic} = useOutletContext();
  const {themeMode, setThemeMode} = useThemeMode();
  const [, startTransition] = useTransition();

  // set hub favicon and title
  useEffect(() => {
    let link = document.querySelector("link[rel~='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.getElementsByTagName('head')[0].appendChild(link);
    }
    document.title = `${hub?.full_name || globalThis.envault.hub} | envault.io`;
    if (hub?.config?.favicon) {
      link.href = hub.config.favicon;
    }
  }, [hub]);

  // set user theme preference
  useEffect(() => {
    startTransition(() => {
      setThemeMode(user?.config?.theme || hub?.config?.theme || 'auto');
    });
  }, [hub, user]);

  useEffect(() => {
    Cookies.set('themeMode', themeMode);
  }, [themeMode]);

  return hub ? (
    <Layout style={{height: '100svh'}}>
      {!isPublic && (
        <Suspense fallback={<HubHeaderSkeleton />}>
          <Header {...props} hub={hub} />
        </Suspense>
      )}
      <Outlet context={{hub, user, isPublic}} />
      {!isPublic && (
        <Suspense fallback={<HubHeaderSkeleton />}>
          <Footer {...props} />
        </Suspense>
      )}
    </Layout>
  ) : (
    <NoHub error={{status: 404}} />
  );
};
Component.displayName = 'AppLayout';
