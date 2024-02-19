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



const AddIsoCodes = (props) => {

    const { id } = useParams();
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()
    const [errorObj, setErrorObj] = useState()
    const [dataObj, setDataObj] = useState({
        text: "text",
        code: "code",
        description: "description"
    })
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
        { key: 'ISO Code ', content: 'ISO Code ', link: true },
        { key: id ? 'Edit Container ISO Code' : 'Add Container ISO Code', content: id ? 'Edit Container ISO Code' : 'Add Container ISO Code', active: true },
    ];

    const clearFields = () => {
        setDataObj({ text: "", code: "", description: "" })
        setErrorObj()
        navigate('/dashboard/containerisocodes')
    }

    const validate = (data) => {

        if (!data.text.trim()) {
            setErrorObj({ ...errorObj,text: "text is required" })
            return false
        }
        if (!data.code.trim()) {
            setErrorObj({ ...errorObj,code: "code is required" })
            return false
        }
        if (!data.description.trim()) {
            setErrorObj({ ...errorObj, description: "description is required" })
            return false
        }

        return true
    }

    const onClickAddIsoCode = async () => {
        console.log("dataObj", dataObj);
        try {
            if (loading) return
            const isValid = await validate(dataObj)
            if (isValid) {
                setLoading(true)
                const response = await apiPOST('v1/isoCodes/', dataObj)
                setLoading(false)
                console.log("response", response);
                if (response.status === 200) {
                    Swal.fire({
                        title: "Success!",
                        text: "Container ISO Code added successfully",
                        icon: "success",
                    });
                    setLoading(false)
                    clearFields()
                    props.getIsoCodesList()
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

    const onClickEditIsoCodeById = async () => {
        try {
            if (loading) return
            const isValid = await validate(dataObj)
            if (isValid) {
                setLoading(true)
                const response = await apiPOST(`v1/isoCodes/${id}`, dataObj)
                setLoading(false)
                console.log('response post', response);
                if (response.status === 200) {
                    Swal.fire({
                        title: "Success!",
                        text: "Container ISO Code updated successfully",
                        icon: "success",
                    });
                    props.getIsoCodesList()
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

    const onClickGetIsoCodeById = async () => {
        try {
            if (loading) return
            const response = await apiGET(`v1/isoCodes/${id}`)
            setLoading(false)
            if (response.status === 200) {
                setDataObj({
                    text: response.data.data.text,
                    code: response.data.data.code,
                    description: response.data.data.description,
                })
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
            onClickGetIsoCodeById()
        }
    }, [id])

    return (
        <div className="fadeIn page-content-wrapper ">
            <div className="page-header">
                <div>
                    <Breadcrumb icon="right angle" sections={sections} />
                    <div className="header-text">{id ? "Edit ISO Code" : 'Add ISO Code'}</div>
                    <div className="sub-text">Proceed to {id ? "edit ISO Code" : 'add new ISO Code here'}</div>
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
                        label="Text"
                        placeholder="Enter text"
                        required={true}
                        value={dataObj?.text || ""}
                        onChange={(e) => {
                            setDataObj({ ...dataObj, text: e.target.value});
                            delete errorObj?.text
                        }}
                        error={errorObj && errorObj.text}
                    />
                    <Form.Field
                        id="form-input-control-first-name"
                        control={Input}
                        label="Code "
                        placeholder="Enter code "
                        required={true}
                        value={dataObj?.code || ""}
                        onChange={(e) => {
                            setDataObj({ ...dataObj, code: e.target.value });
                            delete errorObj?.code
                        }}
                        error={errorObj && errorObj.code}
                    />
                    <Form.Field
                        id="form-input-control-first-name"
                        control={Input}
                        label="Description "
                        placeholder="Enter description"
                        required={true}
                        value={dataObj?.description || ""}
                        onChange={(e) => {
                            setDataObj({ ...dataObj, description: e.target.value });
                            delete errorObj?.description
                        }}
                        error={errorObj && errorObj.description}
                    />
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
                    onClick={id ? onClickEditIsoCodeById : onClickAddIsoCode}
                    disabled={loading} loading={loading}
                >
                    {id ? 'Update ISO Code' : 'Create ISO Code'}
                </button>


            </div>
        </div >)
}

export default AddIsoCodes