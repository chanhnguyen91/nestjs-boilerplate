export interface I18nErrorDetail {
    path?: string;
    message: string | { key: string; params?: Record<string, any> };
    args?: Record<string, any>;
  }
  
export interface I18nErrorMetadata {
  statusCode: number;
  message: string;
  args?: Record<string, any>;
  details?: I18nErrorDetail[];
}