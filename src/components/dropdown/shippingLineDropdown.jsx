import React from "react"
import { Dropdown } from "semantic-ui-react"
import { apiGET } from "../../utils/apiHelper"
import Swal from "sweetalert2"
import { useState } from "react"
import { useEffect } from "react"

const ShippingLineNameDropdown = ({
    shippingLineId,shippingId,refresh,multiselect,setSelectedShippingLineName,height
}) => {
    const [shippingLineArr, setShippingLineArr] = useState([])
    const getAllShippingLineList = async() => {
        try {
            let response = await apiGET(`/v1/shipping-lines/list`,);
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
              setShippingLineArr(list)
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
      getAllShippingLineList()
    }, [refresh])

    const onChangeShippingLineId = (e,data) => { 
      shippingLineId(data.value)
        if (setSelectedShippingLineName) {
           const selectedOption = shippingLineArr?.find(option => option.value === data.value);
            setSelectedShippingLineName(selectedOption?.text) 
        }
     }

       
        
    return (
        <div className="ui toggle checkbox small">
            <Dropdown
              clearable
              value={shippingId ? shippingId: ""}
              placeholder='Select Shipping line'
              style={{ marginRight: '10px',height:height }}
              search
              selection
              options={shippingLineArr}
              onChange={onChangeShippingLineId}
              multiple={multiselect? true: false}
            />            
        </div>
    )
}

export default ShippingLineNameDropdown
