import React, { useState } from 'react';
import {
    Breadcrumb,
    Button,
    Checkbox,
    Dropdown,
    Form,
    Icon,
    Input,
    Modal,
} from 'semantic-ui-react';
import { useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2'
import { apiDELETE, apiGET, apiPOST, objectToQueryParam } from '../../utils/apiHelper';
import { useEffect } from 'react';
import { Editor } from '@monaco-editor/react';
import AddLogic from '../logic/addLogic';
import moment from 'moment';

function AddLabel(props) {
    const navigate = useNavigate();
    const { id } = useParams();
    const [overrideText, setOverrideText] = useState("")
    const [isoverride, setIsOverride] = useState(false)
    const [labelObj, setLabelObj] = useState({
        label: "",
        documentTypeId: "",
        fieldId: "",
        logicCodeId: "",
        isOverride: false,

    })
    const [documentTypeName, setDocumentTypeName] = useState()
    const [fieldName, setFieldName] = useState()
    const [documentTypeList, setDocumentTypeList] = useState([])
    const [fieldList, setFieldList] = useState([])
    const [errorObj, setErrorObj] = useState()
    const [loading, setLoading] = useState(false)
    const [codeDataList, setCodeDataList] = useState([])
    const [search, setSearch] = useState('')
    const [editorCode, setEditorCode] = useState()
    const [allCodeData, setAllCodeData] = useState([])
    const [openModal, setOpenModal] = useState(false)
    const [updateLogicInLabelId, setUpdateLogicInLabelId] = useState()


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
        { key: 'Label List', content: 'Label List', link: true },
        { key: id ? 'Edit Label' : 'Add Label', content: id ? 'Edit Label' : 'Add Label', active: true },
    ];


    const validate = (data) => {
        if (id) {
            if (!data.label || data.label.trim() === '') {
                setErrorObj({ ...errorObj, label: "Label is required" })
                return false
            }
        } else {
            if (!data.label || data.label.trim() === '') {
                setErrorObj({ ...errorObj, label: "Label is required" })
                return false
            }
            if (!data.documentTypeId) {
                setErrorObj({ ...errorObj, documentTypeId: "documentType Id is required" })
                return false
            }
            if (!data.fieldId) {
                setErrorObj({ ...errorObj, fieldId: "Field Id is required" })
                return false
            }
            if (!data.logicCodeId && !data.isOverride) {
                setErrorObj({ ...errorObj, logicCodeId: "logicCodeId is required" })
                return false
            }
            if (!data.overrideCustomLogic && !data.logicCodeId) {
                setErrorObj({ ...errorObj, overrideCustomLogic: "overrideCustomLogic is required" })
                return false
            }
        }
        return true
    }

    const onChangeShipping = (e, data) => {
        setLabelObj({ ...labelObj, documentTypeId: data.value });
    };

    const onChangeField = (e, data) => {
        setLabelObj({ ...labelObj, fieldId: data.value });
    };

    const onChangeShortCode = (e, data) => {
        let val = allCodeData.find(item => { if (item._id == data.value) return item.textArea })
        setLabelObj({ ...labelObj, logicCodeId: data.value, isOverride: false })
        setEditorCode(val?.textArea)
    }
    
    const onChangeOverrided = (val) => {
        setOverrideText(val)
        // setLabelObj({ ...labelObj, overrideText: overrideText, isoverride: isoverride, logicCodeId: "" })
    }


    const onClickAddLabel = async () => {
        try {
            if (loading) return
            const isValid = await validate(labelObj)
            if (isValid) {
                setLoading(true)
                const response = await apiPOST('v1/labels/', labelObj)
                setLoading(false)
                if (response.status === 200) {

                    Toast.fire("Success!",  "Labels added successfully", 'success');
                    setLoading(false)
                    clearFields()
                    props.getAllLabel()
                }
                else {
                    Toast.fire('Error!', response?.data?.data || "Something went wrong!", 'error');
                }
            }
        } catch (error) {
            Toast.fire('Error!', error || "Something went wrong!", 'error');
        }
    }

    const onClickEditLabelById = async () => {
        try {
            if (loading) return
            let result = {}
            result = {
                label: labelObj.label, logicCodeId: labelObj.logicCodeId, isOverride: isoverride, overrideCustomLogic: labelObj.overrideCustomLogic
            }

            const isValid = await validate(result)
            if (isValid) {
                setLoading(true)
                const response = await apiPOST(`v1/labels/${id}`, result)
                setLoading(false)
                if (response.status === 200) {
                    Swal.fire({
                        title: "Success!",
                        text: "Label updated successfully",
                        icon: "success",
                    });
                    props.getAllLabel()
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
    const onClickDeleteLabelById = async () => {
        Swal.fire({
            title: `Are you sure ? `,
            icon: 'warning',
            text: 'Want to delete this Label?',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes',
            buttons: true,
          }).then(async (result) => {
        try {
            if (result.isConfirmed) {
            if (loading) return
            setLoading(true)
            const response = await apiDELETE(`v1/labels/${id}`)
            setLoading(false)
            if (response.status === 200) {
                Swal.fire({
                    title: "Success!",
                    text: "Label Deleted successfully",
                    icon: "success",
                });
                props.getAllLabel()
                setLoading(false)
                clearFields()
            }
            else {
                Swal.fire({
                    title: "Error!",
                    text: response?.data?.data || "Something went wrong!",
                    icon: "error",
                });
            }
        }
        } catch (error) {
            Swal.fire({
                title: "Error!",
                text: error || "Something went wrong!",
                icon: "error",
            });
        }
    })
    }

    const onClickGetLabelById = async () => {
        try {
            if (loading) return
            const res = await apiGET(`v1/labels/${id}`)
            setLoading(false)
            if (res.status === 200) {
                let response = res.data.data[0]
                setIsOverride(response.isOverride)
                setLabelObj({
                    label: response.label,
                    documentTypeId: response.documentTypeId,
                    fieldId: response.fieldId,
                    logicCodeId: response?.logicCodeId,
                    isOverride: response.isOverride,
                    overrideCustomLogic: response.overrideCustomLogic,
                    oclUpdatedBy:response.oclUpdatedBy,
                    oclUpdatedAt:response.oclUpdatedAt,
                    overrideLogicUser:response?.overrideLogicUser
                })
                setOverrideText(response.overrideCustomLogic)
                setEditorCode(response.logic?.textArea)
                setDocumentTypeName(response.documentType?.name)
                setFieldName(response.field?.displayName)
            }
            else {
                Toast.fire('Error! ', response?.data?.data || "Something went wrong!", 'error');
            }
        } catch (error) {
            Toast.fire('Error! ',  error.stack || error || "Something went wrong!", 'error');
        }
    }

    const getListOfShippingLine = async () => {
        try {
            const response = await apiGET(`/v1/document-type`)
            if (response.status === 200) {
                let list = response?.data?.data?.data;
                if (list && list.length) {
                    list = list.map((item) => {
                        return {
                            key: item.name,
                            text: item.name,
                            value: item._id,
                        };
                    });
                }
                setDocumentTypeList(list)
            } else {
                Toast.fire('Error!', response?.data?.data || "Something went wrong!", 'error');
            }
        } catch (error) {
            Toast.fire('Error!', error || "Something went wrong!", 'error');
        } finally {
            setLoading(false);
        }
    }

    const getListOfField = async () => {
        setLoading(true);
        try {
            const response = await apiGET(`/v1/fields`)
            if (response.status === 200) {
                let list = response?.data?.data?.data;
                if (list && list.length) {
                    list = list.map((item) => {
                        return {
                            key: item.paramName,
                            text: item.paramName,
                            value: item._id,
                        };
                    });
                }
                setFieldList(list)
            } else {
                Toast.fire('Error!', response?.data?.data || "Something went wrong!", 'error');
            }
        } catch (error) {
            Toast.fire('Error!', error || "Something went wrong!", 'error');
        } finally {
            setLoading(false);
        }
    }

    const getAllShortCodes = async (search) => {
        setCodeDataList([])
        try {
            setLoading(true);
            let response
            const payload = {
                search: {
                  name: search,
                }
              }
              const queryParams = objectToQueryParam(payload)
            if (search) {
                response = await apiGET(`/v1/logic?all=true&${queryParams}`);
            }
            else{
                response = await apiGET(`/v1/logic?all=true`);
            }
            setLoading(false);
            if (response.status === 200) {
                let list = response?.data?.data?.data
                if (updateLogicInLabelId) {
                    setLabelObj({...labelObj,logicCodeId:updateLogicInLabelId})
                    const found= list.find(item=>(item._id == updateLogicInLabelId) && item)
                    setEditorCode(found?.textArea)
                }
                setAllCodeData(list)
                if (list.length > 0) {
                    list = list.map((item) => {
                        return {
                            key: item.name,
                            text: item.name,
                            value: item._id,
                        };
                    });
                    setCodeDataList(list)
                }
                else {
                    setCodeDataList([])
                }
            }
            else {
                Swal.fire({
                    title: "Error!",
                    text: response?.data?.data || "Something went wrong!",
                    icon: "error",
                });
            }
        } catch (error) {
            Swal.fire({
                title: "Error!",
                text: error || "Something went wrong!",
                icon: "error",
            });
        }
    };

    const getUpdatedByandTime = (id) => {
        let data = allCodeData?.find(item=>(item._id === id) && item)
        if (data?.createdUser[0]?._id) {
        return <p>UpdatedBy {data?.createdUser[0]?.name ||""} {" at  "}<span>{moment(data?.updatedAt).format('DD/MM/YYYY')}</span>{" "}{moment(data?.updatedAt).format('HH:mm a')} </p>
        }
    }

    const getUpdatedByandTimeOverride = (data) => {
        if (data?.overrideLogicUser?._id) {
        return <p>UpdatedBy {data?.overrideLogicUser?.name ||""} {" at  "}<span>{moment(data?.oclUpdatedAt).format('DD/MM/YYYY')}</span>{" "}{moment(data?.oclUpdatedAt).format('HH:mm a')} </p>
        }
    }
    const clearFields = () => {
        setLabelObj({ label: "", documentTypeId: "", fieldId: "", logicCodeId: "", isOverride: false })
        setEditorCode("")
        setIsOverride(false)
        setErrorObj()
        setOverrideText("")
        if (props.through) {
            navigate('/dashboard/labels/manage')
        } else {
            navigate('/dashboard/labels')
        }
    }

    useEffect(() => {
        if (props.visible == false) {
            clearFields();
        }
    }, [props.visible == false]);

    useEffect(() => {
        if (id) {
            onClickGetLabelById()
            getAllShortCodes()
        }
    }, [id])

    useEffect(() => {
        getListOfShippingLine()
        getListOfField()
        getAllShortCodes()
        if (props.idsData) {
            setLabelObj({
                ...labelObj, documentTypeId: props.idsData?.documentTypeId,
                fieldId: props.idsData?.fieldId, label: props.idsData?.fieldName
            })
            let documentTypeData = documentTypeList.find(item => { if (item.value == props.idsData?.documentTypeId) return item.text })
            setDocumentTypeName(documentTypeData?.text)
            let fieldData = fieldList.find(item => { if (item.value == props.idsData?.fieldId) return item.text })
            setFieldName(fieldData?.text)
        }
    }, [props.idsData])

    useEffect(() => {
        if (isoverride) {
            setLabelObj({
                label: labelObj.label,
                documentTypeId: labelObj.documentTypeId,
                fieldId: labelObj.fieldId,
                isOverride: isoverride,
                overrideCustomLogic: overrideText,
                logicCodeId: labelObj.logicCodeId,
                 oclUpdatedBy:labelObj.oclUpdatedBy,
                    oclUpdatedAt:labelObj.oclUpdatedAt,
                    overrideLogicUser:labelObj?.overrideLogicUser
            })
        }
    }, [overrideText])
    
    return (
        <div className="fadeIn page-content-wrapper">
            <div className="page-header">
                <div>
                    <Breadcrumb icon="right angle" sections={sections} />
                    <div className="header-text">{id ? 'Update Label' : 'Add Label'}</div>
                    <div className="sub-text">Proceed to {id ? 'Update Label here' : 'Add new Label here'}</div>
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
                        label="Label"
                        placeholder="Label"
                        required={true}
                        value={labelObj.label || ""}
                        onChange={(e) => {
                            setLabelObj({ ...labelObj, label: e.target.value });
                            delete errorObj?.label
                        }}
                        error={errorObj && errorObj.label}
                    />

                    <div style={{ marginBottom: "1rem", marginTop: "2rem" }}>
                        <label ><strong>Document Type :</strong> <strong>{documentTypeName || labelObj.documentTypeId}</strong></label>
                    </div>

                    <div style={{ marginTop: "1rem", marginBottom: "2rem", display: "flex" }}>
                        <label ><strong>Field :</strong> <strong>{fieldName || ""}</strong></label>
                    </div>
                    {/* {
                        id ? <div style={{ marginBottom: "1rem" }}>
                            <label ><span>Shipping Line :</span> <strong>{documentTypeName || ""}</strong></label>
                        </div>
                            : <Form.Dropdown
                                label="Shipping Line"
                                placeholder="Select Shipping Id"
                                options={shippingList}
                                required={true}
                                // disabled={id ? true : false}
                                error={errorObj && errorObj.shippingLineId}
                                selection
                                onFocus={() => {
                                    setErrorObj();
                                }}
                                value={labelObj.shippingLineId}
                                onChange={onChangeShipping}
                            />
                    }
                    {
                        id ?
                            <div style={{ marginTop: "1rem", marginBottom: "1rem", display: "flex" }}>
                                <label ><span>Field :</span> <strong>{fieldName || ""}</strong></label>
                            </div>

                            : <Form.Dropdown
                                label="Field"
                                placeholder="Select Field"
                                options={fieldList}
                                required={true}
                                disabled={id ? true : false}
                                error={errorObj && errorObj.fieldId}
                                selection
                                onFocus={() => {
                                    setErrorObj();
                                }}
                                value={labelObj.fieldId}
                                onChange={onChangeField}
                            />
                    } */}

                    <div style={{ display: "flex", marginBottom: "1rem" }}>
                        <label style={{ marginTop: '', marginRight: "2rem" }} ><strong>Custom Logic</strong></label>
                        <Checkbox checked={isoverride} onChange={() => setIsOverride(!isoverride)} />
                        <label style={{ marginLeft: '2px', }} ><strong> Override Custom Logic</strong></label>
                    </div>


                    {isoverride && <Editor
                        height="37.5vh"
                        defaultLanguage="javascript"
                        value={overrideText}
                        onChange={onChangeOverrided}
                        options={{ readOnly: false }}
                    />
                    }
                    {
                        !isoverride && <>
                            <div style={{display:"flex", justifyContent:"space-between"}}>
                                 <Form.Dropdown
                                    label=""
                                    width="13"
                                    placeholder="Select Custom Logic"
                                    options={codeDataList}
                                    search={true}
                                    onSearchChange={(e)=>{
                                        getAllShortCodes(e.target.value)
                                    }}
                                    // disabled={id ? true : false}
                                    error={errorObj && errorObj.logicCodeId}
                                    selection
                                    clearable
                                    onFocus={() => {
                                        setErrorObj();
                                    }}
                                    disabled={isoverride}
                                    value={labelObj.logicCodeId}
                                    onChange={onChangeShortCode}
                                />
                               
                                {
                                labelObj.logicCodeId 
                                    ?  <Button 
                                    style={{height:"2.7rem",marginTop:"4px",width:150}}
                                    content={ 'Update Logic'} onClick={()=>{
                                        setUpdateLogicInLabelId(labelObj.logicCodeId)
                                        setOpenModal(true)}}  />
                                    :   <Button 
                                    style={{height:"2.7rem",marginTop:"4px",width:150}}
                                    content={'add Logic'} onClick={()=>{
                                        setOpenModal(true) 
                                        setUpdateLogicInLabelId(false)}}  />  
                                }
                                
                            </div>
                            <Editor
                                height="30vh"
                                defaultLanguage="javascript"
                                value={editorCode}
                                options={{ readOnly: true }}
                            />
                        </>
                    }
                    {
                    isoverride ? labelObj.overrideCustomLogic && <p style={{ display:"flex",justifyContent:"end",marginBottom:"0px",marginTop:"1px"}}>{getUpdatedByandTimeOverride(labelObj) }</p>
                     : labelObj.logicCodeId && <p style={{ display:"flex",justifyContent:"end",marginBottom:"0px",marginTop:"1px"}}>{getUpdatedByandTime(labelObj?.logicCodeId)}</p>
                    }
                    
                </Form>
            </div >
            <div className="page-footer ">
                <div>
                    <button className={loading ? 'ui  button loading' : 'ui  button '} onClick={clearFields} disabled={loading} loading={loading}>
                        Close
                    </button>
                </div>
                <div>
                    {
                        id && <button className={ 'ui negative basic button '} onClick={id && onClickDeleteLabelById} disabled={loading} loading={loading}>
                            {'Delete'}
                        </button>
                    }
                    <button className={loading ? 'ui primary button loading' : 'ui primary button '} onClick={id ? onClickEditLabelById : onClickAddLabel} disabled={loading} loading={loading}>
                        {id ? 'Update' : 'Create'}
                    </button>
                </div>

            </div>
            {   
            openModal && <AddLogicModal openModal={openModal} setOpenModal={setOpenModal} updateLogicInLabelId={updateLogicInLabelId} setUpdateLogicInLabelId={setUpdateLogicInLabelId}  getAllLogics={getAllShortCodes}/>
            }
           
        </div >
    );
}

export default AddLabel;


export function AddLogicModal({openModal,setOpenModal,updateLogicInLabelId,setUpdateLogicInLabelId,getAllLogics}) {
    const [dataObj, setDataObj] = useState()

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

    const clearFields=()=>{
        getAllLogics()
        setDataObj({ name: "", shortCode: "", textArea: "// Javascript Editor" })
        setOpenModal(false)
    }

    const onClickAddLogic = async () => {
        try {
            // if (loading) return
            const isValid = await validate(dataObj)
            if (isValid) {
                // setLoading(true)
                const response = await apiPOST('v1/logic/', dataObj)
                // setLoading(false)
                if (response.status === 200) {
                    setUpdateLogicInLabelId(response?.data?._id)
                    Swal.fire({
                        title: "Success!",
                        text: "logic added successfully",
                        icon: "success",
                    });
                    // setLoading(false)
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

    const validate = (data) => {

        if (!data.name) {
            setErrorObj({ ...errorObj, name: "name is required" })
            return false
        }
        if (!data.textArea) {
            setErrorObj({ ...errorObj, textArea: "textArea is required" })
            return false
        }
        if (!data.shortCode) {
            setErrorObj({ ...errorObj, shortCode: "shortCode is required" })
            return false
        }

        return true
    }

    const onClickEditLogicById = async () => {
        try {
            // if (loading) return
            const isValid = await validate(dataObj)
            if (isValid) {
                // setLoading(true)
                const response = await apiPOST(`v1/logic/${updateLogicInLabelId}`, dataObj)
                // setLoading(false)
                if (response.status === 200) {
                    Swal.fire({
                        title: "Success!",
                        text: "Custom Logic updated successfully",
                        icon: "success",
                    });
                    // props.getAllLogics()
                    // setLoading(false)
                    // getLabelData()
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

    const onClickGetLogicById = async (id) => {
        try {
            // if (loading) return
            const res = await apiGET(`v1/logic/${id}`)
            // setLoading(false)
            if (res.status === 200) {
                const response = res.data.data
                setDataObj({
                    name: response.name,
                    shortCode: response.shortCode,
                    textArea: response.textArea,
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
        if (updateLogicInLabelId) {
            onClickGetLogicById(updateLogicInLabelId)
        }
    }, [updateLogicInLabelId])  

    return <Modal size={'fullscreen'} onFocus={openModal } open={openModal} onClose={() => setOpenModal(false)}>
          <Modal.Header>{updateLogicInLabelId?"Update Logic":"Add Logic"}</Modal.Header>
          <Modal.Content>
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
                            // delete errorObj?.name
                        }}
                        // error={errorObj && errorObj.name}
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
                            // delete errorObj?.shortCode
                        }}
                        // error={errorObj && errorObj.shortCode}
                    />
                    <div style={{border:"1px solid #ccc",borderRadius:3,padding:1}}>
                        <Editor
                            height="40vh"
                            defaultLanguage="javascript"
                            // value="//JS Editor"
                            theme=''
                            value={dataObj?.textArea}
                            onChange={(val) => setDataObj({ ...dataObj, textArea: val })}
                        />
                    </div>
                </Form>
            </Modal.Content>
            <Modal.Actions>
                <Button color='gray' onClick={() => {clearFields()}}>
                  Close
                </Button>
                <Button color='gray'
                    onClick={updateLogicInLabelId ? onClickEditLogicById : onClickAddLogic}>
                  {updateLogicInLabelId?"Update Logic":"AddLogic"}
                </Button>
            </Modal.Actions>
        </Modal>
}
