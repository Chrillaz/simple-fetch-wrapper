# Simple Fetch Wrapper

Simple wrapper around fetch. 

For own purposes initially...

### Use
```
npm i simple-fetch-wrapper
```

```
import http from '../../node_modules/simple-fetch-wrapper/dist/index'
```

### Example

```
   import http, { setApiUrl, getApiUrl } from '../../node_modules/simple-fetch-wrapper/dist/index'

   setApiUrl(url: string);

   const url = getApiUrl('/api/v1/endpoint');

   http.intercept(requestConfig => {

      console.log(requestConfig);

      return requestConfig;
   })

   http.on('loading', (status: boolean) => console.log(status));

   http.detach('loading', Function);
   
   const response = await http.get(url, args?: {params: {key: value}})

   const response = await http.post(url, body: {key: value}, headers?: {key: value});
```
