import React, { useEffect, useState } from 'react'
import { Dropdown } from 'semantic-ui-react'
import { apiGET } from '../../utils/apiHelper';
import Swal from 'sweetalert2';

const UserListDropDown = ({setAssignToUserId,assignToUserId,disabled}) => {

    const [users, setUsers] = useState([])
    const [options, setOptions] = useState([]);
    const [ddValue, setDDValue] = useState(assignToUserId||"")
    const [errorObj, setErrorObj] = useState({})

    const getAllUsers = async () => {
        // setLoading(true);
        try {
            let response = await apiGET(`/v1/users/list`);
            if (response.status === 200) {
                // setVisible(false)
                setUsers(response?.data?.data?.data);
            } else if (response.status === 400) {
                Swal.fire({
                    title: "Error!",
                    text: response?.data?.data,
                    icon: "error",
                });

            } else {
                Swal.fire({
                    title: "Error!",
                    text: response?.data?.data,
                    icon: "error",
                });
            }
        } catch (error) {
            Swal.fire({
                title: "Error!",
                text: error,
                icon: "error",
            });
        } finally {
            //   setLoading(false);
        }
    };

    useEffect(() => {
        getAllUsers()
    }, [])

    useEffect(() => {
        let optionData = []
        for (let i = 0; i < users.length; i++) {
            optionData.push({ key: users[i].id, text: users[i]?.name, value: users[i].id })
        }
        setOptions([...optionData])
    }, [users])
  return <>
        <Dropdown
            style={{marginBottom:15}}
            fluid
            selection
            search={true}
            options={options}
            clearable
            value={assignToUserId}
            disabled={disabled}
            placeholder='Choose User Name'
            // defaultValue={defaultValue}
            onChange={(e, { value }) =>{
                setAssignToUserId(value)
                delete errorObj?.name
            }}
            // onSearchChange={handleSearchChange}
            // disabled={isFetching}
            // loading={isFetching}
        />
    </>
}

export default UserListDropDown