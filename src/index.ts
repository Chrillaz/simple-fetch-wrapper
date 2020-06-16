import Http from './http-instance';

export default Http.getInstance();

export const setApiUrl = (url: string): void => Http.setBaseUrl(url);

export const getApiUrl = (path: string): string => Http.getBaseUrl(path);

export const setDefaultContentType = (contentType: string): void => Http.setDefaultContentType(contentType);

export const getDefaultContentType = (): string => Http.getDefaultContentType(); 