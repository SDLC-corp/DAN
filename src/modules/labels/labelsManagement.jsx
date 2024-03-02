import React, { useState, useEffect, useRef } from 'react';
import { apiGET } from '../../utils/apiHelper';
import TableWrapper from '../../utils/tableWrapper';
import { Breadcrumb, Sidebar, Grid, Input, Dropdown, Button, Icon } from 'semantic-ui-react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import AddLabel from './addLabel';
import ShippingLineNameDropdown from '../../components/dropdown/shippingLineDropdown';

const sections = [
    { key: 'Dashboard', content: 'Dashboard', link: true },
    { key: 'label List', content: 'Label List', active: true },
];

export default function labelsManagement() {
    const navigate = useNavigate()
    let { action } = useParams();
    const [params, setParams] = useSearchParams()
    const [visible, setVisible] = useState()
    const [loading, setLoading] = useState();
    const [documentTypes, setDocumentTypes] = useState([])
    const [fields, setFields] = useState([])
    const [fieldForFilter, setFieldForFilter] = useState([])
    const [keyMap, setKeyMap] = useState({})
    const [idsData, setIdsData] = useState({})
    const querySearch = params.get('search');
    const [search, setSearch] = useState(querySearch || "");
    const [shippingLineForFilter, setShippingLineForFilter] = useState([])
    const [shippingLineId, setShippingLineId] = useState('');
    const [refresh, setRefresh] = useState(false)
    async function getMatrixData() {
        // setRefresh(true)
        setLoading(true);
        const {
            labels = [],
            documentTypes = [],
            fields = []
        } = await getAllLabel(); 


        let keyMap = {}

        for (let idx = 0; idx < labels.length; idx++) {
            const label = labels[idx];

            try {
                keyMap[label.fieldId + "-" + label.documentTypeId] = label
            } catch (error) {
                console.error("Key Map Error :: ", label);
            }
        }
        setRefresh(false)
        setLoading(false);
        setShippingLineForFilter(documentTypes)
        setDocumentTypes(documentTypes)
        setFieldForFilter(fields)
        setFields(fields)
        setKeyMap(keyMap)
    }


    useEffect(() => {
        document.title = "Admin Panel | Label-Matrix"
        getMatrixData();
    }, []);

    useEffect(() => {
        if (action == 'edit' || action == 'add') {
            document.getElementsByClassName('isSidebar')[0].classList.remove("pushable");
            // document.getElementsByClassName('table')[0].classList.remove("pushable");
            setVisible(true);
        } else {
            document.getElementsByClassName('isSidebar')[0].classList.add("pushable");
            document.getElementsByClassName('isSidebar')[0].classList.remove("top");
            setVisible(false);
        }
    }, [action]);


    const handleSearchChange = (e) => {
        const searchText = e.target.value;
        setSearch(searchText);
    };

    useEffect(() => {
        if (search.trim() && search) {
            setParams({search:search.trim()})
         const filteredFields = fieldForFilter.filter((item) =>
        item.displayName.toLowerCase().includes(search.toLowerCase())
        )
            setFields(filteredFields);
        }else{
            setFields(fieldForFilter)
            setParams()
        }
    }, [search,fieldForFilter])

    useEffect(() => {
        if (shippingLineId.length > 0) {
            const regexes = shippingLineId.map(id => new RegExp(`^${id}`, 'i'));
            const filteredFields = shippingLineForFilter.filter((item) => {
                return regexes.some(regex => regex.test(item._id));
            });
            setDocumentTypes(filteredFields);
        } else {
            setDocumentTypes(shippingLineForFilter);
        }
    }, [shippingLineId, refresh,fieldForFilter]);


    const getTotalFieldCount = (id) => {
        let arr = Object.keys(keyMap)
        return arr.filter(cusId => cusId.indexOf(id) != -1).length
    }
    return (
        <Sidebar.Pushable className='isSidebar'>
            <Sidebar
                style={{
                    width: 1000,
                }}
                as={'div'}
                animation="overlay"
                icon="labeled"
                direction="right"
                // onHide={() => setVisible(false)}
                onHidden={() => navigate('/dashboard/labels/manage')}
                vertical={'vertical'}
                visible={visible}>
                <AddLabel
                    visible={visible}
                    through={"manage"}
                    idsData={idsData}
                    getAllLabel={getMatrixData}
                />
            </Sidebar>

            <Sidebar.Pusher dimmed={visible}>
                <div className="page-header" >
                    <div>
                        <Breadcrumb icon="right angle" sections={sections} />
                        <div className="header-text">Label Matrix</div>
                        <div className="sub-text">
                            List of all fields and Document Types and Labels
                        </div>
                    </div>
                    <div className="page-header-actions">
                        <div style={{ display: "flex", alignItems: "center", marginRight: "2rem" }}>
                            <strong>REFRESH</strong>
                            <p style={{ marginLeft: "1rem", cursor: "pointer" }}><Icon onClick={()=>{
                            setRefresh(true)
                            getMatrixData()
                            }}
                                className='ui right aligned blue' name="refresh" loading={refresh}></Icon></p>
                        </div>
                        <div style={{ marginRight: 10 }}>
                            <Input
                                icon='search'
                                placeholder="Search Fields"
                                type="text"
                                // onChange={(e, { value }) => setSearch(value)}
                                onChange={handleSearchChange}

                                value={search}
                            />
                        </div>
                        <div>
                            <ShippingLineNameDropdown
                                multiselect={true}
                                shippingLineId={setShippingLineId} shippingId={shippingLineId} refresh={refresh}
                            />
                           
                        </div>
                    </div>
                </div>

                
                <div style={{ display: 'flex',padding:5 }}>
                    <div style={{ width: '300px' }}>

                        <table className="ui compact celled definition table">
                            <thead>
                                <tr style={{ height: '50px'}}>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    fields?.length ?
                                        fields.map(field => {
                                            return (
                                                <tr style={{height:'50px'}}>
                                                    <td ><h5>{field.displayName}</h5></td>
                                                </tr>
                                            );
                                        })
                                        :
                                        <div style={{ textAlign: 'center' }}>No records found</div>
                                }
                            </tbody>
                        </table>
                    </div>
                    <div style={{ width: '100%', overflowX: 'scroll' }} className='label-manage-doctype'>
                        <table className="ui celled table">
                            <thead>
                                <tr  >
                                    {documentTypes.map(documentType => <th id={documentType._id} 
                                    style={{height:'50px',whiteSpace:'nowrap'}}
                                    >
                                        <div data-tooltip={documentType.name} data-position="bottom left"  >
                                            <span >{documentType.name || documentType.code }</span>
                                            <span style={{ marginLeft: "1rem" }}>
                                                ({getTotalFieldCount(documentType._id)})
                                            </span>
                                        </div>
                                    </th>)}
                                </tr>
                            </thead>
                            <tbody>
                                {fields?.length ?
                                    fields.map(field => {
                                        return (
                                            <tr style={{height:'50px',whiteSpace:'nowrap'}}>
                                                {documentTypes.map((docType) => {
                                                    let labelObj = keyMap[field._id + '-' + docType._id] || { documentTypeId: docType._id, fieldId: field._id, fieldName: field.displayName }
                                                    return <TableData
                                                        label={labelObj}
                                                        setIdsData={setIdsData}
                                                    />
                                                })}
                                            </tr>
                                        );
                                    })
                                    :
                                    <div style={{ textAlign: 'center' }}>No records found</div>
                                }
                            </tbody>
                        </table>
                    </div>
                </div>
            </Sidebar.Pusher>
        </Sidebar.Pushable >
    );
}

const TableData = ({ label = {}, setIdsData }) => {
    const navigate = useNavigate()
    const onClickEditButton = (id) => {
        navigate(`/dashboard/labels/manage/edit/${id}`)
    }
    const onClickAddButton = (label) => {
        navigate(`/dashboard/labels/manage/add`)
        setIdsData(label)
    }


    return <td>
        {
            label.label ? <>
                <i className="edit icon blue"
                    onClick={() => onClickEditButton(label._id)}></i>
                {label.label}
            </>
                : <>
                    <i className="add icon blue"
                        onClick={() => onClickAddButton(label)}></i>
                </>
        }

    </td >
}

const getAllLabel = async (limit, page) => {
    let response = await apiGET(`/v1/labels/matrix?limit=${limit}&page=${page}`);
    if (response.status === 200) {
        return response.data.data;
    }
    return {
        displayNames: [],
        labels: [],
        parameterNames: [],
    };
};