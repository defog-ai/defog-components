import React from 'react';
import PropTypes from 'prop-types';

const CustomSearch = ({ value, autoFocus, onChange, onBlur, onSearch, loading, disabled }) => {
  return (
    <div className="flex items-center max-w-full">
      <input
        type="text"
        value={value}
        autoFocus={autoFocus}
        onChange={onChange}
        onBlur={onBlur}
        className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${disabled ? 'bg-gray-200' : ''}`}
        placeholder="Continue asking related questions"
        disabled={disabled}
      />
      <button
        className={`ml-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        onClick={() => onSearch(value)}
        disabled={loading || disabled}
      >
        {loading ? 'Loading...' : 'Ask Follow Up'}
      </button>
    </div>
  );
};

CustomSearch.propTypes = {
  value: PropTypes.string.isRequired,
  autoFocus: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
  onBlur: PropTypes.func,
  onSearch: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  disabled: PropTypes.bool
};

CustomSearch.defaultProps = {
  autoFocus: false,
  onBlur: null,
  loading: false,
  disabled: false
};

export default CustomSearch;
