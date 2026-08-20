import { RollingUpgradeService } from '@services/rollingUpgradeService';
import { FetchCaller } from '@services/fetchCaller';

const mockFetchCaller = {
  post: jest.fn(),
  get: jest.fn(),
  delete: jest.fn(),
  head: jest.fn(),
  fetch: jest.fn()
} as unknown as FetchCaller;

describe('RollingUpgradeService', () => {
  let service: RollingUpgradeService;

  beforeEach(() => {
    service = new RollingUpgradeService('http://localhost:11222/rest/v3', mockFetchCaller);
    jest.clearAllMocks();
  });

  test('checkSourceConnection returns true when HEAD returns 200', async () => {
    (mockFetchCaller.fetch as jest.Mock).mockResolvedValue({ ok: true });
    const result = await service.checkSourceConnection('my-cache');
    expect(result).toBe(true);
    expect(mockFetchCaller.fetch).toHaveBeenCalledWith(
      'http://localhost:11222/rest/v3/caches/my-cache/rolling-upgrade/source-connection',
      'HEAD'
    );
  });

  test('checkSourceConnection returns false when HEAD returns 404', async () => {
    (mockFetchCaller.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 404
    });
    const result = await service.checkSourceConnection('my-cache');
    expect(result).toBe(false);
  });

  test('addSourceConnection posts remote-store config', async () => {
    (mockFetchCaller.post as jest.Mock).mockResolvedValue({
      success: true,
      message: 'ok'
    });
    await service.addSourceConnection('my-cache', {
      host: 'old-cluster',
      port: 11222
    });
    expect(mockFetchCaller.post).toHaveBeenCalledWith(
      expect.objectContaining({
        url: 'http://localhost:11222/rest/v3/caches/my-cache/rolling-upgrade/source-connection',
        body: expect.stringContaining('"host":"old-cluster"')
      })
    );
  });

  test('deleteSourceConnection calls DELETE', async () => {
    (mockFetchCaller.delete as jest.Mock).mockResolvedValue({
      success: true,
      message: 'ok'
    });
    await service.deleteSourceConnection('my-cache');
    expect(mockFetchCaller.delete).toHaveBeenCalledWith(
      expect.objectContaining({
        url: 'http://localhost:11222/rest/v3/caches/my-cache/rolling-upgrade/source-connection'
      })
    );
  });

  test('syncData calls POST and returns entry count', async () => {
    (mockFetchCaller.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      text: () => Promise.resolve('5000')
    });
    const result = await service.syncData('my-cache');
    expect(result.isRight()).toBe(true);
    expect(result.value).toBe(5000);
  });

  test('syncData includes query params when provided', async () => {
    (mockFetchCaller.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      text: () => Promise.resolve('100')
    });
    await service.syncData('my-cache', 5000, 4);
    expect(mockFetchCaller.fetch).toHaveBeenCalledWith(
      'http://localhost:11222/rest/v3/caches/my-cache/_sync-data?read-batch=5000&threads=4',
      'POST'
    );
  });

  test('cache name is URL-encoded', async () => {
    (mockFetchCaller.fetch as jest.Mock).mockResolvedValue({ ok: true });
    await service.checkSourceConnection('my cache/special');
    expect(mockFetchCaller.fetch).toHaveBeenCalledWith(
      'http://localhost:11222/rest/v3/caches/my%20cache%2Fspecial/rolling-upgrade/source-connection',
      'HEAD'
    );
  });
});
