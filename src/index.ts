export interface RequestConfig {
  method?: string;
  headers?: {[key: string]: string} | Headers;
  mode?: any,
  cache?: any,
  body?: {[key: string]: any} | string;
  params?: {[key: string]: string | number} | undefined;
}

export type HTTPInterceptor = (config: HttpRequestInit) => HttpRequestInit;

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

  public listeners: {[key: string]: Function[] | (HTTPInterceptor | Function)} = {};
  
  public emit (event: string, args: any) {

    return this.listeners[event].length > 0
      ? (this.listeners[event] as Function[]).forEach(f => f(args))
      : false;
  }

  public constructor() {}
  
  public intercept (fn: HTTPInterceptor) {

    return this.listeners.interceptor = fn;
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

export class Http extends HttpEmitter {

  private baseUrl: string = '';

  private defaultContentType: string = 'application/json';

  public static instance: Http;

  protected constructor () {
    super();
  }

  public async handleResponse (response: Response) {

    const json = await response.json();

    return !response.ok
      ? JSON.stringify(new HttpErrorResponse(response, json))
      : JSON.stringify(new HttpSuccessResponse(response, json));
  }

  public handleError (error: string) {

    try {

      return JSON.parse(error);
    } catch (err) {

      return error;
    }
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

interface RequestParams {
  instance: Http;
  request: HttpRequestInit;
}

type HttpRequest = (url: string, args: Partial<RequestConfig>) => Promise<HttpSuccessResponse | HttpErrorResponse>;

const makeRequest = async (params: RequestParams): Promise<HttpSuccessResponse | HttpErrorResponse> => {

  try {

    const response = await fetch(new Request(params.request.url, params.request)),
          result = await params.instance.handleResponse(response);
          
    return JSON.parse(result);
  } catch (error) {

    return params.instance.handleError(error);
  } 
}

const makeQueryStr = (params: undefined | RequestConfig['params']): string =>  {

  if (params != undefined) {

    return Object.keys(params).reduce((acc, curr, i) => {

      const val = typeof params[curr] === 'string' ? params[curr] : '' + params[curr];
      
      return acc + `${i === 0 ? '?' : '&'}${curr}=${val}`;
    }, '');
  }

  return '';
}

class HttpRequestInit implements RequestConfig {

  method!: string;

  url!: string;

  headers?: Headers;

  body?: string;

  mode?: any;

  cache?: any;

  params?: {[key: string]: string};

  constructor (url: string, args?: Partial<RequestConfig>) {

    const instance = Http.getInstance();
    
    if (args && args.headers) {
      
      const headers = new Headers();

      for (const contentType in args.headers) {
        
        headers.append(contentType, (args.headers as {[key: string]: string})[contentType]);
      }

      args.headers = headers;
    }

    Object.assign(this, args);

    const init = (instance.listeners.interceptor as HTTPInterceptor)(this);

    if (this.body != undefined) {
      
      this.body = JSON.stringify(this.body);
    }

    if (this.params != undefined) {

      this.url = url + makeQueryStr(this.params);
    }
  }
}

export default {

  get: async (url, args) => await makeRequest({instance: Http.getInstance(), request: new HttpRequestInit(url, args)}), 

  post: async (url, args) => await makeRequest({instance: Http.getInstance(), request: new HttpRequestInit(url, args)})
} as {[key: string]: HttpRequest}

export const setApiUrl = (url: string): void => Http.setBaseUrl(url);

export const getApiUrl = (path: string): string => Http.getBaseUrl(path);

export const setDefaultContentType = (contentType: string): void => Http.setDefaultContentType(contentType);

export const getDefaultContentType = (): string => Http.getDefaultContentType(); 