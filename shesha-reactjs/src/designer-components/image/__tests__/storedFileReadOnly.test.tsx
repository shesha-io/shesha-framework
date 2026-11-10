import { render, screen, waitFor } from '@testing-library/react';
import { App } from 'antd';
import { FileUploadProvider } from '@/providers/storedFile';
import { ImageField } from '../image';

const FILE_ID = 'f6b1c7a2-0000-0000-0000-000000000001';
const FILE_DOWNLOAD_URL = '/api/StoredFile/Download?id=' + FILE_ID;
const BLOB_URL = 'blob:stored-image';

vi.mock('@/providers/sheshaApplication', () => ({
  useSheshaApplication: () => ({ backendUrl: 'http://backend', httpHeaders: {} }),
}));

vi.mock('@/providers/sheshaApplication/publicApi', () => ({
  useHttpClient: () => ({
    get: () => new Promise((resolve) => {
      // resolve after the first render so the file info arrives asynchronously, as it does from the backend
      setTimeout(() => resolve({
        data: {
          success: true,
          result: { id: FILE_ID, name: 'photo.png', type: 'png', size: 10, url: FILE_DOWNLOAD_URL, temporary: false, userHasDownloaded: false },
        },
      }), 10);
    }),
  }),
}));

vi.mock('@/providers/delayedUpdateProvider', () => ({
  useDelayedUpdateOrUndefined: () => undefined,
}));

/**
 * A stored-file image in a readonly form has no upload control, so nothing re-renders it apart from the
 * file info arriving. The image must still appear once that info is fetched.
 */
describe('image component with a stored file', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({ blob: () => Promise.resolve(new Blob(['x'])) })));
    URL.createObjectURL = vi.fn(() => BLOB_URL);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('shows the image in readonly mode and hides the upload button', async () => {
    render(
      <App>
        <FileUploadProvider value={FILE_ID}>
          <ImageField imageSource="storedFile" value={FILE_ID} readOnly styles={{}} alt="stored" />
        </FileUploadProvider>
      </App>,
    );

    await waitFor(() => expect(screen.getByAltText('stored').getAttribute('src')).toBe(BLOB_URL));
    expect(fetch).toHaveBeenCalledWith('http://backend' + FILE_DOWNLOAD_URL, expect.anything());
    expect(screen.queryByRole('button')).toBeNull();
  });
});
