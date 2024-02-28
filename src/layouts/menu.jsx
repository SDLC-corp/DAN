import { AIR_PORT_MASTERS, CONTAINER_ISO_CODE, CUSTOM_LOGIC, DELETE_REQUEST, DOCUMENT_UPLOAD, FIELDS, FIELD_MAPPING, LABEL_MATRIX, MANAGE_DASHBOARD, MANAGE_DOCUMENT, MANAGE_DOMAIN, MANAGE_ROLE, MANAGE_USER, PORT_MASTERS, SHIPPING_LINE, VIEW_DASHBOARD, hasAccess } from "../utils/accessHelper";

export default function getMenus(user = {}) {

  const SuperAdminMenu = [
    { type: 'label', title: 'General' },
    { type: 'menu', title: 'Dashboard', path: '/dashboard', icon: 'home' },
    { type: 'menu', title: 'Document Upload', path: '/dashboard/document-upload', icon: 'upload' },
    { type: 'menu', title: 'Document List', path: '/dashboard/document-list', icon: 'file alternate outline icon' },
    { type: 'menu', title: 'Document Types', path: '/dashboard/document-type', icon: 'file' },

    { type: 'label', title: 'Field Mapping' },
    {
      type: 'menu',
      title: 'Label Matrix',
      path: '/dashboard/labels/manage',
      icon: 'modx',
    },
    {
      type: 'menu',
      title: 'Custom Logic',
      path: '/dashboard/custom-logic',
    //   openInNewTab:true,
      icon: 'js square',
    },
    { type: 'menu', title: 'Fields',      path: '/dashboard/fields',icon: 'exchange',},

    // { type: 'label', title: 'Delete Requests' },
    // {type: 'menu',title: 'Delete Requests',path: '/dashboard/document/deleterequest',icon: 'upload'},

    { type: 'label', title: 'Manage Users' },
    { type: 'menu', title: 'Manage Role', path: '/dashboard/manage-role', icon: 'square'},
    {type: 'menu',title: 'Users',path: '/dashboard/users',icon: 'users'},
  ];

    const MainMenu = [
    { type: 'label', title: 'General' ,accessModule : MANAGE_DASHBOARD },
    { type: 'menu', title: 'Dashboard', path: '/dashboard', icon: 'home',accessModule: VIEW_DASHBOARD },
    { type: 'menu', title: 'Document Upload', path: '/dashboard/document-upload', icon: 'upload' ,accessModule : DOCUMENT_UPLOAD },
    { type: 'menu', title: 'Document List', path: '/dashboard/document-list', icon: 'file alternate outline icon', accessModule : MANAGE_DOCUMENT },

    { type: 'label', title: 'Field Mapping' ,accessModule: FIELD_MAPPING},
    { type: 'menu', title: 'Label Matrix', path: '/dashboard/labels/manage', icon: 'box',accessModule:LABEL_MATRIX },
    { type: 'menu', title: 'Custom Logic', path: '/dashboard/custom-logic', icon: 'js square',accessModule : CUSTOM_LOGIC},

    // { type: 'label', title: 'Delete Requests' , accessModule: DELETE_REQUEST},
    // {type: 'menu',title: 'Delete Requests',path: '/dashboard/document/deleterequest',icon: 'upload', accessModule:DELETE_REQUEST},

    { type: 'label', title: 'Manage Users', accessModule:MANAGE_USER },
    { type: 'menu', title: 'Manage Role', path: '/dashboard/manage-role', icon: 'square',accessModule:MANAGE_ROLE},
    {type: 'menu',title: 'Users',path: '/dashboard/users',icon: 'users',accessModule:MANAGE_USER},
    
    { type: 'label', title: 'Masters' ,accessModule: PORT_MASTERS},
    { type: 'menu', title: 'Fields',      path: '/dashboard/fields',icon: 'exchange',accessModule : FIELDS},

  ];


    if (user.role == "superAdmin") {
        return SuperAdminMenu
    }else{
        const data = MainMenu.filter(item => hasAccess(item.accessModule))
        return data
    }

}