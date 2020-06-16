import { HttpSuccessResponse, HttpErrorResponse, RequestConfig, HTTPInterceptor } from './http-types';
import { HttpEmitter } from './http-emitter';

export default class Http extends HttpEmitter {

  private baseUrl: string = '';

  private defaultContentType: string = 'application/json';

  public static instance: Http;

  private constructor () {
    super();
  }

  private makeQueryStr (params: undefined | RequestConfig['params']): string {

    if (params != undefined) {

      return Object.keys(params).reduce((acc, curr, i) => {

        const val = typeof params[curr] === 'string' ? params[curr] : '' + params[curr];
        
        return acc + `${i === 0 ? '?' : '&'}${curr}=${val}`;
      }, '');
    }

    return '';
  }

  private async handleResponse (response: Response) {

    const json = await response.json();

    return !response.ok
      ? JSON.stringify(new HttpErrorResponse(response, json))
      : JSON.stringify(new HttpSuccessResponse(response, json));
  }

  private handleError (error: string) {

    try {

      return JSON.parse(error);
    } catch (err) {

      return error;
    }
  }

  private async makeRequest (request: Request) {

    try {

      const response = await fetch(request),
            result = await this.handleResponse(response);
            
      return JSON.parse(result);
    } catch (error) {

      return this.handleError(error);
    }
  }

  public async get (url: string, args?: Partial<RequestConfig>): Promise<HttpSuccessResponse | HttpErrorResponse> {

    (this.listeners.isFetching as Function)(true);

    const requestConf = new Request(url + this.makeQueryStr(args?.params)),

          request = (this.listeners.intercept as HTTPInterceptor)(requestConf),
    
          response = await this.makeRequest(request);

    (this.listeners.isFetching as Function)(false);

    return response;
  }

  public async post (url: string, args?: Partial<RequestConfig>): Promise<HttpSuccessResponse | HttpErrorResponse> {

    (this.listeners.isFetching as Function)(true);

    const requestConf = new Request(url, {method: 'POST', body: JSON.stringify(args?.body)});

    args && args.headers
      ? Object.keys(args.headers).forEach(property => 
        requestConf.headers.append(property, (args.headers as {[key: string]: string})[property]))
      : requestConf.headers.append('Content-Type', this.defaultContentType)

    const request = (this.listeners.intercept as HTTPInterceptor)(requestConf);

    const response = await this.makeRequest(request);

    (this.listeners.isFetching as Function)(false);

    return response;
  }

  public static setBaseUrl (url: string): void {

    Http.instance.baseUrl = url;
  }

  public static getBaseUrl (path: string): string {

    return Http.instance.baseUrl + path + '/';
  }

  public static setDefaultContentType (contentType: string): void {
     
    Http.instance.defaultContentType = contentType;
  }

  public static getDefaultContentType (): string {

    return Http.instance.defaultContentType;
  }

  public static getInstance () {

    if (!Http.instance) {

      return Http.instance = new Http();
    }

    return Http.instance;
  }
}