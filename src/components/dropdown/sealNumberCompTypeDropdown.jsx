import React, { useEffect, useState } from 'react'
import { Dropdown } from 'semantic-ui-react';

const sealNumberOptionsOne = [
    {
        key: 'Shipper',
        text: 'Shipper',
        value: 'shipper',
        content: 'Shipper',
    },
    {
        key: 'liner',
        text: 'Liner',
        value: 'liner',
        content: 'Liner',
    },
];
const customDdOptions = [
    {
        key: 'Custom',
        text: 'Custom',
        value: 'custom',
        content: 'Custom',
    }
];

const SealNumberCompTypeDropdown = ({onFocusRow,aRow,selectedForEditing,index,updateTableField, selectedSentence,onFieldFocus,onFieldBlur ,setClickedFieldIndex}) => {

     const [sealTypeVal, setSealTypeVal] = useState("")
    const [clickCheckOne, setClickCheckOne] = useState({})
    const [clickCheckTwo, setClickCheckTwo] = useState({})     

    let fieldsValue = selectedForEditing.fieldValue.length ? selectedForEditing?.fieldValue[index] : {};

    if (selectedForEditing?.overrideValue?.length > 0 && !fieldsValue) {
        if (selectedForEditing.overrideValue[index]) {
        fieldsValue = selectedForEditing.overrideValue[index];
        }
    }

    let defualtVal = ""
    if(fieldsValue?.shipper) {
        console.log('fieldsValue.shipper',fieldsValue.shipper);
        defualtVal = sealNumberOptionsOne[0].value
    }
    if(fieldsValue?.liner) {
        console.log('fieldsValue.liner',fieldsValue.liner);
        defualtVal = sealNumberOptionsOne[1].value
    }


    const [valueData, setValueData] = useState(defualtVal || "liner")
    const [customDdData, setCustomDdData] = useState("custom")

    let initialCustomData= ""
    if (fieldsValue && fieldsValue["custom"]) {
        initialCustomData = fieldsValue["custom"]
    }
    const [customSealVal, setCustomSealVal] = useState(initialCustomData)

    useEffect(() => {
        if (initialCustomData) {
            setCustomSealVal(fieldsValue["custom"])
        }
    }, [initialCustomData])


    useEffect(() => {
        if (fieldsValue?.liner) {
            setSealTypeVal(fieldsValue.liner)
        }else if (fieldsValue?.shipper) {
            setSealTypeVal(fieldsValue.shipper)
        }
    }, [fieldsValue])
  

  return <>
      <div style={{marginTop:0}}>
          <label>
              <p>Seal Type : <Dropdown inline options={sealNumberOptionsOne} 
                onChange={(e,{value})=>setValueData(value)}
                defaultValue={valueData}
                value={valueData} /></p>
          </label>
          <input
              style={{
                  outline: onFocusRow.itemId == aRow.itemId && onFocusRow.selectedParam == ((valueData === clickCheckOne.value)&& valueData) ? '2px solid #9c27b0' : 'none',
                  border: onFocusRow.itemId == aRow.itemId && onFocusRow.selectedParam == ((valueData === clickCheckOne.value)&& valueData) ? '1px solid #9c27b0' : '1px solid black',
                  padding: 4,
                  borderRadius: 3,
                  height:37,
                  width: 150,
              }}
            placeholder={`Enter Seal Number`}
              onFocus={(e) =>{setClickCheckTwo({}); setClickedFieldIndex(index); setClickCheckOne({value:valueData, index:index}); onFieldFocus(index, e, valueData, aRow.itemId)}}
              onBlur={(e) => {setClickCheckTwo({}); setClickedFieldIndex(index); setClickCheckOne({value:valueData, index:index}); onFieldBlur(index, e, valueData, aRow.itemId)}}
              onChange={(e) => {
                updateTableField(index, e.target.value, valueData, aRow.itemId)
                  setSealTypeVal(e.target.value);
              }}
                value={sealTypeVal}
          />
      </div>
      <div style={{marginTop:4}}>
          <label>
             <p> Seal Type :  <Dropdown inline options={customDdOptions} 
                onChange={(e,{value})=>setCustomDdData(value)}
                defaultValue={customDdData}
                value={customDdData}/></p>
          </label>
          <input
              style={{
                  outline: onFocusRow.itemId == aRow.itemId && onFocusRow.selectedParam == ((customDdData === clickCheckTwo.value)&& customDdData)   ? '2px solid #9c27b0' : 'none',
                  border: onFocusRow.itemId == aRow.itemId && onFocusRow.selectedParam == ((customDdData === clickCheckTwo.value)&& customDdData) ? '1px solid #9c27b0' : '1px solid black',
                  padding: 4,
                  borderRadius: 3,
                  height:37,
                  width: 150,
              }}
              placeholder={`Enter Seal Number`}
              onFocus={(e) =>{
                setClickCheckOne({})
                setClickedFieldIndex(index)
                setClickCheckTwo({value:customDdData,index:index})
                onFieldFocus(index, e, customDdData, aRow.itemId)}}
              onBlur={(e) => {
                setClickCheckOne({});
                setClickedFieldIndex(index)
                setClickCheckTwo({value:customDdData,index:index}); setClickCheckTwo(customDdData); onFieldBlur(index, e, customDdData, aRow.itemId)}}
              onChange={(e) => {
                updateTableField(index, e.target.value, customDdData, aRow.itemId)
                setCustomSealVal(e.target.value)
              }}
              value={customSealVal}

          />
      </div>

  </>
}

export default SealNumberCompTypeDropdown