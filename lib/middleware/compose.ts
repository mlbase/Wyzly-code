import { ApiHandler } from './auth';

// Compose multiple middlewares
export const compose = (...middlewares: Array<(handler: ApiHandler) => ApiHandler>) => {
  return (handler: ApiHandler): ApiHandler => {
    return middlewares.reduceRight((acc, middleware) => middleware(acc), handler);
  };
};

// Common middleware combinations
export { withAuth, withCustomerAuth, withRestaurantAuth, withAdminAuth, withAnyAuth } from './auth';
export { withValidation } from './validation';
export { withLogging } from './logging';
export { withErrorHandler } from './errorHandler';
export { withMethods } from './methods';