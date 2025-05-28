// utils/roleNavigation.js
export const navigateByRole = (user, navigate) => {
  switch (user.role) {
    case 'receptionist':
      navigate('/pharmacy');
      break;
    case 'doctor':
      navigate('/doctor-finance');
      break;
    case 'admin':
      navigate('/');
      break;
    default:
      navigate('/not-found');
      break;
  }
};
