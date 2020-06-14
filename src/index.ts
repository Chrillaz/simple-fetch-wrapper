export interface RequestConfig {
  readonly method: string;
  headers?: {[key: string]: string};
  params?: {[key: string]: string};
  body?: {[key: string]: any} | string;
}

export type Listener = (status: boolean) => any;

export type HTTPInterceptor = (config: Partial<RequestConfig>) => Partial<RequestConfig>;

class HttpEmitter {

  protected listeners: {[key: string]: Listener[] | HTTPInterceptor} = {};

  protected emit (event: string, args: any) {

    return this.listeners[event].length > 0
      ? (this.listeners[event] as Listener[]).forEach(f => f(args))
      : false;
  }

  public intercept (fn: HTTPInterceptor) {

    return this.listeners.beforeRequest = fn;
  }

  public on (event: 'loading', fn: Listener) {

    this.listeners[event] = this.listeners[event] || [];

    (this.listeners[event] as Listener[]).push(fn);

    return this;
  }

  public detach (event: string, fn: Listener) {

    const index = (this.listeners[event] as Listener[]).indexOf(fn);
      
    if (index > -1) {

      (this.listeners[event] as Listener[]).splice(index, 1);
    }
  }
}

class HttpSuccessResponse {

  success!: boolean;

  status!: number;

  data!: any;

  constructor (response: any, json: any) {

    this.success = response.ok;

    this.status = response.status;

    this.data = json
  }
}

class HttpErrorResponse {

  success!: boolean;

  status!: number;

  statusText: string;

  constructor (response: any, json: any) {

    this.success = response.ok;

    this.status = response.status;

    this.statusText = response.statusText ? response.statusText : json.error || '';
  }
}

class Http extends HttpEmitter {

  private baseUrl: string = '';

  public static instance: Http;

  private constructor () {
    super();
  }

  private buildQueryStr (params: {[key: string]: string}): string {

    return Object.keys(params).reduce((acc, curr, i) => 
      acc + `${i === 0 ? '?' : '&'}${curr}=${params[curr]}`, '');
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

  private async makeRequest (url: string, params: any) {

    try {

      const response = await fetch(url, {...params}),
            result = await this.handleResponse(response);
            
      return JSON.parse(result);
    } catch (error) {

      return this.handleError(error);
    }
  }

  public async get (url: string, args?: {params: {}}): Promise<HttpSuccessResponse | HttpErrorResponse> {

    this.emit('loading', true);

    const requestConfig = (this.listeners.beforeRequest as Function)({
      params: args?.params,
      method: 'GET'
    });
    
    if (requestConfig.params) {
      
      url = url + this.buildQueryStr(requestConfig.params);
    }

    const response = await this.makeRequest(url, {method: requestConfig.method});

    this.emit('loading', false); 

    return response;
  }

  public async post (url: string, body: {}, headers?: {}): Promise<HttpSuccessResponse | HttpErrorResponse> {

    this.emit('loading', true);

    const requestConfig = (this.listeners.beforeRequest as HTTPInterceptor)({
      method: 'POST',
      body: JSON.stringify(body),
      headers: headers ? headers : {
        'Content-Type': 'application/json'
      }
    });

    const response = this.makeRequest(url, {...requestConfig});

    this.emit('loading', false);

    return response;
  }

  public static setBaseUrl (url: string): void {

    Http.instance.baseUrl = url;
  }

  public static getBaseUrl (path: string): string {

    return Http.instance.baseUrl + path + '/';
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