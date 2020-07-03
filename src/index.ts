export interface HTTPInstance {
  baseUrl: string;
  defaultContentType: string;
  setBaseUrl: (url: string) => void;
  getBaseUrl: (extention: string) => string;
  setDefaultContentType: (type: string) => void;
  getDefaultContentType: () => string;
  makeRequest: (request: HTTPRequestInit) => Promise<HTTPResponseObject>;
  get: (url: string, args?: HTTPRequestObject) => Promise<HTTPResponseObject>;
  post: (url: string, args?: HTTPRequestObject) => Promise<HTTPResponseObject>;
}

export interface HTTPRequestObject {
  method?: string;
  params?: {[key: string]: any};
  headers?: {[key: string]: string} | Headers;
  body?: {[key: string]: any} | string;
  referrer?: string;
  cache?: any;
  mode?: any;
  credentials?: any;
}

export interface HTTPRequestInit extends HTTPRequestObject {
  url: string;
  headers: Headers;
  body?: string;
}

export interface HTTPResponseObject {
  success: boolean; 
  status: number; 
  data?: any; 
  statusText?: string
}

export interface HTTPListeners {
  [key: string]: Function[] | (HTTPListeners['interceptor'] | HTTPListeners['isFetching']);
  interceptor: (config: HTTPRequestInit) => HttpRequestInit;
  isFetching: (status: boolean) => boolean;
}

export interface HttpResponse extends HTTPResponseObject {}

export class HttpResponse {

  constructor (response: Response, json: any) {
    
    this.success = response.ok;

    this.status = response.status;

    this.success
      ? this.data = json
      : this.statusText = response.statusText ? response.statusText : json.error || '';
  }
}

export interface HttpRequestInit extends HTTPRequestInit {};

export class HttpRequestInit {
  
  constructor ({interceptor}: HTTPListeners, url: string, init?: HTTPRequestObject) {

    const properties = {headers: new Headers(), url, ...init} as HTTPRequestInit;

    new Promise<HTTPRequestInit>((resolve) => resolve(interceptor != undefined ? interceptor(properties) : properties))

    .then(requestInit => {

      Object.assign(this, requestInit);

      if (init) {

        this.url = this.params ? this.url + Object.keys(this.params).reduce((acc, curr, index) =>
          acc + `${index === 0 ? '?' : '&'}${curr}=${'' + this.params![curr]}`, '') : this.url;

        this.body = this.body ? JSON.stringify(this.body) : undefined;

        for (const property in this.headers) {

          this.headers[property] = this.headers[property];
        }
      }
    });
  }
}

class HttpEmitter {

  public listeners = {} as HTTPListeners;
  
  public interceptor (fn: (config: HTTPRequestInit) => HTTPRequestInit) {
    
    return this.listeners.interceptor = fn;
  }
  
  public isFetching (fn: (status: boolean) => boolean) {
    
    return this.listeners.isFetching = fn;
  }
  
  public emit (event: string, args: any) {

    return this.listeners[event].length > 0
      ? (this.listeners[event] as Function[]).forEach(f => f(args))
      : false;
  }

  public on (event: string, fn: Function) {

    this.listeners[event] = this.listeners[event] || [];

    (this.listeners[event] as Function[]).push(fn);
  }

  public detach (event: string, fn: Function) {

    const index = (this.listeners[event] as Function[]).indexOf(fn);
      
    return index > -1
      ? (this.listeners[event] as Function[]).splice(index, 1)
      : false;
  }
}

export class Http extends HttpEmitter {

  baseUrl = '';

  defaultContentType = 'application/json';

  static instance: Http;

  private constructor () {

    super();
  }

  public setBaseUrl (url: string): void {

    this.baseUrl = url;
  }

  public getBaseUrl (extention?: string): string {

    if (extention != undefined) {

      return this.baseUrl.charAt(this.baseUrl.length - 1) === '/'
        ? this.baseUrl + extention
        : this.baseUrl + '/' + extention;
    }

    return this.baseUrl;
  }

  public setDefaultContentType (type: string): void {

    this.defaultContentType = type;
  }

  public getDefaultContentType (): string {

    return this.defaultContentType;
  }

  public async makeRequest ({url, ...rest}: Omit<HTTPRequestInit, 'params'>): Promise<HTTPResponseObject> {

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

  public async get (url: string, args = {} as HTTPRequestObject): Promise<HTTPResponseObject> {
    
    return await this.makeRequest(new HttpRequestInit(this.listeners, url, {...args, method: 'GET'}));
  }

  public async post (url: string, args = {} as HTTPRequestObject): Promise<HTTPResponseObject> {
  
    return await this.makeRequest(new HttpRequestInit(this.listeners, url, {...args, method: 'POST'}));
  }

  public static getInstance (): Http {

    return !Http.instance
      ? Http.instance = new Http()
      : Http.instance;
  }
}

export default Http.getInstance();