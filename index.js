const http = require('http');
const https = require('https');

/**
 * @typedef {Object} HttpConfig
 * @property {Object} headers The request headers
 * @property {number} timeout The request timeout
 * @property {http.Agent | https.Agent | null} agent The agent to use for the request
 * @property {string | null} auth Basic authentication credentials
 * @property {string | null} body The request body
 * @property {string} method The HTTP method to use
 * @property {function} onData Callback for when data is received
 * @property {boolean} silent Whether to suppress errors
 * @property {AbortSignal} signal The signal to abort the request
 */

/**
 * @typedef {Object} FetchResponse
    * @property {number} statusCode The response status code
    * @property {string} statusMessage The response status message
    * @property {Object} headers The response headers
    * @property {function(): Object} json Parse response as JSON
    * @property {function(): string} text Parse response as text
    * @property {function(): Blob} blob Parse response as Blob
    * @property {function(): ArrayBuffer} arrayBuffer Parse response as ArrayBuffer
    * @property {function(): FormData} formData Parse response as FormData
    * 
 */

/** @type {HttpConfig} */
const httpConfig = {
    headers: {},
    timeout: 5000,
    agent: null,
    auth: null,
    body: null,
    method: "GET",
    onData: null,
    silent: false,
    signal: null,
    agent: null
};

class FetchError extends Error {
    constructor(message, status, statusText) {
        super(message);
        this.status = status;
        this.statusText = statusText;
    }
}

function copyProperties(target, source) {
    for (let key in source) {
    if(typeof source[key] === 'function' || source[key] == null) continue;
    target[key] = source[key];
    }
}

async function ReadStream(stream) {
    const reader = stream.getReader();
    const decoder = new TextDecoder();
    let result = '';
    while (true) {
        const { done, value } = await reader.read();
        if (done) {
            break;
        }
        result += decoder.decode(value, { stream: true });
    }
   return result;
}

/**
 * Fetch data from a URL.
 * @param {string | URL | Request} url The URL to fetch.
 * @param {HttpConfig} [config=httpConfig] Configuration for the request.
 * @returns {Promise<FetchResponse>} A promise that resolves to the response data.
 */
const _fetch = (url, config = httpConfig) => {
    return new Promise(async (resolve, reject) => {
        let protocol;
        let _url;

        if (url instanceof Request) {
            _url = new URL(url.url);
            copyProperties(config, url);
            protocol = url.url.startsWith('https') ? https : http;
        } else if (typeof url === "string") {
            _url = new URL(url);
            protocol = url.protocol === 'https:' ? https : http;
        } else if (url instanceof URL) {
            _url = url;
            protocol = url.protocol === 'https:' ? https : http;
        } else {
            reject(new FetchError("Invalid URL", 400, "Bad Request"));
        }

        if(config.headers instanceof Headers) {
            config.headers = Object.fromEntries(config.headers.entries());
        }

        let path = _url.pathname;
        if (_url.search) path += _url.search;
        if (_url.hash) path += _url.hash;

        if(config.body instanceof ReadableStream) config.body = await ReadStream(config.body);

        if(typeof config.bodyUsed === 'boolean') delete config.bodyUsed;

        const { silent, onData, ..._config } = config;

        const req = protocol.request({
                hostname: _url.hostname,
                port: _url.port,
                path,
                ..._config
            },
            (res) => {
                let data = '';
                res.on('data', (chunk) => {
                    data += chunk;
                    if (onData) onData(chunk);
                });

                res.on('end', () => {
                    if (res.statusCode >= 400 && !silent) reject(new FetchError(`Request failed with status code ${res.statusCode}`, res.statusCode, res.statusMessage));
                    res.json = async () => JSON.parse(data);
                    res.text = async () => data;
                    res.blob = async () => new Blob([data]);
                    res.arrayBuffer = async () => new ArrayBuffer(data);
                    res.formData = async () => new FormData(data);
                    resolve(res);
                });
            }
        );

        req.on('error', (err) => {
            reject(new FetchError(err.message, err.code, err.message));
        });        

        req.on('timeout', () => {
            req.destroy();
            reject(new FetchError("Request timed out", 408, "Request Timeout"));
        });

        req.end();
    });
};

/**
 * Make a GET request.
 * @param {string | URL | Request} url The URL to fetch.
 * @param {HttpConfig} [config] Configuration for the request.
 * @returns {Promise<FetchResponse>} A promise that resolves to the response data.
 */
module.exports.get = (url, config) => _fetch(url, {
    ...config,
    method: 'GET'
});

/**
 * Make a POST request.
 * @param {string | URL | Request} url The URL to fetch.
 * @param {HttpConfig} [config] Configuration for the request.
 * @returns {Promise<FetchResponse>} A promise that resolves to the response data.
 */
module.exports.post = (url, config) => _fetch(url, {
    ...config,
    method: 'POST'
});

/**
 * Make a PUT request.
 * @param {string | URL | Request} url The URL to fetch.
 * @param {HttpConfig} [config] Configuration for the request.
 * @returns {Promise<FetchResponse>} A promise that resolves to the response data.
 */
module.exports.put = (url, config) => _fetch(url, {
    ...config,
    method: 'PUT'
});

/**
 * Make a PATCH request.
 * @param {string | URL | Request} url The URL to fetch.
 * @param {HttpConfig} [config] Configuration for the request.
 * @returns {Promise<FetchResponse>} A promise that resolves to the response data.
 */
module.exports.patch = (url, config) => _fetch(url, {
    ...config,
    method: 'PATCH'
});

/**
 * Make a DELETE request.
 * @param {string | URL | Request} url The URL to fetch.
 * @param {HttpConfig} [config] Configuration for the request.
 * @returns {Promise<FetchResponse>} A promise that resolves to the response data.
 */
module.exports.delete = (url, config) => _fetch(url, {
    ...config,
    method: 'DELETE'
});

/**
 * Make a HEAD request.
 * @param {string | URL | Request} url The URL to fetch.
 * @param {HttpConfig} [config] Configuration for the request.
 * @returns {Promise<FetchResponse>} A promise that resolves to the response data.
 */
module.exports.head = (url, config) => _fetch(url, {
    ...config,
    method: 'HEAD'
});

module.exports.fetch = _fetch;
