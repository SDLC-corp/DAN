import React from "react"
import { Dropdown } from "semantic-ui-react"
import { apiGET } from "../../utils/apiHelper"
import Swal from "sweetalert2"
import { useState } from "react"
import { useEffect } from "react"

const DocumentTypeDropdown = ({
    shippingLineId,shippingId,refresh,multiselect,setSelectedShippingLineName,height
}) => {
    const [documentTypeOptions, setDocumentTypeOptions] = useState([])
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
    }, [refresh])

    const onChangeDocumentTypeId = (e,data) => { 
      shippingLineId(data.value)
        if (setSelectedShippingLineName) {
           const selectedOption = documentTypeOptions?.find(option => option.value === data.value);
            setSelectedShippingLineName(selectedOption?.text) 
        }
     }

       
        
    return (
        <div className="ui toggle checkbox small">
            <Dropdown
              clearable
              value={shippingId ? shippingId: ""}
              placeholder='Select Document Types'
              style={{ marginRight: '10px',height:height, borderRadius:'20px' }}
              search
              selection
              options={documentTypeOptions}
              onChange={onChangeDocumentTypeId}
              multiple={multiselect? true: false}
            />            
        </div>
    )
}

export default DocumentTypeDropdown
