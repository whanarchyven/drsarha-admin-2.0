import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse, type AxiosError } from 'axios';

export class AxiosApiService {
  private api: AxiosInstance;

  constructor(baseURL: string, defaultConfig: AxiosRequestConfig = {}) {
    this.api = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Expires': '0'
      },
      ...defaultConfig,
    });

    // Добавляем интерцептор для обработки ошибок
    this.api.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error: AxiosError) => {

        console.error('API error:', error.response);
        console.log(JSON.stringify(error),"ERROR RESPONSE")
        return Promise.reject(error.response);
      }
    );

    this.api.interceptors.request.use(
      (config) => {
        console.log('Request config:', JSON.stringify(config));
        return config;
      },
      (error) => Promise.reject(error)
    );
  }

  // Метод для добавления авторизационного заголовка
  setAuthToken(token: string): void {
    this.api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  // Удаление авторизационного заголовка
  clearAuthToken(): void {
    delete this.api.defaults.headers.common['Authorization'];
  }

  // Методы для выполнения запросов
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.get<T>(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.post<T>(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.put<T>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.delete<T>(url, config);
    return response.data;
  }

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {

    const response = await this.api.patch<T>(url, data, config);
    return response.data;
  }
}