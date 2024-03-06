import _ from 'lodash';
// import faker from 'faker';
import React, { useEffect, useState } from 'react';
import { Button, Dropdown, Grid, Header, Icon } from 'semantic-ui-react';
import { apiGET, objectToQueryParam } from '../../utils/apiHelper';
import Swal from 'sweetalert2';

// const getOptions = () =>
//   _.times(3, () => {
//     const name = faker.name.findName();
//     return { key: name, text: name, value: _.snakeCase(name) };
//   });


const RemoteDropdown = ({ value, setValue, handleButton }) => {
    const [documentData, setDocumentData] = useState([])
    const [isFetching, setIsFetching] = useState(false);
    const [multiple, setMultiple] = useState(true);
    const [search, setSearch] = useState(true);
    const [searchQuery, setSearchQuery] = useState(null);
    //   const [options, setOptions] = useState(getOptions());
    const [options, setOptions] = useState(documentData);

    const handleChange = (e, { value }) => setValue(value);
    const handleSearchChange = (e, { searchQuery }) => setSearchQuery(searchQuery);

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

    const getAllDocuments = async () => {
        try {
            setIsFetching(true)
            const res = await apiGET(`/v1/documents/list`)
            setIsFetching(false)
            if (res.status === 200) {
                let response = res?.data?.data
                setDocumentData(response.data);
            }
            else {
                Toast.fire('Error!', res?.data?.data || 'Something went wrong!', 'error');
            }
        } catch (error) {
            Toast.fire('Error!', error || 'Something went wrong!', 'error');
        }
    };

    useEffect(() => {
        getAllDocuments()
    }, [])
    const getBlNo = (fieldsAndValues) => {
        if (fieldsAndValues) {
            let found = fieldsAndValues.filter(item => item.fieldName == 'bl_no')
            if (found[0]) return found[0].fieldValue
        }
        return ''
    }

    useEffect(() => {
        let optionData = []
        for (let i = 0; i < documentData.length; i++) {
            optionData.push({ key: documentData[i]._id, text: documentData[i]?.seqId + " | " + documentData[i]?.documentNo + " | " + getBlNo(documentData[i]?.fieldsAndValues), value: documentData[i]._id })
        }
        setOptions([...optionData])
    }, [documentData])




    const fetchOptions = () => {
        setIsFetching(true);

        setTimeout(() => {
            setIsFetching(false);
            getAllDocuments()
            //   setOptions(documentData);
            selectRandom();
        }, 500);
    };

    const selectRandom = () => {
        const newValue = multiple
            ? [_.sample(options)?.value]
            : _.head(options)?.value || '';
        setValue(newValue);
    };

    const toggleSearch = (e) => setSearch(e.target.checked);
    const toggleMultiple = (e) => {
        const newValue = e.target.checked
            ? _.compact([value])
            : _.head(value) || '';
        setMultiple(e.target.checked);
        setValue(newValue);
    };
    return <>
        <label style={{display:"flex",alignContent:'center'}}>
            <strong>Document Dropdown</strong> 
            <span style={{marginLeft:"1rem",cursor:"pointer"}}>
                <span data-tooltip='Refetch Document List' data-position="top left">
                        <Icon  onClick={fetchOptions} className='ui right aligned blue' name="refresh"> </Icon>
                </span>
            </span>
            <input
                style={{marginLeft:"1rem"}}
                type='checkbox'
                checked={search}
                onChange={toggleSearch}
            />{' '}
            <span style={{marginLeft:"0.5em"}}>Search</span>
            <input
                style={{marginLeft:"1rem"}}
                type='checkbox'
                checked={multiple}
                onChange={toggleMultiple}
            />{' '}
            <span style={{marginLeft:"0.5em"}}>Multiple</span>
        </label>
        <div style={{marginTop:10}}>
            <Grid>
            <Grid.Column width={13}>
                <Dropdown
                    fluid
                    selection
                    multiple={multiple}
                    search={search}
                    options={options}
                    clearable
                    value={value}
                    placeholder='Seq Id | Document No | BL No.'
                    onChange={handleChange}
                    onSearchChange={handleSearchChange}
                    disabled={isFetching}
                    loading={isFetching}
                />
            </Grid.Column>
            <Grid.Column width={3}>
                <div style={{ display: "flex", justifyContent: "end" }}>
                    <Button onClick={handleButton}>Execute</Button>
                </div>
            </Grid.Column>
        </Grid>
        </div>
         <p style={{marginTop:10}}>
            {/* <Button onClick={fetchOptions}>Fetch</Button> */}
            <Button
                onClick={selectRandom}
                disabled={_.isEmpty(options)}
            >
                Select Random
            </Button>
        </p>
    </>
}

export default RemoteDropdown


