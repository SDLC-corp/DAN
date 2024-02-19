import { useContext } from 'react';
import { AuthContext } from '../index';
import { useLocation, Navigate } from 'react-router-dom';

function AuthRequired({ children }) {
  let auth = useContext(AuthContext);
  let userObj = JSON.parse(localStorage.getItem('user'));
  let location = useLocation();

  if (!auth.user && !userObj) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  } else {
    if (auth.user) {
      return children;
    }
  }
}

export default AuthRequired;
