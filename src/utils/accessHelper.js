/* ALL Module*/
export const VIEW_STATUS = "VIEW_STATUS"
export const ADD_NOTES = "ADD_NOTES"
export const DELETE_DOCUMENT = "DELETE_DOCUMENT"
export const MANAGE_DOCUMENT = "MANAGE_DOCUMENT"
export const UPDATE_LOGIC = "UPDATE_LOGIC"
export const DOCUMENT_UPLOAD = "DOCUMENT_UPLOAD"
export const UPDATE_FIELD = "UPDATE_FIELD"
export const ASSIGN_TO = "ASSIGN_TO"
export const REUPLOAD_PDF = "REUPLOAD_PDF"
export const VIEW_RAW = "VIEW_RAW"
export const SYNC_WITH_ERP = "SYNC_WITH_ERP"
export const EXTRACTION = "EXTRACTION"
export const VIEW_DOCUMENT = "VIEW_DOCUMENT"
export const EXPORT_DOCUMENTS = "EXPORT_DOCUMENTS"
export const ALLOW_SYNCHRONIZATION = "ALLOW_SYNCHRONIZATION"
export const MANAGE_USER = "MANAGE_USER"
export const ADD_USER = "ADD_USER"
export const EDIT_USER = "EDIT_USER"
export const VIEW_USER = "VIEW_USER"
export const MANAGE_ROLE = "MANAGE_ROLE"
export const ADD_ROLE = "ADD_ROLE"
export const EDIT_ROLE = "EDIT_ROLE"
export const DELETE_ROLE = "DELETE_ROLE"
export const SHIPPING_LINE = "SHIPPING_LINE"
export const ADD_SHIPPING_LINE = "ADD_SHIPPING_LINE"
export const EDIT_SHIPPING_LINE = "EDIT_SHIPPING_LINE"
export const DELETE_SHIPPING_LINE = "DELETE_SHIPPING_LINE"
export const CONTAINER_ISO_CODE = "CONTAINER_ISO_CODE"
export const ADD_CONTAINER_ISO_CODE = "ADD_CONTAINER_ISO_CODE"
export const EDIT_CONTAINER_ISO_CODE = "EDIT_CONTAINER_ISO_CODE"
export const DELETE_CONTAINER_ISO_CODE = "DELETE_CONTAINER_ISO_CODE"
export const AIR_PORT_MASTERS = "AIR_PORT_MASTERS"
export const ADD_AIR_PORT_MASTERS = "ADD_AIR_PORT_MASTERS"
export const EDIT_AIR_PORT_MASTERS = "EDIT_AIR_PORT_MASTERS"
export const DELETE_AIR_PORT_MASTERS = "DELETE_AIR_PORT_MASTERS"
export const PORT_MASTERS = "PORT_MASTERS"
export const ADD_PORT_MASTERS = "ADD_PORT_MASTERS"
export const EDIT_PORT_MASTERS = "EDIT_PORT_MASTERS"
export const DELETE_PORT_MASTERS = "DELETE_PORT_MASTERS"
export const MANAGE_DOMAIN = "MANAGE_DOMAIN"
export const ADD_DOMAIN = "ADD_DOMAIN"
export const EDIT_DOMAIN = "EDIT_DOMAIN"
export const DELETE_DOMAIN = "DELETE_DOMAIN"
export const DELETE_REQUEST = "DELETE_REQUEST"
export const AIR = "AIR"
export const OCEAN = "OCEAN"

// All accessible
export const MANAGE_DASHBOARD = "MANAGE_DASHBOARD"
export const VIEW_DASHBOARD = "VIEW_DASHBOARD"

// Super Admin Only 
export const FIELD_MAPPING = "FIELD_MAPPING"
export const LABEL_MATRIX = "LABEL_MATRIX"
export const CUSTOM_LOGIC = "CUSTOM_LOGIC"
export const FIELDS = "FIELDS"

const getCurrentUser =()=>{
    try {
        let user = JSON.parse(localStorage.getItem("user"))
    return {
        role:user.role,
        accessModules: user.accessModules || []
    }
    } catch (error) {
        return {
        role: "admin",
        accessModules: []
    }
    }
}

export function hasAccess(module) {
    const {role,accessModules} = getCurrentUser()
    if (role == "superAdmin") {
        return true
    }else{
        return accessModules.includes(module)
    }
}


/* Example */
/* 
  hasAccess(["EDIT_USER","VIEW_USER"], VIEW_USER)
*/

