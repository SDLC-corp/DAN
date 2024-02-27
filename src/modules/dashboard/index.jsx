import React, { useContext, useEffect, useState } from 'react';
import { Breadcrumb, Button, Form, Icon, Image, Input, Modal } from 'semantic-ui-react';
import Swal from 'sweetalert2';
import { apiGET, apiPOST } from '../../utils/apiHelper';
import { Chart as ChartsJs, BarElement, CategoryScale, LinearScale, LineElement, PointElement, Title, Tooltip, Legend, ArcElement } from 'chart.js'

import { useNavigate } from 'react-router-dom';
import { alertError } from '../../utils/alerts';
import { AuthContext } from '../../contexts';
import DocumentUploadDrop from '../../components/imageuploader/docUpload';

ChartsJs.register(
  CategoryScale,
  LinearScale,
  LineElement,
  BarElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
)

function Dashboard() {
  const navigate = useNavigate()
  const { user } = useContext(AuthContext);

  const initialDocObj = {
    documentUrl: "",
    documentTypeId: "",
  }
  const [openModal, setOpenModal] = useState(false)
  const [imageUrl, setImageUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [assignToUserId, setAssignToUserId] = useState("")
  const [docNoLoading, setDocNoLoading] = useState(false)
  const [docObj, setDocObj] = useState({ ...initialDocObj })
  const [documentTypeOptions, setDocumentTypeOptions] = useState([])
  const [uploadType, setUploadType] = useState(null)
  const [refNo, setRefNo] = useState('')
  const [refNoError, setRefNoError] = useState(false)


  const saveBtnClickHandler = async () => {
    if(refNo =='' || refNo==undefined){
        setRefNoError('Please Provide Reference Number')
        return
    }
  
    let payload = {
      "documentTypeId": docObj.documentTypeId,
      "documentUrl": docObj.documentUrl || "https://artyfactassests.s3.ap-south-1.amazonaws.com/uploads/1692697809182/How-to-submit-shipping-instruction_0.pdf",
      "documentNo": refNo
    }

    if (user.role != "documentation" && assignToUserId) {
      payload = { ...payload, assignToUserId: assignToUserId }
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
      } else {
        alertError(response?.data?.data)
      }
    }


  }


  function updateUpload(url) {
    setImageUrl(url)
  }

  const onUploadDone = (data) => {
    updateUpload(data)

  }
  const updateDocObj = (key, value) => {
    setDocObj({ ...docObj, [key]: value })
  }

  const getAllDocumentTypeList = async () => {
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
        updateDocObj("documentTypeId", list[0].value)
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
    updateDocObj("documentUrl", imageUrl)
  }, [imageUrl])


  useEffect(() => {
    getAllDocumentTypeList()
  }, [])
  return (
    <div className="fadeIn  page-content-wrapper "  >
      <div style={{ padding: '20px', display: 'flex', flexDirection: 'row ', flexWrap: "wrap", gap: '25px' }}>
        {documentTypeOptions.length > 0 && documentTypeOptions.map((type, index) => (
          <div key={index} style={{ width: '258px' }}>
            <div style={{ width: '254px', height: '140px', backgroundColor: '#F0EFEF', borderRadius: '10.4px' }} ></div>
            <div style={{ marginTop: '8px', fontWeight: '700' }}>{type.text}</div>
            <div style={{ fontSize: '12px' }}>
              Extract invoice ID customer details.
              vendor details, shop to, bill to. total tax.
              subtotal. line items and more.
            </div>
            <button onClick={() => { setOpenModal(!openModal); updateDocObj("documentTypeId", type.value); }} style={{ border: 'none', color: '#048DEF', background: 'transparent', fontWeight: '500', cursor: 'pointer', marginTop: '10px' }}><Icon name='upload' /> Upload Document</button>
          </div>
        ))}
        <CardComponent
          loading={loading}
          docNoLoading={docNoLoading}
          imageUrl={imageUrl}
          saveBtnClickHandler={saveBtnClickHandler}
          openModal={openModal}
          setOpenModal={setOpenModal}
          onUploadDone={onUploadDone}
          docObj={docObj}
          uploadType={uploadType}
          setRefNo={setRefNo}
          refNo={refNo}
          refNoError={refNoError}
          setRefNoError={setRefNoError}
        />
      </div>
    </div>
  );
}



const CardComponent = ({ loading, docNoLoading, imageUrl, saveBtnClickHandler, openModal, setOpenModal, onUploadDone, docObj, refNo, setRefNo, refNoError, setRefNoError }) =>
(
  <Modal
    size={'mini'}
    open={openModal}
    closeIcon={'close'}
    onClose={() => setOpenModal(!openModal)}
    closeOnDimmerClick={false}
    style={{ padding: '20px', borderRadius: '20px' }}
  >
    <div>
      <h2>Upload Document</h2>
      <div style={{marginBottom:'10px'}}>Document Number (Reference No.)</div>
      <Form.Field
        id="form-input-control-first-name"
        control={Input}
        placeholder="Enter Reference No"
        required={true}
        value={refNo}
        onChange={(e) => {
          setRefNoError('')
          setRefNo(e.target.value );
        }}
        style={{ width: '100%' }}
        error={refNoError ? true :false}
        
      />
      {refNoError ?<div style={{color:'#ab3a38', padding:'10px 0', fontSize:'10px'}}>{refNoError}</div> :''}
    </div>
    <div style={{ paddingBottom: '30px', paddingTop:'20px' }}>
    <div style={{marginBottom:'10px'}}>Upload Document</div>
      <DocumentUploadDrop imageUrl={docObj.documentUrl} onUploadDone={onUploadDone} disabled={loading} minHeight='15vh' />
    </div>
    <Button
      loading={loading} disabled={loading || docNoLoading || !imageUrl}
      content='Save' fluid onClick={saveBtnClickHandler} primary />
  </Modal>
);


export default Dashboard;
