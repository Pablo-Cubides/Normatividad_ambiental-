// Mock for Next.js server components
// Define basic Request and Response constructors for testing

function MockRequest(input, init) {
  this.url = typeof input === 'string' ? input : input.url;
  this.method = init?.method || 'GET';
  this.headers = new Map();
  this.body = init?.body || null;

  // Add any headers from init
  if (init?.headers) {
    Object.entries(init.headers).forEach(([key, value]) => {
      this.headers.set(key.toLowerCase(), value);
    });
  }
}

class MockHeaders {
  constructor(init) {
    this._headers = new Map();

    if (init) {
      if (init instanceof MockHeaders) {
        init._headers.forEach((value, key) => {
          this._headers.set(key, value);
        });
      } else if (Array.isArray(init)) {
        init.forEach(([key, value]) => {
          this._headers.set(key.toLowerCase(), value);
        });
      } else {
        Object.entries(init).forEach(([key, value]) => {
          this._headers.set(key.toLowerCase(), value);
        });
      }
    }
  }

  get(name) {
    return this._headers.get(name.toLowerCase()) || null;
  }

  has(name) {
    return this._headers.has(name.toLowerCase());
  }

  set(name, value) {
    this._headers.set(name.toLowerCase(), value);
    return this;
  }

  append(name, value) {
    const existing = this.get(name);
    if (existing) {
      this.set(name, existing + ', ' + value);
    } else {
      this.set(name, value);
    }
    return this;
  }

  delete(name) {
    return this._headers.delete(name.toLowerCase());
  }

  forEach(callback, thisArg) {
    this._headers.forEach((value, key) => {
      callback.call(thisArg, value, key, this);
    });
  }

  *entries() {
    for (const [key, value] of this._headers) {
      yield [key, value];
    }
  }

  *keys() {
    for (const key of this._headers.keys()) {
      yield key;
    }
  }

  *values() {
    for (const value of this._headers.values()) {
      yield value;
    }
  }

  [Symbol.iterator]() {
    return this.entries();
  }
}

function MockResponse(body, init) {
  this.body = body;
  this.status = init?.status || 200;
  this.statusText = init?.statusText || 'OK';
  this.headers = new MockHeaders(init?.headers);

  this.json = async () => JSON.parse(body);
  this.text = async () => body;
}

class MockNextResponse extends MockResponse {
  constructor(body, init) {
    super(body, init);
  }

  static json(data, init) {
    return new MockNextResponse(JSON.stringify(data), {
      ...init,
      headers: {
        'content-type': 'application/json',
        ...init?.headers,
      },
    });
  }
}

// Define NextRequest as an alias for Request
const NextRequest = MockRequest;

// Make them globally available
if (typeof global !== 'undefined') {
  global.Request = MockRequest;
  global.Response = MockResponse;
  global.NextRequest = NextRequest;
  global.NextResponse = MockNextResponse;
  global.Headers = MockHeaders;
}

// Export for module mocking
export {
  NextRequest,
  MockNextResponse as NextResponse,
  MockRequest as Request,
  MockResponse as Response,
  MockHeaders as Headers,
};