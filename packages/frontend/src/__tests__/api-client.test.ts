import { ApiClient } from '@/lib/api-client';

describe('ApiClient', () => {
  let client: ApiClient;

  beforeEach(() => {
    client = new ApiClient();
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should create an axios instance', () => {
    const instance = client.getInstance();
    expect(instance).toBeDefined();
    expect(instance.defaults.baseURL).toBeDefined();
  });

  it('should set auth token in localStorage', () => {
    const token = 'test-token-123';
    client.setAuthToken(token);
    expect(localStorage.getItem('auth_token')).toBe(token);
  });

  it('should clear auth token from localStorage', () => {
    localStorage.setItem('auth_token', 'test-token');
    client.clearAuthToken();
    expect(localStorage.getItem('auth_token')).toBeNull();
  });

  it('should include auth token in request headers', async () => {
    const token = 'test-token-123';
    client.setAuthToken(token);

    const instance = client.getInstance();
    const config = await instance.interceptors.request.handlers[0].fulfilled({
      headers: {},
    } as any);

    expect(config.headers.Authorization).toBe(`Bearer ${token}`);
  });
});
