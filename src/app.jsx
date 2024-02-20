import React, { useContext, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './layouts/basic';
import AuthRequired from './contexts/auth/authRequired';
import { authProtectedRoutes, publicRoutes } from './routes';
import ErrorPage from './utils/error-page';
import { ProSidebarProvider } from 'react-pro-sidebar';
import { AuthContext } from './contexts';
import ViewDocument from './modules/docupload/viewDocument';
import AccessRequired from './utils/accessRequired';
import { axiosApi } from './services/axios';
import { DELETE_DOCUMENT_PAGE, REUPLOAD_PDF, VIEW_DOCUMENT, VIEW_DOCUMENT_PAGE, hasAccess } from './utils/accessHelper';
import UnAuthorized from './utils/unAuthorized';

export default function App() {

  const {updateContext} = useContext(AuthContext)

  const  getCurrentUser = async () => {
    try {
      const response = await axiosApi.post(`/v1/auth/getCurrentUser`, {token: localStorage.getItem('refreshToken')})
      if(response?.data.data) {
        let userData = response.data.data.userData
        window.localStorage.setItem('user', JSON.stringify(userData));
        updateContext(userData)
      }
    } catch (error) {
      
    }
  }

  useEffect(() => {
    getCurrentUser()
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

          {
            (hasAccess(VIEW_DOCUMENT) || hasAccess(VIEW_DOCUMENT_PAGE)) ? <Route
                errorElement={<ErrorPage />}
                path="/dashboard/studio/:id"
                element={ <AuthRequired><ViewDocument/></AuthRequired>}
                key={"asdasd"}
              />
              : <Route
              errorElement={<ErrorPage />}
              path="/dashboard/studio/:id"
              element={<UnAuthorized/>}
              key={"asdasd"}
            />
          }

            <Route
                errorElement={<ErrorPage />}
                path="/dashboard/studio/reupload/:id"
                element={ <AuthRequired>
                  <AccessRequired
                  module = {REUPLOAD_PDF}
                  >
                    <ViewDocument/>
                  </AccessRequired>
                  </AuthRequired>}
                key={"klkdlkgh"}
              />
                       
            <Route
                errorElement={<ErrorPage />}
                path="/dashboard/studio/:id/delete"
                element={ <AuthRequired>
                <AccessRequired
                  module = {DELETE_DOCUMENT_PAGE}
                  >
                    <ViewDocument/>
                </AccessRequired>
                </AuthRequired>}
                key={"klkdppl"}
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
