var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
class HttpSuccessResponse {
    constructor(response, json) {
        this.success = response.ok;
        this.status = response.status;
        this.data = json;
    }
}
class HttpErrorResponse {
    constructor(response, json) {
        this.success = response.ok;
        this.status = response.status;
        this.statusText = response.statusText ? response.statusText : json.error || '';
    }
}
class Http {
    constructor() {
        this.baseUrl = '';
    }
    buildQueryStr(params) {
        let str = '';
        Object.keys(params).forEach((key, i) => {
            str = str + `${i === 0 ? '?' : '&'}${key}=${params[key]}`;
        });
        return str;
    }
    handleResponse(response) {
        return __awaiter(this, void 0, void 0, function* () {
            const json = yield response.json();
            if (!response.ok) {
                return JSON.stringify(new HttpErrorResponse(response, json));
            }
            return JSON.stringify(new HttpSuccessResponse(response, json));
        });
    }
    handleError(error) {
        try {
            return JSON.parse(error);
        }
        catch (err) {
            return error;
        }
    }
    makeRequest(url, params) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield fetch(url, Object.assign({}, params)), response = yield this.handleResponse(result), json = yield JSON.parse(response);
                return yield json;
            }
            catch (error) {
                return yield this.handleError(error);
            }
        });
    }
    get(url, args) {
        return __awaiter(this, void 0, void 0, function* () {
            const options = {
                method: 'GET'
            };
            if (args === null || args === void 0 ? void 0 : args.params) {
                url = url + this.buildQueryStr(args.params);
            }
            return yield this.makeRequest(url, Object.assign({}, options));
        });
    }
    post(url, body, headers) {
        return __awaiter(this, void 0, void 0, function* () {
            const options = {
                method: 'POST',
                headers: headers ? headers : {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            };
            return yield this.makeRequest(url, Object.assign({}, options));
        });
    }
    static setBaseUrl(url) {
        Http.instance.baseUrl = url;
    }
    static getBaseUrl(path) {
        return Http.instance.baseUrl + path + '/';
    }
    static getInstance() {
        if (!Http.instance) {
            return Http.instance = new Http();
        }
        return Http.instance;
    }
}
export const http = Http.getInstance();
export const setApiUrl = (url) => Http.setBaseUrl(url);
export const getApiUrl = (path) => Http.getBaseUrl(path);
