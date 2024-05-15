import React from 'react';
import PropTypes from 'prop-types';

const CustomTable = ({ columns, data, maxHeight }) => {
  return (
    <div className="custom-table-container" style={{ maxHeight: `${maxHeight}px` }}>
      <table className="min-w-full">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key} className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                {column.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white">
          {data.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {columns.map((column) => (
                <td key={column.key} className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                  {row[column.dataIndex]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

CustomTable.propTypes = {
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      dataIndex: PropTypes.string.isRequired,
    })
  ).isRequired,
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  maxHeight: PropTypes.number,
};

CustomTable.defaultProps = {
  maxHeight: 300,
};

export default CustomTable;
