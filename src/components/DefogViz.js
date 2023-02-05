import React, { useState, useEffect } from 'react';
import DataTable from './Table.js';

const DefogViz = ({ vizType, columns, data, isLoading }) => {
  const [tableData, setTableData] = useState([]);
  const [tableColumns, setTableColumns] = useState([]);
  
  useEffect(() => {
    let cols = columns.map((col) => {
      return {
        title: col,
        dataIndex: col,
        key: col,
      }
    });
    
    // data is an array of values
    let tableRows = data.map((row) => {
      let obj = {};
      row.forEach((val, i) => {
        obj[columns[i]] = val;
      })
      return obj;
    })

    setTableData(tableRows);
    setTableColumns(cols);
  }, [columns, data])

  return (
    <DataTable data={tableData} cols={tableColumns} loading={isLoading} />
  )
}

export default DefogViz