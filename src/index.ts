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

class Http {

  private baseUrl: string = '';

  public static instance: Http;

  private buildQueryStr (params: {[key: string]: string}): string {

    let str = '';

    Object.keys(params).forEach((key, i) => {

      str = str + `${i === 0 ? '?' : '&'}${key}=${params[key]}`;
    });

    return str;
  }

  private async handleResponse (response: any) {

    const json = await response.json();

    if (!response.ok) {

      return JSON.stringify(new HttpErrorResponse(response, json));
    }

    return JSON.stringify(new HttpSuccessResponse(response, json));
  }

  private handleError (error: string) {

    try {

      return JSON.parse(error)
    } catch (err) {

      return error;
    }
  }

  private async makeRequest (url: string, params: any) {

    try {

      const result = await fetch(url, {...params}),
            response = await this.handleResponse(result),
            json = await JSON.parse(response);
            
      return await json;
    } catch (error) {

      return await this.handleError(error);
    }
  }

  public async get (url: string, args?: {params: {};}): Promise<HttpSuccessResponse | HttpErrorResponse> {

    const options = {
      method: 'GET'
    };
    
    if (args?.params) {
      
      url = url + this.buildQueryStr(args.params);
    }

    return await this.makeRequest(url, {...options});
  }

  public async post (url: string, body: {}, headers?: {}): Promise<HttpSuccessResponse | HttpErrorResponse> {

    const options = {
      method: 'POST',
      headers: headers ? headers : {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    }

    return await this.makeRequest(url, {...options});
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

export const http = Http.getInstance();

export const setApiUrl = (url: string): void => Http.setBaseUrl(url);

export const getApiUrl = (path: string): string => Http.getBaseUrl(path)