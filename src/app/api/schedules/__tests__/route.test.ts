import { GET } from '../route';
import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';

// Mock dependencies
jest.mock('next-auth');
jest.mock('@/lib/auth/options', () => ({
  authOptions: {},
}));

// Mock fetch
global.fetch = jest.fn();

describe('/api/schedules', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET', () => {
    it('should return 401 when user is not authenticated', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/schedules');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should return 401 when session has no access token', async () => {
      (getServerSession as jest.Mock).mockResolvedValue({
        user: { id: '123', email: 'test@example.com' },
      });

      const request = new NextRequest('http://localhost:3000/api/schedules');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should fetch schedules from PagerDuty successfully', async () => {
      const mockSchedules = [
        {
          id: 'SCHEDULE1',
          name: 'Engineering On-Call',
          description: 'Main engineering rotation',
          time_zone: 'America/New_York',
        },
        {
          id: 'SCHEDULE2',
          name: 'Support Team',
          description: 'Customer support rotation',
          time_zone: 'UTC',
        },
      ];

      (getServerSession as jest.Mock).mockResolvedValue({
        user: { id: '123' },
        accessToken: 'mock_access_token',
      });

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ schedules: mockSchedules }),
      });

      const request = new NextRequest('http://localhost:3000/api/schedules');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.schedules).toEqual(mockSchedules);
      expect(data.total).toBe(2);

      // Verify PagerDuty API was called correctly
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('https://api.pagerduty.com/schedules'),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer mock_access_token',
            Accept: 'application/vnd.pagerduty+json;version=2',
          }),
        })
      );
    });

    it('should handle PagerDuty API errors', async () => {
      (getServerSession as jest.Mock).mockResolvedValue({
        user: { id: '123' },
        accessToken: 'mock_access_token',
      });

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({
          error: { message: 'PagerDuty service unavailable' },
        }),
      });

      const request = new NextRequest('http://localhost:3000/api/schedules');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to fetch schedules');
      expect(data.message).toBe('PagerDuty service unavailable');
    });

    it('should handle 401 from PagerDuty (expired token)', async () => {
      (getServerSession as jest.Mock).mockResolvedValue({
        user: { id: '123' },
        accessToken: 'expired_token',
      });

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({ error: { message: 'Unauthorized' } }),
      });

      const request = new NextRequest('http://localhost:3000/api/schedules');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
      expect(data.message).toBe('Invalid or expired PagerDuty token');
    });

    it('should pass query parameter to PagerDuty API', async () => {
      (getServerSession as jest.Mock).mockResolvedValue({
        user: { id: '123' },
        accessToken: 'mock_access_token',
      });

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ schedules: [] }),
      });

      const request = new NextRequest('http://localhost:3000/api/schedules?query=engineering');
      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('query=engineering'),
        expect.any(Object)
      );
    });

    it('should handle network errors', async () => {
      (getServerSession as jest.Mock).mockResolvedValue({
        user: { id: '123' },
        accessToken: 'mock_access_token',
      });

      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      const request = new NextRequest('http://localhost:3000/api/schedules');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Internal server error');
      expect(data.message).toBe('Network error');
    });

    it('should return empty array when no schedules exist', async () => {
      (getServerSession as jest.Mock).mockResolvedValue({
        user: { id: '123' },
        accessToken: 'mock_access_token',
      });

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ schedules: [] }),
      });

      const request = new NextRequest('http://localhost:3000/api/schedules');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.schedules).toEqual([]);
      expect(data.total).toBe(0);
    });
  });
});
