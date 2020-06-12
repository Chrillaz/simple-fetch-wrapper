declare class HttpSuccessResponse {
    success: boolean;
    status: number;
    data: any;
    constructor(response: any, json: any);
}
declare class HttpErrorResponse {
    success: boolean;
    status: number;
    statusText: string;
    constructor(response: any, json: any);
}
declare class Http {
    private baseUrl;
    static instance: Http;
    private buildQueryStr;
    private handleResponse;
    private handleError;
    private makeRequest;
    get(url: string, args?: {
        params: {};
    }): Promise<HttpSuccessResponse | HttpErrorResponse>;
    post(url: string, body: {}, headers?: {}): Promise<HttpSuccessResponse | HttpErrorResponse>;
    static setBaseUrl(url: string): void;
    static getBaseUrl(path: string): string;
    static getInstance(): Http;
}
export declare const http: Http;
export declare const setApiUrl: (url: string) => void;
export declare const getApiUrl: (path: string) => string;
export {};
