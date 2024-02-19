import React, { useEffect, useState } from 'react';
import { Visibility } from 'semantic-ui-react';
import DataTable from 'react-data-table-component';

function writeStyles(styleName, cssText) {
  if (!document.getElementById('styles-div')) return;

  var styleElement = document.getElementById(styleName);
  if (styleElement)
    document.getElementById('styles-div').removeChild(styleElement);
  styleElement = document.createElement('style');
  styleElement.type = 'text/css';
  styleElement.id = styleName;
  styleElement.innerHTML = cssText;
  document.getElementById('styles-div').appendChild(styleElement);
}

function TableWrapper(props) {
  // let {columns, data } = props;
  let handleUpdate = (e, data) => {
    let rootElementHeight = window.innerHeight - 232;
    setCurrentDivHeight(rootElementHeight);
  };

  let [currentDivHeight, setCurrentDivHeight] = useState();

  useEffect(() => {
    var cssText =
      '#tableParent > div:first-child { height : ' + currentDivHeight + 'px; }';
    writeStyles('styles_js', cssText);
    console.log('currentDivHeight : ', currentDivHeight);
  }, [currentDivHeight]);

  useEffect(() => {
    let rootElementHeight = window.innerHeight - 232;
    setCurrentDivHeight(rootElementHeight);
  }, []);

  return (
    <Visibility
      onUpdate={handleUpdate}
      id="tableParent"
      style={{ background: '#f1f5f9', flex: 1 }}>
      <DataTable
        direction="auto"
        fixedHeader
        fixedHeaderScrollHeight={currentDivHeight + 'px'}
        highlightOnHover
        noContextMenu
        pagination={props.role != "admin" ? true : false}
        pointerOnHover
        responsive
        subHeaderAlign="right"
        subHeaderWrap
        paginationRowsPerPageOptions={
          [10, 30,50, 100]
        }
        selectableRowsHighlight
        {...props}
      />
    </Visibility>
  );

}

export default TableWrapper;
