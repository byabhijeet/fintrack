import { useAlertStore, AlertButton, AlertOptions } from '../store/alertStore';

export const Alert = {
  alert: (title: string, message?: string, buttons?: AlertButton[], options?: AlertOptions) => {
    useAlertStore.getState().showAlert(title, message, buttons, options);
  },
};
