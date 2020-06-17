# Simple Fetch Wrapper

Simple wrapper around fetch. 

For own purposes initially...

GET and POST 

### Use
```
npm i simple-fetch-wrapper
```

```
import http from 'simple-fetch-wrapper'
```

### Example

```
   import http, { setApiUrl, getApiUrl, setDefaultContentType } from 'simple-fetch-wrapper'

   setApiUrl(url: string);

   setDefaultContentType('application/json');

   const url = getApiUrl('/api/v1/endpoint');

   http.intercept(requestConfig => {

      console.log(requestConfig);

      requestConfig.headers.append('Authorization', `Bearer ${token}`);

      return requestConfig;
   })

   http.isFetching(status: boolean) => console.log(status));

   http.on('customEvent', (data) => console.log(data));

   http.emit('customEvent', data);

   http.detach('customEvent', Function);
   
   const response = await http.get(url, args?: {params: {key: value}})

   const response = await http.post(url, body: {key: value}, headers?: {key: value});
```

