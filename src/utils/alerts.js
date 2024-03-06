import Swal from 'sweetalert2';

const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.addEventListener('mouseenter', Swal.stopTimer);
    toast.addEventListener('mouseleave', Swal.resumeTimer);
  },
});

export const alertError = (message) => {
  // Toast.fire('Error!', message || 'Something went wrong!', 'error');
  Toast.fire('Error!', message || 'Something went wrong!', 'error');
};
export const alertWarning = (message) => {
    Swal.fire({
      title: 'Warning!',
      text: message,
      icon: 'warning',
    });
    
  };
export const alertSuccess = (message, title) => {
  Toast.fire("Success!",message, 'success');
};

export const alertInfo = (message, title) => {
    Swal.fire({
      title: title || 'Info!',
      text: message,
      icon: 'info',
    });
  };