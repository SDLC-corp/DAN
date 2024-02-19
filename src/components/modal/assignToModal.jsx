import React, { useEffect, useState } from 'react'
import { Button, Dropdown, Modal } from 'semantic-ui-react'
import Swal from 'sweetalert2';
import { apiGET, apiPOST } from '../../utils/apiHelper';
import UserListDropDown from '../dropdown/userListDropDown';

const AssignToModal = ({ modalOpen, setModalOpen, defaultValue, documentId,getData }) => {
    const [ddValue, setDDValue] = useState(defaultValue)
    const [errorObj, setErrorObj] = useState({})


    const validate = (data) => {
        if (!data.userId) {
            setErrorObj({name: "Select the User" })
            return false
        }
        return true
    }

    const updateAssignToUser = async () => {
        // setLoading(true);
        try {
            let payload = { userId: ddValue }
            const isValid = await validate(payload)
            if (isValid) {
                let response = await apiPOST(`/v1/documents/update-assign-to-user/` + documentId, payload);
            if (response.status === 200) {
                getData(documentId)
                Swal.fire({
                    title: "Success!",
                    text: "Assign User Updated",
                    icon: "success",
                });
                setModalOpen(false)
            } else {
                Swal.fire({
                    title: "Error!",
                    text: response?.data?.data,
                    icon: "error",
                });
                setModalOpen(false)
            }
            }
        } catch (error) {
            Swal.fire({
                title: "Error!",
                text: error,
                icon: "error",
            });
            setModalOpen(false)
        } finally {
            //   setLoading(false);
        }
    };

    useEffect(() => {
            if (ddValue.trim()) {
                delete errorObj?.name
            }
    }, [ddValue])
    
    return <>
        <Modal
            closeIcon
            onClose={() => setModalOpen(false)}
            onOpen={() => setModalOpen(true)}
            open={modalOpen}
        // trigger={documentsdata.length > 0 && !loading ? <Icon name="eye" size='large'></Icon> : null}
        >
            <Modal.Header>Assign To User</Modal.Header>
            <Modal.Content>
                <UserListDropDown
                    assignToUserId={ddValue} 
                    setAssignToUserId={setDDValue}
                />
                {
                errorObj &&  <label style={{color:"red",marginBottom:50}}>{ errorObj.name}</label>
                }
            </Modal.Content>
            <Modal.Actions>
                <Button color="black" onClick={() => {
                    updateAssignToUser()
                }
                } primary>
                    update user
                </Button>
            </Modal.Actions>
        </Modal>
    </>
}

export default AssignToModal