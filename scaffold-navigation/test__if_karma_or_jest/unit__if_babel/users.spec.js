import {Users} from '../../src/users';

class HttpStub {
  fetch(url) {
    var response = this.itemStub;
    this.url = url;
    return new Promise((resolve) => {
      resolve({ json: () => response });
    });
  }

  configure(func) { /**/ }
}

describe('the Users module', () => {
  it('sets fetch response to users', async () => {
    var http = new HttpStub();
    var sut = new Users(http);
    var itemStubs = [1];
    var itemFake = [2];

    http.itemStub = itemStubs;
    await sut.activate();
    expect(sut.users).toBe(itemStubs);
    expect(sut.users).not.toBe(itemFake);
  });
});
