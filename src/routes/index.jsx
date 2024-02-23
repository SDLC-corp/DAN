import React from 'react';
import Login from '../modules/login';
import Dashboard from '../modules/dashboard';
import UserList from '../modules/users/listUsers';
import FieldList from '../modules/fields/listFields';
import LabelList from '../modules/labels/listLabel';
import LabelsManagement from '../modules/labels/labelsManagement';
import DocumentUpload from '../modules/docupload/documentUpload';
import DocumentList from '../modules/docupload/listDocuments';
import ViewDocument from '../modules/docupload/viewDocument';
import JobList from '../modules/job/listJobs';
import CustomLogic from '../modules/logic/customLogic';
import ListFieldGroup from '../modules/fieldGroup/listFieldGroup';
import RoleList from '../modules/role/listRole';
import UnAuthorized from '../utils/unAuthorized';
import OrganizationsRegistration from '../modules/organizationsRegistration/organizationsRegistration';
import VerifyRegistration from '../modules/organizationsRegistration/verifyRegistration';
import { AIR, AIR_PORT_MASTERS, CONTAINER_ISO_CODE, CUSTOM_LOGIC, DELETE_REQUEST, DOCUMENT_UPLOAD, FIELDS, FIELD_MAPPING, LABEL_MATRIX, MANAGE_DASHBOARD, MANAGE_DOCUMENT, MANAGE_DOMAIN, MANAGE_ROLE, MANAGE_USER, OCEAN, PORT_MASTERS, REUPLOAD_PDF, SHIPPING_LINE, VIEW_DOCUMENT } from '../utils/accessHelper';
import SetPassword from '../modules/organizationsRegistration/setPassword';

// These path are relative to /dashboard/
const authProtectedRoutes = [
  { path: '', component: <Dashboard />, acccessModuleName: MANAGE_DASHBOARD},

  { path: 'users', component: <UserList />, acccessModuleName: MANAGE_USER},
  { path: 'users/:action', component: <UserList />, acccessModuleName : MANAGE_USER},
  { path: 'users/:action/:id', component: <UserList />, acccessModuleName : MANAGE_USER},

  { path: '/dashboard/document-upload', component: <DocumentUpload />,acccessModuleName : DOCUMENT_UPLOAD },
  { path: '/dashboard/document-upload/air', component: <DocumentUpload />,acccessModuleName : AIR },
  { path: '/dashboard/document-upload/ocean', component: <DocumentUpload />,acccessModuleName : OCEAN },
  { path: '/dashboard/document-list', component: <DocumentList />, acccessModuleName : MANAGE_DOCUMENT },
  { path: '/dashboard/document-list/view/:id', component: <ViewDocument />, acccessModuleName: VIEW_DOCUMENT },
  { path: '/dashboard/document-list/reupload/:id', component: <ViewDocument />,acccessModuleName : REUPLOAD_PDF },

  { path: 'fields', component: <FieldList /> , acccessModuleName: FIELDS},
  { path: 'fields/:action', component: <FieldList />, acccessModuleName:FIELD_MAPPING },
  { path: 'fields/:action/:id', component: <FieldList />, acccessModuleName:FIELD_MAPPING },

  { path: 'field-group', component: <ListFieldGroup />, acccessModuleName: FIELDS },
  { path: 'field-group/:action', component: <ListFieldGroup />,acccessModuleName : FIELDS },
  { path: 'field-group/:action/:id', component: <ListFieldGroup />,acccessModuleName :FIELDS },

  { path: 'custom-logic', component: <CustomLogic />,acccessModuleName : CUSTOM_LOGIC },
  { path: 'custom-logic/:action', component: <CustomLogic />,acccessModuleName : CUSTOM_LOGIC },
  { path: 'custom-logic/:action/:id', component: <CustomLogic />,acccessModuleName : CUSTOM_LOGIC },

  { path: 'manage-role', component: <RoleList />, acccessModuleName: MANAGE_ROLE },
  { path: 'manage-role/:action', component: <RoleList />, acccessModuleName: MANAGE_ROLE },
  { path: 'manage-role/:action/:id', component: <RoleList />, acccessModuleName: MANAGE_ROLE },

  { path: 'labels', component: <LabelList />, acccessModuleName:LABEL_MATRIX },
  { path: 'labels/manage', component: <LabelsManagement />, acccessModuleName:LABEL_MATRIX },
  { path: 'labels/manage/:action/:id', component: <LabelsManagement />, acccessModuleName:LABEL_MATRIX },
  { path: 'labels/manage/:action', component: <LabelsManagement />, acccessModuleName:LABEL_MATRIX },
  { path: 'labels/:action', component: <LabelList />, acccessModuleName:LABEL_MATRIX },
  { path: 'labels/:action/:id', component: <LabelList />, acccessModuleName:LABEL_MATRIX },

  { path: 'jobs', component: <JobList /> },


];

const publicRoutes = [
  { path: '/login', component: <Login /> },
  { path: '/un-authorized', component: <UnAuthorized /> },
  { path: '/', component: <Login /> },
  { path: '/registration', component: <OrganizationsRegistration/>},
  { path: '/registration/verify', component: <VerifyRegistration/>},
  { path: '/registration/set-password', component: <SetPassword/>}
];

export { authProtectedRoutes, publicRoutes };
