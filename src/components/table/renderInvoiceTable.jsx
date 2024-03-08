import { Button, Icon, Table } from "semantic-ui-react";
import { EditableMasterItem, EditableTextItem } from "../../modules/docupload/viewDocument";

export const renderInvoiceTable = ({aField, idx, documentId, thisSelectedSentence, clearSelection}) => {
    return <Table compact className='shipUnitTable'>
        <Table.Header>
            <Table.Row>
                <Table.HeaderCell></Table.HeaderCell>
                <Table.HeaderCell>Amount</Table.HeaderCell>
                <Table.HeaderCell>Description</Table.HeaderCell>
                <Table.HeaderCell>ProductCode</Table.HeaderCell>
                <Table.HeaderCell>Quantity</Table.HeaderCell>
                <Table.HeaderCell>Tax</Table.HeaderCell>
                <Table.HeaderCell>TaxRate</Table.HeaderCell>
                <Table.HeaderCell>UnitPrice</Table.HeaderCell>

            </Table.Row>
        </Table.Header>

        <Table.Body>

            {aField?.fieldValue ? aField?.fieldValue?.map((aRow, rowIndex) => {
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
                        {aRow.amount ? <Table.Cell>
                            <EditableTextItem compact={true} key={idx + "2"} field={{
                                fieldValue: aRow.amount.amount + " " + aRow.amount.currencyCode,
                                shipUnit: {
                                    itemId: aRow.itemId,
                                    attr: 'container'
                                }
                            }} documentId={documentId} thisSelectedSentence={thisSelectedSentence} clearSelection={clearSelection} />
                        </Table.Cell> : ''}
                        {aRow.description ? <Table.Cell>

                            <EditableMasterItem compact={true} key={idx + "4"} field={{
                                fieldValue: aRow.description,
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

                        </Table.Cell> : ""}
                        {aRow.productCode ? <Table.Cell>
                            <EditableTextItem compact={true} key={idx + "6"} field={{
                                fieldValue: aRow.productCode,
                                shipUnit: {
                                    itemId: aRow.itemId,
                                    attr: 'liner'
                                }
                            }} documentId={documentId} thisSelectedSentence={thisSelectedSentence} clearSelection={clearSelection} />

                        </Table.Cell> : ''}
                        {aRow.quantity ? <Table.Cell>
                            <EditableTextItem compact={true} key={idx + "8"} field={{
                                fieldValue: aRow.quantity,
                                shipUnit: {
                                    itemId: aRow.itemId,
                                    attr: 'shipper'
                                }
                            }} documentId={documentId} thisSelectedSentence={thisSelectedSentence} clearSelection={clearSelection} />
                        </Table.Cell> : ''}
                        {aRow.tax ? <Table.Cell>
                            <EditableTextItem compact={true} key={idx + "10"} field={{
                                fieldValue: aRow.tax.amount + " " + aRow.tax.currencyCode,
                                shipUnit: {
                                    itemId: aRow.itemId,
                                    attr: 'custom'
                                }
                            }} documentId={documentId} thisSelectedSentence={thisSelectedSentence} clearSelection={clearSelection} />
                        </Table.Cell> : ""}
                        {aRow.taxRate ? <Table.Cell>
                            <EditableMasterItem compact={true} key={idx + "12"} field={{
                                fieldValue: aRow.taxRate,
                                shipUnit: {
                                    itemId: aRow.itemId,
                                    attr: 'item'
                                },
                                field: {
                                    master: {
                                        collectionName: "itemMaster",
                                        search: 'text',
                                        value: "code"
                                    }
                                }
                            }} documentId={documentId} thisSelectedSentence={thisSelectedSentence} clearSelection={clearSelection} />
                        </Table.Cell> : ""}
                        {aRow.unitPrice ? <Table.Cell>
                            <EditableMasterItem compact={true} key={idx + "13"} field={{
                                fieldValue: aRow.unitPrice.amount + " " + aRow.unitPrice.currencyCode,
                                shipUnit: {
                                    itemId: aRow.itemId,
                                    attr: 'packageType'
                                },
                                field: {
                                    master: {
                                        collectionName: "packageTypeMaster",
                                        search: 'text',
                                        value: "code"
                                    }
                                }
                            }} documentId={documentId} thisSelectedSentence={thisSelectedSentence} clearSelection={clearSelection} />
                        </Table.Cell> : ""
                        }
                    </Table.Row>
                );
            }
            )
                : ''}
        </Table.Body>
    </Table>

}
