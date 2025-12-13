// src/services/AuthService.ts
import HttpService from "./HttpService";
import type { CustomResponse } from "../../types/common/ApiTypes";
import { API_ENDPOINTS } from "../../constants/API_ENDPOINTS";
import type { ForgotPasswordRequest, LoginRequest, LoginResponse } from "../../types/common/Auth.types";
import UserService from "../settings/User.services";

class AuthService {
  static async login(credentials: LoginRequest): Promise<CustomResponse<LoginResponse>> {
    try {
      const response = await HttpService.callApi<CustomResponse<LoginResponse>>(
        API_ENDPOINTS.AUTH.LOGIN,
        "POST",
        credentials,
        true // isPublic - no token needed for login
      );

      console.log('API Response:', response);

      // Store token in localStorage if login successful
      if (response.isSucess && response.value) {
        console.log('Login successful, storing data...');

        // Store token
        if (response.value.token) {
          localStorage.setItem('jwt_token', response.value.token);
          console.log('Token stored:', localStorage.getItem('jwt_token') !== null);
        }

        // Store user data
        // if (response.value.user) {
        //   const userString = JSON.stringify(response.value.user);
        //   localStorage.setItem('user', userString);
        //   console.log('User stored:', localStorage.getItem('user') !== null);
        //   console.log('Stored user data:', localStorage.getItem('user'));
        // }
         // ✅ ADDED: Fetch complete user profile from database to get profileImagePath
        if (response.value.user) {
          try {
            const userId = response.value.user.userId;
            console.log('Fetching complete user profile for userId:', userId);
            
            // Fetch user profile from database
            const userProfileResponse = await UserService.getById(userId);
            
            if (userProfileResponse.isSucess && userProfileResponse.value) {
              // ✅ Merge login user data with complete profile data from database
              const completeUserData = {
                ...response.value.user,
                profileImagePath: userProfileResponse.value.profileImagePath || "",
                address: userProfileResponse.value.address || response.value.user.address,
                phoneNumber: userProfileResponse.value.phoneNumber || response.value.user.phoneNumber,
              };
              
              const userString = JSON.stringify(completeUserData);
              localStorage.setItem('user', userString);
              console.log('Complete user data stored with profileImagePath:', completeUserData.profileImagePath);
              console.log('Stored user data:', localStorage.getItem('user'));
            } else {
              // Fallback: store original user data if profile fetch fails
              const userString = JSON.stringify(response.value.user);
              localStorage.setItem('user', userString);
              console.log('User stored (fallback):', localStorage.getItem('user') !== null);
            }
          } catch (profileError) {
            console.error('Error fetching user profile from database:', profileError);
            // Fallback: store original user data
            const userString = JSON.stringify(response.value.user);
            localStorage.setItem('user', userString);
            console.log('User stored (error fallback):', localStorage.getItem('user') !== null);
          }
        }

        // Store token expiry
        if (response.value.expiresAt) {
          localStorage.setItem('token_expires_at', response.value.expiresAt);
          console.log('Expiry stored:', localStorage.getItem('token_expires_at') !== null);
        }

        // Verify storage
        console.log('Storage verification:');
        console.log('- jwt_token exists:', !!localStorage.getItem('jwt_token'));
        console.log('- user exists:', !!localStorage.getItem('user'));
        console.log('- token_expires_at exists:', !!localStorage.getItem('token_expires_at'));
      } else {
        console.error('Login failed - response not successful or no value');
      }

      return response;
    } catch (error) {
      console.error('Login error in AuthService:', error);
      throw error;
    }
  }

  static logout(): void {
    console.log('Logging out...');
    console.log('Before logout - jwt_token:', localStorage.getItem('jwt_token') !== null);
    console.log('Before logout - user:', localStorage.getItem('user') !== null);

    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user');
    localStorage.removeItem('token_expires_at');

    console.log('After logout - jwt_token:', localStorage.getItem('jwt_token') !== null);
    console.log('After logout - user:', localStorage.getItem('user') !== null);
    console.log('Logout complete');
  }

  static getCurrentUser(): any | null {
    try {
      const userStr = localStorage.getItem('user');
      console.log('Getting current user, raw string:', userStr);

      if (!userStr) {
        console.log('No user found in localStorage');
        return null;
      }

      const user = JSON.parse(userStr);
      console.log('Parsed user:', user);
      return user;
    } catch (error) {
      console.error('Error parsing user from localStorage:', error);
      return null;
    }
  }

  static getToken(): string | null {
    const token = localStorage.getItem('jwt_token');
    console.log('Getting token, exists:', token !== null);
    return token;
  }

  static isAuthenticated(): boolean {
    const token = localStorage.getItem('jwt_token');
    console.log('Checking authentication, token exists:', token !== null);

    if (!token) {
      console.log('Not authenticated - no token');
      return false;
    }

    // Check if token is expired
    const expiresAt = localStorage.getItem('token_expires_at');
    if (expiresAt) {
      const expiryDate = new Date(expiresAt);
      const now = new Date();
      console.log('Token expiry check:', { expiryDate, now, expired: now >= expiryDate });

      if (now >= expiryDate) {
        console.log('Token expired, logging out');
        this.logout();
        return false;
      }
    }

    console.log('User is authenticated');
    return true;
  }

  // change-password
  static async changePassword(currentPassword: string, newPassword: string): Promise<CustomResponse<any>> {
    try {
      const payload = { currentPassword, newPassword };
      const response = await HttpService.callApi<CustomResponse<any>>(
        API_ENDPOINTS.AUTH.CHANGE_PASSWORD,
        "POST",
        payload
      );
      return response;
    } catch (error) {
      console.error("Change password error:", error);
      throw error;
    }
  }

  //forgot-password
  static async forgotPassword(data: ForgotPasswordRequest): Promise<CustomResponse<void>> {
    return await HttpService.callApi<CustomResponse<void>>(
      API_ENDPOINTS.AUTH.FORGOT_PASSWORD,
      "POST",
      data,
      true //  public endpoint (no token required)
    );
  }
}

export default AuthService;
