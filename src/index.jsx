import {ThemeColorProvider} from 'app/config/themes/ThemeColorProvider';
import Router from 'app/router';
import 'constant/app';
import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
const root = createRoot(document.getElementById('root'));
root.render(
  <StrictMode>
    <ThemeColorProvider>
      <Router />
    </ThemeColorProvider>
  </StrictMode>,
);
