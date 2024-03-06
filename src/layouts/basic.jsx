import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../contexts';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { Sidebar, Menu, MenuItem, useProSidebar } from 'react-pro-sidebar';
import { Button, Icon, Image } from 'semantic-ui-react';
import LogoImg from '../assets/images/dataGeometrySmallLogo.svg';
import LogoImgWITHCOMAPNYNAME from '../assets/images/dataGeometryLogo.svg';
import getMenus from './menu';
import { apiGET } from '../utils/apiHelper';

function Layout() {

  const location = useLocation();
  let authContext = useContext(AuthContext);
  const { collapseSidebar, collapsed } = useProSidebar();
  let roles = authContext.user.role

  const [user, setUser] = useState('')
  const [userRole, setUserRole] = useState("")
  const [orgName, setOrgName] = useState('')
  const MenuData = getMenus(authContext.user)

  const roleSelection = () => {
    setUser(authContext.user.name)
    if (roles == "superAdmin") {
      setUserRole("Super Admin")
    }
    else {
      setUserRole(authContext.user.roleName)
    }
  }
  const getOrganizationName = async () => {
    try {
      const response = await apiGET('/v1/organizations')
      if (response.status === 200) {
        setOrgName(response.data.data.name);
      } else {
        console.log(response);
      }
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    roleSelection()
    getOrganizationName()
  }, [])



  return (
    <div className="layout-wrapper " style={{ backgroundColor: '#e1eeff' }}>
      <div className="sidebar-wrapper">
        <Sidebar backgroundColor="#E1EEFF" width="270px" style={{ maxWidth: '270px', borderWidth: 0 }}>
          {collapsed ?
            <div className='collapsed-sidebar-header'>
              <Image src={LogoImg} centered />
            </div>
            : null}
          {!collapsed ?
            <div className="sidebar-header">
              <Image src={LogoImgWITHCOMAPNYNAME} style={{ height: 45 }} centered />
            </div>
            : null}

          <Menu
            user={authContext.user}
            style={{
              paddingBottom: 100,
              height: '100%',
              overflow: "auto"
            }}
            rootStyles={{
              '.ps-menu-button': {
                color: 'black',
              },
              '.ps-menu-button:hover': {
                color: 'black',
                background: '#acbdcd',
              },
            }}>
            {MenuData.map((aMenu, idx) =>
              aMenu.type == 'label' ? (
                !collapsed ? (
                  <div
                    key={idx}
                    style={{
                      padding: '20px 30px 10px 30px',
                      color: 'black',
                      fontWeight: '600'
                    }}>
                    {aMenu.title}
                  </div>
                ) : null
              ) : aMenu.type == 'menu' ? (
                <Link style={{ color: 'inherit' }} to={aMenu.path}>
                  {collapsed ?
                    <div className='collapsed-sidebar-icon' style={{ borderRadius: '100px', backgroundColor: location.pathname == aMenu.path ? '#048DEF' : '', margin: '12px 16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '15px', }}>
                        <Icon bordered={false} name={aMenu.icon} style={{ color: location.pathname == aMenu.path ? 'white' : '#9C9393', fontSize: '16px' }}></Icon>
                      </div>
                    </div>
                    : <MenuItem
                      key={idx}
                      href={aMenu.path}
                      style={{
                        background: location.pathname == aMenu.path ? '#048DEF' : '',
                        color: location.pathname == aMenu.path ? 'white' : 'black',
                        margin: '5px 14px',
                        borderRadius: '30px',
                        marginBottom: userRole==='Organization Admin'?aMenu.title == 'Setting' ? '30px' : '' : aMenu.title == 'Users' ? '30px' : ''
                      }}
                    >
                      <Icon bordered={false} name={aMenu.icon} style={{ padding: collapsed ? "" : '0 30px 0 10px', color: location.pathname == aMenu.path ? 'white' : '#9C9393', }}></Icon>
                      {aMenu.title}
                    </MenuItem>}
                </Link>
              ) : null
            )}
            {/* <div style={{ height: 50 }}>

            </div> */}
          </Menu>
        </Sidebar>
      </div>
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          height: '97%',
          overflowX: 'hidden',
          overflowY: 'hidden',
          margin: ' 10px 10px  0 0',
          backgroundColor: 'white',
          borderRadius: '20px',
        }}>
        <div
          className="header-content"
          style={{
            height: 60,
            minHeight: 60,
            borderBottom: '1px solid #efefef',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingRight: 27,
            boxShadow: '0 1px 2px 0 rgba(34,36,38,.15)',
          }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div
              style={{ paddingLeft: 28, cursor: 'pointer' }}
              onClick={() => {
                collapseSidebar();
              }}>
              <Icon name="bars" size="large"></Icon>
            </div>
            <div style={{ fontSize: 'x-large', marginLeft: '20px', color: '#9093a9', fontWeight: '600' }}>{orgName}</div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div className="sub-text" style={{ marginRight: 15, textAlign: 'right', textTransform: 'capitalize' }}>
              {user} | {userRole}
            </div>
            <Button
              animated="fade"
              onClick={() => {
                authContext.signout(() => { });
              }}
              style={{ backgroundColor: 'transparent' }}
            >
              <Button.Content visible style={{ color: 'red' }}>  Logout <Icon name="log out" style={{ marginLeft: '10px', color: 'red' }} /></Button.Content>
              <Button.Content hidden>
                <Icon name="log out" style={{ color: 'red' }} />
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
