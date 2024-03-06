import React, { useState } from 'react';
import {
    Breadcrumb,
    Button,
    Form,
    Icon,
    Input,
} from 'semantic-ui-react';
import { useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2'
import { apiGET, apiPOST } from '../../utils/apiHelper';
import { useEffect } from 'react';
import { Editor } from '@monaco-editor/react';
import ModulesComp from './modulesComp';



const AddRole = (props) => {
    const { id } = useParams();
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()
    const [errorObj, setErrorObj] = useState()
    const [disableModulesIds, setDisableModulesIds] = useState([])
    const [dataObj, setDataObj] = useState({
        name: "",
        description: "",
        disabledModules :[],
        parentModuleIds : []
    })
    const [parentModuleIds, setParentModuleIds] = useState([])

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
            let disableModuleArray = parentModuleIds.filter(item => disableModulesIds.includes(item))
            console.log("disableModuleArray",disableModuleArray);
            let payload = {
                name: dataObj.name,
                description: dataObj.description,
                disabledModules : disableModulesIds,
                // parentModuleIds : parentModuleIds
            }
            if (isValid) {
                setLoading(true)
                const response = await apiPOST('v1/role/', payload)
                setLoading(false)
                if (response.status === 200) {
                    Toast.fire("Success!","Role added successfully", 'success');
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
            console.log("disableModuleArray",disableModuleArray);
            let payload = {
                name: dataObj.name,
                description: dataObj.description,
                disabledModules : disableModuleArray,
                // parentModuleIds : parentModuleIds
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

    // useEffect(() => {
    //     setDataObj({...dataObj,disabledModules : disableModulesIds})
    // }, [disableModulesIds])

    
    return (
        <div className="fadeIn page-content-wrapper ">
            <div className="page-header">
                <div>
                    <Breadcrumb icon="right angle" sections={sections} />
                    <div className="header-text">{id ? "Edit Role" : 'Add Role'}</div>
                    <div className="sub-text">Proceed to {id ? "edit role" : 'add new role here'}</div>
                </div>
                <div className="page-header-actions">
                    <Button icon
                        onClick={clearFields}>
                        <Icon name='close' />
                    </Button>
                </div>
            </div>
            <div className="page-body">
                <Form style={{ width: '100%' }}>
                    <Form.Field
                        id="form-input-control-first-name"
                        control={Input}
                        label="Name"
                        placeholder="Enter Name"
                        required={true}
                        value={dataObj?.name || ""}
                        onChange={(e) => {
                            setDataObj({ ...dataObj, name: e.target.value });
                            delete errorObj?.name
                        }}
                        error={errorObj && errorObj.name}
                    />
                    <Form.Field 
                        id="form-input-control-first-name"
                        control={Input}
                        label="Description"
                        placeholder="Enter Description"
                        required={true}
                        value={dataObj?.description || ""}
                        onChange={(e) => {
                            setDataObj({ ...dataObj, description: e.target.value });
                            delete errorObj?.description
                        }}
                        error={errorObj && errorObj.description}
                    />
                    <Form.Field
                        style={{marginBottom:0}}
                        label="Access Modules"
                        placeholder="Select Modules For this role"
                    />
                   {
                        props.visible && <ModulesComp
                        setParentModuleIds={setParentModuleIds}
                        disableModulesIds={disableModulesIds} 
                        setDisableModulesIds={setDisableModulesIds}
                        />
                    } 
                </Form>
            </div>
            <div className="page-footer ">
                <button
                    className={loading ? 'ui  button loading' : 'ui  button '}
                    onClick={clearFields}
                    disabled={loading} loading={loading}
                >
                    Close
                </button>
                <button
                    className={loading ? 'ui primary button loading' : 'ui primary button '}
                    onClick={id ? onClickEditRoleById : onClickAddRole
}
                    disabled={loading} loading={loading}
                >
                    {id ? 'Update Role' : 'Create Role'}
                </button>


            </div>
        </div >)
}

export default AddRole
