import React from 'react'
import { useEffect } from 'react'
import { useRef } from 'react'
import { useState } from 'react'
import moment from 'moment'
import { DateRangePicker } from 'react-date-range'
import 'react-date-range/dist/styles.css'
import 'react-date-range/dist/theme/default.css'
import { Button,  Input, Modal } from 'semantic-ui-react'

const DateRange = ({setRangeProps,showDatePicker,setlabel}) => {
   
    const refOne = useRef(null)
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
    const [open, setOpen] = useState(false)
    const [selectedData, setSelectedData] = useState([])
    const [range, setRange] = useState([
        {
            startDate: firstDayOfMonth,
            endDate: lastDayOfMonth,
            key: 'selection'
        }
    ]);   

    const getDatesInRange = (startDate, endDate) => {
        const dates = [];
        const current = moment(startDate).startOf('day');
        const end = moment(endDate).startOf('day');
        do {
          dates.push({ date: current.format('YYYY-MM-DD') });
          current.add(1, 'day');
        }
        while (current.isSameOrBefore(end))
        return dates;
      };
    


    useEffect(() => {
      if (!open) {
        showDatePicker(false)
      }
    }, [open])
    
    const handlerFilterFn = () => {
        setRangeProps(selectedData)
        const datesInRange = getDatesInRange(range[0].startDate, range[0].endDate);
        setlabel(datesInRange)
    }
    useEffect(() => {
     handlerFilterFn()
    }, [])
    

    return (
        <div>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-evenly'}}>
            <label style={{alignItems:'center',fontWeight: 600,fontSize: '16px'}}>Filter</label>
            <Input
                value={`${moment(range[0].startDate).format("MM/DD/YYYY")} to ${moment(range[0].endDate).format("MM/DD/YYYY")}`}
                readOnly
                className="inputBox"
                onClick={() => setOpen(open => !open)}
                style={{width:"210px"}}
            />
            </div>
            <Modal
                onClose={() => setOpen(false)}
                onOpen={() => setOpen(true)}
                open={open}
            >
                <Modal.Header>Select Date</Modal.Header>

                <div ref={refOne} >
                    {open &&
                        <DateRangePicker
                            style={{ width: '674px' }}
                            onChange={(item) => {
                                setSelectedData([item.selection])
                                setRange([item.selection])
                                // setRangeProps([item.selection])
                                showDatePicker(true)
                            }}
                            editableDateInputs={true}
                            moveRangeOnFirstSelection={false}
                            ranges={range}
                            months={1}
                            direction="horizontal"
                            className="calendarElement"
                        />
                    }
                </div>
                <Modal.Actions>
                    <Button
                        content="Apply Filter"
                        onClick={() =>{
                            handlerFilterFn()
                            setOpen(false)} 
                        }
                        labelPosition='right'
                        icon='checkmark'
                    />
                </Modal.Actions>
            </Modal>

        </div>
    )
}

export default DateRange