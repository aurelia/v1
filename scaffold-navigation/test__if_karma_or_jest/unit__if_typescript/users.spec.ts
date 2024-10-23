import {Users} from '../../src/users';
import {HttpClient} from 'aurelia-fetch-client';

class HttpStub {
  items: any[];

  fetch(url) {
    return new Promise(resolve => {
      resolve({ json: () => this.items });
    });
  }

  configure(func) { /**/ }
}

function createHttpStub(): any {
  return new HttpStub();
}

describe('the Users module', () => {
  it('sets fetch response to users', async () => {
    const http = createHttpStub();
    const sut = new Users(<HttpClient>http);
    const itemStubs = [1];
    const itemFake = [2];

    http.items = itemStubs;

    await sut.activate();
    expect(sut.users).toBe(itemStubs);
    expect(sut.users).not.toBe(itemFake);
  });
});
