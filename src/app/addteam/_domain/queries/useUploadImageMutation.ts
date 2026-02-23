import { useMutation } from '@tanstack/react-query';
import { uploadImage } from '../apis/image';

export function useUploadImageMutation() {
  return useMutation({
    mutationFn: uploadImage,
  });
}
