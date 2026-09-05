export const sendSuccess = (res, statusCode = 200, message = 'Operation successful', data = {}) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

export const sendError = (res, statusCode = 400, message = 'Something went wrong', errors = []) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
};
