export const MAX_STORED_IMAGE_BYTES = 2 * 1024 * 1024;

export function canStoreImageFile(file: File) {
  return file.size <= MAX_STORED_IMAGE_BYTES;
}

export function canStoreImageBlob(blob: Blob) {
  return blob.size <= MAX_STORED_IMAGE_BYTES;
}

export function formatImageStorageLimit() {
  return `${MAX_STORED_IMAGE_BYTES / (1024 * 1024)} MB`;
}

export function showImageStorageLimitAlert() {
  window.alert(`This image is too large to save in this prototype. Use an image under ${formatImageStorageLimit()}.`);
}
