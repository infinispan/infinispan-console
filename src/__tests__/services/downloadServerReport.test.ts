import * as DownloadServerReport from '@app/services/clusterHook';

jest.mock('@app/services/clusterHook');
const mockedClusterHook = DownloadServerReport as jest.Mocked<typeof DownloadServerReport>;

let onDownloadReport;

beforeEach(() => {
  onDownloadReport = 0;
  mockedClusterHook.useDownloadServerReport.mockClear();
});

mockedClusterHook.useDownloadServerReport.mockImplementation(() => {
  return {
    downloadServerReport: () => onDownloadReport++,
    downloading: true
  };
});

describe('downloadReport', () => {
  test('To download server report and check download calls', () => {
    const { downloadServerReport } = DownloadServerReport.useDownloadServerReport();
    downloadServerReport('node1');
    expect(onDownloadReport).toBe(1);
  });
});
