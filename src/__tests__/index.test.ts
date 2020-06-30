import http, {Http, RequestConfig} from '../index';

describe('http', () => {

  const instance = http;

  it('Should be instance of Http', () => {
    expect(instance).toBeInstanceOf(Http);
    expect(instance).toHaveProperty('listeners');
    expect(instance).toHaveProperty('baseUrl');
    expect(instance).toHaveProperty('defaultContentType');
  });
});

describe('conert object to string extention', () => {
  const instance = TestHttp.getInstance()
  // expect(instance.s)
})

class TestHttp extends Http {
  public makeQueryStr_ (params: undefined | RequestConfig['params']): string {
    return this.makeQueryStr(params)
  }
}