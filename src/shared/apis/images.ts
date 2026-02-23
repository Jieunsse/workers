interface ImageUploadResponse {
  url: string;
}

export async function uploadImage(file: File): Promise<ImageUploadResponse> {
  const formData = new FormData();
  formData.append('image', file);

  const response = await fetch('/api/images/upload', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`이미지 업로드 실패 (status: ${response.status})`);
  }

  return response.json() as Promise<ImageUploadResponse>;
}
