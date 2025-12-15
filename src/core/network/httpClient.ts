import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { appConfig } from '@core/config/appConfig';
import { mapError } from '@core/error/errorMapper';
import { reportError } from '@core/error/errorReporter';
import { Result, err, ok } from '@core/utils/result';
import { AppError } from '@core/error/appError';

/**
 * HTTP Client class for making API requests
 */
class HttpClient {
  private instance: AxiosInstance;

  constructor() {
    this.instance = axios.create({
      baseURL: appConfig.apiBaseUrl,
      timeout: appConfig.requestTimeout,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  /**
   * Setup request and response interceptors
   */
  private setupInterceptors() {
    // Request interceptor
    this.instance.interceptors.request.use(
      (config) => {
        // Add auth token if available
        // const token = getAuthToken();
        // if (token) {
        //   config.headers.Authorization = `Bearer ${token}`;
        // }
        return config;
      },
      (error) => {
        return Promise.reject(mapError(error));
      }
    );

    // Response interceptor
    this.instance.interceptors.response.use(
      (response) => response,
      (error) => {
        const appError = mapError(error);
        reportError(appError);
        return Promise.reject(appError);
      }
    );
  }

  /**
   * Get the axios instance
   */
  getAxiosInstance(): AxiosInstance {
    return this.instance;
  }

  /**
   * Set authorization token
   */
  setAuthToken(token: string) {
    this.instance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  /**
   * Clear authorization token
   */
  clearAuthToken() {
    delete this.instance.defaults.headers.common['Authorization'];
  }

  /**
   * GET request
   */
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<Result<T, AppError>> {
    try {
      const response: AxiosResponse<T> = await this.instance.get(url, config);
      return ok(response.data);
    } catch (error) {
      return err(mapError(error));
    }
  }

  /**
   * POST request
   */
  async post<T, D = any>(url: string, data?: D, config?: AxiosRequestConfig): Promise<Result<T, AppError>> {
    try {
      const response: AxiosResponse<T> = await this.instance.post(url, data, config);
      return ok(response.data);
    } catch (error) {
      return err(mapError(error));
    }
  }

  /**
   * PUT request
   */
  async put<T, D = any>(url: string, data?: D, config?: AxiosRequestConfig): Promise<Result<T, AppError>> {
    try {
      const response: AxiosResponse<T> = await this.instance.put(url, data, config);
      return ok(response.data);
    } catch (error) {
      return err(mapError(error));
    }
  }

  /**
   * PATCH request
   */
  async patch<T, D = any>(url: string, data?: D, config?: AxiosRequestConfig): Promise<Result<T, AppError>> {
    try {
      const response: AxiosResponse<T> = await this.instance.patch(url, data, config);
      return ok(response.data);
    } catch (error) {
      return err(mapError(error));
    }
  }

  /**
   * DELETE request
   */
  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<Result<T, AppError>> {
    try {
      const response: AxiosResponse<T> = await this.instance.delete(url, config);
      return ok(response.data);
    } catch (error) {
      return err(mapError(error));
    }
  }
}

/**
 * HTTP client instance
 */
export const httpClient = new HttpClient();

/**
 * Export axios instance for advanced usage
 */
export const axiosInstance = httpClient.getAxiosInstance();
