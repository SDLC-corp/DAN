import React from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
    Breadcrumb,
    Button,
    Grid,
    Header,
    Icon,
    Input,
    Label,
    Modal,
    Pagination,
    Sidebar,
    Table,
} from 'semantic-ui-react';
import { apiGET, apiPOST } from '../../utils/apiHelper';
import { useEffect } from 'react';
import { useState, useRef } from 'react';
import { Document, Page } from 'react-pdf';
import { alertError, alertSuccess } from '../../utils/alerts';
import moment from 'moment';
import ModalDocument from './modalDocument';
import ReuploadDocument from './reuploadDocument';
// import file from './MBL_EBKG05619941.pdf'
const sections = [
    { key: 'Dashboard', content: 'Dashboard', link: true, to: '/dashboard' },
    {
        key: 'Documents List',
        content: 'Documents List',
        link: true,
        to: '/dashboard/document-list',
    },
    { key: 'Documents View', content: 'Documents View', active: true },
];
export default function ViewDocument() {
    let { id } = useParams();
    const [docObj, setDocObj] = useState({});
    const [pushLoading, setPushLoading] = useState(false);
    const [extractLoading, setExtractLoading] = useState(false);
    const [visible, setVisible] = useState(false);
    const navigate = useNavigate();
    const getData = async (id) => {
        let data = await apiGET('/v1/documents/' + id);
        if (data.status == '200') {
            const doc = data.data.data;
            setDocObj(doc);
        }
    };

    const pushToOTMClickHandler = async () => {
        if (pushLoading) return;

        setPushLoading(true);
        let res = await apiPOST('/v1/job', { documentId: id });
        console.log('pushToOTMClickHandler ::', res);
        setPushLoading(false);

        if (res.status == '200') {
            getData(id);
            alertSuccess(
                "The 'Push to ERP' process has been successfully initiated. To view its status, please navigate to the 'Jobs' page."
            );
        } else {
            alertError(res?.data?.data || 'Something went wring');
        }
    };

    const extract = async () => {
        if (pushLoading) return;

        setExtractLoading(true);
        let res = await apiPOST('/v1/documents/processExtractedFields/' + id);
        console.log('extractLoading ::', res);
        setExtractLoading(false);

        if (res.status == '200') {
            alertSuccess('Extraction Done');
            getData(id);
        } else {
            alertError(res?.data?.data || 'Something went wring');
        }
    };

    useEffect(() => {
        getData(id);
    }, []);

    const getPercentage = (fieldsAndValues) => {
        let count = 0;
        for (let i = 0; i < fieldsAndValues?.length; i++) {
            if (fieldsAndValues[i]?.fieldValue != null) {
                count = count + 1;
            }
        }
        if (count && (count / fieldsAndValues?.length) * 100) {
            return `${((count / fieldsAndValues?.length) * 100).toFixed()}%`;
        } else {
            return `00%`;
        }
    };

    const getRemainingFileds = (fieldsAndValues) => {
        let count = 0;
        for (let i = 0; i < fieldsAndValues?.length; i++) {
            if (fieldsAndValues[i]?.fieldValue != null) {
                count = count + 1;
            }
        }
        return `${count + '/' + fieldsAndValues?.length}`;
    };

    return (
        <Sidebar.Pushable>
            <Sidebar
                style={{
                    width: 800,
                }}
                as={'div'}
                animation="overlay"
                icon="labeled"
                direction="right"
                onHide={() => setVisible(false)}
                onHidden={() => navigate(`/dashboard/document-list/view/${id}`)}
                vertical={'vertical'}
                visible={visible}>
                {visible && (
                    <ReuploadDocument
                        visible={visible}
                        setVisible={setVisible}
                        getAllData={getData}
                    />
                )}
            </Sidebar>
            <Sidebar.Pusher dimmed={visible} className="fadeIn">
                <div className="page-header">
                    <div>
                        {/* <Breadcrumb icon="right angle" sections={sections} /> */}
                        <Breadcrumb icon="right angle">
                            {sections.map((section, index) => (
                                <span key={section.key}>
                                    {section.to ? (
                                        <Link to={section.to}>
                                            <Breadcrumb.Section
                                                active={section.active}>
                                                {section.content}
                                            </Breadcrumb.Section>
                                        </Link>
                                    ) : (
                                        <Breadcrumb.Section
                                            active={section.active}>
                                            {section.content}
                                        </Breadcrumb.Section>
                                    )}
                                    {/* {index < sections.length - 1 && <Breadcrumb.Divider>{">"}</Breadcrumb.Divider>} */}
                                    {index < sections.length - 1 && (
                                        <Icon
                                            name="right angle"
                                            color="grey"
                                            size="small"
                                            style={{ marginTop: 6, margin: 4 }}
                                        />
                                    )}
                                </span>
                            ))}
                        </Breadcrumb>
                        <div className="header-text">View Document</div>
                        <div className="sub-text">Verify Extracted fields</div>
                    </div>
                    <div className="showFormat">
                        <div>
                            <p style={{ marginBottom: 5 }}>
                                <strong>Sync With OTM</strong>
                            </p>
                            {docObj?.syncWithOtm ? (
                                <div>
                                    <p>YES</p>
                                    {moment(docObj?.lastSyncTime).format(
                                        'DD/MM/YYYY H:MM a'
                                    )}
                                </div>
                            ) : (
                                <div style={{ marginBottom: 20 }}>
                                    <p>NO</p>
                                </div>
                            )}
                        </div>
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                width: '35%',
                            }}>
                            <p style={{ marginBottom: 5 }}>
                                <strong>Extraction</strong>
                            </p>
                            {getPercentage(docObj.fieldsAndValues)}
                            <p>{getRemainingFileds(docObj.fieldsAndValues)}</p>
                        </div>
                    </div>
                    <div className="page-header-actions">
                        <Button
                            style={{ height: '3rem' }}
                            onClick={() => {
                                navigate(
                                    '/dashboard/document-list/reupload/' + id
                                );
                                setVisible(true);
                            }}>
                            Reupload
                        </Button>
                        <Button
                            style={{ height: '3rem' }}
                            onClick={extract}
                            loading={extractLoading}>
                            Extract
                        </Button>
                        <Button
                            style={{ height: '3rem', width: '150px' }}
                            onClick={pushToOTMClickHandler}
                            loading={pushLoading}
                            primary>
                            Push To ERP
                        </Button>
                    </div>
                </div>
                <div
                    className="page-body"
                    style={{
                        justifyContent: 'space-between',
                        height: '80vh',
                        overflowY: 'scroll',
                        overflowX : "hidden",
                        width :"100%",
                        padding: 0,
                        backgroundColor: '#efefef',
                    }}>
                    <DocViewer url={docObj.documentUrl} data={docObj} />
                    {/* <FieldsList documentId={id} extractedData={docObj.extractedData} /> */}
                    <FieldsAndValuesCmp
                        documentId={id}
                        extractedData={docObj.extractedData}
                        fieldsAndValues={docObj.fieldsAndValues}
                    />
                </div>
            </Sidebar.Pusher>
        </Sidebar.Pushable>
    );
}
function FieldCard({ value, confidence, idx, keyLabel, documentId }) {
    const [loading, setLoading] = useState(false);
    const [_value, set_value] = useState(value);

    const updateField = async (documentId, data) => {
        const url = `/v1/documents/update-field/${documentId}`;

        setLoading(true);
        const response = await apiPOST(url, data);
        setLoading(false);
        if (response.status == '200') {
            alertSuccess('Field Updated');
        } else {
            alertError(response.message || response.data.data);
        }
    };

    const updateFieldBtnClickHandler = () => {
        updateField(documentId, { valueString: _value, key: keyLabel });
    };

    return (
        <div className="field-card">
            <div className="flex justify-between">
                <div className="field-key">
                    <span className="field-count">{idx + 1}</span> {keyLabel}:
                </div>
                <div>
                    Confidence: <span className="text-bold">{confidence}</span>
                </div>
            </div>
            <div className="field-value">
                <div className="ui action input" style={{ width: '100%' }}>
                    <input
                        value={_value || ''}
                        onChange={(e) => set_value(e.target.value)}
                        type="text"
                        placeholder="Search..."
                    />
                    <Button
                        onClick={updateFieldBtnClickHandler}
                        loading={loading}>
                        Save
                    </Button>
                </div>

                {/* <Input 
      loading={loading} 
      style={{width: '100%'}} 
      value={_value} 
      onA
      action='Save'
    /> */}
            </div>
        </div>
    );
}

