import React from "react";
import { Table } from "antd";

const DataTable = ({ data, cols, loading }) => {
  return (
    <Table
      dataSource={data}
      columns={cols}
      loading={loading}
      size={"large"}
      rowKey={"key"}
    />
  );
};

export default DataTable;
