import type { ImageProps } from 'next/image';
import type { BaseDomainModalProps } from '../../types/types';

export interface ProfileModalProfileOptions {
  title: string;
  email: string;
  imageSrc?: ImageProps['src'];
  imageAlt?: string;
  copyButtonLabel?: string;
}

export interface ProfileModalProps extends BaseDomainModalProps {
  onCopyEmail: () => void;
  profile: ProfileModalProfileOptions;
}
