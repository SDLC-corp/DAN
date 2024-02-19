import React from "react"
import { Dropdown, Input } from "semantic-ui-react"

const DateRangeFilter = ({
    shippingLineId, fromDate, toDate,fromDat, toDat
}) => {

    const maxDate = new Date().toISOString().split("T")[0];

    const onChangeShippingLineId = (e, data) => {
        shippingLineId(data.value)
    }

    return (
            <div >
                <label className='container-count-text'>Select Date Range (From - To)</label>
                <div style={{ display: 'flex', marginTop: 6 }}>
                    <div style={{ marginRight: 20 }}>
                        <Input type='date' onChange={(e) => {
                            fromDate(e.target.value)
                        }}
                            value={fromDat}
                            placeholder="From Date"
                        />
                    </div>
                    <div>
                        <Input type='date' onChange={(e) => {
                            toDate(e.target.value)
                        }}
                            value={toDat}
                            placeholder="To Date"
                            min={fromDat}
                            max={maxDate}
                        />
                    </div>
                </div>
            </div>
    )
}

export default DateRangeFilter
