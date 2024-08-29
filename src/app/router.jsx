import {QueryCache, QueryClient, QueryClientProvider, useQueryClient} from '@tanstack/react-query';
import {ReactQueryDevtools} from '@tanstack/react-query-devtools';
import {App, Collapse, ConfigProvider, Typography, notification} from 'antd';
import {ThemeProvider, createGlobalStyle} from 'antd-style';
import CenturyGothic from 'assets/fonts/CenturyGothic.ttf';
import HelveticaNeue from 'assets/fonts/HelveticaNeue.ttf';
import Icon from 'components/atoms/Icon';
import {ApplicationError} from 'components/error/boundary';
import {routes} from 'constant/routes';
import {hubQuery} from 'hooks/useHub';
import {userQuery} from 'hooks/useUser';
import Cookies from 'js-cookie';
import {Component as AuthLayout} from 'layouts/auth';
import {Component as ExploreLayout} from 'layouts/explore';
import {Component as HubLayout} from 'layouts/hub';
import {Component as NodeLayout} from 'layouts/node';
import {Component as SettingsLayout} from 'layouts/settings';
import {Component as UserLayout} from 'layouts/user';
import {
  Navigate,
  Outlet,
  RouterProvider,
  createBrowserRouter,
  isRouteErrorResponse,
  useLoaderData,
  useOutletContext,
  useRouteError,
  useSearchParams,
} from 'react-router-dom';
import {BaseService} from 'services/api/base.service';

const Logout = () => {
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const redirect = searchParams.get('redirect');
  (async () => {
    await BaseService.post(`api/auth/logout`);
    await queryClient.clear();
  })();
  localStorage.clear();
  sessionStorage.clear();
  return <Navigate to={{pathname: routes.login, search: `redirect=${redirect ?? '/'}`}} replace />;
};
// Handle error messages
const onErrorHandler = (error, query) => {
  const themeMode = Cookies.get('themeMode');
  ConfigProvider.config({
    holderRender: children => (
      <ThemeProvider prefixCls="ant" iconPrefixCls="anticon" themeMode={themeMode}>
        {children}
      </ThemeProvider>
    ),
  });
  const errorMessage = {
    meta: query?.meta,
  };
  if (error instanceof Error) {
    errorMessage.type = 'application';
    errorMessage.status = error.name;
    errorMessage.statusText = error.message;
    errorMessage.data = error.stack;
  }
  if (error instanceof Response || isRouteErrorResponse(error)) {
    errorMessage.type = 'response';
    errorMessage.status = error.status;
    errorMessage.statusText = error.statusText;
    errorMessage.data = error.data;
    errorMessage.url = error.url;
  }

  if (Cookies.get('uid')) {
    const errorResponse = {
      type: 'error',
    };
    switch (errorMessage.status) {
      case 400: {
        errorResponse.message = 'Bad Request';
        break;
      }
      case 401:
        if (errorMessage.data?.message === 'invalid jwt token') {
          errorResponse.type = 'warning';
          errorResponse.message = 'Session Expired';
          errorResponse.description = 'Your session has expired. Please login to continue';
        }
        errorResponse.navigate = {
          to: {pathname: routes.login, search: `redirect=${window.location.pathname}`},
          replace: true,
        };
        break;
      case 403:
        switch (errorMessage.data?.type) {
          case 'NO_ACCESS_HUB':
            errorResponse.message = 'Access Denied';
            errorResponse.description = 'You do not have access to this hub';
            errorResponse.navigate = {to: globalThis.envault.app, replace: true};
            break;
          case 'NO_ACCESS_HUB_ADMIN':
            errorResponse.message = 'Access Denied';
            errorResponse.description = 'You need Hub Admin permissions to access this resource';
            errorResponse.navigate = {to: globalThis.envault.app, replace: true};
            break;
          case 'NO_ACCESS_APP_ADMIN':
            errorResponse.message = 'Access Denied';
            errorResponse.description = 'You need App Admin permissions to access this resource';
            errorResponse.navigate = {to: globalThis.envault.app, replace: true};
            break;
          default:
            errorResponse.message = 'Forbidden';
            errorResponse.description = 'You do not have permission to access this resource';
        }
        break;
      case 404:
        switch (errorMessage.data?.type) {
          case 'HUB_NOT_FOUND':
            errorResponse.message = 'Hub Not Found';
            errorResponse.description = 'The hub you are looking for does not exist';
            errorResponse.navigate = {to: globalThis.envault.app, replace: true};
            break;
          default:
            errorResponse.message = 'Resource Not Found';
        }
        break;
      case 409:
        errorResponse.message = 'Conflict';
        errorResponse.description = errorMessage.data?.message
          ? errorMessage.data?.detail
          : 'Conflict with existing resource';
        break;
      case 500:
        errorResponse.message = 'Server Error';
        errorResponse.description = errorMessage.meta
          ? `Server unable to ${errorMessage.meta.method} the ${errorMessage.meta.type}. If problem persists, contact admin`
          : 'Server unable to perform the request. If problem persists, contact admin';
        break;
      default:
        return <ApplicationError error={error} isCompileError />;
    }
    if (errorResponse.message) {
      notification.open({
        type: errorResponse.type,
        message: errorResponse.message,
        showProgress: true,
        pauseOnHover: true,
        description: (
          <Collapse
            size={'small'}
            bordered={false}
            expandIconPosition={'end'}
            expandIcon={() => <Icon icon={'BugOutlined'} type={'ant'} />}
            items={[
              {
                key: '1',
                label: errorResponse.description,
                children: (
                  <Typography.Text copyable={{text: JSON.stringify(errorMessage)}}>
                    <pre>
                      <code>{JSON.stringify(errorMessage.data, null, 2)}</code>
                    </pre>
                  </Typography.Text>
                ),
              },
            ]}
          />
        ),
      });
    }
    if (errorResponse.navigate) {
      return <Navigate {...errorResponse.navigate} />;
    }
  }
  return <Navigate to={{pathname: routes.logout, search: `redirect=${window.location.pathname}`}} replace />;
};

