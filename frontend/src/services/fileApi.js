import api from './api';

// Private files require a Bearer token, so they must be fetched through the
// authenticated Axios client instead of using a direct <a href> URL.
export async function openAuthorizedFile(path) {
  const previewWindow = window.open('', '_blank');
  try {
    const response = await api.get(path, { responseType: 'blob' });
    const blobUrl = window.URL.createObjectURL(new Blob([response.data], {
      type: response.headers['content-type'] || 'application/octet-stream',
    }));

    if (previewWindow) {
      previewWindow.opener = null;
      previewWindow.location.replace(blobUrl);
    } else {
      window.location.assign(blobUrl);
    }
    window.setTimeout(() => window.URL.revokeObjectURL(blobUrl), 60_000);
  } catch (error) {
    previewWindow?.close();
    throw error;
  }
}
