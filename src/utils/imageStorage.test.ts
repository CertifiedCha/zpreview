import { describe, expect, it } from "vitest";
import {
  MAX_STORED_IMAGE_BYTES,
  canStoreImageBlob,
  canStoreImageFile,
  formatImageStorageLimit,
} from "./imageStorage";

describe("image storage limit", () => {
  it("accepts images up to and including 2 MB", () => {
    expect(MAX_STORED_IMAGE_BYTES).toBe(2 * 1024 * 1024);
    expect(canStoreImageFile({ size: MAX_STORED_IMAGE_BYTES } as File)).toBe(true);
    expect(canStoreImageBlob({ size: MAX_STORED_IMAGE_BYTES } as Blob)).toBe(true);
  });

  it("rejects images larger than 2 MB", () => {
    expect(canStoreImageFile({ size: MAX_STORED_IMAGE_BYTES + 1 } as File)).toBe(false);
    expect(canStoreImageBlob({ size: MAX_STORED_IMAGE_BYTES + 1 } as Blob)).toBe(false);
    expect(formatImageStorageLimit()).toBe("2 MB");
  });
});
