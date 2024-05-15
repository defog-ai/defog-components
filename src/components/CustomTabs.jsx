import React from 'react';
import PropTypes from 'prop-types';

const CustomTabs = ({ tabs, activeTab, onTabChange }) => {
  return (
    <div className="flex flex-col">
      <div className="flex border-b">
        {tabs.map((tab, index) => (
          <button
            key={tab.key}
            className={`py-2 px-4 text-sm font-medium text-center ${
              activeTab === index
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-600 hover:text-blue-600 hover:border-blue-600'
            } focus:outline-none`}
            onClick={() => onTabChange(index)}
          >
            {tab.title}
          </button>
        ))}
      </div>
      <div className="py-4">
        {tabs.map((tab, index) => (
          <div key={tab.key} className={`${activeTab === index ? 'block' : 'hidden'}`}>
            {tab.component}
          </div>
        ))}
      </div>
    </div>
  );
};

CustomTabs.propTypes = {
  tabs: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      component: PropTypes.node.isRequired,
    })
  ).isRequired,
  activeTab: PropTypes.number,
  onTabChange: PropTypes.func.isRequired,
};

CustomTabs.defaultProps = {
  activeTab: 0,
};

export default CustomTabs;
