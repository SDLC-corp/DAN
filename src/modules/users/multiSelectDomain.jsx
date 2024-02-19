import React, { useEffect } from 'react'
import { useState } from 'react'
import { Button, Form, Input, Modal } from 'semantic-ui-react'
import NestedDomain from '../../components/nodetree/nestedDomain'

const MultiSelectDomain = ({setVisible,setNodeTreeValue,nodeTreeValue,id,error}) => {
    const [errorObj, setErrorObj] = useState()
    const [openModalTree, setOpenModalTree] = useState(false)
    const [domain, setDomain] = useState(nodeTreeValue)
    const [rowId, setRowId] = useState('')

    useEffect(() => {
       
        let newArray =[]
        for (let i = 0; i < domain?.length; i++) {
            if (!nodeTreeValue.includes(domain[i])) {
              newArray.push(domain[i])  
            }
        }
        if ((rowId === 0 || rowId) && newArray[0] && !openModalTree) {
            let newArray2 = [...nodeTreeValue]
            newArray2[rowId] = newArray[0]
            setNodeTreeValue([...newArray2])
            setRowId("")
        }else if (nodeTreeValue?.length>=1 || newArray?.length>=1) {
            setNodeTreeValue([...nodeTreeValue,...newArray])
            // setRowId("")
        }
    }, [domain])

    return <>
        {
            nodeTreeValue?.length ? nodeTreeValue?.map((item,index) => <Form.Field
                id="form-textarea-control-opinion"
                control={Input}
                type='text'
                placeholder="Enter domain Name"
                required={true}
                action={{
                    icon: 'trash icon',
                    type: 'button',
                    onClick: () => {
                        let copy = nodeTreeValue
                        console.log(index,nodeTreeValue);
                            copy.splice(index, 1)
                            // copy = copy.map((itm) => {
                            //     if (itm.index > (item.index)) {
                            //         itm.index = itm.index - 1
                            //         return { name: itm.name, index: itm.index }
                            //     } else {
                            //         return itm
                            //     }
                            // })
                        // setDomain([...copy]);
                        setNodeTreeValue([...copy]);
                        setErrorObj(false)
                    }
                }}
                value={item || ""}
                onClick={(e) => {
                    setOpenModalTree(true)
                    setRowId(index)
                    // let copy = nodeTreeValue
                    // copy[index - 1] = e.target.value
                    // setDomain([...copy]);
                    delete errorObj?.msg
                }}
                error={error && error.domain}
            />) :""
        }
        <button type='button' className={'ui button'}  onClick={e => {
            setOpenModalTree(true)
            // if ((domain[domain.length - 1]).trim() === '') {
            //     setErrorObj({ msg: `Enter domain${domain.length}  Name` })
            // } else {
            //     // setDomain([...domain, ""])
            // }
        }} >
            Add domain
        </button>
        <span style={{color:"red"}}>{error?.domain}</span>
        {
        // modal

        openModalTree && <DominModal setOpenModalTree={setOpenModalTree} setDomain={setDomain} openModalTree={openModalTree} domain={domain} />
        }
    </>
    
}

export default MultiSelectDomain

export function DominModal({openModalTree,setOpenModalTree,setDomain,domain}) {
    const [nodeItem, setNodeItem] = useState([])
    return <Modal onFocus={
        //   openModalTree && Props.setVisible(true)
            openModalTree 
        } open={openModalTree} onClose={() => setOpenModalTree(false)}>
          <Modal.Header>Select Domain</Modal.Header>
          <Modal.Content>
            <NestedDomain
              nodePathFn={setNodeItem}
            defaultValue={domain}
            />
          </Modal.Content>
          <Modal.Actions>
            <Button color="black" onClick={() => {
                setDomain([...nodeItem])
                setOpenModalTree(false)}}>
              ok
            </Button>
          </Modal.Actions>
        </Modal>
    
}