export const Global = createGlobalStyle`
  @font-face {
    font-family: 'Century Gothic';
    font-style: normal;
    src:
      local('Century Gothic'),
      url(${CenturyGothic}) format('truetype');
  }
  @font-face {
    font-family: 'Helvetica Neue';
    font-style: normal;
    src:
      local('Helvetica Neue'),
      url(${HelveticaNeue}) format('truetype');
  }
  html,
  body,
  #root {
    width: 100%;
    width: -webkit-fill-available;
    width: -moz-available;
    width: fill-available;
    height: 100%;
    height: -webkit-fill-available;
    height: -moz-available;
    height: fill-available;
    min-width: 280px;
    padding: 0;
    margin: 0;
    overflow: hidden;
  }
`;

const HubGlobal = createGlobalStyle`
  *::-webkit-scrollbar {
    width: 6px;
    height: 6px;
    background: ${p => p.theme.colorBgContainer};
  }
  *::-webkit-scrollbar-thumb {
    border-radius: ${p => p.theme.borderRadius}px;
    background: ${p => p.theme.colorBgLayout};
    :hover {
      background: ${p => p.theme.colorPrimaryBorderHover};
    }
  }
`;

// Check if user is logged in
const AuthBoundary = () => {
  const {user, isPublic} = useLoaderData();
  const hub = user?.hubs?.find(hub => hub.name === globalThis.envault.hub);
  if (user) {
    return (
      <ThemeProvider
        theme={{
          token: {
            colorPrimary: hub?.config?.colorPrimary || '#13aeef',
            fontFamily: 'Century Gothic, Helvetica Neue, sans-s',
            fontFamilyCode: 'SFMono-Regular, Consolas, Liberation Mono, Menlo, Courier, monospace',
          },
          components: {
            Layout: {
              algorithm: true,
              headerPadding: '0 10px',
            },
            Form: {
              itemMarginBottom: 16,
            },
          },
        }}
      >
        <HubGlobal />
        <App>
          <Outlet context={{user, hub, isPublic}} />
        </App>
      </ThemeProvider>
    );
  }
  throw {data: user, internal: false, status: 401, statusText: 'Unauthorized'};
};
const AppAdminBoundary = () => {
  const {user} = useLoaderData();
  if (user?.app_admin) {
    return <Outlet context={{user}} />;
  }
  throw {
    data: {type: 'NO_ACCESS_APP_ADMIN'},
    internal: false,
    status: 403,
    statusText: 'Forbidden',
  };
};
const HubAdminBoundary = () => {
  const {user, hub, ...context} = useOutletContext();
  if (hub.is_admin || user?.app_admin) {
    return <Outlet context={{user, hub, ...context}} />;
  }
  throw {
    data: {type: 'NO_ACCESS_HUB_ADMIN'},
    internal: false,
    status: 403,
    statusText: 'Forbidden',
  };
};
// Catch route and handle route errors
const AuthErrorBoundary = () => {
  const error = useRouteError();
  return onErrorHandler(error);
};

