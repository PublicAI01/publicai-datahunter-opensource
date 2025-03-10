import React from 'react';
import ReactDOM from 'react-dom/client';
import { domAnimation, LazyMotion } from 'framer-motion';

import Popup from '@/pages/Popup';

ReactDOM.createRoot(document.getElementById('popup') as HTMLElement).render(
  <React.StrictMode>
    <LazyMotion features={domAnimation}>
      <Popup />
    </LazyMotion>
  </React.StrictMode>,
);
