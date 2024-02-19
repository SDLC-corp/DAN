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
import moment from 'moment';


const AddPortMaster = (props) => {

    const { id } = useParams();
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()
    const [errorObj, setErrorObj] = useState()
    const [dataObj, setDataObj] = useState({
        locationXid: "INLUH",
        locationGid: "TW.INLUH",
        locationName: "// locationName LUDHIANA ",
        lastSyncDate:""
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
        { key: 'Post Matser ', content: 'Port Master ', link: true },
        { key: id ? 'Edit Port Master' : 'Add Port Master', content: id ? 'Edit Port Master' : 'Add Port Master', active: true },
    ];

    const clearFields = () => {
        setDataObj({ locationXid: "", locationGid: "", locationName: "" })
        setErrorObj()
        navigate('/dashboard/portmaster')
    }

    const validate = (data) => {

        if (!data.locationXid.trim()) {
            setErrorObj({ ...errorObj, locationXid: "locationXid is required" })
            return false
        }
        if (!data.locationGid.trim()) {
            setErrorObj({ ...errorObj, locationGid: "locationGid is required" })
            return false
        }
        if (!data.locationName.trim()) {
            setErrorObj({ ...errorObj, locationName: "locationName is required" })
            return false
        }

        return true
    }

    const onClickAddPortMaster = async () => {
        console.log("dataObj", dataObj);
        try {
            if (loading) return
            const isValid = await validate(dataObj)
            if (isValid) {
                setLoading(true)
                const response = await apiPOST('/v1/portmaster/', dataObj)
                setLoading(false)
                console.log("response", response);
                if (response.status === 200) {
                    Swal.fire({
                        title: "Success!",
                        text: "Port Master added successfully",
                        icon: "success",
                    });
                    setLoading(false)
                    clearFields()
                    props.getPortMasterList()
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

    const onClickEditPortMasterById = async () => {
        try {
            if (loading) return
            const isValid = await validate(dataObj)
            if (isValid) {
                setLoading(true)
                const response = await apiPOST(`/v1/portmaster/${id}`, dataObj)
                setLoading(false)
                console.log('response post', response);
                if (response.status === 200) {
                    Swal.fire({
                        title: "Success!",
                        text: "Port Master updated successfully",
                        icon: "success",
                    });
                    props.getPortMasterList()
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

    const onClickGetPortMasterById = async () => {
        try {
            if (loading) return
            const response = await apiGET(`v1/portmaster/${id}`)
            setLoading(false)
            if (response.status === 200) {
                setDataObj({
                    locationXid: response.data.data.locationXid,
                    locationGid: response.data.data.locationGid,
                    locationName: response.data.data.locationName,
                    lastSyncDate: response.data.data.lastSyncDate
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
            onClickGetPortMasterById()
        }
    }, [id])

    return (
        <div className="fadeIn page-content-wrapper ">
            <div className="page-header">
                <div>
                    <Breadcrumb icon="right angle" sections={sections} />
                    <div className="header-text">{id ? "Edit Port Master" : 'Add Port Master'}</div>
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
                        label="LocationName "
                        placeholder="Enter LocationName"
                        required={true}
                        value={dataObj?.locationName || ""}
                        onChange={(e) => {
                            setDataObj({ ...dataObj, locationName: e.target.value.toUpperCase() });
                            delete errorObj?.locationName
                        }}
                        error={errorObj && errorObj.locationName}
                    />
                    <Form.Field
                        id="form-input-control-first-name"
                        control={Input}
                        label="LocationXid"
                        placeholder="Enter LocationXid"
                        required={true}
                        value={dataObj?.locationXid || ""}
                        onChange={(e) => {
                            setDataObj({ ...dataObj, locationXid: e.target.value.toUpperCase() , locationGid: "TW."+ e.target.value.toUpperCase() });
                            delete errorObj?.locationXid
                        }}
                        error={errorObj && errorObj.locationXid}
                    />

                    <label><strong>LocationGid</strong></label>
                    <div class="ui input" style={{width:"100%",border:5,marginBottom:"1rem"}}>
                        <input type="text" value={dataObj?.locationGid} class="disabled-input"  disabled />
                    </div>

                    {/* <Form.Field
                        id="form-input-control-first-name"
                        control={Input}
                        label="LocationGid "
                        placeholder="Enter LocationGid "
                        // required={true}
                        disabled
                        value={dataObj?.locationGid || ""}
                        onChange={(e) => {
                            // setDataObj({ ...dataObj, locationGid: e.target.value.toUpperCase() });
                            delete errorObj?.locationGid
                        }}
                        error={errorObj && errorObj.locationGid}
                    /> */}
                   { id &&  <div style={{display:"flex",justifyContent:"end"}}>
                    <label >Last Sync on {moment(dataObj?.lastSyncDate).format('DD/MM/YYYY')} {moment(dataObj?.lastSyncDate).format('HH:mm a')}</label>
                    </div>}
                   
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
                    onClick={id ? onClickEditPortMasterById : onClickAddPortMaster}
                    disabled={loading} loading={loading}
                >
                    {id ? 'Update Port' : 'Create Port'}
                </button>


            </div>
        </div >)
}

export default AddPortMaster