import React from 'react'

import { AskDefog, AskDefogChat } from 'defog-react'
import 'defog-react/dist/index.css'

const App = () => {
  return <AskDefogChat
    maxWidth={"100%"}
    maxHeight={"100%"}
    apiEndpoint="YOUR_API_ENDPOINT"
    buttonText={"Ask AI"}
  />
}

export default App
