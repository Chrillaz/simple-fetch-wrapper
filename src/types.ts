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

export type HTTPListeners = {[key: string]: Function[] | (HTTPInterceptor | Function)};

export type HTTPInterceptor = (config: HTTPRequestInit) => HTTPRequestInit;

