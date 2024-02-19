import React, { useEffect, useState } from 'react'
import { Breadcrumb, Button, Dropdown, Form, Icon, Input, Loader } from 'semantic-ui-react'
import { apiGET, apiPOST } from '../../utils/apiHelper';
import Swal from 'sweetalert2';
import moment from 'moment';

const Documentnotes = (props) => {
    const sections = [
        { key: 'Dashboard', content: 'Dashboard', link: true },
        { key: 'User List', content: 'User List', link: true },
        { key: "Document Note", content: 'Document Note', active: true },
    ];

    const [notes, setNotes] = useState('')
    const [Error, setError] = useState()
    const [loading, setLoading] = useState(false)
    const [documentNoteArr, setDocumentNoteArr] = useState([])
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

    //Validation
    const validate = (data) => {
        if (!data || data.trim() === '') {
            setError({ ...Error, notes: "Name is a required field" })
            return false
        }
        return true
    }

    //Get User By Id
    const getDocumentNoteById = async (id) => {
        try {
            setLoading(true)
            const response = await apiGET(`/v1/documentnotes/${id}`)
            if (response.status) {
                setLoading(false)
                setDocumentNoteArr(response.data.data)
            } else {
                setLoading(false)
                Toast.fire('Error!', response?.data?.data || "Something went wrong!", 'error');
            }

        } catch (error) {
            setLoading(false)
            Toast.fire('Error!', error || "Something went wrong!", 'error');
        }
    }

    //Add Note
    const onClickAddNote = async () => {
        try {
            const isValidated = await validate(notes);
            if (isValidated) {
                let payload = {
                    notes: notes,
                    documentId: props.documentId,
                }
                setLoading(true)
                const response = await apiPOST('/v1/documentnotes/', payload);
                if (response.status) {
                    setNotes('')
                    getDocumentNoteById(props.documentId)

                } else {
                    Toast.fire('Error!', response?.data?.data || "Something went wrong!", 'error');
                }
            }
        } catch (error) {
            Toast.fire('Error!', error || "Something went wrong!", 'error');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (props.visible) {
            getDocumentNoteById(props.documentId)
            setNotes('')
        }
    }, [props.visible])
    const options = [
        { key: '.com', text: '.com', value: '.com' },
        { key: '.net', text: '.net', value: '.net' },
        { key: '.org', text: '.org', value: '.org' },
    ]

    return (
        <div className="fadeIn page-content-wrapper">
            <div className="page-header">
                <div>
                    <Breadcrumb icon="right angle" sections={sections} />
                    <div className="header-text">Add Note</div>
                </div>
                <div className="page-header-actions">
                    <Button icon
                        onClick={() => {
                            props.setVisible(false)
                        }} >
                        <Icon name='close' />
                    </Button>
                </div>
            </div>
            <div className='note-page-body'>
                {
                    loading ?
                        <div style={{ alignSelf: 'center' }}>
                            <Loader active inline />
                        </div>
                        :
                        documentNoteArr?.length > 0 && !loading ?
                            documentNoteArr.map((item, index) => {
                                return (
                                    <div className='notes-note-div'>
                                        <div className='notes-nametxt'>{item.userdata.name}</div>
                                        <div className='notes-notetxt'>{item.notes}</div>
                                        <div className='notes-datetxt'> {moment
                                            .utc(item.createdAt)
                                            .local()
                                            .startOf('seconds')
                                            .fromNow()}</div>
                                    </div>
                                )
                            }) :
                            <div className='notes-nodatatxt'>
                                No Data Found
                            </div>
                }
                <div style={{ height: 60 }}></div>
            </div>
            <div style={{
                bottom: 0, position: 'fixed', display: 'flex', width: '100%'
            }}
            >
                <input
                    placeholder='Write note here'
                    className='notes-input'
                    onChange={(e) => {
                        setNotes(e.target.value)
                    }}
                    value={notes}
                />
                <Button color='blue' onClick={onClickAddNote}
                >Post</Button>


            </div>
        </div>
    )
}


export default Documentnotes
