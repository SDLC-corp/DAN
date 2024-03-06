import React from 'react'
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Breadcrumb, Button, Form, Icon, Input } from 'semantic-ui-react';
import { AuthContext } from '../../contexts';
import { useEffect } from 'react';
import { apiGET, apiPOST } from '../../utils/apiHelper';
import DocumentUploadDrop from '../../components/imageuploader/docUpload';
import { alertError,alertSuccess, alertWarning } from '../../utils/alerts';
import Swal from 'sweetalert2';

const ReuploadDocument = ({ fromURL, visible, setVisible,getAllData }) => {
    const { id } = useParams();
    const navigate = useNavigate()
    const [imageUrl, setImageUrl] = useState('')
    const [errorObj, setErrorObj] = useState({})
    const [shippingLineList, setShippingLineList] = useState([])
    const [loading, setLoading] = useState(false)
    const [docNoLoading, setDocNoLoading] = useState(false)
    const [docObj, setDocObj] = useState({})
    const airDocumentType = [{ text: "HAWBL", value: "HAWBL" }, { text: "MAWBL", value: "MAWBL" }]
    const oceanDocumentType = [{ text: "HBL", value: "HBL" }, { text: "MBL", value: "MBL" }]
    const sections = [
        { key: 'Dashboard', content: 'Dashboard', link: true },
        { key: 'label_List', content: 'Document Reupload', active: true },
    ];

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

    const getData = async (id) => {
        try {
            let data = await apiGET('/v1/documents/' + id);
            if (data.status == '200') {
                const doc = data.data.data;
                console.log('doc',doc);
                setDocObj({
                    domainName:doc.domainName,
                    documentNo:doc.documentNo,
                    documentType:doc.documentType,
                    shippingLineId:doc.shippingLineId,
                    shippingType:doc.shippingLine.type,
                    documentUrl:doc.documentUrl
                });
                setImageUrl(doc.documentUrl)
            }else{
                alertError(data?.data?.data)
            }
        } catch (error) {
            alertError("Something went wrong, please try again")
            console.log('error', error);
        }
    };

    const updateData = async () => {
        try {
            setLoading(true)
            let data = await apiPOST(`/v1/documents/${id}`,docObj);
            if (data.status == '200') {
                setLoading(false)
               setTimeout(() => {
                //  getAllData(id)
                window.location.reload()
               }, 10000*2)
                Swal.fire({
                    title: "Success!",
                    text: "Document Reuploaded successfully",
                    icon: "success",
                  }); 
                Toast.fire('Error!', error || 'Document Reuploaded successfully', 'error');  
                clearFields()
            }else{
                setLoading(false)
                  Toast.fire('Error!', error || 'Document Not Reupload', 'error');
                clearFields()
                alertError(data?.data?.data)
            }
        } catch (error) {
            setLoading(false)
            alertError("Something went wrong, please try again")
            console.log('error', error);
        }
    };
    async function verifyDocument(orderBaseXid, domainName,shippingType) {
        
        setDocNoLoading(true)
        let response = await apiGET(`/v1/documents/check/orderBases?documentNo=${orderBaseXid}&domainName=${domainName}&type=${shippingType}`)
        
    
        if (response.status == "200") {
          response = response.data
          if (response.data && response.data.docPresent) {
            alertSuccess("Document found in OTM", "Document No: " + orderBaseXid)
            updateDocObj("documentNoVerified", true)
          } else {
            alertWarning("Document not found in OTM")
            updateDocObj("documentNoVerified", false)
          }
        } else {
          alertError("Something went wrong")
          updateDocObj("documentNoVerified", false)
        }
    
        setDocNoLoading(false)
        // console.log("response ::", response);
        //  if(response.data){
    
        //  } else {
        //   Toast.fire('Error!', response?.data?.data || "Something went wrong!", 'error');
        //  }
    }


    const getListOfShippingLine = async (shippingType) => {

        try {
            const response = await apiGET(`/v1/document-type?type=${shippingType}`)
            if (response.status === 200) {
                console.log("response?.data?.data?.data", response?.data);
                let list = response?.data?.data?.data;
                if (list && list.length) {
                    list = list.map((item) => {
                        return {
                            key: item.name,
                            text: item.name,
                            value: item._id,
                            type:item.type,
                        };
                    });
                }
                setShippingLineList(list)
            } else {
                alertError(response?.data?.data)
            }
        } catch (error) {
            alertError("Something went wrong, please try again")
        } finally {
            setLoading(false);
        }
    }

    const onCheckClickHandler = async () => {
        let docVerified = await verifyDocument(docObj.documentNo, docObj.domainName,docObj.shippingType)
    }

    useEffect(() => {
        if (docObj.shippingType) {
            getListOfShippingLine(docObj.shippingType)
        }
    }, [docObj.shippingType])
    function clearFields(){
        setDocObj({ domainName: "", shippingLineId: "", documentType: "" })
        if(fromURL){
            navigate(fromURL)
        }else{
            navigate(`/dashboard/document-list/view/${id}`)
        }
        setDocNoLoading(false)
        setVisible(false)
        setImageUrl("")
    }

    useEffect(() => {
        if (visible == false) {
            clearFields();
        }
    }, [visible == false]);

    useEffect(() => {
        if (id) {
            getData(id);
        }
    }, [id,visible === true]);

        useEffect(() => {
              setDocObj({...docObj,documentUrl: imageUrl})
        }, [imageUrl])

     function updateUpload(url) {
        setImageUrl(url)
     }
      const onUploadDone = (data) => {
          updateUpload(data)
        }
    return <div className="fadeIn page-content-wrapper">
        <div className="page-header">
            <div>
                <Breadcrumb icon="right angle" sections={sections} />
                <div className="header-text">Reupload</div>
                <div className="sub-text">Proceed to Reupload here</div>
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
                    id="form-input-control-token-tracker"
                    label="Document Number"
                    required={true}
                    style={{ marginTop: "10px" }}
                ></Form.Field>

                <div className="ui action input" style={{ marginBottom: 18, display: 'flex' }}>
                    <input
                        style={{ flex: 1 }}
                        type="text"
                        placeholder="Document Number"
                        value={docObj.documentNo || ""}
                        onChange={(e, data) => {
                            setDocObj({...docObj, documentNo: e.target.value });
                        }} />
                </div>

                <Form.Dropdown
                    label={`Document Type`}
                    // label="Shipping Lines"
                    placeholder="Select Document Type"
                    options={shippingLineList}
                    value={docObj.shippingLineId}
                    required={true}
                    error={errorObj && errorObj.fieldId}
                    selection
                    onFocus={() => {
                        setErrorObj();
                    }}
                    onChange={(e, data) => {
                        setDocObj({...docObj, shippingLineId: data.value });
                    }}
                />
                <DocumentUploadDrop imageUrl={docObj.documentUrl} onUploadDone={onUploadDone} />
            </Form>

        </div>
        <div className="page-footer ">
            {/* <button className={loading ? 'ui  button loading' : 'ui  button '} onClick={clearFields} disabled={loading} loading={loading}> */}
            <button className={'ui  button '} onClick={clearFields} >
                Close
            </button>
            <button onClick={updateData} className={loading ? 'ui primary button loading' : 'ui primary button '}
                disabled={!imageUrl} loading={loading}>
                Reupload
            </button>
        </div>
    </div>
}

export default ReuploadDocument