class Http {

  public static instance: Http;

  private buildQueryStr (params: {[key: string]: string}): string {

    let str = '';

    Object.keys(params).forEach((key, i) => {

      str = str + `${i === 0 ? '?' : '&'}${key}=${params[key]}`;
    });

    return str;
  }

  private async send (url: string, options: any) {

    try {

      const response = await fetch(url, {...options}),
            result = await response.json();
      
      if (result.status != 200) {

        throw new Error('Ooops...');
      }

      return result;

    } catch (err) {

      return err; // new ErrorResponse();
    }
  }

  async get (url: string, args: {params: {};}) {

    const options = {
      method: 'GET'
    };
    
    if (args.params) {
      
      url = url + this.buildQueryStr(args.params);
    }

    return await this.send(url, {...options});
  }

  async post (url: string, body: {}, headers?: {}) {

    const options = {
      method: 'POST',
      headers: headers ? headers : {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    }

    return await this.send(url, {...options});
  }

  public static getInstance () {

    if (!Http.instance) {

      return Http.instance = new Http();
    }

    return Http.instance;
  }
}

export const http = Http.getInstance();
