import { useEffect, useState } from 'react';
import { AuthContext } from '..';
import { apiPOST } from '../../utils/apiHelper';
function AuthProvider({ children }) {
  let [user, setUser] = useState(null);
  useEffect(() => {
    let userObj = JSON.parse(localStorage.getItem('user'));
    if (userObj) {
      setUser(userObj);
    }
  }, []);

  let signin = async (userDetails, callback) => {
    let payload = userDetails;
    let response = await apiPOST('/v1/auth/login', payload);
    if (response && response.status == 200) {
      window.localStorage.setItem('accesstoken',response.data.data.tokens.access.token);
      window.localStorage.setItem("refreshToken",response.data.data.tokens.refresh.token)
      window.localStorage.setItem('user', JSON.stringify(response.data.data.user));
      setUser(response.data.data.user)
      callback({
        type:'success'
      });
    } else  {
      callback({type:response.data.message});
    }
  };

  let signout = (callback) => {
    setUser(null);
    window.localStorage.removeItem('user');
    window.localStorage.removeItem('accesstoken');
    window.localStorage.removeItem('refreshToken')
    callback();
  };

    const updateContext = (userData)=>{
        setUser(userData)
    }

  let value = { user, signin, signout , updateContext };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthProvider;
