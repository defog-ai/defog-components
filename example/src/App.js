import React from 'react'

import { AskDefog } from 'defog-react'
import 'defog-react/dist/index.css'

const App = () => {
  return <AskDefog
    showQuery={true}
    maxHeight={500}
    apiEndpoint="https://test-defog-expenses-ikcpfh5tva-uc.a.run.app"
  />
}

export default App
