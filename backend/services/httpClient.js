const axios = require('axios');

// Create a shared axios instance with sensible defaults
const httpClient = axios.create({
  timeout: 5000,
});

// Apply exponential backoff retry — works with axios-retry v3 and v4
try {
  const axiosRetry = require('axios-retry');
  // axios-retry v4 exports the function as .default when using CJS
  const retryFn = axiosRetry.default || axiosRetry;
  const isNetworkFn =
    (axiosRetry.default || axiosRetry).isNetworkOrIdempotentRequestError ||
    ((err) => !err.response);

  retryFn(httpClient, {
    retries: 2,
    retryDelay: (retryCount) => retryCount * 300,
    retryCondition: (error) => {
      const method = (error.config?.method || 'get').toLowerCase();
      return ['get', 'head', 'options'].includes(method) && (isNetworkFn(error) || error.response?.status >= 500);
    },
  });
} catch (e) {
  console.warn('[httpClient] axios-retry not available, continuing without retry logic.');
}

module.exports = httpClient;

