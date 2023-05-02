import React from 'react'

import { AskDefogChat } from 'defog-react'
// import 'defog-react/dist/index.css'

const App = () => {
  return <AskDefogChat
    maxWidth={"100%"}
    maxHeight={"100%"}
    apiEndpoint="http://127.0.0.1:8000/generate_query_chat"
    buttonText={"Ask AI"}
  />
}

export default App
