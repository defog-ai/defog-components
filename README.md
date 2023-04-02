# defog-components

You can import our "standard" component like this

```
import { AskDefog } from "defog-components";
return <AskDefog
  apiEndpoint={"YOUR_API_ENDPOINT"}
  showQuery={true}
  maxHeight={600}
/>
```

You can import our "chat-styled" component like this

```
import { AskDefogChat } from 'defog-react'

const App = () => {
  return <AskDefogChat
    maxWidth={"100%"}
    maxHeight={"100%"}
    apiEndpoint="YOUR_API_ENDPOINT"
    buttonText={"Ask Defog"}
  />
}
```