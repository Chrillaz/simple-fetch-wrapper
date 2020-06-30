import { HTTPResponseObject } from '../types';

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