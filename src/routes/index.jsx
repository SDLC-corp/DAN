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
import { ADD_DOCUMENT_TYPE, AIR, DELETE_REQUEST, DOCUMENT_TYPE, DOCUMENT_UPLOAD, EDIT_DOCUMENT_TYPE, MANAGE_DASHBOARD, MANAGE_DOCUMENT, MANAGE_LABEL_MATRIX, MANAGE_ROLE, MANAGE_USER, OCEAN, REUPLOAD_PDF, VIEW_CUSTOM_LOGIC, VIEW_DOCUMENT, VIEW_FIELD, VIEW_LABEL_MATRIX } from '../utils/accessHelper';
import SetPassword from '../modules/organizationsRegistration/setPassword';
import DocumentTypeList from '../modules/docupload/documentTypes/listDocumentType';
import Setting from '../modules/settings';

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


  { path: 'document-type', component: <DocumentTypeList />,acccessModuleName: DOCUMENT_TYPE},
  { path: 'document-type/:action', component: <DocumentTypeList />, acccessModuleName: ADD_DOCUMENT_TYPE },
  { path: 'document-type/:action/:id', component: <DocumentTypeList />, acccessModuleName: EDIT_DOCUMENT_TYPE },

  { path: 'fields', component: <FieldList /> , acccessModuleName: VIEW_FIELD},
  { path: 'fields/:action', component: <FieldList />, acccessModuleName:VIEW_FIELD },
  { path: 'fields/:action/:id', component: <FieldList />, acccessModuleName:VIEW_FIELD },

  { path: 'field-group', component: <ListFieldGroup />, acccessModuleName: VIEW_FIELD },
  { path: 'field-group/:action', component: <ListFieldGroup />,acccessModuleName : VIEW_FIELD },
  { path: 'field-group/:action/:id', component: <ListFieldGroup />,acccessModuleName :VIEW_FIELD },

  { path: 'custom-logic', component: <CustomLogic />,acccessModuleName : VIEW_CUSTOM_LOGIC },
  { path: 'custom-logic/:action', component: <CustomLogic />,acccessModuleName : VIEW_CUSTOM_LOGIC },
  { path: 'custom-logic/:action/:id', component: <CustomLogic />,acccessModuleName : VIEW_CUSTOM_LOGIC },

  { path: 'manage-role', component: <RoleList />, acccessModuleName: MANAGE_ROLE },
  { path: 'manage-role/:action', component: <RoleList />, acccessModuleName: MANAGE_ROLE },
  { path: 'manage-role/:action/:id', component: <RoleList />, acccessModuleName: MANAGE_ROLE },

  { path: 'labels', component: <LabelList />, acccessModuleName: MANAGE_LABEL_MATRIX },
  { path: 'labels/manage', component: <LabelsManagement />, acccessModuleName: VIEW_LABEL_MATRIX },
  { path: 'labels/manage/:action/:id', component: <LabelsManagement />, acccessModuleName:VIEW_LABEL_MATRIX },
  { path: 'labels/manage/:action', component: <LabelsManagement />, acccessModuleName:VIEW_LABEL_MATRIX },
  { path: 'labels/:action', component: <LabelList />, acccessModuleName:VIEW_LABEL_MATRIX },
  { path: 'labels/:action/:id', component: <LabelList />, acccessModuleName:VIEW_LABEL_MATRIX },

  { path: 'jobs', component: <JobList /> },

  { path: 'setting', component: <Setting /> , acccessModuleName: VIEW_FIELD},



];

const publicRoutes = [
  { path: '/login', component: <Login /> },
  { path: '/un-authorized', component: <UnAuthorized /> },
  { path: '/', component: <Login /> },
  { path: '/signup', component: <OrganizationsRegistration/>},
  { path: '/signup/verify', component: <VerifyRegistration/>},
  { path: '/signup/set-password', component: <SetPassword/>}
];

export { authProtectedRoutes, publicRoutes };
