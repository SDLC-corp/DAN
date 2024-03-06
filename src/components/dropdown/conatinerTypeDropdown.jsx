import _ from 'lodash';
import React, { useEffect, useState } from 'react';
import { Button, Dropdown, Grid, Header, Icon, Modal, Popup,Form,Input } from 'semantic-ui-react';
import { apiGET, apiPOST, objectToQueryParam } from '../../utils/apiHelper';
import Swal from 'sweetalert2';




const ContainerTypeDropdown = ({ dropDownOptions,dafaultValue, updateTableField, onFocus, onBlur, onFocusRow, aRow, clickedFieldIndex, index,selectedSentence }) => {
    const [isoCodeData, setIsoCodeData] = useState(dropDownOptions || [])
    const [isFetching, setIsFetching] = useState(false);
    const [search, setSearch] = useState(true);
    const [searchQuery, setSearchQuery] = useState(null);
    const [options, setOptions] = useState(isoCodeData);
    const [showBtn, setShowBtn] = useState(false)
    const [loading, setLoading] = useState(false)
    const [showModal, setShowModal] = useState(false)
    const [errorObj, setErrorObj] = useState()
    const [dataObj, setDataObj] = useState({
        text: "",
        code: "",
        description: ""
    })
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

    const handleSearchChange = (e, { searchQuery }) => { setSearch(true),setSearchQuery(searchQuery) };

    const getAllIsoCodes = async (searchQuery) => {
        try {
            setIsFetching(true)
            let res
            if (searchQuery) {
                res = await apiGET(`v1/isoCodes/ddlist?search=${searchQuery}&limit=${10}`)
            } else {
                res = await apiGET(`v1/isoCodes/list`)
            }

            setIsFetching(false)
            if (res.status === 200) {
                let response = res?.data?.data?.data

                if (searchQuery?.length > 0) {
                    setIsoCodeData(response);
                }
            }
            else {
                Toast.fire('Error!', res?.data?.data || 'Something went wrong!', 'error');
            }
        } catch (error) {
            Toast.fire('Error!', error || 'Something went wrong!', 'error');
        }
    };
    const clearFields = () => {
        setDataObj({ text: "", code: "", description: "" })
        setErrorObj()
        setShowModal(false)
        setShowBtn(false)
    }
    const validate = (data) => {
        if (!data.text.trim()) {
            setErrorObj({ ...errorObj,text: "text is required" })
            return false
        }
        if (!data.code.trim()) {
            setErrorObj({ ...errorObj,code: "code is required" })
            return false
        }
        return true
    }
    const addIsoCode = async () => {
        try {
            if (loading) return
            const isValid = await validate(dataObj)
            if (isValid) {
                setLoading(true)
                const response = await apiPOST('v1/isoCodes/', dataObj)
                setLoading(false)    
                console.log("response", response);
                if (response.status === 200) {
                    Toast.fire("Success!","Container ISO Code added successfully", 'success');
                    setLoading(false)
                    clearFields()
                    getAllIsoCodes()
                }
                else {
                    Toast.fire('Error!', response?.data?.data || "Something went wrong!", 'error');
                }
            }
        } catch (error) {
            console.log(error);
            Toast.fire('Error!', error || "Something went wrong!", 'error');
        }
    }
    useEffect(() => {
        if (searchQuery && !isoCodeData?.length) {
            setShowBtn(true)
        } else {
            setShowBtn(false)
        }
    }, [isoCodeData?.length, searchQuery]);

    useEffect(() => {
        if(searchQuery?.trim()) {
            getAllIsoCodes(searchQuery?.trim())
        }else if((clickedFieldIndex == index) && (onFocusRow.selectedParam == 'type')) {
            getAllIsoCodes()
        }
    }, [searchQuery,selectedSentence])

    useEffect(() => {
        getAllIsoCodes()
    }, [])
    
    useEffect(() => {
        let optionData = []
        for (let i = 0; i < isoCodeData?.length; i++) {
            optionData.push({ key: isoCodeData[i]._id, text:  isoCodeData[i]?.code + " | " + isoCodeData[i]?.text, value: isoCodeData[i].code})
        }
        setOptions([...optionData])
    }, [isoCodeData])

    console.log('options',options);
    useEffect(() => {
        if (selectedSentence?.trim() && (clickedFieldIndex == index) && (onFocusRow.selectedParam == 'type')) {
            setSearchQuery(selectedSentence?.trim())
        }
    }, [selectedSentence?.length,clickedFieldIndex])

    return <div style={{display:"flex"}}>
                    <div >
                      <Dropdown
                        style={{
                            width: showBtn ? 90 :130,
                            // width: 60,
                            // padding: "2px",
                            // height:2,
                            borderRadius: 3,
                            outline: onFocusRow.itemId == aRow.itemId && onFocusRow.selectedParam == 'type' && (clickedFieldIndex == index) ? '2px solid #9c27b0' : 'none',
                            border: onFocusRow.itemId == aRow.itemId && onFocusRow.selectedParam == 'type' && (clickedFieldIndex == index) ? '1px solid #9c27b0' : '1px solid black',
                        }}
                        fluid
                        selection
                        search={search}
                        options={options}
                        clearable={true}
                        // value={value}
                        onBlur={onBlur}
                        onFocus={onFocus}
                        value={dafaultValue}
                        searchQuery={searchQuery}
                        placeholder='Text | Code'
                        // onChange={handleChange}
                        onChange={(e, { value }) =>{
                            setSearchQuery("")
                            updateTableField(index, value, 'type', aRow.itemId)}
                        }
                        onSearchChange={handleSearchChange}
                        disabled={isFetching}
                        loading={isFetching}    
                    />
                    </div>
                     {
            showBtn && <p style={{marginLeft:10}}>
                <Popup content='Add Type' trigger={<Button icon='add' size='mini' onClick={() => {
                    setDataObj({...dataObj,text:searchQuery})
                    setShowModal(true)
                }} />} />
            </p>
        }
              

        {
            showModal && <Modal
                closeIcon
                onClose={() => setShowModal(false)}
                onOpen={() => setShowModal(true)}
                open={showModal}
            >
                <Modal.Header>Add Container ISO Code Type</Modal.Header>
                <Modal.Content>
                    <Form style={{ width: '100%' }}>
                        <Form.Field
                            id="form-input-control-first-name"
                            control={Input}
                            label="Text"
                            placeholder="Enter text"
                            required={true}
                            value={dataObj?.text || ""}
                            onChange={(e) => {
                                setDataObj({ ...dataObj, text: e.target.value });
                                delete errorObj?.text
                            }}
                            error={errorObj && errorObj.text}
                        />
                        <Form.Field
                            id="form-input-control-first-name"
                            control={Input}
                            label="Code "
                            placeholder="Enter code "
                            required={true}
                            value={dataObj?.code || ""}
                            onChange={(e) => {
                                setDataObj({ ...dataObj, code: e.target.value });
                                delete errorObj?.code
                            }}
                            error={errorObj && errorObj.code}
                        />
                        <Form.Field
                            id="form-input-control-first-name"
                            control={Input}
                            label="Description "
                            placeholder="Enter description"
                            value={dataObj?.description || ""}
                            onChange={(e) => {
                                setDataObj({ ...dataObj, description: e.target.value });
                                delete errorObj?.description
                            }}
                            error={errorObj && errorObj.description}
                        />
                    </Form>
                </Modal.Content>
                <Modal.Actions>
                    <Button color='gray' onClick={() => {
                        setShowModal(false)
                        clearFields()
                    }}>
                        Clear
                    </Button>
                    <Button color='gray' onClick={() => {
                        addIsoCode();
                        clearFields()
                    }}>
                        Add ISO Code
                    </Button>
                </Modal.Actions>
            </Modal>
        }

    </div>
}

export default ContainerTypeDropdown


