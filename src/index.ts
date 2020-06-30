import { HttpResponse } from './modules/httpresponse'
import { HttpRequestInit } from './modules/httprequestinit'
import { HttpEmitter } from './modules/httpemitter'
import { HTTPResponseObject, HTTPRequestInit, HTTPRequestObject } from './types';

export class Http extends HttpEmitter {

  baseUrl = '';

  defaultContentType = 'application/json';

  static instance: Http;

  private constructor () {

    super();
  }

  setBaseUrl (url: string): void {

    this.baseUrl = url;
  }

  getBaseUrl (extention?: string): string {

    if (extention != undefined) {

      return this.baseUrl.charAt(this.baseUrl.length - 1) === '/'
        ? this.baseUrl + extention
        : this.baseUrl + '/' + extention;
    }

    return this.baseUrl;
  }

  setDefaultContentType (type: string): void {

    this.defaultContentType = type;
  }

  getDefaultContentType (): string {

    return this.defaultContentType;
  }

  async makeRequest (request: Omit<HTTPRequestInit, 'params'>): Promise<HTTPResponseObject> {
    
    const {url, ...rest} = request as Omit<HTTPRequestInit, 'params'>;

    try {
      
      const response = await fetch(url, rest),
            json = await response.json();

      return JSON.parse(JSON.stringify(new HttpResponse(response, json)));
    } catch (error) {

      try {

        return JSON.parse(error);
      } catch (err) {
  
        return error;
      }
    } 
  }

  async get (url: string, args = {} as HTTPRequestObject): Promise<HTTPResponseObject> {
    
    return await this.makeRequest(new HttpRequestInit(this.listeners, url, {...args, method: 'GET'}));
  }

  async post (url: string, args = {} as HTTPRequestObject): Promise<HTTPResponseObject> {
  
    return await this.makeRequest(new HttpRequestInit(this.listeners, url, {...args, method: 'POST'}));
  }

  static getInstance (): Http {

    return !Http.instance
      ? Http.instance = new Http()
      : Http.instance;
  }
}

export default Http.getInstance();