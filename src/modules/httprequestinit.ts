import { HTTPListeners, HTTPInterceptor, HTTPRequestInit, HTTPRequestObject } from '../types';

export interface HttpRequestInit extends HTTPRequestInit {};

export class HttpRequestInit {
  
  constructor (listeners: HTTPListeners, url: string, init?: HTTPRequestObject) {

    if (init) {

      this.headers = new Headers();

      Object.assign(this, {...init});

      if (listeners.interceptor != undefined) {

        const modifyedObject = (listeners.interceptor as HTTPInterceptor)(this);

        Object.assign(this, modifyedObject);
      }

      if (this.params != undefined) {

        const params = {...this.params};

        this.url = url +  Object.keys(this.params).reduce((acc, curr, index) => 
          acc + `${index === 0 ? '?' : '&'}${curr}=${'' + params[curr]}`, '');
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
