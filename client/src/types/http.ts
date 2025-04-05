interface HttpStatusCode {
  code: string;
  text: string;
  category: 'success' | 'redirection' | 'clientError' | 'serverError';
}

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

// Status codes appropriate for each HTTP method
export const METHOD_STATUS_CODES: Record<HttpMethod, HttpStatusCode[]> = {
  GET: [
    { code: '200', text: 'OK', category: 'success' },
    { code: '206', text: 'Partial Content', category: 'success' },
    { code: '304', text: 'Not Modified', category: 'redirection' },
    { code: '400', text: 'Bad Request', category: 'clientError' },
    { code: '401', text: 'Unauthorized', category: 'clientError' },
    { code: '403', text: 'Forbidden', category: 'clientError' },
    { code: '404', text: 'Not Found', category: 'clientError' },
    { code: '500', text: 'Internal Server Error', category: 'serverError' },
    { code: '503', text: 'Service Unavailable', category: 'serverError' }
  ],
  POST: [
    { code: '201', text: 'Created', category: 'success' },
    { code: '202', text: 'Accepted', category: 'success' },
    { code: '400', text: 'Bad Request', category: 'clientError' },
    { code: '401', text: 'Unauthorized', category: 'clientError' },
    { code: '403', text: 'Forbidden', category: 'clientError' },
    { code: '409', text: 'Conflict', category: 'clientError' },
    { code: '500', text: 'Internal Server Error', category: 'serverError' }
  ],
  PUT: [
    { code: '200', text: 'OK', category: 'success' },
    { code: '201', text: 'Created', category: 'success' },
    { code: '204', text: 'No Content', category: 'success' },
    { code: '400', text: 'Bad Request', category: 'clientError' },
    { code: '401', text: 'Unauthorized', category: 'clientError' },
    { code: '403', text: 'Forbidden', category: 'clientError' },
    { code: '404', text: 'Not Found', category: 'clientError' },
    { code: '409', text: 'Conflict', category: 'clientError' },
    { code: '500', text: 'Internal Server Error', category: 'serverError' }
  ],
  DELETE: [
    { code: '200', text: 'OK', category: 'success' },
    { code: '204', text: 'No Content', category: 'success' },
    { code: '400', text: 'Bad Request', category: 'clientError' },
    { code: '401', text: 'Unauthorized', category: 'clientError' },
    { code: '403', text: 'Forbidden', category: 'clientError' },
    { code: '404', text: 'Not Found', category: 'clientError' },
    { code: '500', text: 'Internal Server Error', category: 'serverError' }
  ],
  PATCH: [
    { code: '200', text: 'OK', category: 'success' },
    { code: '204', text: 'No Content', category: 'success' },
    { code: '400', text: 'Bad Request', category: 'clientError' },
    { code: '401', text: 'Unauthorized', category: 'clientError' },
    { code: '403', text: 'Forbidden', category: 'clientError' },
    { code: '404', text: 'Not Found', category: 'clientError' },
    { code: '409', text: 'Conflict', category: 'clientError' },
    { code: '500', text: 'Internal Server Error', category: 'serverError' }
  ]
};

export const HTTP_STATUS_CODES = Object.values(METHOD_STATUS_CODES).flat();
