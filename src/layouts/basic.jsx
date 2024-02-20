import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../contexts';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { Sidebar, Menu, MenuItem, useProSidebar } from 'react-pro-sidebar';
import { Button, Icon, Image } from 'semantic-ui-react';
import LogoImg from '../assets/images/sdlc-logo2.png';
import LogoImgWITHCOMAPNYNAME from '../assets/images/sdlc-logo2.png';
import getMenus from './menu';

function Layout() {

  const location = useLocation();
  let authContext = useContext(AuthContext);
  const { collapseSidebar, collapsed } = useProSidebar();
  let roles = authContext.user.role

  const [user, setUser] = useState('')
  const [userRole, setUserRole] = useState("")
  const MenuData = getMenus(authContext.user)

  const roleSelection = () => {
    setUser(authContext.user.name)
    if (roles == "superAdmin") {
      setUserRole("Super Admin")
    } 
    else{
      setUserRole(authContext.user.roleName)
    }
  }

  useEffect(() => {
    roleSelection()
  }, [])



  return (
    <div className="layout-wrapper">
      <div className="sidebar-wrapper">
        <Sidebar backgroundColor="#0f182a" width="270px" style={{ maxWidth: '270px', borderWidth: 0 }}>
          <div className="sidebar-header">
            {collapsed ? <Image src={LogoImg}  centered /> : null} {!collapsed ? <Image src={LogoImgWITHCOMAPNYNAME} style={{height: 65}} centered /> : null}
          </div>
          <Menu
            user={authContext.user}
            style={{
              paddingBottom : 100,
              height : '100%',
              overflow: "auto"
            }}
            rootStyles={{
              '.ps-menu-button': {
                color: '#e0e0e0',
              },
              '.ps-menu-button:hover': {
                color: 'white',
                background: '#343a48',
              },
            }}>
            {MenuData.map((aMenu, idx) =>
              aMenu.type == 'label' ? (
                !collapsed ? (
                  <div
                    key={idx}
                    style={{
                      padding: '20px 30px 10px 30px',
                      color: 'rgb(171 171 171)',
                    }}>
                    {aMenu.title}
                  </div>
                ) : null
              ) : aMenu.type == 'menu' ? (
                <Link style={{ color: 'inherit' }} to={aMenu.path}>
                  <MenuItem
                    key={idx}
                    href={aMenu.path}
                    style={{
                      background: location.pathname == aMenu.path ? '#343a48' : '',
                      color: location.pathname == aMenu.path ? '#3098ff' : '#e0e0e0',
                    }}
                  >
                    <Icon bordered={false} name={aMenu.icon} style={{ padding: '0 30px 0 10px' }}></Icon>
                      {aMenu.title}
                  </MenuItem>
                </Link>
              ) : null
            )}
            <div style={{height:50}}>

            </div>
          </Menu>
        </Sidebar>
      </div>
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          overflowX: 'hidden',
          overflowY: 'hidden',
        }}>
        <div
          className="header-content"
          style={{
            height: 56,
            minHeight: 56,
            borderBottom: '1px solid #efefef',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingRight: 27,
            boxShadow: '0 1px 2px 0 rgba(34,36,38,.15)',
          }}>
          <div
            style={{ paddingLeft: 28, cursor: 'pointer' }}
            onClick={() => {
              collapseSidebar();
            }}>
            <Icon name="bars" size="large"></Icon>
          </div>

          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div className="sub-text" style={{ marginRight: 15, textAlign: 'right', textTransform: 'capitalize' }}>
              {user} | {userRole}
            </div>
            <Button
              animated="fade"
              onClick={() => {
                authContext.signout(() => {});
              }}>
              <Button.Content visible>Logout</Button.Content>
              <Button.Content hidden>
                <Icon name="log out" />
              </Button.Content>
            </Button>
          </div>
        </div>
        <Outlet id="appContent" class="appContent" style={{ flex: 1, display: 'flex', overflow: 'hidden' }} />
      </div>
    </div>
  );
}

export default Layout;
