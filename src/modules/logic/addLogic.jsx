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
import RemoteDropdown from './remoteDropdown';
import SearchAddwithoutOptionDropdown from '../../components/dropdown/searchAddwithoutOptionDropdown';



const AddLogic = (props) => {

    const { id } = useParams();
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()
    const [errorObj, setErrorObj] = useState()
    const [dataObj, setDataObj] = useState({
        name: "",
        shortCode: "",
        textArea: "// Javascript Editor ",
        dependency :[]
    })
    const [docDropDownValue, setDocDropDownValue] = useState([])
    const [dependencyArray, setDependencyArray] = useState([])
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
        { key: 'Custom Logic ', content: 'Custom Logic ', link: true },
        { key: id ? 'Edit Logic' : 'Add Logic', content: id ? 'Edit Logic' : 'Add Logic', active: true },
    ];

    const clearFields = () => {
        setDataObj({ name: "", shortCode: "", textArea: "// Javascript Editor", dependency:[] })
        setDependencyArray([])
        setErrorObj()
        navigate('/dashboard/custom-logic')
    }

    const validate = (data) => {
        if (!data.name.trim()) {
            setErrorObj({ ...errorObj, name: "Name is required" })
            return false
        }
        if (!data.textArea.trim()) {
            setErrorObj({ ...errorObj, textArea: "JS Logic is required" })
            return false
        }
        if (!data.shortCode.trim()) {
            setErrorObj({ ...errorObj, shortCode: "Short Code is required" })
            return false
        }
        return true
    }

    const onClickAddLogic = async () => {
        console.log("dataObj", dataObj);
        try {
            if (loading) return
            const isValid = await validate(dataObj)
            if (isValid) {
                setLoading(true)
                const response = await apiPOST('v1/logic/', dataObj)
                setLoading(false)
                console.log("response", response);
                if (response.status === 200) {
                    Toast.fire("Success!","logic added successfully", 'success');
                    setLoading(false)
                    clearFields()
                    props.getAllLogics()
                }
                else {
                    Toast.fire('Error!', response?.data?.data || "Something went wrong!", 'error');
                }
            }
        } catch (error) {
            console.log(error);
            Toast.fire('Error!', error || "Something went wrong!", 'error');
        }
    }

    const onClickEditLogicById = async () => {
        try {
            if (loading) return
            const isValid = await validate(dataObj)
            if (isValid) {
                setLoading(true)
                const response = await apiPOST(`v1/logic/${id}`, dataObj)
                setLoading(false)
                console.log('response post', response);
                if (response.status === 200) {
                    Toast.fire("Success!","Custom Logic updated successfully", 'success');
                    props.getAllLogics()
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

    const onClickGetLogicById = async () => {
        try {
            if (loading) return
            const response = await apiGET(`v1/logic/${id}`)
            setLoading(false)
            console.log('response get Single', response);
            if (response.status === 200) {
                let result = response.data.data
                setDataObj({
                    name: result?.name,
                    shortCode: result?.shortCode,
                    textArea: result?.textArea,
                    dependency:result?.dependency
                })
                if (result?.dependency) {
                    setDependencyArray(result.dependency)
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
            onClickGetLogicById()
        }
    }, [id])

    useEffect(() => {
            if (dependencyArray.length) {
                setDataObj({...dataObj,dependency : dependencyArray})
            }
    }, [dependencyArray])
    
    return (
        <div className="fadeIn page-content-wrapper ">
            <div className="page-header">
                <div>
                    <Breadcrumb icon="right angle" sections={sections} />
                    <div className="header-text">{id ? "Edit Logic" : 'Add Logic'}</div>
                    <div className="sub-text">Proceed to {id ? "edit logic" : 'add new logic here'}</div>
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
                        label="Short Code"
                        placeholder="Enter Short Code"
                        required={true}
                        value={dataObj?.shortCode || ""}
                        onChange={(e) => {
                            setDataObj({ ...dataObj, shortCode: e.target.value });
                            delete errorObj?.shortCode
                        }}
                        error={errorObj && errorObj.shortCode}
                    />
                    <Form.Field
                        style={{marginBottom:0}}
                        label="Dependency"
                    />
                    <SearchAddwithoutOptionDropdown
                        style={{marginBottom:15}}
                        placeholder="Enter dependency"
                        dependencyArray={dependencyArray} 
                        setDependencyArray={setDependencyArray}
                    />
                    <Editor
                        height="23vh"
                        defaultLanguage="javascript"
                        value={dataObj.textArea}
                        onChange={(val) => setDataObj({ ...dataObj, textArea: val })}
                    />
                    <p style={{marginTop:20}}>
                        <RemoteDropdown value={docDropDownValue} setValue={setDocDropDownValue} handleButton={()=>console.log('execute btn',docDropDownValue)} />
                    </p>
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
                    onClick={id ? onClickEditLogicById : onClickAddLogic}
                    disabled={loading} loading={loading}
                >
                    {id ? 'Update Logic' : 'Create Logic'}
                </button>


            </div>
        </div >)
}

export default AddLogic