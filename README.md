# defog-components

You can install `defog-components` with `npm i defog-components`

![Defog Demo GIF](defog-rlhf.gif)

You can import our chat-styled component like this. Toggle `debugMode` to `true`, where you can look at the actual SQL queries generated to answer your question + give feedback on them.

Debug mode should only be used for local testing, in order to prevent leaking of your API key.

```
import { AskDefogChat } from 'defog-components'

const App = () => {
  return <AskDefogChat
    maxWidth={"100%"}
    maxHeight={"100%"}
    apiEndpoint="YOUR_API_ENDPOINT"
    buttonText={"Ask Defog"}
    // debugMode={true}
  />
}
```

## Local Testing

To test locally:

1. Run `npm start` in the root directory
2. While a process is running in the root directory, go to the `example` directory and run `npm start` there as well
