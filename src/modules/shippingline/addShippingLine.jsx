import React, { useState } from 'react';
import {
  Breadcrumb,
  Button,
  Form,
  Icon,
  Input,
  Radio,
  TextArea,
} from 'semantic-ui-react';
import { useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2'
import { apiGET, apiPOST } from '../../utils/apiHelper';
import ImageUploadDrop from '../../components/imageuploader/imageUploadDropzone';
import { useEffect } from 'react';

function AddShippingLine(props) {

  const navigate = useNavigate();
  const { id } = useParams();
  const [ShippingListObj, setShippingListObj] = useState({
    name: "",
    description: "",
    modelId: "",
    code:"",
    locationName:'',
    locationId:'',
    type:"ocean"
  })
  const [errorObj, setErrorObj] = useState()
  const [loading, setLoading] = useState(false)
  const [imageUrl, setImageUrl] = useState('')

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
    { key: 'Carrier line List', content: 'Carrier line List', link: true },
    { key: id ? 'Edit Carrier Line' : 'Add Carrier Line', content: id ? 'Edit Carrier Line' : 'Add Carrier Line', active: true },
  ];


  const validate = (data) => {
    if (!data.name.trim()) {
      setErrorObj({ ...errorObj, name: "Name is required" })
      return false
    }
    if (!data.code.trim()) {
      setErrorObj({ ...errorObj, code: "Short Hand Name is required" })
      return false
    }
    if (!data.type?.trim()) {
      setErrorObj({ ...errorObj, type: "Type is required" })
      return false
    }
    if (!data.modelId.trim()) {
      setErrorObj({ ...errorObj, modelId: "Model Id is required" })
      return false
    }
    if (!data.locationName.trim()) {
      setErrorObj({ ...errorObj, locationName: "location Name is required" })
      return false
    }
    if (!data.locationId.trim()) {
      setErrorObj({ ...errorObj, locationId: "location Id is required" })
      return false
    }
    return true
  }

  const onClickAddShippingLine = async () => {
    try {
      if (loading) return
      let payload = {
        name:ShippingListObj?.name,
        modelId:ShippingListObj.modelId,
        logo:imageUrl,
        description:ShippingListObj.description,
        code:ShippingListObj.code,
        locationName:ShippingListObj.locationName,
        locationId:ShippingListObj.locationId,
        type:ShippingListObj.type
      }
      const isValid = await validate(ShippingListObj)
      if (isValid) {
        setLoading(true)
        const response = await apiPOST('v1/shipping-lines/', payload)
        setLoading(false)
        if (response.status === 200) {
          Swal.fire({
            title: "Success!",
            text: "Carrier Line added successfully",
            icon: "success",
          });
          setLoading(false)
          clearFields()
          props.getAllShippingLine()
        }
        else {
          Toast.fire('Error!', response?.data?.data, 'error');
        }
      }
    } catch (error) {
        Toast.fire('Error!', error || "Something went wrong!", 'error');
    }
  }

  const onClickEditShippingLineById = async() => {
    try {
    //   if (loading) return
      let payload = {
        name:ShippingListObj?.name,
        modelId:ShippingListObj.modelId,
        logo:imageUrl,
        description:ShippingListObj.description,
        code:ShippingListObj.code,
        locationName:ShippingListObj.locationName,
        locationId:ShippingListObj.locationId,
        type:ShippingListObj?.type
      }
      const isValid = await validate(payload)
        console.log(isValid,errorObj);
      if (isValid) {
        setLoading(true)
        const response = await apiPOST(`v1/shipping-lines/${id}`, payload)
        setLoading(false)
        if (response.status === 200) {
          Swal.fire({
            title: "Success!",
            text: "Carrier Line updated successfully",
            icon: "success",
          });
          props.getAllShippingLine()
          setLoading(false)
          clearFields()
        }
        else {
          Toast.fire('Error!', response?.data?.data, 'error');
        }
      }
    } catch (error) {
        console.log('error',error);
      Toast.fire('Error!', error || "Something went wrong!", 'error');
    }
  }

  const onClickGetShippingLineById = async () => {
    try {
      if (loading) return
        const response = await apiGET(`v1/shipping-lines/${id}`)
        setLoading(false)
        if (response.status === 200) {
        setShippingListObj({
          name:response.data.data.name,
          description:response.data.data.description,
          modelId:response.data.data.modelId,
          code:response.data.data.code,
          locationName: response.data.data.locationName,
          locationId: response.data.data.locationId,
          type: response.data.data.type
        })
        setImageUrl(response.data.data.logo)
        }
        else {
          Toast.fire('Error!', response?.data?.data || "Something went wrong!", 'error');
        }
    } catch (error) {
      Toast.fire('Error!', error || "Something went wrong!", 'error');
    }
  }

  const clearFields = () => {
    setShippingListObj({ name: "", description: "", modelId: '',code: '' ,locationName:'',locationId:'',type:"ocean"})
    setImageUrl('')
    setErrorObj()
    navigate('/dashboard/carrier-line')
  }

  useEffect(() => {
    if (props.visible == false) {
      clearFields();
    }
  }, [props.visible == false]);

  useEffect(() => {
    if (id) {
      onClickGetShippingLineById()
    }
  }, [id])

    const handleAllExtraction=(id, shippingLineName)=>{
     Swal.fire({
       title: `Do you want to `,
       icon: 'warning',
       width : 550,
       text: 'Perform following action on all document of ' + shippingLineName,
       input: 'radio',
       inputOptions: {
         1: 'Apply Logics again',
         2: 'Do OCR/AI and apply Logic again',
         3: 'Clear override values and apply Logics again',
         4: 'Clear override values, do OCR/AI & apply Logic again',
       },
       inputValidator: (value) => {
         if (!value) {
           return 'Select an option to proceed!';
         }
       },
       showCancelButton: true,
       confirmButtonColor: '#3085d6',
       cancelButtonColor: '#d33',
       confirmButtonText: 'Yes',
       buttons: true,
     }).then(async (result) => {
      if (result.value){
        try {
          const response = await apiPOST(`/v1/shipping-lines/allextraction/${id}`, {
            option: result.value,
          });
          if (response.status === 200) {
            Swal.fire({
              title: 'Success!',
              text: 'All Carrier Line Extraction successfully',
              icon: 'success',
            });
          } else {
            Swal.fire({
              title: 'Error!',
              text: response?.data?.data || 'Something went wrong!',
              icon: 'error',
            });
          }
        } catch (error) {
          Swal.fire({
            title: 'Error !',
            text: error || 'Something went wrong !',
            icon: 'error',
          });
        }
      }
        
     });
    }
  

  return (
    <div className="fadeIn page-content-wrapper">
      <div className="page-header">
        <div>
          <Breadcrumb icon="right angle" sections={sections} />
          <div className="header-text">{id ? 'Edit Carrier Line' : 'Add Carrier Line'}</div>
          <div className="sub-text">Proceed to {id ? 'edit carrier line here' : 'add new carrier line here'}</div>
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
            placeholder="Name"
            required={true}
            value={ShippingListObj.name || ""}
            onChange={(e) => {
              setShippingListObj({ ...ShippingListObj, name: e.target.value });
              delete errorObj?.name
            }}
            error={errorObj && errorObj.name}
          />
          <Form.Field
            id="form-input-control-shortHand-name"
            control={Input}
            label="Short Hand Name"
            placeholder="Short Hand Name"
            required={true}
            value={ShippingListObj.code || ""}
            onChange={(e) => {
              setShippingListObj({ ...ShippingListObj, code: e.target.value });
              delete errorObj?.code
            }}
            error={errorObj && errorObj.code}
          />
        <Form.Field label="Choose Type" required error={errorObj && errorObj.type}/>
        <Form.Field>
            <span>
          <Radio
            label='Ocean'
            name='radioGroup'
            value={ShippingListObj.type}
            checked={ShippingListObj.type === 'ocean'}
            onChange={(e)=>{
                setShippingListObj({...ShippingListObj,type:"ocean"})
                delete errorObj.type
                }}
          />
        </span>
        <span style={{marginLeft:15}}>
          <Radio
            label='Air'
            name='radioGroup'
            value={ShippingListObj.type}
            checked={ShippingListObj.type === 'air'}
            onChange={(e)=>setShippingListObj({...ShippingListObj,type:"air"})}
          />
        </span>
        </Form.Field>

          <Form.Field
            id="form-textarea-control-opinion"
            control={TextArea}
            label="Description"
            placeholder="Description"
            value={ShippingListObj.description || ""}
            onChange={(e) => {
              setShippingListObj({ ...ShippingListObj, description: e.target.value });
            }}
          />

          <Form.Field
            id="form-textarea-control-opinion"
            control={Input}
            label="Model No."
            placeholder="Model No."
            required={true}
            value={ShippingListObj.modelId || ""}
            onChange={(e) => {
              setShippingListObj({ ...ShippingListObj, modelId: e.target.value });
              delete errorObj?.modelId
            }}
            error={errorObj && errorObj.modelId}
          />

          <Form.Field
            id="form-textarea-control-opinion"
            control={Input}
            label="Location Name"
            placeholder="Location Name"
            required={true}
            value={ShippingListObj.locationName || ""}
            onChange={(e) => {
              setShippingListObj({ ...ShippingListObj, locationName: e.target.value });
              delete errorObj?.locationName
            }}
            error={errorObj && errorObj.locationName}
          />

          <Form.Field
            id="form-textarea-control-opinion"
            control={Input}
            label="Location ID"
            placeholder="Location ID"
            required={true}
            value={ShippingListObj.locationId || ""}
            onChange={(e) => {
              setShippingListObj({ ...ShippingListObj, locationId: e.target.value });
              delete errorObj?.locationId
            }}
            error={errorObj && errorObj.locationId}
          />

          <Form.Field
            width={4}
            id="form-input-control-token-tracker"
            label="Logo"
            style={{ marginTop: "18px" }}
          >
          </Form.Field>

          <ImageUploadDrop
            imageUrl={imageUrl}
            setImage={setImageUrl}
            assetLayoutType={"logo-image"}
            uploadType="collection"
            // onUploadDone={(data) => {
            //   setShippingListObj({...ShippingListObj,logo:data});
            // }}
          />

        </Form>
      </div>
      <div className="page-footer ">
       <div>
        <button className={loading ? 'ui  button loading' : 'ui  button '} onClick={clearFields} disabled={loading} loading={loading}>
          Close
        </button>
        {
            id &&  <button className={loading ? 'ui  button loading' : 'ui  button '} onClick={(e)=>{
            handleAllExtraction(id, ShippingListObj.name);
            clearFields()    
        }} disabled={loading} loading={loading}>
          Extract All
        </button>
        }
        </div>
        <button className={loading ? 'ui primary button loading' : 'ui primary button '} 
        onClick={id ? onClickEditShippingLineById : onClickAddShippingLine} disabled={loading} loading={loading}>
          {id ? 'Update carrier line' : 'Create carrier line'}
        </button>

      </div>
    </div>
  );
}

export default AddShippingLine;
