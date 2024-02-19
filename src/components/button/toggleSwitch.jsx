import React from "react"

const ToggleSwitch = ({
    onChangehandleVisibleStatus,
    visible
}) => {
    return (
        <div className="ui toggle checkbox small">
            <input type="checkbox" name="public" checked={visible} onChange={onChangehandleVisibleStatus} />
            <label></label>
        </div>
    )
}

export default ToggleSwitch
