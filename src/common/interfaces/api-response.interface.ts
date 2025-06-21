export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: {
    statusCode: number;
    message: string;
    details?: any;
  } | null;
}
