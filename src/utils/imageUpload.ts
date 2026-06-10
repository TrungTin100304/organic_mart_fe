export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
export const IMAGE_ACCEPT = "image/jpeg,image/png,image/webp";

const ALLOWED_IMAGE_TYPES = new Set(IMAGE_ACCEPT.split(","));

export const validateImageFile = (file: File): string | null => {
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    return "Chỉ chấp nhận ảnh JPEG, PNG hoặc WEBP.";
  }
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return "Ảnh không được vượt quá 5MB.";
  }
  return null;
};
