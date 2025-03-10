import { useContext } from 'react';

import { ToastContext } from '@/provider/toast';

const useToast = () => useContext(ToastContext);

export { useToast };
