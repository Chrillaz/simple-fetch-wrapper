import { HTTPListeners, HTTPInterceptor, HTTPRequestInit, HTTPRequestObject } from '../types';

export interface HttpRequestInit extends HTTPRequestInit {};

export class HttpRequestInit {
  
  constructor (listeners: HTTPListeners, url: string, init?: HTTPRequestObject) {

<<<<<<< HEAD
=======
    console.log(init);
>>>>>>> 434116d1a11d19d645aa396fc924fbcd5c52f14e
    if (init) {

      this.headers = new Headers();

      Object.assign(this, {...init});

      if (listeners.interceptor != undefined) {

        const modifyedObject = (listeners.interceptor as HTTPInterceptor)(this);

        Object.assign(this, modifyedObject);
      }

      if (this.params != undefined) {

<<<<<<< HEAD
        const params = {...this.params};

        this.url = url +  Object.keys(this.params).reduce((acc, curr, index) => 
          acc + `${index === 0 ? '?' : '&'}${curr}=${'' + params[curr]}`, '');
=======
        const arr = this.params;

        this.url = url +  Object.keys(this.params).reduce((acc, curr, index) => 
          acc + `${index == 0 ? '?' : '&'}${curr}=${'' + arr[curr]}`);
>>>>>>> 434116d1a11d19d645aa396fc924fbcd5c52f14e
      }

      if (this.body != undefined) {

        this.body = JSON.stringify(this.body);
      }

      for (const property in this.headers) {
        
        this.headers[property] = this.headers[property];
      }
    }
  }
}
