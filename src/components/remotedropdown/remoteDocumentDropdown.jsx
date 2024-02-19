import React, { useEffect, useState } from 'react';
import { Dropdown, Button, Grid, Header, Icon, Popup, Modal, Form, Input } from 'semantic-ui-react';
import { apiGET, apiPOST } from '../../utils/apiHelper';
import Swal from 'sweetalert2';

const RemoteDocumentDropdown = ({ value, fieldsObj, setValue, thisSelectedSentenceText, setThisSelectedSentenceTex, setDocumentsData, setHideTextAreaCheck }) => {
    const masterCollectionName = fieldsObj.master.collectionName

    const isMasterTypePort = fieldsObj.master.collectionName === "port_masters"
    const isMasterTypeAirPort = fieldsObj.master.collectionName === "air_port_masters"

    const [documentData, setDocumentData] = useState([]);
    const [isFetching, setIsFetching] = useState(false);
    const [searchQuery, setSearchQuery] = useState(null);
    const [options, setOptions] = useState(documentData);
    const [showModal, setShowModal] = useState(false)
    const [errorObj, setErrorObj] = useState()
    const [initialDropdown, setInitialDropdown] = useState(false)
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const [dataObj, setDataObj] = useState({
        locationXid: "",
        locationGid: "",
        locationName: `${thisSelectedSentenceText}`
    })
    const [isoDataObj, setIsoDataObj] = useState({
        text: "text",
        code: "code",
        description: "description"
    })
    const [loading, setLoading] = useState(false)

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

    const validate = (data) => {

        if (!data.locationXid.trim()) {
            setErrorObj({ ...errorObj, locationXid: "locationXid is required" })
            return false
        }
        if (!data.locationGid.trim()) {
            setErrorObj({ ...errorObj, locationGid: "locationGid is required" })
            return false
        }
        if (!data.locationName.trim()) {
            setErrorObj({ ...errorObj, locationName: "locationName is required" })
            return false
        }

        return true
    }

    const isoValidate = (data) => {

        if (!data.text.trim()) {
            setErrorObj({ ...errorObj, text: "Text is required" })
            return false
        }
        if (!data.code.trim()) {
            setErrorObj({ ...errorObj, code: "Code is required" })
            return false
        }
        return true
    }

    const handleChange = (e, { value }) => setValue(value);


    useEffect(() => {
        if (thisSelectedSentenceText) {
            setValue(thisSelectedSentenceText?.trim())
        }
    }, [thisSelectedSentenceText])


    const getDropdownOptions = () => {
        let newOptions = [...options];
        newOptions.push({
            key: thisSelectedSentenceText,
            text: thisSelectedSentenceText,
            value: thisSelectedSentenceText,
        });
        return newOptions;
    };


    const handleSearchChange = (e, { searchQuery }) => {
        setValue(searchQuery)
        setSearchQuery(searchQuery);
        getAllMasters(searchQuery)
        setDataObj({ ...dataObj, locationName: searchQuery })
    };

    const getAllMasters = async (searchQuery) => {
        try {
            setIsFetching(true);
            let res
            if (searchQuery) {
                res = await apiGET(
                    `/v1/portmaster/collectionnamelist?collectionName=${masterCollectionName}&search=${searchQuery}`
                );
            }
            else {
                res = await apiGET(
                    `/v1/portmaster/collectionnamelist?collectionName=${masterCollectionName}`
                );
            }
            setIsFetching(false);
            if (res.status === 200) {
                let response = res?.data?.data;
                setDocumentData(response);
                if (res?.data?.data?.length <= 0) {
                    setDocumentsData(res?.data?.data?.length)
                    setThisSelectedSentenceTex('')
                }
            } else {
                Swal.fire({
                    title: "Error!",
                    text: res?.data?.data || "Something went wrong!",
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
    };

   //Add Port Master or Add Container ISO
   const AddMaster = async (e) => {
    try {
        e.preventDefault(); 
        if (loading) return

        let isValid;
        if (isMasterTypePort || isMasterTypeAirPort) {
            isValid = await validate(dataObj)
        } else {
            isValid = await isoValidate(isoDataObj)
        }
        if (isValid) {
            let response
            setLoading(true)
            if (isMasterTypePort || isMasterTypeAirPort) {
                response = await apiPOST('/v1/portmaster/', dataObj)
            }
            else {
                response = await apiPOST('v1/isoCodes/', isoDataObj)
            }
            setLoading(false)
            if (response.status === 200) {
                Swal.fire({
                    title: "Success!",
                    text: "Master added successfully",
                    icon: "success",
                });
                setLoading(false)
                getAllMasters(searchQuery || thisSelectedSentenceText)
                setShowModal(false)
                setHideTextAreaCheck(false)
                clearFields()
            }
            else {
                Toast.fire('Error!', response?.data?.data || "Something went wrong!", 'error');
            }
        }
    } catch (error) {
        console.log(error);
        Toast.fire('Error!', error || "Something went wrong!", 'error');
    }
};

    //clear Fields
    const clearFields = () => {
        setDataObj({})
        setIsoDataObj({})
    }

    useEffect(() => {
        getAllMasters();
    }, []);


    useEffect(() => {
        if (thisSelectedSentenceText) {
            getAllMasters(thisSelectedSentenceText)
            setDataObj({ ...dataObj, locationName: thisSelectedSentenceText })
        }
        if (value?.length == 0 && searchQuery?.length == undefined && thisSelectedSentenceText?.length == 0 ) {
            getAllMasters()
        }

    }, [thisSelectedSentenceText])

    function getPMFormattedDDValue(docRow={}) {
        console.log("docRow", docRow);
        if(docRow) {
            return `${docRow.locationXid} - ${docRow.locationName}`
        } else {
            return ""
        }
    }

    useEffect(() => {
        let optionData = [];
        for (let i = 0; i < documentData.length; i++) {
            isMasterTypePort || isMasterTypeAirPort ?
                optionData.push({
                    key: documentData[i]._id,
                    text:
                        documentData[i]?.[fieldsObj?.master?.value] +
                        " | " +
                        documentData[i]?.[fieldsObj?.master?.search],
                    value: getPMFormattedDDValue(documentData[i]),
                }) :
                optionData.push({
                    key: documentData[i]._id,
                    text:
                        documentData[i]?.[fieldsObj?.master?.value] +
                        " | " +
                        documentData[i]?.[fieldsObj?.master?.search],
                    value: documentData[i]?.[fieldsObj?.master?.value],
                });
        }
        setOptions([...optionData]);
    }, [documentData]);

    useEffect(() => {
        if (!initialDropdown && value) {
            setInitialDropdown(false)
        }
        else if (thisSelectedSentenceText && !initialDropdown) {
            setInitialDropdown(true);
        } else if (thisSelectedSentenceText && initialDropdown) {
            setIsDropdownOpen(true);
        } else {
            setIsDropdownOpen(false);
        }


    }, [thisSelectedSentenceText, initialDropdown]);

    useEffect(() => {
        if (searchQuery) {
            setIsDropdownOpen(true);
        } else {
            setIsDropdownOpen(false);
        }
    }, [searchQuery]);

    useEffect(() => {
        if (documentData && documentData?.length <= 0) {
            setIsDropdownOpen(false)
        }
    }, [documentData])


    return (
        <>
            <label style={{ display: "flex", alignContent: 'center' }}>
                <strong>{isMasterTypePort || isMasterTypeAirPort ? "Port List" : 
                masterCollectionName === 'freightterm' ? "Freight Term List" : "Country Code List"}</strong>
            </label>
            <div style={{ marginTop: 10 }}>
                <Grid>
                    <Grid.Column width={13}>
                        <Dropdown
                            fluid
                            search
                            selection
                            options={getDropdownOptions()}
                            clearable
                            value={value}
                            placeholder={
                                isMasterTypePort || isMasterTypeAirPort
                                    ? `seqId | Location Name | Location Gid`
                                    : `seqId | text | code`
                            }
                            onChange={(e, { value }) => {
                                handleChange(e, { value });
                                if (isDropdownOpen) {
                                    setIsDropdownOpen(false);
                                }
                                if (value == "") {
                                    getAllMasters()
                                }
                            }}
                            onOpen={() => {
                                if (!thisSelectedSentenceText) {
                                    setIsDropdownOpen(true)
                                }
                            }}
                            onBlur={()=>{
                                setIsDropdownOpen(false)
                            }}
                            searchQuery={value}
                            onSearchChange={handleSearchChange}
                            disabled={isFetching}
                            loading={isFetching}
                            open={isDropdownOpen}
                        />
                    </Grid.Column>
                  {
                  isMasterTypePort || isMasterTypeAirPort ?
                  <Grid.Column width={2}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <>
                                <Popup content='Add Master' trigger={<Button icon='add' size='medium' onClick={() => {
                                    setShowModal(true)
                                    setHideTextAreaCheck(true)
                                }} />} />
                            </>
                        </div>
                    </Grid.Column> :  null}
                </Grid>
                {
                    documentData.length <= 0 && !showModal ?
                        <div className='sub-text'>Not Found in {isMasterTypePort || isMasterTypeAirPort ? "Port List" : 
                        masterCollectionName === 'freightterm' ? "Freight Term List" : "Country Code List"} Click to add*</div> : null}
                {
                    showModal ?
                        <div>
                            {
                                isMasterTypePort || isMasterTypeAirPort ?
                                    <Form style={{ width: '100%' }}>
                                        <Form.Field
                                            id="form-input-control-first-name"
                                            control={Input}
                                            label="locationXid"
                                            placeholder="Enter LocationXid"
                                            required={true}
                                            value={dataObj?.locationXid || ""}
                                            onChange={(e) => {
                                                setDataObj({ ...dataObj, locationXid: e.target.value.toUpperCase(), locationGid: "TW." + e.target.value.toUpperCase() });
                                                delete errorObj?.locationXid
                                            }}
                                            error={errorObj && errorObj.locationXid}
                                        />
                                        <Form.Field
                                            id="form-input-control-first-name"
                                            control={Input}
                                            label="locationGid "
                                            placeholder="Enter LocationGid "
                                            required={true}
                                            value={dataObj?.locationGid || ""}
                                            onChange={(e) => {
                                                delete errorObj?.locationGid
                                            }}
                                            error={errorObj && errorObj.locationGid}
                                        />
                                        <Form.Field
                                            id="form-input-control-first-name"
                                            control={Input}
                                            label="locationName "
                                            placeholder="Enter LocationName"
                                            required={true}
                                            value={dataObj?.locationName || ""}
                                            onChange={(e) => {
                                                setDataObj({ ...dataObj, locationName: e.target.value.toUpperCase() });
                                                delete errorObj?.locationName
                                            }}
                                            error={errorObj && errorObj.locationName}
                                        />
                                    </Form>
                                    :
                                    <Form style={{ width: '100%' }}>
                                        <Form.Field
                                            id="form-input-control-first-name"
                                            control={Input}
                                            label="Text"
                                            placeholder="Enter text"
                                            required={true}
                                            value={isoDataObj?.text || ""}
                                            onChange={(e) => {
                                                setIsoDataObj({ ...isoDataObj, text: e.target.value });
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
                                            value={isoDataObj?.code || ""}
                                            onChange={(e) => {
                                                setIsoDataObj({ ...isoDataObj, code: e.target.value });
                                                delete errorObj?.code
                                            }}
                                            error={errorObj && errorObj.code}
                                        />
                                    </Form>
                            }
                            <div style={{ display: 'flex', marginTop: 10 }}>
                                <Button color='gray' onClick={() => {
                                    clearFields()
                                    setHideTextAreaCheck(false)
                                    setShowModal(false)
                                }}>
                                    Close
                                </Button>
                                <Button color='gray' onClick={(e) => {
                                    AddMaster(e);
                                }}>
                                    Add Master
                                </Button>

                            </div>
                        </div>
                        : null
                }
            </div>
        </>
    );
};

export default RemoteDocumentDropdown;
