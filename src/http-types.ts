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