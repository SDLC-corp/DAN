import React, { useState, useEffect, useContext } from 'react';
import { apiGET, apiPOST, objectToQueryParam } from '../../utils/apiHelper';
import TableWrapper from '../../utils/tableWrapper';
import { Breadcrumb, Sidebar, Grid, Form, Input, Radio, Button, Tab } from 'semantic-ui-react';
import DocumentUploadDrop from '../../components/imageuploader/docUpload';
import { AuthContext } from '../../contexts';
import Swal from 'sweetalert2';
import { alertError, alertInfo, alertSuccess, alertWarning } from '../../utils/alerts';
import { useNavigate } from 'react-router-dom';
import AssignToModal from '../../components/modal/assignToModal';
import UserListDropDown from '../../components/dropdown/userListDropDown';
import { AIR, OCEAN, hasAccess } from '../../utils/accessHelper';

const sections = [
  { key: 'Dashboard', content: 'Dashboard', link: true },
  { key: 'label_List', content: 'Document Upload', active: true },
];

export default function labelsManagement() {
  const navigate = useNavigate()
  const [imageUrl, setImageUrl] = useState('')
  const [errorObj, setErrorObj] = useState({})
  const [loading, setLoading] = useState(false)
  const [docNoLoading, setDocNoLoading] = useState(false)
  const { user } = useContext(AuthContext);
  const [assignToUserId, setAssignToUserId] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [shippingType, setShippingType] = useState("ocean")
  const [documentTypeOptions, setDocumentTypeOptions] = useState([])

  const initialDocObj = {
    documentUrl: "",
    documentTypeId: "",
  }



  const [docObj, setDocObj] = useState({...initialDocObj})

  const updateDocObj = (key, value) => {
    setDocObj({ ...docObj, [key]: value })
  }

  useEffect(() => {
    updateDocObj("documentUrl", imageUrl)
  }, [imageUrl])


  function updateUpload(url) {
    setImageUrl(url)
  }

  const onUploadDone = (data) => {
    updateUpload(data)

  }

  const getAllDocumentTypeList = async() => {
      try {
          let response = await apiGET(`/v1/document-type/list`,);
          if (response.status === 200) {
            let list = response?.data?.data?.data;
            if (list && list.length) {
              const uniqueTexts = new Set();
              list = list.filter((item) => {
                const text = item?.name;
                if (!uniqueTexts.has(text)) {
                  uniqueTexts.add(text);
                  return true;
                }
                return false;
              });
              list = list.map((item) => {
                return {
                  key: item?.name,
                  text: item?.code,
                  value: item?._id,
                };
              });
            }
            setDocumentTypeOptions(list)
            updateDocObj("documentTypeId",list?.[0]?.value)
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
  }

  useEffect(() => {
    getAllDocumentTypeList()
  }, [])



  async function verifyDocument(orderBaseXid, domainName) {

    setDocNoLoading(true)
    let response = await apiGET(`/v1/documents/check/orderBases?documentNo=${orderBaseXid}&domainName=${domainName}&type=${shippingType}`)

    if (response.status == "200") {
      response = response.data

      if (response.data && response.data.docPresent) {
        alertSuccess("Document found in ERP", "Document No: " + orderBaseXid)
        updateDocObj("documentNoVerified", true)
      } else if (response.data && response.data.orderReleasesExisted) {
        alertWarning("Order Already Released", "Document No: " + orderBaseXid)
        updateDocObj("documentNoVerified", false)
      } else {
        alertWarning("Document not found in ERP")
        updateDocObj("documentNoVerified", false)
      }
    } else {
      alertError("Something went wrong")
      updateDocObj("documentNoVerified", false)
    }

    setDocNoLoading(false)

  }


  const saveBtnClickHandler = async () => {
    let payload = {
      "documentTypeId": docObj.documentTypeId,
      "documentUrl": docObj.documentUrl || "https://artyfactassests.s3.ap-south-1.amazonaws.com/uploads/1692697809182/How-to-submit-shipping-instruction_0.pdf",
    }

    if (user.role != "documentation" && assignToUserId) {
        payload={...payload,assignToUserId:assignToUserId}
    }

    setLoading(true)
    let response = await apiPOST("/v1/documents", payload)
    setLoading(false)
    if (response?.status == "200") {
      Swal.fire({
        title: "Success!",
        text: "Document added successfully",
        icon: "success",
      });

      setDocObj(initialDocObj)
      setImageUrl("")
      setAssignToUserId("")
      navigate("/dashboard/document-list")
    } else {
        if (response?.status == "403") {
            Swal.fire({
                title: "Alredy Exist!",
                html: `<div style="display: flex; flex-direction:column; justify-content: center;">A Booking with this <div style="text-align: left; margin-left: 80px;"><span style={{margin: 0 20px;}}>Document No : ${docObj?.documentNo},</span><br/><span style={{margin: 0 20px;}}></span><br/> <span style={{margin: 0 20px;}}>Location : ${docObj?.domainName}</span><br/></div>already exist, kindly delete the previous to proceed with adding new one.</div>`,
                icon: "error",
         });
        }else{
            alertError(response?.data?.data)
        }
    }


  }

    const panes = [
  {
    menuItem: 'Ocean',
    value:"ocean"
    // render: () => <Tab.Pane attached={false}>Tab 2 Content</Tab.Pane>,
  },
  {
    menuItem: 'Air',
    value:"air"
    // render: () => <Tab.Pane attached={false}>Tab 1 Content</Tab.Pane>,
  },
]





    const handleShippingLineSearchQuery = (e, { searchQuery }) => { 
        setSearchQuery(searchQuery)
    }

    const handleTabChangeShippingLine=(val)=>{
        setShippingType(val)
    }
    useEffect(() => {
        if(hasAccess(AIR))  setShippingType("air")
        if(hasAccess(OCEAN))  setShippingType("ocean")
    }, [])
    

  return (
    <Sidebar.Pushable>
      <Sidebar.Pusher className="fadeIn">
        <div className="page-header">
          <div>
            <Breadcrumb icon="right angle" sections={sections} />
            <div className="header-text">Document Upload</div>
            <div className="sub-text">
              Upload document to extract the fields
            </div>
          </div>
        </div>
             <span>
                    {/* <Tab menu={{ secondary: true,pointing: true }} panes={panes} 
                        onTabChange={handleTabChangeShippingLine} /> */}
              
                    {/* <div class="ui pointing secondary menu">
                        {  hasAccess(OCEAN) && <a class={`${shippingType == "ocean" && "active"} item`} onClick={()=>handleTabChangeShippingLine("ocean")}>Ocean</a>}
                        {  hasAccess(AIR) && <a class={`${shippingType == "air" && "active"} item`} onClick={()=>handleTabChangeShippingLine("air")}>Air</a>}
                    </div> */}
                    
                </span>
        <div style={{ padding: 25, flex: 1 }} >
          <div class="ui grid">
            <div class="ten wide column">
                <label><strong>Upload Document<span style={{color:"red"}}>*</span> </strong></label>
              <DocumentUploadDrop imageUrl={docObj.documentUrl} onUploadDone={onUploadDone} disabled={loading} />
              <Form style={{ width: '100%',marginTop:10 }}>

              <Form.Dropdown
                label="Document Types"
                placeholder="Select Document Types"
                options={documentTypeOptions || []}
                required={true}
                selection
                onFocus={() => {
                  setErrorObj();
                }}
                value={docObj.documentTypeId}
                disabled={loading}
                onChange={(e, data) => {
                  updateDocObj("documentTypeId", data.value);
                }}
              />
              
              {/* <Form.Field
                id="form-input-control-token-tracker"
                label="INVOICE Id"
                required={true}
                style={{ marginTop: "18px",marginBottom:0 }}
                disabled={loading}
                // value={docObj.documentNo || ""}
                // onChange={(e, data) => {
                //   updateDocObj("documentNo", e.target.value);
                // }}
              ></Form.Field> */}

              {/* <div className="ui action input" style={{ marginBottom: 18, display: 'flex' }}>
                <input
                  style={{ flex: 1 }}
                  type="text"
                  placeholder="Document Number"
                  value={docObj.documentNo || ""}
                  disabled={loading}
                  onChange={(e, data) => {
                    updateDocObj("documentNo", e.target.value);
                  }} />
              </div> */}

              <Button
                loading={loading} disabled={loading || docNoLoading || !imageUrl}
                content='Save' fluid  onClick={saveBtnClickHandler} primary/>
              </Form>
            </div>

            <div className="six wide column">
             
            </div>
          </div>
        </div>
      </Sidebar.Pusher>
    </Sidebar.Pushable>
  );
}