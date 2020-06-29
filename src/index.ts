export interface HttpInstance {
  baseUrl: string;
  defaultContentType: string;
  setBaseUrl: (url: string) => void;
  getBaseUrl: (extention: string) => string;
  setDefaultContentType: (type: string) => void;
  getDefaultContentType: () => string;
  makeRequest: (request: RequestInit) => Promise<HttpResponseObject>;
  get: (url: string, args: RequestInit) => Promise<HttpResponseObject>;
  post: (url: string, args: RequestInit) => Promise<HttpResponseObject>;
}

export interface RequestInit {
  url: string;
  method: string;
  headers?: Headers | {[key: string]: string};
  params?: {[key: string]: string};
  body?: string;
  cache?: any;
  mode?: any;
}

export interface HttpResponseObject {
  success: boolean; 
  status: number; 
  data?: any; 
  statusText?: string
}

export type Listeners = {[key: string]: Function[] | (HTTPInterceptor | Function)};

export type HTTPInterceptor = (config: RequestInit) => RequestInit;

interface HttpRequestInit extends RequestInit {};

interface HttpResponse extends HttpResponseObject {}

class HttpResponse {

  constructor (response: Response, json: any) {
    
    Object.assign(this, response);

    this.success
      ? this.data = json
      : this.statusText = response.statusText ? response.statusText : json.error || '';
  }
}

class HttpEmitter {

  public listeners: Listeners = {};
  
  public emit (event: string, args: any) {

    return this.listeners[event].length > 0
      ? (this.listeners[event] as Function[]).forEach(f => f(args))
      : false;
  }
  
  public interceptor (fn: HTTPInterceptor) {

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
      
    return index > -1
      ? (this.listeners[event] as Function[]).splice(index, 1)
      : false;
  }
}

class HttpRequestInit {

  constructor (listeners: Listeners, url: string, init?: RequestInit) {

    if (init && listeners.interceptor != undefined) {
      
      init = (listeners.interceptor as HTTPInterceptor)(init);
    }

    Object.assign(this, init);

    if (init && init.headers != undefined) {

      this.headers = new Headers();

      for (const property in init.headers) {

        this.headers.append(property, (init.headers as {[key: string]: string})[property]);
      }
    }

    if (init && init.params != undefined) {

      this.url = url + Object.keys(init.params).reduce((acc, curr, index) => 
        acc + `${index === 0 ? '?' : '&'}${curr}=${'' + (init?.params as {[key: string]: string})[curr]}`, '');
    }

    if (init && init.body != undefined) {

      this.body = JSON.stringify(init.body);
    }
  }
}

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

  async makeRequest (request: RequestInit): Promise<HttpResponse> {

    try {

      const response = await fetch(new Request(request.url, request)),
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

  async get (url: string, args: RequestInit): Promise<HttpResponse> {

    return await this.makeRequest(new HttpRequestInit(this.listeners, url, {...args, method: 'GET'}));
  }

  async post (url: string, args: RequestInit): Promise<HttpResponse> {
  
    return await this.makeRequest(new HttpRequestInit(this.listeners, url, {...args, method: 'POST'}));
  }

  static getInstance (): Http {

    return !Http.instance
      ? Http.instance = new Http()
      : Http.instance;
  }
}

export default Http.getInstance();