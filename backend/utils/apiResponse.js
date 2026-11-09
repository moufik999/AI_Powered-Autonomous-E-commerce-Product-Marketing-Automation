/**
 * OmniMarket AI - Standardized API Response Utilities
 */

const successResponse = (res, { statusCode = 200, message = 'Success', data = null, ...extra }) => {
  return res.status(statusCode).json({
    success: true,
    message,
    ...(data !== null ? { data } : {}),
    ...extra
  });
};

const errorResponse = (res, { statusCode = 500, message = 'An error occurred', error = null, code = null }) => {
  const payload = {
    success: false,
    message: typeof message === 'string' ? message : 'Operation failed'
  };

  if (code) {
    payload.code = code;
  }

  if (process.env.NODE_ENV !== 'production' && error) {
    payload.errorDetails = typeof error === 'object' ? (error.message || String(error)) : String(error);
  }

  return res.status(statusCode).json(payload);
};

module.exports = {
  successResponse,
  errorResponse
};
