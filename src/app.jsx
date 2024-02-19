import React, { useContext, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Layout from './layouts/basic';
import AuthRequired from './contexts/auth/authRequired';
import AuthProvider from './contexts/auth/authProvide';
import { authProtectedRoutes, publicRoutes } from './routes';
import ErrorPage from './utils/error-page';
import { ProSidebarProvider } from 'react-pro-sidebar';
import { AuthContext } from './contexts';
import {  apiPOST } from './utils/apiHelper';
import { alertError, alertWarning } from './utils/alerts';
import ViewDocument from './modules/docupload/viewDocumentV3';
import AccessRequired from './utils/accessRequired';

export default function App() {

  const navigate = useNavigate()
  const location = useLocation()
    const {updateContext} = useContext(AuthContext)

    const  getCurrentUsr = async(token)=> {
        const response = await apiPOST(`/v1/auth/getCurrentUser`,{token:token})
        if (response?.status == 200) {
            let userData = response?.data?.data?.userData
            window.localStorage.setItem('user', JSON.stringify(userData));
            updateContext(userData)
        } else {
          window.localStorage.clear()
          alertError("Your login session has expired. Please log in again.")
          setTimeout(() => {
            navigate('/login', {state: { from: location }, replace: true})
          }, 3000);
        }
    }

    useEffect(() => {
        let refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          getCurrentUsr(refreshToken)
        }
    }, [])
    

  return (
    <>
      <div className="app-body">
        <Routes>
          <Route>
            {publicRoutes.map((route, idx) => (
              <Route
                errorElement={<ErrorPage />}
                path={route.path}
                element={route.component}
                key={idx}
              />
            ))}
            <Route
              path="/dashboard"
              errorElement={<ErrorPage />}
              element={
                <AuthRequired>
                  <ProSidebarProvider>
                    <Layout />
                  </ProSidebarProvider>
                </AuthRequired>
              }>
              {authProtectedRoutes.map((route, idx) => (
                <Route
                  path={route.path}
                  element={<AccessRequired
                    module = {route.acccessModuleName}
                    >{route.component}</AccessRequired>}
                  errorElement={<ErrorPage />}
                  key={idx}
                />
              ))}
            </Route>

            <Route
                errorElement={<ErrorPage />}
                path="/dashboard/studio/:id"
                element={ <AuthRequired><ViewDocument/></AuthRequired>}
                key={"asdasd"}
              />

            <Route
                errorElement={<ErrorPage />}
                path="/dashboard/studio/reupload/:id"
                element={ <AuthRequired><ViewDocument/></AuthRequired>}
                key={"klkdl"}
              />
                       
            <Route
                errorElement={<ErrorPage />}
                path="/dashboard/studio/:id/delete"
                element={ <AuthRequired><ViewDocument/></AuthRequired>}
                key={"klkdl"}
              /> 
             
           
            <Route
                errorElement={<ErrorPage />}
                path="/dashboard/studio/approved/:id"
                element={ <AuthRequired><ViewDocument/></AuthRequired>}
                key={"klkdl"}
              />
        
          </Route>
        </Routes>
      </div>
    </>
  );
}
