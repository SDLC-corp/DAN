import React, { useState } from 'react';
import {
    Breadcrumb,
    Button,
    Form,
    Icon,
    Input,
    Modal,
    Label,
    Table,
    TableHeader,
    TableRow,
    TableHeaderCell,
    TableBody,
    TableCell,
    Image
} from 'semantic-ui-react';
import { useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2'
import { apiDELETE, apiGET, apiPOST } from '../../utils/apiHelper';
import { useEffect } from 'react';
import ModulesComp from './modulesComp';
import { ADD_USERS, hasAccess } from '../../utils/accessHelper';

import ProfilePic from '../../assets/images/Profile.png'

const AddRole = (props) => {
    const { id } = useParams();
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()
    const [errorObj, setErrorObj] = useState()
    const [disableModulesIds, setDisableModulesIds] = useState([])
    const validInputRegex = /^[a-zA-Z0-9\s]*$/
    const [dataObj, setDataObj] = useState({
        name: "",
        description: "",
        disabledModules :[],
    })
    const [parentModuleIds, setParentModuleIds] = useState([])
    const [usersMadal, setUsersMadal] = useState(false)
    const [userListAccordingToRole, setUserListAccordingToRole] = useState([])

    const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer)
            toast.addEventListener('mouseleave', Swal.resumeTimer)
        }
    })

    const sections = [
        { key: 'Dashboard', content: 'Dashboard', link: true },
        { key: 'Role ', content: 'Role ', link: true },
        { key: id ? 'Edit Role' : 'Add Role', content: id ? 'Edit Role' : 'Add Role', active: true },
    ];

    const clearFields = () => {
        setDataObj({ name: "", description: "",disabledModules:[] })
        setUserListAccordingToRole([])
        setDisableModulesIds([])
        setParentModuleIds([])
        setErrorObj()
        navigate('/dashboard/manage-role')
    }

    const validate = (data) => {
        if (!data.name.trim()) {
            setErrorObj({ ...errorObj, name: "Name is required" })
            return false
        }
        if (!data.description.trim()) {
            setErrorObj({ ...errorObj, description: "Description is required" })
            return false
        }
        return true
    }

    const onClickAddRole = async () => {
        try {
            if (loading) return
            const isValid = await validate(dataObj)
            let disableModuleArray = disableModulesIds.filter(item => !parentModuleIds.includes(item))
            let payload = {
                name: dataObj.name,
                description: dataObj.description,
                disabledModules : disableModuleArray,
            }
            if (isValid) {
                setLoading(true)
                const response = await apiPOST('v1/role/', payload)
                setLoading(false)
                if (response.status === 200) {
                    Swal.fire({
                        title: "Success!",
                        text: "Role added successfully",
                        icon: "success",
                    });
                    setLoading(false)
                    clearFields()
                    props.getAllRoles()
                }
                else {
                    Toast.fire('Error!', response?.data?.data || "Something went wrong!", 'error');
                }
            }
        } catch (error) {
            Toast.fire('Error!', error || "Something went wrong!", 'error');
        }
    }

    const onClickEditRoleById = async () => {
        try {
            if (loading) return
            const isValid = await validate(dataObj)
            let disableModuleArray = disableModulesIds.filter(item => !parentModuleIds.includes(item))
            let payload = {
                name: dataObj.name,
                description: dataObj.description,
                disabledModules : disableModuleArray,
            }
            if (isValid) {
                setLoading(true)
                const response = await apiPOST(`v1/role/${id}`, payload)
                setLoading(false)
                if (response.status === 200) {
                    Swal.fire({
                        title: "Success!",
                        text: "Role updated successfully",
                        icon: "success",
                    });
                    props.getAllRoles()
                    setLoading(false)
                    clearFields()
                }
                else {
                    Toast.fire('Error!', response?.data?.data || "Something went wrong!", 'error');
                }
            }
        } catch (error) {
            Toast.fire('Error!', error || "Something went wrong!", 'error');
        }
    }

    const onClickGetRoleById = async () => {
        try {
            if (loading) return
            const response = await apiGET(`v1/role/${id}`)
            setLoading(false)
            if (response.status === 200) {
                let result = response.data.data
                setDataObj({
                    name: result?.name,
                    description: result?.description,
                    disabledModules: result?.disabledModules
                })
                if (result?.disabledModules) {
                    setDisableModulesIds(result.disabledModules)
                }
            }
            else {
                Toast.fire('Error!', response?.data?.data || "Something went wrong!", 'error');
            }
        } catch (error) {
            Toast.fire('Error!', error || "Something went wrong!", 'error');
        }
    }

    const getAllUsersRoleID = async (roleId) => {
        try {
            const payload = { roleId }
            const search = JSON.stringify(payload)
            let response = await apiGET(`/v1/users/list?search=${search}`);
            if (response.status === 200) {
                const data = response?.data?.data?.data
                setUserListAccordingToRole(data)
            } else if (response.status === 400) {
                Swal.fire({
                    title: "Error!",
                    text: response?.data?.data,
                    icon: "error",
                });

            } else {
                Swal.fire({
                    title: "Error!",
                    text: response?.data?.data,
                    icon: "error",
                });
            }
        } catch (error) {
            Swal.fire({
                title: "Error!",
                text: error,
                icon: "error",
            });
        } finally {
            //   setLoading(false);
        }
    };

    useEffect(() => {
        if (id) {
            getAllUsersRoleID(id)
        }
    }, [id])

    useEffect(() => {
        if (props.visible == false) {
            clearFields();
        }
    }, [props.visible == false]);

    useEffect(() => {
        if (id) {
            onClickGetRoleById()
        }
    }, [id])


    
    return (
      <div className="fadeIn page-content-wrapper ">
        <div className="page-header">
          <div>
            <Breadcrumb icon="right angle" sections={sections} />
            <div className="header-text">{id ? 'Edit Role' : 'Add Role'}</div>
            <div className="sub-text">Proceed to {id ? 'edit role' : 'add new role here'}</div>
          </div>
          <div className="page-header-actions">
            <Button icon onClick={clearFields}>
              <Icon name="close" />
            </Button>
          </div>
        </div>
        <div className="page-body" style={{display: 'flex', flexDirection:'column'}}>
          <Form style={{ width: '100%' }}>
            <Form.Field
              id="form-input-control-first-name"
              control={Input}
              label="Name"
              placeholder="Enter Name"
              required={true}
              value={dataObj?.name || ''}
              onChange={(e) => {
                let value = e.target.value;
                if ((value === '') | validInputRegex.test(value)) {
                  setDataObj({ ...dataObj, name: value });
                  delete errorObj?.name;
                } else {
                  setErrorObj({ ...errorObj, name: 'No special characters allowed' });
                }
              }}
              error={errorObj && errorObj.name}
            />
            <Form.Field
              id="form-input-control-first-name"
              control={Input}
              label="Description"
              placeholder="Enter Description"
              required={true}
              value={dataObj?.description || ''}
              onChange={(e) => {
                setDataObj({ ...dataObj, description: e.target.value });
                delete errorObj?.description;
              }}
              error={errorObj && errorObj.description}
            />
            <Form.Field style={{ marginBottom: 0 }} label="Access Modules" placeholder="Select Modules For this role" />
            {props.visible && <ModulesComp setParentModuleIds={setParentModuleIds} disableModulesIds={disableModulesIds} setDisableModulesIds={setDisableModulesIds} />}
          </Form>
          {userListAccordingToRole?.length ? (
            <div style={{ marginTop: 8 }}>
              <Form.Field style={{ marginBottom: 0, fontWeight: 'bold' }} label="Users List" />
              <UserTable data={userListAccordingToRole} roleId={id} getDataFn={getAllUsersRoleID} />
            </div>
          ) : null}
        </div>
        <div className="page-footer ">
          <div>
            <button className={loading ? 'ui  button loading' : 'ui  button '} onClick={clearFields} disabled={loading} loading={loading}>
              Close
            </button>
            {id && (
              <button className={loading ? 'ui  button loading' : 'ui  button '} onClick={() => setUsersMadal(true)} disabled={loading} loading={loading}>
                Add User's
              </button>
            )}
          </div>
          <button className={loading ? 'ui primary button loading' : 'ui primary button '} onClick={id ? onClickEditRoleById : onClickAddRole} disabled={loading} loading={loading}>
            {id ? 'Update Role' : 'Create Role'}
          </button>
        </div>
        {usersMadal && <AddUsersModal getAllUsersRoleID={getAllUsersRoleID} openModal={usersMadal} setOpenModal={setUsersMadal} roleId={id} />}
      </div>
    );
}

