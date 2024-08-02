import {App, Layout} from 'antd';
import {useThemeMode} from 'antd-style';
import Cookies from 'js-cookie';
import {NoHub} from 'pages/error/nohub';
import {lazy, useEffect, useState, useTransition} from 'react';
import {Outlet, useOutletContext} from 'react-router-dom';
const Header = lazy(() => import('layouts/hub/components/header'));
const Footer = lazy(() => import('layouts/hub/components/footer'));

export const Component = props => {
  const {hub, user, isPublic} = useOutletContext();
  const {themeMode, setThemeMode} = useThemeMode();
  const [, startTransition] = useTransition();
  const [showPrivate, setShowPrivate] = useState(false);

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

  if (!isPublic && !showPrivate) {
    startTransition(() => setShowPrivate(true));
  }

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
    <App>
      <Layout style={{height: '100svh'}}>
        {showPrivate && <Header {...props} hub={hub} />}
        <Outlet context={{hub, user, isPublic}} />
        {showPrivate && <Footer {...props} />}
      </Layout>
    </App>
  ) : (
    <NoHub error={{status: 404}} />
  );
};
Component.displayName = 'AppLayout';
