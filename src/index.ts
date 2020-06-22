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

const makeQueryStr = (params: undefined | RequestConfig['params']): string => {

  if (params != undefined) {

    return Object.keys(params).reduce((acc, curr, i) => {

      const val = typeof params[curr] === 'string' ? params[curr] : '' + params[curr];
      
      return acc + `${i === 0 ? '?' : '&'}${curr}=${val}`;
    }, '');
  }

  return '';
}

interface RequestParams {
  request: Request;
  context: Http;
}

type HttpRequest = (url: string, args: Partial<RequestConfig>) => Promise<HttpSuccessResponse | HttpErrorResponse>;

const makeRequest = async (params: RequestParams): Promise<HttpSuccessResponse | HttpErrorResponse> => {
  
  const {context, request} = params;
  
  const requestObj = (context.listeners.intercept as HTTPInterceptor)(request);

  try {

    const response = await fetch(requestObj),
          result = await context.handleResponse(response);
          
    return JSON.parse(result);
  } catch (error) {

    return context.handleError(error);
  } 
}

class HttpRequestConstructor {

  method!: string;

  url!: string;

  headers?: {[key: string]: string};

  mode?: any;

  cache?: any;

  body?: string;

  constructor (args?: Partial<HttpRequestConstructor>) {

    const headers = new Headers();

    if (args && args.headers) {
      
      for (const contentType in args.headers) {
        
        headers.append(contentType, args.headers[contentType]);
      }
    }

    if (args && args.body) {
      
      args.body = JSON.stringify(args.body);
    }

    if (args && args.params) {

      
    }

    Object.assign(this, args);
  }
}
export default {

  get: async (url, args) => await makeRequest({context: Http.getInstance(), request: new Request(url + makeQueryStr(args?.params))}), 

  post: async (url, args) => await makeRequest({context: Http.getInstance(), request: new Request(url, {method: 'POST', body: JSON.stringify(args?.body)})})
} as {[key: string]: HttpRequest}

export const setApiUrl = (url: string): void => Http.setBaseUrl(url);

export const getApiUrl = (path: string): string => Http.getBaseUrl(path);

export const setDefaultContentType = (contentType: string): void => Http.setDefaultContentType(contentType);

export const getDefaultContentType = (): string => Http.getDefaultContentType(); 