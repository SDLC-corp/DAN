import React from 'react'
import { Dropdown } from 'semantic-ui-react'
import { apiGET } from '../../utils/apiHelper';
import { useState } from 'react';
import { useEffect } from 'react';

const ItemMasterDropdown = ({dafaultValue, updateTableField, onFocus, onBlur, onFocusRow, aRow, clickedFieldIndex, index,selectedSentence }) => {

    const [isFetching, setIsFetching] = useState(false)
    const [documentData, setDocumentData] = useState([])
    const [documentsData, setDocumentsData] = useState([])
    const [options, setOptions] = useState([])
    const [thisSelectedSentenceTex, setThisSelectedSentenceTex] = useState('')
    const [searchQuery, setSearchQuery] = useState(dafaultValue || '');
    const [search, setSearch] = useState(true);

    const handleSearchChange = (e, { searchQuery }) => { setSearch(true), setSearchQuery(searchQuery) };

    const getAllMasters = async (searchQuery) => {
        try {
            setIsFetching(true);
            let res
            if (searchQuery) {
                res = await apiGET(
                    `/v1/portmaster/collectionnamelist?collectionName=itemMaster&search=${searchQuery}`
                );
            }
            else {
                res = await apiGET(
                    `/v1/portmaster/collectionnamelist?collectionName=itemMaster`
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

    useEffect(() => {
        getAllMasters()
    }, [])


    useEffect(() => {
        getAllMasters(searchQuery)
    }, [searchQuery])

    useEffect(() => {
        let optionData = []
        for (let i = 0; i < documentData?.length; i++) {
            optionData.push({ key: documentData[i]._id, text: documentData[i]?.text + " | " + documentData[i]?.code, value: documentData[i].code })
        }
        setOptions([...optionData])
    }, [documentData, searchQuery])

    useEffect(() => {
        if(searchQuery?.trim()) {
            getAllMasters(searchQuery?.trim())
        }else if((clickedFieldIndex == index) && (onFocusRow.selectedParam == 'item')) {
            getAllMasters()
        }
    }, [searchQuery,selectedSentence])

    useEffect(() => {
        if (selectedSentence?.trim() && (clickedFieldIndex == index) && (onFocusRow.selectedParam == 'item')) {
            setSearchQuery(selectedSentence?.trim())
        }
    }, [selectedSentence?.length,clickedFieldIndex])

    return (
        <div>
            <Dropdown
                style={{
                    height:20,
                    outline: onFocusRow.itemId == aRow.itemId && onFocusRow.selectedParam == 'item' && (clickedFieldIndex == index) ? '2px solid #9c27b0' : 'none',
                    border: onFocusRow.itemId == aRow.itemId && onFocusRow.selectedParam == 'item' && (clickedFieldIndex == index) ? '1px solid #9c27b0' : '1px solid black',
                }}
                clearable={true}
                fluid
                selection
                searchQuery={searchQuery}
                options={options}
                placeholder='Select Item Master'
                value={dafaultValue}
                search={search}
                onSearchChange={handleSearchChange}
                onChange={(e, { value }) => {
                    setSearchQuery(value)
                    updateTableField(index, value, 'item', aRow.itemId)
                }
                }
                onFocus={onFocus}
                disabled={isFetching}
                loading={isFetching}    
            />
        </div>
    )
}


export default ItemMasterDropdown