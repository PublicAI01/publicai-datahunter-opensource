import React from 'react';
import ReactDOM from 'react-dom/client';

import Offscreen from '@/pages/Offscreen';

ReactDOM.createRoot(document.getElementById('offscreen') as HTMLElement).render(
  <React.StrictMode>
    <Offscreen />
  </React.StrictMode>,
);
