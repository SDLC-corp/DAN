import React from 'react'

const ShippingLineActionButtons = ({
    onClickEditButton,
    onClickViewButton,
    onClickDeleteButton
}) => {



    return (
        <div className='flex gap-2'>
            <button className="ui blue icon button basic" onClick={onClickEditButton}>
                <i className="edit icon"></i>
            </button>

            {
                onClickDeleteButton && <button className="ui red icon button basic" onClick={onClickDeleteButton}>
                    <i className="trash icon"></i>
                </button>
            }
            <button className="ui icon button basic" style={{ display: "none" }} onClick={onClickViewButton}>
                <i className="eye icon"></i>
            </button>
        </div>
    )


}

export default ShippingLineActionButtons