export default AddRole

export function AddUsersModal({openModal,setOpenModal,roleId,getAllUsersRoleID}) {
    const [dataObj, setDataObj] = useState()
    const [userDDOptions, setUserDDOptions] = useState([])
    const [roleName, setRoleName] = useState('')
    const [userRolesIds, setUserRolesIds] = useState([])

    const getAllUsers = async () => {
        try {
            let response = await apiGET(`/v1/users/list`);
            if (response.status === 200) {
                const data = response?.data?.data?.data
                const result = data.map(item =>{
                    return {key:item.id,value:item.id,text:item.name}
                })
                setUserDDOptions([...result])
            } else if (response.status === 400) {
                Swal.fire({
                    title: "Error!",
                    text: response?.data?.data,
                    icon: "error",
                });

            } else {
                Swal.fire({
                    title: "Error!",
                    text: response?.data?.data,
                    icon: "error",
                });
            }
        } catch (error) {
            Swal.fire({
                title: "Error!",
                text: error,
                icon: "error",
            });
        } finally {
            //   setLoading(false);
        }
    };

    const onClickGetRoleById = async (id) => {
        try {
            const response = await apiGET(`v1/role/${id}`)
            if (response.status === 200) {
                let result = response.data.data
                setRoleName(result?.name)
            }
            else {
                Toast.fire('Error!', response?.data?.data || "Something went wrong!", 'error');
            }
        } catch (error) {
            Toast.fire('Error!', error || "Something went wrong!", 'error');
        }
    }

    const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer)
            toast.addEventListener('mouseleave', Swal.resumeTimer)
        }
    })


    const onClickAddUsers = async () => {
      try {
        const response = await apiPOST(`v1/users/change-roleIds/${roleId}`, userRolesIds);
        if (response.status === 200) {
            getAllUsersRoleID(roleId)
            setOpenModal(false)
          Swal.fire({
            title: 'Success!',
            text: 'Users Added successfully.',
            icon: 'success',
          });
        } else {
          Toast.fire('Error!', response?.data?.data || 'Something went wrong!', 'error');
          setOpenModal(false)
        }
      } catch (error) {
        Toast.fire('Error!', error || 'Something went wrong!', 'error');
        setOpenModal(false)
      }
    };



    
    useEffect(() => {
        getAllUsers()
    }, [])

    useEffect(() => {
        onClickGetRoleById(roleId)
    }, [roleId])
    

    return (
      <Modal size={''} onFocus={openModal} open={openModal}  onClose={() =>{
        getAllUsersRoleID(roleId)
        setOpenModal(false)
      }}>
        <Modal.Header>{'Add Users'}</Modal.Header>
        <Modal.Content>
          <Form style={{ width: '100%' }}>
            <Form.Field
              id="form-input-control-first-name"
              control={Input}
              label="Role Name"
              // placeholder="Enter Name"
              value={roleName || ''}
              // error={errorObj && errorObj.name}
            />
            <Form.Dropdown
              label="Add Users"
              width="auto"
              placeholder="Select Users"
              options={userDDOptions}
              search={true}
              onSearchChange={(e) => {
                // getAllShortCodes(e.target.value);
              }}
              // disabled={id ? true : false}
            //   error={errorObj && errorObj.logicCodeId}
              selection
              multiple
              clearable
              onChange={(e,{value}) => {
                setUserRolesIds(value)
              }}
            />
          </Form>
        </Modal.Content>
        <Modal.Actions>
          <Button color="gray" onClick={() => {
            getAllUsersRoleID(roleId)
                setOpenModal(false)
                setUserRolesIds([])
            }}>
            Close
          </Button>
          <Button
            color="gray"
            onClick={onClickAddUsers}
          >
            {/* {updateLogicInLabelId?"Update Logic":"AddLogic"} */}
            Update Users
          </Button>
        </Modal.Actions>
      </Modal>
    );
}

