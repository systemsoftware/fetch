# @systemsoftware/fetch
Simple Promise-based HTTP client for Node.js

## Features
- Promise-based
- Simple API that's similar to the [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
- Supports the full [Request API](https://developer.mozilla.org/en-US/docs/Web/API/Request)
- Supports the full [Headers API](https://developer.mozilla.org/en-US/docs/Web/API/Headers)
- Powered by the built-in [http](https://nodejs.org/api/http.html) and [https](https://nodejs.org/api/https.html) modules
- Supports chunked responses
- Supports JSON, ArrayBuffer, Blob, FormData, and text responses
- Supports AbortController, AbortSignal, and timeout
- ESM and CommonJS support
- Lightweight and zero dependencies

## Table of Contents
- [Installation](#installation)
- [Usage](#usage)
    - [Basic](#basic)
    - [fetch](#fetch)
    - [Request Support](#request-support)
    - [Silence Errors](#silence-errors)
    - [AbortController](#abortcontroller)
    - [onData](#ondata)
- [Response](#response)


## Installation
```bash
npm install @systemsoftware/fetch
```
## Usage
### Basic
Where `METHOD` is one of the following: `get`, `post`, `put`, `delete`, `head`, `patch`.
```js
const fetch = require('@systemsoftware/fetch');
fetch.METHOD('https://example.com')
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(error => console.error(error));
```
### fetch
```js
const { fetch } = require('@systemsoftware/fetch');
fetch('https://example.com', { method: 'GET' })
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(error => console.error(error));
```
### Request Support
```js
const req = new Request('https://example.com', { method: 'GET', headers:new Headers({ 'Content-Type': 'application/json' }) });
fetch(req)
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(error => console.error(error));
```
### Silence Errors
By default, @systemsoftware/fetch will throw an error if the response status code is not in the range 200-299. To silence these errors, you can use the `silent` option and the response will be returned regardless of the status code.
```js
const { fetch } = require('@systemsoftware/fetch');
fetch('https://example.com', { method: 'GET', silent: true })
    .then(response => response.json())
    .then(data => console.log(data))
```

### AbortController
To abort a request, you can use the `AbortController` class.
```js
const { fetch } = require('@systemsoftware/fetch');
const controller = new AbortController();

fetch('https://example.com', { method: 'GET', signal: controller.signal })

controller.abort();
```

### onData
To handle the response data in chunks, you can use the `onData` option.
```js
const { fetch } = require('@systemsoftware/fetch');
fetch('https://example.com', { method: 'GET', onData: chunk => console.log(chunk) })
    .then(response => console.log('Response finished'))
    .catch(error => console.error(error));
```

## Response
The response object is what is returned by the http request, with these additional methods:
- `json` - A promise that returns the response body as JSON
- `text` - A promise that returns the response body as text
- `arrayBuffer` - A promise that returns the response body as an ArrayBuffer
- `blob` - A promise that returns the response body as a Blob