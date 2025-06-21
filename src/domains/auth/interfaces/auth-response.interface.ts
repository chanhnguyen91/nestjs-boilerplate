export interface TokensResponse {
    accessToken: string;
    refreshToken: string;
  }
  
export interface PasswordResetRequestResponse {
    message: string;
    resetToken: string;
}