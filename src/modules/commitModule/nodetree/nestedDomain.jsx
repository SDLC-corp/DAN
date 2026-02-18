import React, { useState, useEffect } from 'react';
import Tree from 'rc-tree';
import 'rc-tree/assets/index.css';
import Swal from 'sweetalert2';
import { apiGET, apiPOST, apiPUT } from '../../utils/apiHelper';
import { Button, Form, Icon, Input, Modal } from 'semantic-ui-react';
import { da } from 'date-fns/locale';
import { useContext } from 'react';
import { AuthContext } from '../../contexts';
import { ADD_DOMAIN, DELETE_DOMAIN, EDIT_DOMAIN, hasAccess } from '../../utils/accessHelper';

const NestedDomain = ({ nodePathFn ,hideActionBtn,defaultValue}) => {

    const [modalOpen, setModalOpen] = useState(false);
    const [parentId, setParentId] = useState('')
    const [id, setId] = useState('')
    const [label, setLabel] = useState('')
    const [domainData, setDomainData] = useState([]);
    const [checkedKeys, setCheckedKeys] = useState([]);
    const [errorObj, setErrorObj] = useState()
    const {user} = useContext(AuthContext)

    const validate = (data) => {
        if (!data.trim()) {
            setErrorObj({ ...errorObj, label: "Label is a required field" })
          return false
        }

        return true
      }

     const getDataAccordingToRole = (data, domain) => {
        // let result =[]
        // for (let i = 0; i < data[0].children?.length; i++) {
        //     if (data[0].children[i].label === domain) {
        //         console.log("ala");
        //         result = data[0].children[i].children
        //     }
        // }
        // return result

        const filteredData = data.map((parent) => {
            const filteredChildren = parent.children.filter(
                (child) => child.label === domain
            );

            if (filteredChildren.length > 0) {
                // If there are matching children, keep the parent and update its children
                return { ...parent, children: filteredChildren };
            } else {
                // If there are no matching children, exclude the parent from the result
                return null;
            }
        }).filter(Boolean); // Remove null entries from the result
        return filteredData
    }    


    // const transformData = (data) => {
    //     console.log('data',data);
    //     const map = {};
    //     const roots = [];

    //     data.forEach((item) => {
    //         item.children = [];
    //         map[item._id] = item;

    //         if (item.parentId == null) {
    //             roots.push(item);
    //         } else {
    //             if (!map[item.parentId].children) {
    //                 map[item.parentId].children = [];
    //             }
    //             map[item.parentId]?.children.push(item);
    //         }
    //     });

    //     return roots;
    // };

    const transformData = (data) => {
        const map = {};
        const roots = [];

        // Create a map of _id to the item and initialize children as an empty array
        data.forEach((item) => {
            item.children = [];
            map[item._id] = item;
        });

        // Iterate through the data to build the tree structure
        data.forEach((item) => {
            const parentItem = map[item.parentId];
            if (parentItem) {
                parentItem.children.push(item);
            } else {
                roots.push(item); // If no parent found, treat it as a root element
            }
        });

        return roots;
    };

    const getDomain = async () => {
        try {
            let response = await apiGET('/v1/domain/');
            if (response.status === 200) {
                let arr = transformData(response.data.data);
                setDomainData(arr);
                if (user.role !== "superAdmin") {
                    const resultData = getDataAccordingToRole(arr, user.domain[0].split("/")[1])
                    setDomainData(resultData)
                } else {
                    setDomainData(arr);
                }
            } else {
                Swal.fire({
                    title: 'Error!',
                    text: response?.data?.data,
                    icon: 'error',
                });
            }
        } catch (error) {
            Swal.fire({
                title: 'Error!',
                text: error,
                icon: 'error',
            });
        }
    };

    useEffect(() => {
        getDomain();
    }, []);


    const addDomain = async () => {
        try {
            let payload = {
                label: label,
                parentId: parentId ? parentId : null
            }
            const isValid = await validate(label)
            if (isValid) {
                let response = await apiPOST(
                    `/v1/domain/`, payload
                );
                if (response.status === 200) {
                    setModalOpen(false)
                    setParentId("")
                    getDomain()
                }
                else {
                    Swal.fire({
                        title: "Error!",
                        text: response?.data?.data,
                        icon: "error",
                    });
                }
            }

        } catch (error) {
            Swal.fire({
                title: "Error!",
                text: error,
                icon: "error",
            });
        }
    };

    const updateDomain = async () => {
        try {
            let payload = {
                label: label,
            }
            const isValid = await validate(label)
            if (isValid) {

            let response = await apiPUT(
                `/v1/domain/${id}`, payload
            );
            if (response.status === 200) {
                setModalOpen(false)
                setId("")
                getDomain()
            }
            else {
                Swal.fire({
                    title: "Error!",
                    text: response?.data?.data,
                    icon: "error",
                });
            }
        }
        } catch (error) {
            Swal.fire({
                title: "Error!",
                text: error,
                icon: "error",
            });
        }
    };

    useEffect(() => {
        if (!modalOpen) {
            setLabel('')
            setErrorObj()
        }
    }, [modalOpen])
    


    const modalContent = (
        <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
            <Modal.Header>{id ? "Update" : "Add"} {parentId ? 'Child Node' : 'Parent Node'}</Modal.Header>
            <Modal.Content>
            <Form style={{ width: '100%' }}>
                    <Form.Field
                        id="form-input-control-first-name"
                        control={Input}
                        label="Label"
                        placeholder="Label"
                        required={true}
                        value={label}
                        onChange={(e) => {
                            setLabel(e.target.value)
                            delete errorObj.label
                        }}
                        error={errorObj && errorObj.label}
                    />
                </Form>
            </Modal.Content>
            <Modal.Actions>
                <Button
                    animated="fade"
                    onClick={() => { setModalOpen(false) }}
                >
                    <Button.Content visible >Close</Button.Content>
                    <Button.Content hidden>
                        <Icon name="close" />
                    </Button.Content>
                </Button>
                <Button
                    animated="fade"
                    onClick={id ? updateDomain :addDomain}
                >
                    <Button.Content visible >{id? 'Update' : 'Add'}</Button.Content>
                    <Button.Content hidden>
                        <Icon name="plus" />
                    </Button.Content>
                </Button>
            </Modal.Actions>
        </Modal>
    );


    const getPathToNode = (tree, targetKey, path = []) => {
        for (const node of tree) {
            if (node._id === targetKey) {
                return [...path, node.label];
            }

            if (node.children) {
                const result = getPathToNode(node.children, targetKey, [...path, node.label]);
                if (result) {
                    return result;
                }
            }
        }
        return null;
    };

    const handleCheck = (newCheckedKeys, e) => {
        const checkedNodes = e.checkedNodes;
    
        // Extract the keys of selected leaf nodes
        const leafKeys = checkedNodes
          .filter((node) => !node.children)
          .map((node) => node.key);
          setCheckedKeys(newCheckedKeys);
            let totalPath=[]
          const paths = leafKeys.map((nodeKey) => {
            const path = getPathToNode(domainData, nodeKey).join('/');
            // return {_id:path, text: path, value: path };
            totalPath.push(path)
          });
          nodePathFn(totalPath);

      };


    const renderTreeNodes = (data) => {
        return data.map((item) => (
            <Tree.TreeNode title={<NodeWithButton label={item.label} id={item._id} />} key={item._id}>
                {item.children && item.children.length > 0 && renderTreeNodes(item.children)}
            </Tree.TreeNode>
        ));
    };

    const NodeWithButton = ({ label, id }) => {
        const handleButtonClick = () => {
            setParentId(id)
        };
        
        const handleEditButtonClick = () => {
            setId(id)
            setLabel(label)
            
        };

        const deleteDomain = async () => {
            Swal.fire({
                title: `Are you sure ? `,
                icon: 'warning',
                text: 'Want to delete this domain?',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes',
                buttons: true,
              }).then(async (result) => {
                try {
                  if (result.isConfirmed) {
                      let response = await apiPUT(
                          `/v1/domain/deletedomain/${id}`);
                    if (response?.status == 200) {
                      Swal.fire('Success', 'Domain Deleted !', 'success');
                      await getDomain();
                    } else if (response?.status === 400) {
                      Swal.fire(
                        'Error!',
                        response?.data?.data || 'Something went wrong.',
                        'error'
                      );
                    } else {
                      Swal.fire('Error!', 'Something went wrong.', 'error');
                    }
                  }
                } catch (error) {
                  Swal.fire({
                    title: 'Error !',
                    text: error || "Something went wrong !",
                    icon: 'error',
                  });
                }
              });
        };
        
    
        return (
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '20vw' }}>

                <p className='text'>{label}</p>

                {
                    hideActionBtn ?
                        <div style={{ display: 'flex' }}>
                            {/* Delete Button */}
                            {
                                hasAccess(DELETE_DOMAIN) &&  <Button
                                animated="fade"
                                onClick={() => {
                                    deleteDomain()
                                }} size='tiny' style={{ height: 10, display: 'flex', alignItem: 'center' }}>
                                <Button.Content visible style={{ alignSelf: 'center' }} ><Icon name="trash" size='small' /></Button.Content>
                                <Button.Content hidden>
                                    <Icon name="trash" />
                                </Button.Content>
                            </Button>
                            }

                            {/* Add Button */}
                            {
                                hasAccess(ADD_DOMAIN) && <Button
                                    animated="fade"
                                    onClick={() => {
                                        handleButtonClick()
                                        setModalOpen(true)
                                    }} size='tiny' style={{ height: 10, display: 'flex', alignItem: 'center' }}>
                                    <Button.Content visible style={{ alignSelf: 'center' }} >+</Button.Content>
                                    <Button.Content hidden>
                                        <Icon name="plus" />
                                    </Button.Content>
                                </Button>
                            }

                            {/* Editor Button */}
                            {
                                hasAccess(EDIT_DOMAIN) && <Button
                                    animated="fade"
                                    onClick={() => {
                                        handleEditButtonClick()
                                        setModalOpen(true)
                                    }} size='tiny' style={{ height: 10, display: 'flex', alignItem: 'center' }}>
                                    <Button.Content visible style={{ alignSelf: 'center' }} >
                                        <Icon name="pencil" size='small' />
                                    </Button.Content>
                                    <Button.Content hidden>
                                        <Icon name="pencil" />
                                    </Button.Content>
                                </Button>
                            }
                           
                        </div>
                        : null
                }
            </div>
        );
    };

    return <div>
        {/* <div style={{ display: "flex", justifyContent: "space-between", width: '12vw', margin: "10px" }}>
            <span>Create New</span>
            <div>
                <Button
                    animated="fade"
                    onClick={() => {
                        setModalOpen(true)
                    }} size='tiny' style={{ height: 10, display: 'flex', alignItem: 'center' }}>
                    <Button.Content visible style={{ alignSelf: 'center' }} >+</Button.Content>
                    <Button.Content hidden>
                        <Icon name="plus" />
                    </Button.Content>
                </Button>
            </div>
        </div> */}
        <Tree
            checkable
            showLine={true}
            defaultExpandAll={true}
            checkedKeys={checkedKeys}
            defaultSelectedKeys={defaultValue}
            defaultCheckedKeys={defaultValue}
            defaultExpandParent={true}
            onCheck={handleCheck}
        >
            {renderTreeNodes(domainData)}
        </Tree>
        {modalContent}
    </div>
}

export default NestedDomain	