// Load user data
const userLoader = async (request, queryClient) => {
  const url = new URL(request.url);
  const isPublic = url.searchParams.has('public');
  const uid = isPublic ? 0 : Cookies.get('uid');
  // Only fetch user if user id exists
  if (uid != null) {
    const [user] = await queryClient.ensureQueryData({
      ...userQuery({id: +uid}),
    });
    return {
      user,
      isPublic,
    };
  }
  throw {data: '', internal: false, status: 401, statusText: 'Unauthorized'};
};

const hubLoader = async (request, queryClient) => {
  const hubName = globalThis.envault.hub;
  const [hub] = await queryClient.ensureQueryData({
    ...hubQuery({name: hubName}),
  });
  return {
    hub,
  };
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30, // 30 seconds
      refetchOnMount: true,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      onError: (error, _, __, mutation) => onErrorHandler(error, mutation), // {error, variables, context, mutation}
    },
  },
  queryCache: new QueryCache({
    onError: (error, query) => onErrorHandler(error, query), // {error, query}
  }),
});

const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <AuthBoundary />,
      errorElement: <AuthErrorBoundary />,
      loader: ({request}) => userLoader(request, queryClient),
      id: 'auth',
      children: [
        {
          index: true,
          element: <Navigate to={'hub'} replace />,
        },
        {
          element: <HubLayout />,
          path: 'hub',
          id: 'hub',
          children: [
            {
              index: true,
              element: <Navigate to={'explore'} replace />,
            },
            {
              path: 'explore',
              id: 'explore',
              element: <ExploreLayout />,
              children: [
                {
                  index: true,
                  element: <Navigate to={'node'} replace />,
                },
                {
                  path: 'node',
                  id: 'node',
                  element: <NodeLayout />,
                  children: [
                    {
                      path: 'dashboard/:nodeId?',
                      id: 'dashboard',
                      lazy: () => import('pages/dashboard'),
                    },
                    {
                      path: 'device/:nodeId?',
                      id: 'device',
                      lazy: () => import('pages/device'),
                      children: [
                        {
                          index: true,
                          element: <Navigate to={'data'} replace />,
                        },
                        {
                          path: 'data',
                          id: 'device-data',
                          lazy: () => import('pages/device/data'),
                        },
                        {
                          path: 'image',
                          id: 'device-image',
                          lazy: () => import('pages/device/image'),
                        },
                        {
                          path: 'state',
                          id: 'device-state',
                          lazy: () => import('pages/device/state'),
                        },
                      ],
                    },
                    {
                      path: 'variable/:nodeId?',
                      id: 'variable',
                      lazy: () => import('pages/variable'),
                    },
                    {
                      path: 'task/:nodeId?',
                      id: 'task',
                      lazy: () => import('pages/task'),
                    },
                    {
                      path: 'notification/:nodeId?',
                      id: 'notification',
                      lazy: () => import('pages/notification'),
                    },
                    {
                      path: 'group/:nodeId?',
                      id: 'group',
                      lazy: () => import('pages/map'),
                    },
                    {
                      path: 'timelapse/:nodeId?',
                      id: 'timelapse',
                      lazy: () => import('pages/gallery'),
                    },
                    {
                      path: 'gallery/:nodeId?',
                      id: 'gallery',
                      lazy: () => import('pages/gallery'),
                    },
                    {
                      path: 'chart/:nodeId?',
                      id: 'chart',
                      lazy: () => import('pages/chart'),
                      children: [
                        {
                          index: true,
                          element: <Navigate to={'chart'} replace />,
                        },
                        {
                          path: 'chart',
                          id: 'chart-chart',
                          lazy: () => import('pages/chart/chart'),
                        },
                        {
                          path: 'table',
                          id: 'chart-table',
                          lazy: () => import('pages/chart/table'),
                        },
                      ],
                    },
                    {
                      path: 'series/:nodeId?',
                      id: 'series',
                      lazy: () => import('pages/chart'),
                    },
                    {
                      path: 'create/:nodeId?',
                      id: 'create',
                      lazy: () => import('pages/error/nonode'),
                    },
                    {
                      path: '*',
                      lazy: () => import('pages/error/notfound'),
                    },
                  ],
                },
                {
                  path: '*',
                  lazy: () => import('pages/error/notfound'),
                },
              ],
            },
            {
              path: 'analyse',
              lazy: () => import('pages/analyse'),
            },
            {
              path: 'settings',
              element: <HubAdminBoundary />,
              children: [
                {
                  element: <SettingsLayout />,
                  children: [
                    {
                      index: true,
                      element: <Navigate to={'config'} replace />,
                    },
                    {
                      path: 'config',
                      id: 'config',
                      lazy: () => import('app/pages/settings/hub'),
                    },
                    {
                      path: 'users',
                      id: 'users',
                      lazy: () => import('app/pages/settings/users'),
                    },
                    {
                      path: 'roles',
                      id: 'roles',
                      lazy: () => import('app/pages/settings/roles'),
                    },
                    {
                      path: 'tasks',
                      id: 'tasks',
                      lazy: () => import('app/pages/settings/tasks'),
                    },
                    {
                      path: 'tasks/:nodeId',
                      id: 'taskDetail',
                      lazy: () => import('pages/task'),
                    },
                    {
                      path: 'billing',
                      id: 'billing',
                      lazy: () => import('app/pages/settings/billing'),
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          path: 'user/:userId?',
          element: <UserLayout />,
          children: [
            {
              index: true,
              element: <Navigate to={'home'} replace />,
            },
            {
              path: 'home',
              lazy: () => import('app/pages/user'),
            },
            {
              path: 'admin',
              element: <AppAdminBoundary />,
              loader: ({request}) => userLoader(request, queryClient),
              children: [
                {
                  path: 'hubs',
                  lazy: () => import('pages/admin/hubs'),
                },
                {
                  path: 'users',
                  lazy: () => import('pages/admin/users'),
                },
              ],
            },
          ],
        },
        {
          path: '*',
          element: <Navigate to="/" replace />,
        },
      ],
    },
    {
      path: 'auth',
      element: <AuthLayout />,
      errorElement: <AuthErrorBoundary />,
      loader: ({request}) => hubLoader(request, queryClient),
      children: [
        {
          index: true,
          element: <Navigate to="login" replace />,
        },
        {
          path: 'login',
          lazy: () => import('pages/auth/login'),
        },
        {
          path: 'recover',
          lazy: () => import('pages/auth/recover'),
        },
        {
          path: 'logout',
          element: <Logout queryClient={queryClient} />,
        },
        {
          path: '*',
          element: <Navigate to={'/'} replace />,
        },
      ],
    },
  ],
  {
    future: {
      v7_relativeSplatPath: true,
      v7_startTransition: true,
    },
  },
);

const Router = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Global />
      <RouterProvider router={router} />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
};
export default Router;
