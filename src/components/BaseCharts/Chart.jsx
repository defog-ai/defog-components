import React from 'react'
import BaseChart from './BaseChart.jsx'

const Chart = ((props) => {
  return (
    <BaseChart 
      constructorType={"stockChart"}
      options={props.options}
      annotate={props.annotate}
    />
  )
})

Chart.displayName = 'Chart';

export default Chart;