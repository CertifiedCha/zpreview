export const MAX_STORED_IMAGE_BYTES = 750 * 1024;

export function canStoreImageFile(file: File) {
  return file.size <= MAX_STORED_IMAGE_BYTES;
}

export function canStoreImageBlob(blob: Blob) {
  return blob.size <= MAX_STORED_IMAGE_BYTES;
}

export function formatImageStorageLimit() {
  return `${Math.round(MAX_STORED_IMAGE_BYTES / 1024)} KB`;
}

export function showImageStorageLimitAlert() {
  window.alert(`This image is too large to save in this prototype. Use an image under ${formatImageStorageLimit()}.`);
}
