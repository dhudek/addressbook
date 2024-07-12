const assert = require('assert');
const fetch = require('node-fetch');
const crypto = require("crypto");

const packageJson = require('../package.json');
const config = require('../config/config.json');
const URL = `http://localhost:${config.port}`;

describe('env variables', () => {
  it('process.env.SALT exists', () => {
    assert(process.env.SALT, "SALT missing");
  });
  it('process.env.jwtSalt exists', () => {
    assert(process.env.jwtSalt, "jwtSalt missing");
  });
});

describe('status Api check', () => {
  it("call status Api", async () => {
    const url = `${URL}/status`;
    const response = await fetch(url);
    const responseData = await response.json(); 
    assert(response.ok, "response not ok");
    assert(responseData.appName == packageJson.name, "name mismatch");
    assert(responseData.appVersion == packageJson.version, "version mismatch");
  })
});

describe('registration Api check', () => {
  let cookie;
  it("register existing account", async () => {
    const url = `${URL}/registration`;
    const response = await fetch(url, { 
      method: "POST",
      headers: { 
        'Content-Type': 'application/json',
        'x-test': 'broken1'
      },
      body: JSON.stringify({email: 'test@gmail.com', password: '1234'})
    });
    // const responseData = await response.json();  
    cookie = response.headers.get('set-cookie');
    assert(!response.ok, "response is ok");
  });

  it("register new account", async () => {
    const url = `${URL}/registration`;
    const response = await fetch(url, { 
      method: "POST",
      headers: { 
        'Content-Type': 'application/json',
        'x-test': 'broken2'
      },
      body: JSON.stringify({email: `test_new_account_${crypto.randomBytes(10).toString('hex')}@gmail.com`, password: '1234'})
    });
    // const responseData = await response.json();  
    if (!cookie) 
      cookie = response.headers.get('set-cookie');

    assert(response.ok, "response not ok");
    assert(response.headers.get('set-cookie'), "cookie not set");
  })

  it("register non-existing email while cookie is active", async () => {
    const url = `${URL}/registration`;
    const response = await fetch(url, { 
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        'x-test': 'broken3',
        "cookie": cookie
      },
      body: JSON.stringify({email: `test_non_existing_WITH_cookie_${crypto.randomBytes(10).toString('hex')}@gmail.com`, password: '1234'})
    });
    // const responseData = await response.json();  
    assert(!response.ok, "response not ok");
    assert(!response.headers.get('set-cookie'), "cookie not set");
  })
});

describe('login Api check', () => {
  let cookie;
  it("login non-existing account", async () => {
    const url = `${URL}/login`;
    const response = await fetch(url, { 
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({email: `test${crypto.randomBytes(10).toString('hex')}@gmail.com`, password: '1234'})
    });
    // const responseData = await response.json();  
    assert(!response.ok, "response is ok.");
  })
  it("login existing account", async () => {
    const url = `${URL}/login`;
    const response = await fetch(url, { 
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({email: `test@gmail.com`, password: '1234'})
    });
    // const responseData = await response.json(); 
    cookie = response.headers.get('set-cookie');
    assert(response.ok, "response not ok");
    assert(cookie, "cookie not set");
  })
  it("login while cookie is active (non existing email)", async () => {
    const url = `${URL}/login`;
    const response = await fetch(url, { 
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "cookie": cookie
      },
      body: JSON.stringify({email: `test${crypto.randomBytes(10).toString('hex')}@gmail.com`, password: '1234'})
    });
    // const responseData = await response.json(); 
    cookie = response.headers.get('set-cookie');
    assert(!response.ok, "response not ok");
    assert(!cookie, "cookie not set");
  })
});

describe('new-contact Api check', async () => {
  let cookie;
  it("login to obtain cookie", async () => {
    const url = `${URL}/login`;
    const response = await fetch(url, { 
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({email: `test@gmail.com`, password: '1234'})
    });
    // const responseData = await response.json(); 
    cookie = response.headers.get('set-cookie');
  });

  it("try add new-contact with out cookie", async () => {
    const url = `${URL}/new-contact`;
    const response = await fetch(url, { 
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName: "Cameron", 
        lastName: "Diaz", 
        address: "Hollywood", 
        phoneNumber: "1234567890"
      })
    });
    // const responseData = await response.json(); 
    assert(!response.ok, "response ok"); 
  })
  it("try add new-contact with out cookie", async () => {
    const url = `${URL}/new-contact`;
    const response = await fetch(url, { 
      method: "POST",
      headers: { 'Content-Type': 'application/json', "cookie": cookie },
      body: JSON.stringify({
        firstName: "Cameron", 
        lastName: "Diaz", 
        address: "Hollywood", 
        phoneNumber: "1234567890"
      })
    });
    // const responseData = await response.json(); 
    assert(response.ok, "response not ok"); 
  })
});