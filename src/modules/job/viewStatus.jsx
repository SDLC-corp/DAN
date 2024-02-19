import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { Breadcrumb, Button, Header, Icon, Loader, Popup, Table } from 'semantic-ui-react';
import { apiGET, apiPOST } from '../../utils/apiHelper';
import { alertError, alertSuccess } from '../../utils/alerts';
import { ALLOW_SYNCHRONIZATION, hasAccess } from '../../utils/accessHelper';

const StatusView = ({ count,documentId, modalOpen, blNo, docNo,getAllDocuments,getData,modal }) => {
    const sections = [
        { key: 'Dashboard', content: 'Dashboard', link: true },
        { key: 'Jobs List', content: 'Jobs List', active: true },
    ];

    const [jobData, setJobData] = useState({});
    const [tableArr, setTableArr] = useState([]);
    const [pushLoading, setPushLoading] = useState(false);
    const [loading, setLoading] = useState(false)

    const getJobByDocumentId = async (id) => {
        try {
            setLoading(true)
            const response = await apiGET(`/v1/job/document/${id}`);
            const result = response?.data?.data;
            setJobData(result);
            if (result?.status) {
                const newTableArr = Object.keys(result?.status).map(key => {
                    const arr = [];
                    if (typeof result?.status[key] === "object") {
                        Object.keys(result?.status[key]).forEach(key2 => {
                            if (result?.status[key].hasOwnProperty(key2)) {
                                arr.push({ [key2]: result?.status[key][key2] });
                            }
                        });
                    }
                    return { name: key, tdArr: arr };
                });
                setTableArr(newTableArr);
            }else{
                setTableArr([])
            }
            setLoading(false)
        } catch (error) {
            setLoading(false)
            console.log("error", error);
        }
    };

    function getDifference(startTime, endTime) {
        if (!startTime || !endTime) return "--";
        try {
            const duration = moment.duration(moment(endTime).diff(new Date(startTime)));
            return Number(duration.asSeconds()).toFixed(0) + " seconds";
        } catch (error) {
            return "--";
        }
    }
    const pushToOTMClickHandler = async (id) => {
        if (pushLoading) return;

        setPushLoading(true);
        let response = await apiPOST(`/v1/documents/allow-sync/` + id);
        setPushLoading(false);

        if (response.status == '200') {
            getJobByDocumentId(id)
            alertSuccess("Allow Sync Done");
            getAllDocuments && getAllDocuments()
            getData && getData(id)
            modalOpen(false)
        } else {
            alertError(response?.data?.data || 'Something went wring');
        }
  };

    useEffect(() => {
        if (documentId && modal) {
            getJobByDocumentId(documentId);
        }
    }, [documentId,count,modal]);

    return (
        <div className="fadeIn page-content-wrapper">
            <div className="page-header">
                <div>
                    <Breadcrumb icon="right angle" sections={sections} />
                    <div className="header-text">View Status</div>
                </div>
                <div className="page-header-actions">
                    <div style={{ display: "flex", alignItems: "center", marginRight: "2rem" }}>
                        <strong>REFRESH</strong>
                        <p style={{ marginLeft: "1rem", cursor: "pointer" }}><Icon onClick={()=>{
                        getJobByDocumentId(documentId)
                        }}
                        className='ui right aligned blue' name="refresh" loading={loading}></Icon></p>
                    </div>
                    { hasAccess(ALLOW_SYNCHRONIZATION) && <Button 
                            onClick={()=>pushToOTMClickHandler(documentId)}
                            loading={pushLoading} primary>
                            Allow Sync
                        </Button>
                    }
                    <Button icon onClick={() => modalOpen(false)}>
                        <Icon name='close' />
                    </Button>
                </div>
            </div>
            <div style={{ background: '#f1f5f9', width: '100%' }}>
                <div style={{ display: 'flex', paddingLeft: '30px', gap: 25, width: '100%' }}>
                    <div style={{ marginTop: '10px' }}><strong>BL/NO:</strong> {blNo}</div>
                    <div style={{ marginTop: '10px' }}><strong>Document No:</strong> {docNo}</div>
                    <div style={{ marginTop: '10px' }}><strong>Time Taken:</strong> {getDifference(jobData?.startTime, jobData?.endTime)}</div>
                </div>
            </div>
            <div className="page-body">
                {
                    loading 
                    ? <Loader active content="loading">Loading...</Loader>
                    :  <Table celled striped style={{ height: '10px' }}>
                    <Table.Body>
                        <Table.Row>
                            <Table.Cell style={{ textAlign: 'center' }}>
                                <Header as="h5">Qualifiers</Header>
                            </Table.Cell>
                            <Table.Cell style={{ textAlign: 'center' }}>
                                <Header as="h5">Tasks</Header>
                            </Table.Cell>
                            <Table.Cell style={{ textAlign: 'center' }}>
                                <Header as="h5">Status</Header>
                            </Table.Cell>
                        </Table.Row>
                        {tableArr.map((item, index) => {
                            let taskCount = 0;
                            return (
                                <Table.Row key={index}>
                                    <Table.Cell>{item.name}</Table.Cell>
                                    <Table.Cell>
                                        <div style={{ display: 'flex', gap: 10 }}>
                                            {item.tdArr.map((task) => {
                                                const taskKeys = Object.keys(task);
                                                if (taskKeys.length === 1 && taskKeys[0] !== 'status') {
                                                    const taskKey = taskKeys[0];
                                                    taskCount++;
                                                    return (
                                                        <Popup
                                                            key={taskKey}
                                                            content={<div>
                                                                <h5>{task[taskKey]?.title}</h5>
                                                                <p>{task[taskKey]?.text}</p>
                                                                {
                                                                    task[taskKey]?.payload && <p><strong>Payload:</strong> <br /> {task[taskKey]?.payload}</p>
                                                                }
                                                                {
                                                                    task[taskKey]?.response && <p><strong>Response:</strong> <br /> {task[taskKey]?.response}</p>
                                                                }
                                                            </div>}
                                                            trigger={
                                                                <div style={{ backgroundColor: 'white', display: 'flex', alignSelf: 'flex-start' }}>
                                                                    <div
                                                                        style={{
                                                                            border: '4px solid',
                                                                            borderColor:
                                                                                task[taskKey]?.status === 3 ? 'red' :
                                                                                    task[taskKey]?.status === 1 ? 'green' : '#ededed',
                                                                            width: 25,
                                                                            height: 25,
                                                                            borderRadius: 20,
                                                                            display: 'flex',
                                                                            justifyContent: 'center',
                                                                            alignItems: 'center',
                                                                        }}
                                                                    >
                                                                        <div style={{ fontSize: 13 }}>{taskCount}</div>
                                                                    </div>
                                                                </div>
                                                            }
                                                        />
                                                    );
                                                }
                                                return null;
                                            })}
                                        </div>
                                    </Table.Cell>
                                    <Table.Cell>
                                        <div
                                            style={{
                                                display: 'flex',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                            }}
                                        >
                                            <div style={{
                                                height: 15, width: 15, borderRadius: 10,
                                                backgroundColor: !item.tdArr.some(task => task?.status !== undefined)
                                                    ? '#ededed' : 'transparent'
                                            }}>
                                                {item.tdArr.some(task => task.status === 1) && (
                                                    <i className="green check icon"></i>
                                                )}
                                                {item.tdArr.some((task) => {
                                                    const taskKeys = Object.keys(task);
                                                    const taskKey = taskKeys[0];
                                                    return taskKeys[taskKey]?.status === 3 || task?.status === 0;
                                                }) && (
                                                    <i className="red times icon"></i>
                                                )}
                                            </div>
                                        </div>
                                    </Table.Cell>
                                </Table.Row>
                            )
                        })}
                    </Table.Body>
                </Table>
                }
            </div>
        </div>
    );
};

export default StatusView;
