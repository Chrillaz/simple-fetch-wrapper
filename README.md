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

### API Examples

```
   import http from 'simple-fetch-wrapper'

   http.setBaseUrl(url: string);

   http.setDefaultContentType('application/json');

   const url = http.getBaseUrl('/api/v1/endpoint');

   http.intercept(requestConfig => {

      console.log(requestConfig);

      requestConfig.headers.append('Authorization', `Bearer ${token}`);

      return requestConfig;
   })

   http.isFetching(status: boolean) => console.log(status));

   http.on('customEvent', (data) => console.log(data));

   http.emit('customEvent', data);

   http.detach('customEvent', Function);
```

### Supports GET and POST

```
   const args = {
      params: {post: 71}
   };

   const response = await http.get(url, args)


   const args = {
      headers: {'Content-Type': 'application/json'},
      body: {name: 'Some name', id: 1}
   };

   const response = await http.post(url, args);
```

### Args

| Properties   | Type                     |
|--------------|:------------------------:|
| headers      | {[key: string]: string}  |
| body         | {[key: string]: any}     |
| params       | {[key: string]: any}     |

