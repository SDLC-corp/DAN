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

function AddFieldGroup(props) {

    const navigate = useNavigate();
    const { id } = useParams();
    const [fieldGroupObj, setFieldGroupObj] = useState({
        name: "",
        description: "",
        layout: ""
    })
    const [errorObj, setErrorObj] = useState()
    const [loading, setLoading] = useState(false)

    const layoutList = [
        {
            key: "horizontal",
            text: "Horizontal",
            value: "horizontal",
        },
        {
            key: "vertical",
            text: "Vertical",
            value: "vertical",
        },
        {
            key: "table",
            text: "Table",
            value: "table",
        }
    ]

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
        { key: 'Field List', content: 'Field List', link: true },
        { key: id ? 'Edit Field Group' : 'Add Field Group', content: id ? 'Edit Field Group' : 'Add Field Group', active: true },
    ];


    const validate = (data) => {
        if (!data.name.trim()) {
            setErrorObj({ ...errorObj, name: "Name is required" })
            return false
        }
        if (!data.layout.trim()) {
            setErrorObj({ ...errorObj, layout: "Layout is required" })
            return false
        }
        return true
    }

    const handleType = (e, data) => {
        setFieldGroupObj({...fieldGroupObj,layout:data.value})
        delete errorObj?.layout
    }

    const onClickAddFieldGroup = async () => {
        try {
            if (loading) return
            const isValid = await validate(fieldGroupObj)
            if (isValid) {
                setLoading(true)
                const response = await apiPOST('v1/field-group/', fieldGroupObj)
                setLoading(false)
                if (response?.status === 200) {
                    Swal.fire({
                        title: "Success!",
                        text: "Field Group added successfully",
                        icon: "success",
                    });
                    setLoading(false)
                    clearFields()
                    props.getAllField()
                }
                else {
                    Toast.fire('Error!', response?.data?.data || "Something went wrong!", 'error');
                }
            }
        } catch (error) {
            console.log('error', error);
            Toast.fire('Error!', error || "Something went wrong!", 'error');
        }
    }

    const onClickEditFieldGroupById = async () => {
        try {
            if (loading) return
            const isValid = await validate(fieldGroupObj)
            if (isValid) {
                setLoading(true)
                const response = await apiPOST(`v1/field-group/${id}`, fieldGroupObj)
                setLoading(false)
                if (response.status === 200) {
                    Swal.fire({
                        title: "Success!",
                        text: "Field Group updated successfully",
                        icon: "success",
                    });
                    props.getAllField()
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
    const onClickGetFieldGroupById = async () => {
        try {
            if (loading) return
            const res = await apiGET(`/v1/field-group/${id}`)
            console.log('res',res);
            setLoading(false)
            if (res.status === 200) {
                let response = res.data.data
                setFieldGroupObj({
                    name:response.name,
                    description:response.description,
                    layout:response.layout
                })
            }
            else {
                Toast.fire('Error!', res?.data?.data || "Something went wrong!", 'error');
            }
        } catch (error) {
            Toast.fire('Error!', error || "Something went wrong!", 'error');
        }
    }

    const clearFields = () => {
        setFieldGroupObj({ name: "", description: "", layout: "" })
        setErrorObj()
        navigate('/dashboard/field-group')
    }

    useEffect(() => {
        if (props.visible == false) {
            clearFields();
        }
    }, [props.visible == false]);

    useEffect(() => {
        if (id) {
            onClickGetFieldGroupById()
        }
    }, [id])

    console.log('fieldGroupObj', fieldGroupObj);
    return (
        <div className="fadeIn page-content-wrapper">
            <div className="page-header">
                <div>
                    <Breadcrumb icon="right angle" sections={sections} />
                    <div className="header-text">{id ? 'Edit Field Group' : 'Add Field Group'}</div>
                    <div className="sub-text">Proceed to {id ? 'Edit Field Group here' : 'Add new Field Group here'}</div>
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
                        label="Group Name"
                        placeholder="Enter Name"
                        required={true}
                        value={fieldGroupObj?.name || ""}
                        onChange={(e) => {
                            setFieldGroupObj({ ...fieldGroupObj, name: e.target.value });
                            delete errorObj?.name
                        }}
                        error={errorObj && errorObj.name}
                    />

                    <Form.Field
                        id="form-textarea-control-opinion"
                        control={Input}
                        label="Description"
                        placeholder="Enter Description"
                        // required={true}
                        value={fieldGroupObj.description || ""}
                        onChange={(e) => {
                            setFieldGroupObj({ ...fieldGroupObj, description: e.target.value });
                            delete errorObj?.description
                        }}
                        error={errorObj && errorObj.description}
                    />

                    <Form.Dropdown
                        label="Layout"
                        placeholder="Select Layout"
                        options={layoutList}
                        required={true}
                        error={errorObj && errorObj.layout}
                        selection
                        onFocus={() => {
                            // setErrorObj();
                        }}
                        value={fieldGroupObj.layout}
                        onChange={handleType}
                    />
                </Form>
            </div>
            <div className="page-footer ">
                <button className={loading ? 'ui  button loading' : 'ui  button '} onClick={clearFields} disabled={loading} loading={loading}>
                    Close
                </button>
                <button className={loading ? 'ui primary button loading' : 'ui primary button '}
                    onClick={id ? onClickEditFieldGroupById : onClickAddFieldGroup} disabled={loading} loading={loading}>
                    {id ? 'Update Field Group' : 'Create Field Group'}
                </button>

            </div>
        </div>
    );
}


export default AddFieldGroup;



