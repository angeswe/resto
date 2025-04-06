/**
 * API response and request types
 */

/**
 * Standard API response structure
 */
export interface ApiResponse<TData> {
  readonly success: boolean;
  readonly data: TData;
  readonly error?: string;
  readonly message?: string;
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  readonly page: number;
  readonly limit: number;
  readonly total: number;
  readonly totalPages: number;
}

/**
 * Paginated API response
 */
export interface PaginatedApiResponse<TData> extends ApiResponse<TData[]> {
  readonly pagination: PaginationMeta;
}

/**
 * API error response
 */
export interface ApiErrorResponse {
  readonly success: false;
  readonly error: string;
  readonly message: string;
  readonly statusCode: number;
}

/**
 * Query parameters for paginated requests
 */
export interface PaginationParams {
  readonly page?: number;
  readonly limit?: number;
  readonly sort?: string;
  readonly order?: 'asc' | 'desc';
}

/**
 * Query parameters for filtering endpoints
 */
export interface EndpointFilterParams extends PaginationParams {
  readonly method?: string;
  readonly path?: string;
  readonly requireAuth?: boolean;
}

/**
 * Options for API requests
 */
export interface RequestOptions {
  readonly headers?: Record<string, string>;
  readonly params?: Record<string, string | number | boolean | undefined>;
  readonly timeout?: number;
  readonly signal?: AbortSignal;
}

/**
 * HTTP status category
 */
export type HttpStatusCategory = 'success' | 'redirection' | 'clientError' | 'serverError';

/**
 * HTTP status code definition
 */
export interface HttpStatusCode {
  readonly code: string;
  readonly text: string;
  readonly category: HttpStatusCategory;
}

/**
 * Mock API request options
 */
export interface MockRequestOptions {
  readonly method?: string;
  readonly data?: Record<string, unknown>;
  readonly headers?: Record<string, string>;
  readonly delay?: number;
}
