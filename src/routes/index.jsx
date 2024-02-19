import React from 'react';
import Login from '../modules/login';
import Dashboard from '../modules/dashboard';
import UserList from '../modules/users/listUsers';
import ShippingLineList from '../modules/shippingline/listShippingLine';
import FieldList from '../modules/fields/listFields';
import LabelList from '../modules/labels/listLabel';
import LabelsManagement from '../modules/labels/labelsManagement';
import DocumentUpload from '../modules/docupload/documentUpload';
import DocumentList from '../modules/docupload/listDocuments';
import ViewDocument from '../modules/docupload/viewDocumentV2';
import DomainTree from '../modules/managedomain/domainTree';
import JobList from '../modules/job/listJobs';

import CustomLogic from '../modules/logic/customLogic';
import ListPortMaster from '../modules/portmasters/listPortMaster';
import ListAirPortMaster from '../modules/airportmasters/listAirPortMaster';
import ListIsoCodes from '../modules/containerIsoCode/listIsoCodes';
import ListFieldGroup from '../modules/fieldGroup/listFieldGroup';
import RequestedDocumentList from '../modules/requestedDocument/listrequestedDocument';
import RoleList from '../modules/role/listRole';
import UnAuthorized from '../utils/unAuthorized';
import { ADD_AIR_PORT_MASTERS, ADD_CONTAINER_ISO_CODE, ADD_PORT_MASTERS, ADD_ROLE, ADD_SHIPPING_LINE, ADD_USER, AIR, AIR_PORT_MASTERS, CONTAINER_ISO_CODE, CUSTOM_LOGIC, DELETE_REQUEST, DOCUMENT_UPLOAD, EDIT_AIR_PORT_MASTERS, EDIT_CONTAINER_ISO_CODE, EDIT_PORT_MASTERS, EDIT_ROLE, EDIT_SHIPPING_LINE, EDIT_USER, FIELDS, FIELD_MAPPING, LABEL_MATRIX, MANAGE_DASHBOARD, MANAGE_DOCUMENT, MANAGE_DOMAIN, MANAGE_ROLE, MANAGE_USER, OCEAN, PORT_MASTERS, REUPLOAD_PDF, SHIPPING_LINE, VIEW_DOCUMENT } from '../utils/accessHelper';

// These path are relative to /dashboard/
const authProtectedRoutes = [
  { path: '', component: <Dashboard />, acccessModuleName: MANAGE_DASHBOARD},

  { path: 'users', component: <UserList />, acccessModuleName: MANAGE_USER},
  { path: 'users/:action', component: <UserList />, acccessModuleName : ADD_USER},
  { path: 'users/:action/:id', component: <UserList />, acccessModuleName : EDIT_USER},

  { path: '/dashboard/document-upload', component: <DocumentUpload />,acccessModuleName : DOCUMENT_UPLOAD },
  { path: '/dashboard/document-upload/air', component: <DocumentUpload />,acccessModuleName : AIR },
  { path: '/dashboard/document-upload/ocean', component: <DocumentUpload />,acccessModuleName : OCEAN },
  { path: '/dashboard/document-list', component: <DocumentList />, acccessModuleName : MANAGE_DOCUMENT },
  { path: '/dashboard/document-list/view/:id', component: <ViewDocument />, acccessModuleName: VIEW_DOCUMENT },
  { path: '/dashboard/document-list/reupload/:id', component: <ViewDocument />,acccessModuleName : REUPLOAD_PDF },
  { path: '/dashboard/document/deleterequest', component: <RequestedDocumentList />, acccessModuleName: DELETE_REQUEST },
  { path: '/dashboard/document/deleterequest/view/:id', component: <ViewDocument />, acccessModuleName: DELETE_REQUEST },
  { path: '/dashboard/document/deleterequest/approved', component: <RequestedDocumentList />, acccessModuleName: DELETE_REQUEST },
  { path: '/dashboard/document/deleterequest/delete/:id', component: <RequestedDocumentList />, acccessModuleName: DELETE_REQUEST },


  { path: 'carrier-line', component: <ShippingLineList />,acccessModuleName: SHIPPING_LINE },
  { path: 'carrier-line/:action', component: <ShippingLineList />, acccessModuleName: ADD_SHIPPING_LINE },
  { path: 'carrier-line/:action/:id', component: <ShippingLineList />, acccessModuleName: EDIT_SHIPPING_LINE },

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
  { path: 'manage-role/:action', component: <RoleList />, acccessModuleName: ADD_ROLE },
  { path: 'manage-role/:action/:id', component: <RoleList />, acccessModuleName: EDIT_ROLE },

  { path: 'labels', component: <LabelList />, acccessModuleName:LABEL_MATRIX },
  { path: 'labels/manage', component: <LabelsManagement />, acccessModuleName:LABEL_MATRIX },
  { path: 'labels/manage/:action/:id', component: <LabelsManagement />, acccessModuleName:LABEL_MATRIX },
  { path: 'labels/manage/:action', component: <LabelsManagement />, acccessModuleName:LABEL_MATRIX },
  { path: 'labels/:action', component: <LabelList />, acccessModuleName:LABEL_MATRIX },
  { path: 'labels/:action/:id', component: <LabelList />, acccessModuleName:LABEL_MATRIX },

  { path: 'jobs', component: <JobList /> },
  { path: 'portmaster', component: <ListPortMaster /> ,acccessModuleName: PORT_MASTERS},
  { path: 'portmaster/:action', component: <ListPortMaster />,acccessModuleName: ADD_PORT_MASTERS},
  { path: 'portmaster/:action/:id', component: <ListPortMaster />,acccessModuleName: EDIT_PORT_MASTERS },

  { path: 'air-portmaster', component: <ListAirPortMaster />,acccessModuleName: AIR_PORT_MASTERS },
  { path: 'air-portmaster/:action', component: <ListAirPortMaster />,acccessModuleName: ADD_AIR_PORT_MASTERS },
  { path: 'air-portmaster/:action/:id', component: <ListAirPortMaster />,acccessModuleName: EDIT_AIR_PORT_MASTERS },

  { path: 'containerisocodes', component: <ListIsoCodes />, acccessModuleName: CONTAINER_ISO_CODE },
  { path: 'containerisocodes/:action', component: <ListIsoCodes />, acccessModuleName: ADD_CONTAINER_ISO_CODE },
  { path: 'containerisocodes/:action/:id', component: <ListIsoCodes />, acccessModuleName: EDIT_CONTAINER_ISO_CODE },




  { path: 'managedomain', component: <DomainTree />, acccessModuleName: MANAGE_DOMAIN },


];

const publicRoutes = [
  { path: '/login', component: <Login /> },
  { path: '/un-authorized', component: <UnAuthorized /> },
  { path: '/', component: <Login /> },
];

export { authProtectedRoutes, publicRoutes };
