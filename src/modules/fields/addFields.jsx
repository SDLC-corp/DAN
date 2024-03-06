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
import AddColumnInTable from './addColumnInTable';

function AddFields(props) {

  const navigate = useNavigate();
  const { id } = useParams();
  const [column, setColumn] = useState([{
    name: "",
    index: 1
  }])
 const [matserData, setMatserData] = useState({collectionName:"",search:"",value:""})
 const [dateFormat, setDateFormat] = useState("")
  const [fieldObj, setFieldObj] = useState({
    paramName: "",
    displayName: "",
    fieldType: "text",
    fieldTableValue: [],
    regx: "",
    fieldTextValue: "",
    fieldNumValue: "",
    // fieldGroupId:"",
    // master:{}
  })
  const [errorObj, setErrorObj] = useState()
  const [loading, setLoading] = useState(false)
  const [type, setType] = useState("text")
  const [fieldGroupList, setFieldGroupList] = useState([])

  const typeList = [
    {
      key: "text",
      text: "Text",
      value: "text",
    },
    {
      key: "number",
      text: "Number",
      value: "number",
    },
    {
      key: "table",
      text: "Table",
      value: "table",
    },
    {
      key: "master",
      text: "Master",
      value: "master",
    },
    {
      key: "date",
      text: "Date",
      value: "date",
    },

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
    { key: id ? 'Edit Field' : 'Add Field', content: id ? 'Edit Field' : 'Add Field', active: true },
  ];


  const validate = (data) => {
    if (!data.fieldType.trim()) {
      setErrorObj({ ...errorObj, fieldType: "Type is required" })
      return false
    }
    if (!data.paramName.trim()) {
      setErrorObj({ ...errorObj, paramName: "Param name is required" })
      return false
    }
    if (!data.displayName.trim()) {
      setErrorObj({ ...errorObj, displayName: "Display name is required" })
      return false
    }
    return true
  }

  const handleType = (e, data) => {
    setType(data.value)
  }

  const handleFieldGroupDD = (e, data) => {
    setFieldObj({...fieldObj,fieldGroupId:data.value})
    delete errorObj?.fieldGroupId
  }

const getAllFieldGroup = async () => {
    try {
      let response = await apiGET(`/v1/field-group/ddlist`)
       if (response.status === 200) {
                let list = response?.data?.data.data;
                if (list && list.length) {
                    list = list?.map((item) => {
                        return {
                            key: item.name,
                            text: item.name,
                            value: item._id,
                        };
                    });
                }
                setFieldGroupList(list)
        }else {
        Toast.fire('Error!', response?.data?.data || 'Something went wrong!', 'error');
      }
    } catch (error) {
      Toast.fire('Error!', error || 'Something went wrong!', 'error');
    }
  };

  const onClickAddField = async () => {
    try {
      if (loading) return
      const isValid = await validate(fieldObj)
      if (isValid) {
        setLoading(true)
        const response = await apiPOST('v1/fields/', fieldObj)
        setLoading(false)
        if (response?.status === 200) {
          Toast.fire("Success!","Field added successfully", 'success');
          setLoading(false)
          clearFields()
          props.getAllField()
        }
        else {
          Toast.fire('Error!', response?.data?.data || "Something went wrong!", 'error');
        }
      }
    } catch (error) {
      Toast.fire('Error!', error || "Something went wrong!", 'error');
    }
  }

  const onClickEditFieldById = async () => {
    try {
      if (loading) return
      const isValid = await validate(fieldObj)
      if (isValid) {
        setLoading(true)
        const response = await apiPOST(`v1/fields/${id}`, fieldObj)
        setLoading(false)
        if (response.status === 200) {
          Toast.fire("Success!","Field updated successfully", 'success');
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
  const onClickGetFieldById = async () => {
    try {
      if (loading) return
      const res = await apiGET(`v1/fields/${id}`)
      setLoading(false)
      if (res.status === 200) {
        let response = res.data.data
        setFieldObj({
          paramName: response.paramName,
          displayName: response.displayName,
          fieldTableValue: response.fieldTableValue,
          fieldType: response.fieldType,
          regx: response.regx,
          fieldNumValue: response.fieldNumValue,
          fieldTextValue: response.fieldTextValue,
          index:response?.index,
          master:response?.master,
          fieldGroupId:response?.fieldGroupId || "",
        })
        setDateFormat(response.dateFormat)
        setType(response.fieldType)
        if (response?.master) {
            setMatserData(response?.master)
        }
        if (response.fieldTableValue?.length > 0) {
          setColumn(response.fieldTableValue)
        } else {
          setColumn([{ name: "", index: 1 }])
          setType("text")
        }
      }
      else {
        Toast.fire('Error!', res?.data?.data || "Something went wrong!", 'error');
      }
    } catch (error) {
      Toast.fire('Error!', error || "Something went wrong!", 'error');
    }
  }

  const clearFields = () => {
    setFieldObj({ paramName: "", displayName: "", fieldType: "text" ,fieldGroupId:""})
    setType("text")
    setErrorObj()
    navigate('/dashboard/fields')
    setColumn([{ name: "", index: 1 }])
    setMatserData({collectionName:"",search:"",value:""})
    setDateFormat("")
  }

  useEffect(() => {
    if (props.visible == false) {
      clearFields();
    }
  }, [props.visible == false]);

  useEffect(() => {
    if (id) {
      onClickGetFieldById()
    }
  }, [id])

  useEffect(() => {
    setFieldObj({ ...fieldObj, fieldType: type, fieldTableValue: column,master:matserData,dateFormat:dateFormat })        
  }, [column, type,matserData,dateFormat])

    useEffect(() => {
      getAllFieldGroup()
    }, [props.visible])
    
;
  return (
    <div className="fadeIn page-content-wrapper">
      <div className="page-header">
        <div>
          <Breadcrumb icon="right angle" sections={sections} />
          <div className="header-text">{id ? 'Edit Field' : 'Add Field'}</div>
          <div className="sub-text">Proceed to {id ? 'Edit Field here' : 'Add new Field here'}</div>
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
            label="Params Name"
            placeholder="Name"
            required={true}
            value={fieldObj?.paramName || ""}
            onChange={(e) => {
              setFieldObj({ ...fieldObj, paramName: e.target.value });
              delete errorObj?.paramName
            }}
            error={errorObj && errorObj.paramName}
          />

          <Form.Field
            id="form-textarea-control-opinion"
            control={Input}
            label="Display Name"
            placeholder="Display Name"
            required={true}
            value={fieldObj.displayName || ""}
            onChange={(e) => {
              setFieldObj({ ...fieldObj, displayName: e.target.value });
              delete errorObj?.displayName
            }}
            error={errorObj && errorObj.displayName}
          />

          <Form.Field
            id="form-textarea-control-opinion"
            control={Input}
            label="Regx"
            placeholder="Enter Regx"
            // required={true}
            value={fieldObj.regx || ""}
            onChange={(e) => {
              setFieldObj({ ...fieldObj, regx: e.target.value });
              // delete errorObj?.regx
            }}
          // error={errorObj && errorObj.regx}
          />
            {
            id &&  <Form.Field
            id="form-textarea-control-opinion"
            control={Input}
            type='number'
            label="Sequence Index"
            placeholder="Enter Sequence Index"
            // required={true}
            value={fieldObj?.index || ""}
            onChange={(e) => {
              setFieldObj({ ...fieldObj, index: e.target.value });
              // delete errorObj?.fieldGroupId
            }}
          // error={errorObj && errorObj.regx}
          />
            }

         
          <Form.Dropdown
            label="Type"
            placeholder="Select Type"
            options={typeList}
            required={true}
            // disabled={id ? true : false}
            // error={errorObj && errorObj.logicCodeId}
            selection
            onFocus={() => {
              // setErrorObj();
            }}
            value={fieldObj.fieldType}
            onChange={handleType}
          />
          {
            (type === "table") && <AddColumnInTable column={column} setColumn={setColumn} />
          }
          {
            (type === "master") && <AddMaster matserData={matserData} setMatserData={setMatserData} type={type} />
          }
          {
            (type === "date") && <AddDateFormat dateFormat={dateFormat} setDateFormat={setDateFormat} type={type} />
          }
         <Form.Dropdown
            label="Field Groups"
            placeholder="Select Grop"
            options={fieldGroupList}
            clearable
            error={errorObj && errorObj.fieldGroupId}
            selection
            onFocus={() => {
              // setErrorObj();
            }}
            value={fieldObj.fieldGroupId}
            onChange={handleFieldGroupDD}
          />
       
        </Form>
      </div>
      <div className="page-footer ">
        <button className={loading ? 'ui  button loading' : 'ui  button '} onClick={clearFields} disabled={loading} loading={loading}>
          Close
        </button>
        <button className={loading ? 'ui primary button loading' : 'ui primary button '}
          onClick={id ? onClickEditFieldById : onClickAddField} disabled={loading} loading={loading}>
          {id ? 'Update Field' : 'Create Field'}
        </button>

      </div>
    </div>
  );
}


export default AddFields;

export function AddMaster({matserData, setMatserData,type}) {
    return <>
    <Form.Field
            id="form-textarea-control-opinion"
            control={Input}
            label="Collection Name"
            placeholder="Enter Collection Name"
            // required={true}
            value={matserData?.collectionName || ""}
            onChange={(e) => {
              setMatserData({ ...matserData, collectionName :e.target.value });
              // delete errorObj?.regx
            }}
          // error={errorObj && errorObj.regx}
          />
    <Form.Field
            id="form-textarea-control-opinion"
            control={Input}
            label="Search"
            placeholder="Enter search"
            // required={true}
            value={matserData?.search || ""}
            onChange={(e) => {
              setMatserData({ ...matserData, search :e.target.value });
              // delete errorObj?.regx
            }}
          // error={errorObj && errorObj.regx}
          />
    <Form.Field
            id="form-textarea-control-opinion"
            control={Input}
            label="Value"
            placeholder="Enter value"
            // required={true}
            value={matserData?.value || ""}
            onChange={(e) => {
              setMatserData({ ...matserData, value :e.target.value });
              // delete errorObj?.regx
            }}
          // error={errorObj && errorObj.regx}
          />

    </>
}

export function AddDateFormat({dateFormat, setDateFormat,type}) {
  return <>
  <Form.Field
          id="form-textarea-control-opinion"
          control={Input}
          label="Date Format"
          placeholder="Enter Date Format"
          value={dateFormat || ""}
          onChange={(e) => {
            setDateFormat(e.target.value);
          }}
        />

  </>
}


