# Simple Fetch Wrapper

Simple wrapper around fetch. 

For own purposes initially...

### Use
```npm i simple-fetch-wrapper```

```ìmport { http } from 'simple-fetch-wrapper'```

### Example

```
   import {http, setApiUrl, getApiUrl } from 'simple-fetch-wrapper'

   setApiUrl(url: string);

   const url = getApiUrl('/api/v1/endpoint');

   const response = await http.get(url, args?: {params: {key: value}})

   const response = await http.post(url, body: {key: value}, headers?: {key: value});
```
