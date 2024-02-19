import moment from 'moment'
import React from 'react'
import { Header, Modal, Table } from 'semantic-ui-react'

const ModalDocument = ({data,setModalOpen,modalOpen}) => {

    const getBlNo = (fieldsAndValues) => {
        if (fieldsAndValues) {
            let found = fieldsAndValues.filter(item => item.fieldName == 'bl_no')
            if (found[0]) return found[0].fieldValue
        }
        return ''
    }
    const getPercentage = (fieldsAndValues) => {
        let count = 0
        for (let i = 0; i < fieldsAndValues?.length; i++) {
            if ((fieldsAndValues[i]?.fieldValue) != null) {
                count = count + 1
            }
        }
        if (count && ((count / fieldsAndValues?.length) * 100)) {
            return `${((count / fieldsAndValues?.length) * 100).toFixed()}%`
        } else {
            return `00%`
        }
    }
    const getRemainingFileds = (fieldsAndValues) => {
        let count = 0
        for (let i = 0; i < fieldsAndValues?.length; i++) {
            if ((fieldsAndValues[i]?.fieldValue) != null) {
                count = count + 1
            }
        }
        return `${(count + '/' + fieldsAndValues?.length)}`
    }

  return  <Modal
                closeIcon
                onClose={() => setModalOpen(false)}
                onOpen={() => setModalOpen(true)}
                open={modalOpen}
            // trigger={documentsdata.length > 0 && !loading ? <Icon name="eye" size='large'></Icon> : null}
            >
                <Modal.Header>Document Details</Modal.Header>
                <Modal.Content>
                    <Table celled striped>
                        <Table.Body>
                            <Table.Row>
                                <Table.Cell >
                                    <Header as='h5'>Id</Header>
                                </Table.Cell>
                                <Table.Cell>{data?.seqId}</Table.Cell>
                            </Table.Row>
                            <Table.Row>
                                <Table.Cell >
                                    <Header as='h5'>BL Number</Header>
                                </Table.Cell>
                                <Table.Cell>{getBlNo(data?.fieldsAndValues)}</Table.Cell>
                            </Table.Row>
                            <Table.Row>
                                <Table.Cell >
                                    <Header as='h5'>Location</Header>
                                </Table.Cell>
                                <Table.Cell>{data?.domainName}</Table.Cell>
                            </Table.Row>
                            <Table.Row>
                                <Table.Cell >
                                    <Header as='h5'>Shipping Line</Header>
                                </Table.Cell>
                                <Table.Cell>{data?.shippingLine?.name}</Table.Cell>
                            </Table.Row>
                            <Table.Row>
                                <Table.Cell >
                                    <Header as='h5'>Document Number</Header>
                                </Table.Cell>
                                <Table.Cell>{data?.documentNo}</Table.Cell>
                            </Table.Row>
                            <Table.Row>
                                <Table.Cell >
                                    <Header as='h5'>Document Types</Header>
                                </Table.Cell>
                                <Table.Cell>{data?.documentType}</Table.Cell>
                            </Table.Row>
                            <Table.Row>
                                <Table.Cell >
                                    <Header as='h5'>Order Type</Header>
                                </Table.Cell>
                                <Table.Cell>{data?.orderType}</Table.Cell>
                            </Table.Row>
                            <Table.Row>
                                <Table.Cell >
                                    <Header as='h5'>Extraction </Header>
                                </Table.Cell>
                                <Table.Cell>{getPercentage(data.fieldsAndValues)}</Table.Cell>
                            </Table.Row>
                            <Table.Row>
                                <Table.Cell >
                                    <Header as='h5'>Extracted Fields</Header>
                                </Table.Cell>
                                <Table.Cell>{getRemainingFileds(data.fieldsAndValues)}</Table.Cell>
                            </Table.Row>
                            {/* <Table.Row>
                <Table.Cell >
                  <Header as='h5'>Document</Header>
                </Table.Cell>
                <Table.Cell>
                  <Button onClick={() => {
                    // onClickViewDocuments(data.documentUrl)
                    onClickViewDocuments(data)
                  }} size='mini'
                  >View Document</Button>
                </Table.Cell>
              </Table.Row> */}
                            <Table.Row>
                                <Table.Cell >
                                    <Header as='h5'>Uploaded By</Header>
                                </Table.Cell>
                                <Table.Cell>{data?.user?.name}</Table.Cell>
                            </Table.Row>
                            <Table.Row>
                                <Table.Cell >
                                    <Header as='h5'>Created On</Header>
                                </Table.Cell>
                                <Table.Cell>{moment(data?.createdAt).format('DD/MM/YYYY HH:MM a')}</Table.Cell>
                            </Table.Row>
                            <Table.Row>
                                <Table.Cell >
                                    <Header as='h5'>Updated On</Header>
                                </Table.Cell>
                                <Table.Cell>{moment(data?.updatedAt).format('DD/MM/YYYY HH:MM a')}</Table.Cell>
                            </Table.Row>
                        </Table.Body>
                    </Table>
                </Modal.Content>
            </Modal>
}
export default ModalDocument