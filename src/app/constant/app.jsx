import {routes} from './routes';
const [hub, ...rest] = window.location.hostname.split('.');
const host = rest.join('.');
const origin = window.location.origin;
const app = `${origin.replace(hub, 'app')}${routes.user}`;

globalThis.envault = {
  hub,
  host,
  origin,
  app,
  getOrigin: newHub => {
    return `${origin.replace(hub, newHub)}`;
  },
};
