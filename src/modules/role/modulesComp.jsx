import React, { useState, useEffect } from 'react';
import Tree from 'rc-tree';
import 'rc-tree/assets/index.css';
import Swal from 'sweetalert2';
import { apiGET} from '../../utils/apiHelper';

const ModulesComp = ({setParentModuleIds,disableModulesIds,setDisableModulesIds}) => {

    const [domainData, setDomainData] = useState([]);
    const [checkedKeys, setCheckedKeys] = useState([]);
    const [allDoaminData, setAllDoaminData] = useState([])

    const transformData = (data) => {
        const map = {};
        const roots = [];

        data.forEach((item) => {
            item.children = [];
            map[item.nodeId] = item;
        });

        data.forEach((item) => {
            if (item.parentId === 0) {
                roots.push(item);
            } else {
                if (map[item.parentId]) {
                    map[item.parentId].children.push(item);
                }
            }
        });

        return roots;
    };

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
        // get application-modules
    const getAllModulesList = async() => {
        try {
            let response = await apiGET(`/v1/application-modules`,);
        
            if (response.status === 200) {
                let list = response?.data.data;
                
                setAllDoaminData(list)
                let arr = transformData(list);
                setDomainData(arr);
            }
            else {
              Toast.fire('Error!', response?.data?.data || 'Something went wrong!', 'error');
            }
          } catch (error) {
            Toast.fire('Error!', error || 'Something went wrong!', 'error');
          }        
    }
    useEffect(() => {
      getAllModulesList()
    }, [])
    


    const getPathToNode = (tree, targetKey, path = []) => {
        for (const node of tree) {
            if (node.id === targetKey) {
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
    function handleNonChecked(checkedArry, mainArray, disable) {
        console.log('checkedArry, mainArray, disable',checkedArry, mainArray, disable);
        let result = []
        for (let i = 0; i < mainArray.length; i++) {
            let found = false
            for (let j = 0; j < checkedArry.length; j++) {
                if (((mainArray[i].id == checkedArry[j] )|| (mainArray[i].parentId == 0) ) && disable) {
                    found = true
                }else if(mainArray[i].id == checkedArry[j] ) {
                    found = true
                }
            }
            if (!found) {
                result.push(mainArray[i].id )
            }
        }
        return result
        
    }
    const handleCheck = (newCheckedKeys, e) => {
        setCheckedKeys(newCheckedKeys);
        setParentModuleIds(e.halfCheckedKeys.length ? e.halfCheckedKeys:[])
        const newArry = handleNonChecked(newCheckedKeys,allDoaminData,false)
        console.log("newArry",newArry);
        setDisableModulesIds(newArry);
    };

    const renderTreeNodes = (data) => {
        return data.map((item) => (
            <Tree.TreeNode title={<NodeWithButton label={item.text} id={item.id} />} key={item.id}>
                {item.children && item.children.length > 0 && renderTreeNodes(item.children)}
            </Tree.TreeNode>
        ));
    };

    const NodeWithButton = ({ label }) => {
        return (
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '20vw' }}>
                <p className='text'>{label}</p>
            </div>
        );
    };

    useEffect(() => {
      if (disableModulesIds) {
        const newArry = handleNonChecked(disableModulesIds, allDoaminData,true)
        setCheckedKeys(newArry)
      }
    }, [disableModulesIds,allDoaminData])

    return <div>
        <Tree
            checkable
            showLine={true}
            defaultExpandAll={true}
            checkedKeys={checkedKeys}
            // defaultSelectedKeys={defaultValue}
            // checkedKeys={defaultValue}
            onCheck={handleCheck}
        >
            {renderTreeNodes(domainData)}
        </Tree>
    </div>
}

export default ModulesComp	





