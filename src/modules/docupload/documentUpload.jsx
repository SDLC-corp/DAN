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
import BlUpload from '../../components/documentupload/blUploaded';
import InvoiceUpload from '../../components/documentupload/invoiceUpload';

const sections = [
  { key: 'Dashboard', content: 'Dashboard', link: true },
  { key: 'label_List', content: 'Document Upload', active: true },
];

export default function labelsManagement() {
  let authContext = useContext(AuthContext);
  const navigate = useNavigate()
  const [imageUrl, setImageUrl] = useState('')
  const [errorObj, setErrorObj] = useState({})
  const [shippingLineId, setShippingLineId] = useState('')
  const [documentNo, setDocumentNo] = useState('')
  const [shippingLineList, setShippingLineList] = useState([])
  const [loading, setLoading] = useState(false)
  const [docNoLoading, setDocNoLoading] = useState(false)
  const { user } = useContext(AuthContext);
    const [assignToUserId, setAssignToUserId] = useState("")
    const [domainOptions, setDomainOptions] = useState([])
    const [searchQuery, setSearchQuery] = useState("")
    const [extractionType, setExtractionType] = useState("bl")
    const airDocumentType = [{ text: "HAWBL", value: "HAWBL" }, { text: "MAWBL", value: "MAWBL" }]
    const oceanDocumentType = [{ text: "HBL", value: "HBL" }, { text: "MBL", value: "MBL" }]

  const initialDocObj = {
    bookingNo: "",
    documentNo: "",
    documentUrl: "",
    documentType: "",
    stageType: "",
    shippingLineId: "",
    documentNoVerified: false,
  }
    // document: "",

  const [docObj, setDocObj] = useState({
    ...initialDocObj,
    domainName: authContext.user?.domain?.[0] || "",
  })

  const updateDocObj = (key, value) => {
    setDocObj({ ...docObj, [key]: value })
  }

  useEffect(() => {
    updateDocObj("documentUrl", imageUrl)
    console.log("imageUrl ::", imageUrl);
  }, [imageUrl])


  function updateUpload(url) {
    setImageUrl(url)
  }

  const onUploadDone = (data) => {
    updateUpload(data)

  }

  const getListOfShippingLine = async (extractionType) => {
    try {
        let response
        const payload ={
            search :{ name:searchQuery}
        }
        // if (searchQuery?.trim()) {
        //     const queryParams = objectToQueryParam(payload)
        //     response = await apiGET(`/v1/shipping-lines?${queryParams}`)
        // }else{
        // }
        response = await apiGET(`/v1/shipping-lines`)
      if (response.status === 200) {
        // console.log("response?.data?.data?.data", response?.data);
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






  useEffect(() => {
    if (searchQuery !== "" || extractionType !== "") {
        getListOfShippingLine(extractionType)
    }
  }, [searchQuery,extractionType])





    const handleTabChange=(val)=>{
        setExtractionType(val)
    }
    // useEffect(() => {
    //     if(hasAccess(AIR))  setExtractionType("air")
    //     if(hasAccess(OCEAN))  setExtractionType("ocean")
    // }, [])
    

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
                    <div class="ui pointing secondary menu">
                        {  <a class={`${extractionType == "bl" && "active"} item`} onClick={()=>handleTabChange("bl")}>BL</a>}
                        {  <a class={`${extractionType == "invoice" && "active"} item`} onClick={()=>handleTabChange("invoice")}>INVOICE</a>}
                    </div> 
                </span>
        <div style={{ padding: 25, flex: 1 }} >
          {
            extractionType == "bl" ? <BlUpload/> :<InvoiceUpload/>
          }
        </div>
      </Sidebar.Pusher>
    </Sidebar.Pushable>
  );
}

const getAllLabel = async (limit, page) => {
  let response = await apiGET(`/v1/labels/matrix?limit=${limit}&page=${page}`);
  if (response.status === 200) {
    return response.data.data;
  }
  return {
    displayNames: [],
    labels: [],
    parameterNames: [],
  };
};