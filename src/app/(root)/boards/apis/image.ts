export async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('image', file);

  const response = await fetch('/api/images/upload', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`이미지 업로드에 실패했습니다. (status: ${response.status})`);
  }

  const data = (await response.json()) as { url: string };
  return data.url;
}