function FieldsAndValuesCmp({
    fieldsAndValues = [],
    extractedData = {},
    documentId,
}) {
    console.log('fieldsAndValues', fieldsAndValues);
    console.log('extractedData', extractedData);
    const { documents = [{}], pages, tables } = extractedData;
    const [search, setSearch] = useState('');

    const { fields, confidence } = documents[0];

    if (!fields) return;

    let keysArr = Object.keys(fields);
    const regex = new RegExp(`^${search}`, 'i');

    if (search) keysArr = keysArr.filter((fName) => regex.test(fName));

    /* Adding extra padding at bottom */
    fieldsAndValues = [...fieldsAndValues, { displayName: '', fieldValue: '' }];
    return (
        <div className="fields-container">
            <Input
                autoComplete="new-password"
                placeholder="Search Field Name"
                type="text"
                style={{ width: '96%', margin: 8 }}
                onChange={(e, { value }) => setSearch(value)}
                value={search}
            />
            <table className="ui definition table">
                <tbody>
                    {fieldsAndValues.length ? (
                        fieldsAndValues.map((aField, idx) => {
                            return aField['displayName'] ==
                                'Ship Unit Table' ? (
                                <tr>
                                    <td className="two wide column">
                                        {aField?.displayName}
                                    </td>
                                    <td>
                                        <Table>
                                            <Table.Header>
                                                <Table.Row>
                                                    <Table.HeaderCell>
                                                        Container
                                                    </Table.HeaderCell>
                                                    <Table.HeaderCell>
                                                        Type
                                                    </Table.HeaderCell>
                                                    <Table.HeaderCell>
                                                        Weight
                                                    </Table.HeaderCell>
                                                    <Table.HeaderCell>
                                                        UOM
                                                    </Table.HeaderCell>
                                                    <Table.HeaderCell>
                                                        SealNo
                                                    </Table.HeaderCell>
                                                </Table.Row>
                                            </Table.Header>

                                            <Table.Body>
                                                {aField.fieldValue?.length ? (
                                                    aField.fieldValue?.map(
                                                        (aRow) => {
                                                            return (
                                                                <Table.Row>
                                                                    <Table.Cell>
                                                                        {
                                                                            aRow.container
                                                                        }
                                                                    </Table.Cell>
                                                                    <Table.Cell>
                                                                        {
                                                                            aRow.type
                                                                        }
                                                                    </Table.Cell>
                                                                    <Table.Cell>
                                                                        {
                                                                            aRow.weight
                                                                        }
                                                                    </Table.Cell>
                                                                    <Table.Cell>
                                                                        {
                                                                            aRow.uom
                                                                        }
                                                                    </Table.Cell>
                                                                    <Table.Cell>
                                                                        {
                                                                            aRow.sealNo
                                                                        }
                                                                    </Table.Cell>
                                                                </Table.Row>
                                                            );
                                                        }
                                                    )
                                                ) : (
                                                    <div>nothing found</div>
                                                )}
                                            </Table.Body>
                                        </Table>
                                    </td>
                                </tr>
                            ) : (
                                <tr>
                                    <td className="two wide column">
                                        {aField?.displayName}
                                    </td>
                                    <td>{aField?.fieldValue?.toString()}</td>
                                </tr>
                            );
                        })
                    ) : (
                        <div style={{ marginLeft: 8 }}>
                            No matching fields found
                        </div>
                    )}
                </tbody>
            </table>
        </div>
    );
}

