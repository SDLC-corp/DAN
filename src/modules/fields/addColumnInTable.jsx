import React from 'react'
import { useState } from 'react'
import { Form, Input } from 'semantic-ui-react'

const AddColumnInTable = ({ column, setColumn }) => {
    const [errorObj, setErrorObj] = useState()
    return <>
        {
            column?.map(item => <Form.Field
                id="form-textarea-control-opinion"
                control={Input}
                label={`Column ${item.index}`}
                type='text'
                placeholder="Enter Column Name"
                required={true}
                action={{
                    icon: 'trash icon',
                    type: 'button',
                    onClick: () => {
                        let copy = column
                        if (copy.length !== 1) {
                            copy.splice(item.index - 1, 1)
                            copy = copy.map((itm) => {
                                if (itm.index > (item.index)) {
                                    itm.index = itm.index - 1
                                    return { name: itm.name, index: itm.index }
                                } else {
                                    return itm
                                }
                            })
                        }
                        setColumn([...copy]);
                        setErrorObj(false)
                    }
                }}
                value={item?.name || ""}
                onChange={(e) => {
                    let copy = column
                    copy[item.index - 1].name = e.target.value
                    setColumn([...copy]);
                    delete errorObj?.msg
                }}
                error={(errorObj && (column.length == item.index)) && errorObj.msg}
            />)
        }
        <button type='button' className={'ui button '} onClick={e => {
            if ((column[column.length - 1].name).trim() === '') {
                setErrorObj({ msg: `Enter Column${column.length}  Name` })
            } else {
                setColumn([...column, { name: "", index: column.length + 1 }])
            }
        }} >
            Add Column
        </button>
    </>
}

export default AddColumnInTable