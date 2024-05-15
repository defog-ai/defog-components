import React from 'react';
import PropTypes from 'prop-types';

const CustomButton = ({ children, onClick, className }) => {
  return (
    <button
      className={`px-4 py-2 bg-blue-500 hover:bg-blue-700 text-white font-bold ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

CustomButton.propTypes = {
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func,
  className: PropTypes.string
};

CustomButton.defaultProps = {
  onClick: () => {},
  className: ''
};

export default CustomButton;
