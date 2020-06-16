import { HTTPInterceptor } from './http-types';

export class HttpEmitter {

  protected listeners: {[key: string]: Function[] | (HTTPInterceptor | Function)} = {};

  protected emit (event: string, args: any) {

    return this.listeners[event].length > 0
      ? (this.listeners[event] as Function[]).forEach(f => f(args))
      : false;
  }

  public intercept (fn: HTTPInterceptor) {

    return this.listeners.intercept = fn;
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