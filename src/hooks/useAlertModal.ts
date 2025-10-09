import { useAlert } from '../components/AlertModal';

export const useAlertModal = () => {
  const { showAlert } = useAlert();

  const showSuccess = (title: string, message: string, options?: { autoClose?: boolean; autoCloseDelay?: number }) => {
    showAlert({
      type: 'success',
      title,
      message,
      ...options
    });
  };

  const showError = (title: string, message: string, options?: { autoClose?: boolean; autoCloseDelay?: number }) => {
    showAlert({
      type: 'error',
      title,
      message,
      ...options
    });
  };

  const showWarning = (title: string, message: string, options?: { autoClose?: boolean; autoCloseDelay?: number }) => {
    showAlert({
      type: 'warning',
      title,
      message,
      ...options
    });
  };

  const showInfo = (title: string, message: string, options?: { autoClose?: boolean; autoCloseDelay?: number }) => {
    showAlert({
      type: 'info',
      title,
      message,
      ...options
    });
  };

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo
  };
};

export default useAlertModal;