function FieldsList({ extractedData = {}, documentId }) {
    const { documents = [{}], pages, tables } = extractedData;
    const [search, setSearch] = useState('');

    const { fields, confidence } = documents[0];

    if (!fields) return;

    let keysArr = Object.keys(fields);
    const regex = new RegExp(`^${search}`, 'i');

    if (search) keysArr = keysArr.filter((fName) => regex.test(fName));

    return (
        <div className="fields-container">
            <Input
                autoComplete="new-password"
                placeholder="Search Field Name"
                type="text"
                style={{ width: '96%', margin: 8 }}
                onChange={(e, { value }) => setSearch(value)}
                value={search}
            />
            {keysArr.length ? (
                keysArr.map((key, idx) => {
                    return (
                        <FieldCard
                            documentId={documentId}
                            idx={idx}
                            key={key + idx}
                            keyLabel={key}
                            confidence={fields[key]?.confidence}
                            value={fields[key]?.value}
                        />
                    );
                })
            ) : (
                <div style={{ marginLeft: 8 }}>No matching fields found</div>
            )}
        </div>
    );
}

function DocViewer({ data }) {
    const [numPages, setNumPages] = useState(1);
    const [pageNumber, setPageNumber] = useState(1);
    const [modalOpen, setModalOpen] = useState(false);
    const [varA, setVarA] = useState('');
    let selectedWord = [];
    let lastSelectedIndex;

    const ref = useRef();
    // this.file = { url };

    let thisUrl = {
        url:
            data?.documentUrl ??
            'https://artyfactassests.s3.ap-south-1.amazonaws.com/uploads/1695729775225/MSDU5541899.pdf',
    };

    function onDocumentLoadSuccess({ numPages }) {
        setNumPages(numPages);
    }

    function clearCanvas() {
        setVarA(new Date());
        selectedWord = [];
    }
    function onRenderSuccess() {
        const canvas = ref.current;
        const context = canvas.getContext('2d');

        let multiplier = (canvas.parentElement.clientWidth / data.extractedData.pages[pageNumber - 1].width) * (canvas.width/canvas.parentElement.clientWidth);

        var dragging = false;

        function getCanvasCoordinates(event) {
            var x = event.clientX - canvas.getBoundingClientRect().left,
                y = event.clientY - canvas.getBoundingClientRect().top;
            return { x: x, y: y };
        }

        function dragStart(event) {
            dragging = true;
            // dragStartLocation = getCanvasCoordinates(event);
        }

        function pointIsInPoly(p, polygon) {
            if (
                p.x > polygon[0].x * multiplier/(canvas.width/canvas.parentElement.clientWidth) &&
                p.x < polygon[2].x * multiplier/(canvas.width/canvas.parentElement.clientWidth) &&
                p.y > polygon[0].y * multiplier/(canvas.width/canvas.parentElement.clientWidth) &&
                p.y < polygon[2].y * multiplier/(canvas.width/canvas.parentElement.clientWidth)
            ) {
                return true;
            } else {
                return false;
            }
        }

        function drag(event) {
            var position;
            if (dragging === true) {
                position = getCanvasCoordinates(event);
                console.log('dragging', position);

                if (
                    data &&
                    data.extractedData &&
                    data.extractedData.pages[pageNumber - 1]
                ) {
                    let aPage = data.extractedData.pages[pageNumber - 1];
                    for (let w = 0; w < aPage.words.length; w++) {
                        const aWord = aPage.words[w];
                        if (pointIsInPoly(position, aWord.polygon)) {
                            if(lastSelectedIndex != w){
                                lastSelectedIndex = w;
                            }else{
                                break;
                            }

                            let isWordSelected = false;
                            for (let a = 0; a < selectedWord.length; a++) {
                                const aSelectedWord = selectedWord[a];
                                if (aSelectedWord === w) {
                                    isWordSelected = true;
                                    console.log('found in selected Arr');
                                    break;
                                }
                            }

                            if (!isWordSelected) {
                                selectedWord = [...selectedWord, w];
                                context.lineWidth = 1;  
                                context.strokeStyle = '#ff0000';
                                context.beginPath();
                                context.moveTo(
                                    aWord.polygon[0].x * multiplier,
                                    aWord.polygon[0].y * multiplier
                                );
                                context.lineTo(
                                    aWord.polygon[1].x * multiplier,
                                    aWord.polygon[1].y * multiplier
                                );
                                context.lineTo(
                                    aWord.polygon[2].x * multiplier,
                                    aWord.polygon[2].y * multiplier
                                );
                                context.lineTo(
                                    aWord.polygon[3].x * multiplier,
                                    aWord.polygon[3].y * multiplier
                                );
                                context.closePath();
                                context.stroke();
                            }else{
                                selectedWord = selectedWord.splice(w, 1);
                                context.lineWidth = 1;  
                                context.strokeStyle = '#8eb3ff';
                                context.beginPath();
                                context.moveTo(
                                    aWord.polygon[0].x * multiplier,
                                    aWord.polygon[0].y * multiplier
                                );
                                context.lineTo(
                                    aWord.polygon[1].x * multiplier,
                                    aWord.polygon[1].y * multiplier
                                );
                                context.lineTo(
                                    aWord.polygon[2].x * multiplier,
                                    aWord.polygon[2].y * multiplier
                                );
                                context.lineTo(
                                    aWord.polygon[3].x * multiplier,
                                    aWord.polygon[3].y * multiplier
                                );
                                context.closePath();
                                context.stroke();
                            }
                            break;
                        }
                    }
                }
            }
        }

        function dragStop(event) {
            dragging = false;
            lastSelectedIndex = undefined;
            var position = getCanvasCoordinates(event);
        }

        if (
            data &&
            data.extractedData &&
            data.extractedData.pages[pageNumber - 1]
        ) {
            let aPage = data.extractedData.pages[pageNumber - 1];

            for (let w = 0; w < aPage.words.length; w++) {
                const aWord = aPage.words[w];
                // context.fillStyle = '#8eb3ff17';
                context.lineWidth = 1;
                context.strokeStyle = '#8eb3ff';
                context.beginPath();
                context.moveTo(
                    aWord.polygon[0].x * multiplier,
                    aWord.polygon[0].y * multiplier
                );
                context.lineTo(
                    aWord.polygon[1].x * multiplier,
                    aWord.polygon[1].y * multiplier
                );
                context.lineTo(
                    aWord.polygon[2].x * multiplier,
                    aWord.polygon[2].y * multiplier
                );
                context.lineTo(
                    aWord.polygon[3].x * multiplier,
                    aWord.polygon[3].y * multiplier
                );
                
                context.closePath();
                // context.fill();
                context.stroke();
            }
        }

        canvas.addEventListener('mousedown', dragStart, false);
        canvas.addEventListener('mousemove', drag, false);
        canvas.addEventListener('mouseup', dragStop, false);
    }

    const goToPage = (page) => {
        setPageNumber(page);
    };

    return (
        <div className="doc-container">
            <div className="pagination" style={{ marginBottom: 12 }}>
                <div
                    style={{
                        marginTop: 8,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}>
                    <div>
                        <Pagination
                            firstItem={null}
                            lastItem={null}
                            pointing
                            secondary
                            activePage={pageNumber}
                            onPageChange={(e, { activePage }) => {
                                goToPage(activePage);
                            }}
                            totalPages={numPages}
                        />
                        <span style={{ marginLeft: 0 }}>
                            Page {pageNumber} of {numPages}
                        </span>
                    </div>
                    <div>
                        <Button
                            style={{ height: '3rem' }}
                            onClick={clearCanvas}>
                            Clear
                        </Button>
                    </div>
                </div>
            </div>
            <Document file={thisUrl} onLoadSuccess={onDocumentLoadSuccess}>
                <Page
                    pageNumber={pageNumber}
                    scale={1}
                    canvasRef={ref}
                    width={800}
                    renderAnnotationLayer={false}
                    renderTextLayer={false}
                    onRenderSuccess={onRenderSuccess}
                />
            </Document>
        </div>
    );
}
