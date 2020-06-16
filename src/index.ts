export interface RequestConfig {
  method?: string;
  headers?: {[key: string]: string} | undefined;
  mode?: any,
  cache?: any,
  body?: {[key: string]: any} | string;
  params?: {[key: string]: string | number} | undefined;
}

export type HTTPInterceptor = (config: Request) => Request;

export class HttpSuccessResponse {

  success!: boolean;

  status!: number;

  data!: any;

  constructor (response: Response, json: any) {

    this.success = response.ok;

    this.status = response.status;

    this.data = json
  }
}

export class HttpErrorResponse {

  success!: boolean;

  status!: number;

  statusText: string;

  constructor (response: Response, json: any) {

    this.success = response.ok;

    this.status = response.status;

    this.statusText = response.statusText ? response.statusText : json.error || '';
  }
}

class HttpEmitter {

  protected listeners: {[key: string]: Function[] | (HTTPInterceptor | Function)} = {};

  protected emit (event: string, args: any) {

    return this.listeners[event].length > 0
      ? (this.listeners[event] as Function[]).forEach(f => f(args))
      : false;
  }

  public constructor() {}
  
  public intercept (fn: HTTPInterceptor) {

    return this.listeners.intercept = fn;
  }

  public isFetching (fn: (status: boolean) => boolean) {

    return this.listeners.isFetching = fn;
  }

  public on (event: string, fn: Function) {

    this.listeners[event] = this.listeners[event] || [];

    (this.listeners[event] as Function[]).push(fn);

    return this;
  }

  public detach (event: string, fn: Function) {

    const index = (this.listeners[event] as Function[]).indexOf(fn);
      
    if (index > -1) {

      (this.listeners[event] as Function[]).splice(index, 1);
    }
  }
}

class Http extends HttpEmitter {

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

export default Http.getInstance();

export const setApiUrl = (url: string): void => Http.setBaseUrl(url);

export const getApiUrl = (path: string): string => Http.getBaseUrl(path);

export const setDefaultContentType = (contentType: string): void => Http.setDefaultContentType(contentType);

export const getDefaultContentType = (): string => Http.getDefaultContentType(); 