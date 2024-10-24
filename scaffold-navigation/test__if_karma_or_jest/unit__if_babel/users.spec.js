import {Users} from '../../src/users';

class HttpStub {
  fetch(url) {
    const response = this.itemStub;
    this.url = url;
    return new Promise((resolve) => {
      resolve({ json: () => response });
    });
  }

  configure(func) { /**/ }
}

describe('the Users module', () => {
  it('sets fetch response to users', async () => {
    const http = new HttpStub();
    const sut = new Users(http);
    const itemStubs = [1];
    const itemFake = [2];

    http.itemStub = itemStubs;
    await sut.activate();
    expect(sut.users).toBe(itemStubs);
    expect(sut.users).not.toBe(itemFake);
  });
});