export function UserTable({data,getDataFn,roleId}) {

    const onClickGetRoleById = async (id) => {
        try {
            const response = await apiDELETE(`v1/users/remove-role/${id}`)
            if (response.status === 200) {
              Swal.fire({
                title: 'Success!',
                text: 'Remove User Role Successfully.',
                icon: 'success',
              });
              getDataFn(roleId);
            } else {
              Swal.fire({
                title: 'Error!',
                text: response?.data?.data || 'Something went wrong!',
                icon: 'error',
              });
            }
        } catch (error) {
            Swal.fire({
                title: 'Error!',
                text: error || "Something went wrong!",
                icon: 'error',
            });
        }
    }
    return (
      <>
        <Table singleLine>
          <TableHeader>
            <TableRow>
              <TableHeaderCell>#</TableHeaderCell>
              <TableHeaderCell>Name</TableHeaderCell>
              <TableHeaderCell>Email</TableHeaderCell>
              <TableHeaderCell>Action</TableHeaderCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item, i) => (
              <TableRow>
                <TableCell>{i + 1}</TableCell>
                <TableCell style={{display:"flex",alignContent:"center"}} image>
                <Image src={item.profilePic || ProfilePic} rounded size='mini' style={{ width: "30px", height: "30px", borderRadius: "50%" }} />
                    <span style={{display:"flex", alignItems:"center", marginLeft:10}}>{item.name}</span>
                    </TableCell>
                <TableCell>{item.email}</TableCell>
                <TableCell> 
                <button className="ui red icon button basic" onClick={() => onClickGetRoleById(item.id)}>
                    <i className="trash icon"></i>
                </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </>
    );
}