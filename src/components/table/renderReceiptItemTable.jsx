import { Button, Icon, Table } from "semantic-ui-react";
import { EditableMasterItem, EditableTextItem } from "../../modules/docupload/viewDocument";

export const renderReceiptItemTable = ({aField, idx, documentId, thisSelectedSentence, clearSelection}) => {
    return <Table compact className='shipUnitTable'>
        <Table.Header>
            <Table.Row>
                <Table.HeaderCell></Table.HeaderCell>
                <Table.HeaderCell>Description</Table.HeaderCell>
                <Table.HeaderCell>Price</Table.HeaderCell>
                <Table.HeaderCell>Quantity</Table.HeaderCell>
                <Table.HeaderCell>Total Price</Table.HeaderCell>

            </Table.Row>
        </Table.Header>

        <Table.Body>

            {aField?.fieldValue ? aField?.fieldValue?.map((aRow, rowIndex) => {
                console.log(aRow);
                return (
                    <Table.Row key={aRow.itemId}>
                        <Table.Cell>
                            <Button
                                icon size='mini' compact
                                onClick={() => {
                                    removeRow(aRow.itemId)
                                }}>
                                <Icon name="trash alternate" />
                            </Button>
                        </Table.Cell>
                        <Table.Cell>
                            <EditableTextItem compact={true} key={idx + "2"} field={{
                                fieldValue: aRow.description ? aRow.description : '',
                                shipUnit: {
                                    itemId: aRow.itemId,
                                    attr: 'container'
                                }
                            }} documentId={documentId} thisSelectedSentence={thisSelectedSentence} clearSelection={clearSelection} />
                        </Table.Cell>
                        <Table.Cell>
                            <EditableTextItem compact={true} key={idx + "2"} field={{
                                fieldValue: aRow.price ? aRow.price : '',
                                shipUnit: {
                                    itemId: aRow.itemId,
                                    attr: 'container'
                                }
                            }} documentId={documentId} thisSelectedSentence={thisSelectedSentence} clearSelection={clearSelection} />
                        </Table.Cell>
                        <Table.Cell>
                            <EditableTextItem compact={true} key={idx + "2"} field={{
                                fieldValue: aRow.quantity ? aRow.quantity : '',
                                shipUnit: {
                                    itemId: aRow.itemId,
                                    attr: 'container'
                                }
                            }} documentId={documentId} thisSelectedSentence={thisSelectedSentence} clearSelection={clearSelection} />
                        </Table.Cell>
                        <Table.Cell>

                            <EditableMasterItem compact={true} key={idx + "4"} field={{
                                fieldValue: aRow.totalPrice ? aRow.totalPrice : '',
                                shipUnit: {
                                    itemId: aRow.itemId,
                                    attr: 'type'
                                },
                                field: {
                                    master: {
                                        collectionName: "container_iso_codes",
                                        search: 'text',
                                        value: "code"
                                    }
                                }
                            }} documentId={documentId} thisSelectedSentence={thisSelectedSentence} clearSelection={clearSelection} />

                        </Table.Cell>

                    </Table.Row>
                );
            }
            )
                : ''}
        </Table.Body>
    </Table>
}