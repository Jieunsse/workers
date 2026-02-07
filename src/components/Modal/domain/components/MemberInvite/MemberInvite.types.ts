import type { BaseDomainModalProps } from '../../types/types';

export interface MemberInviteTextOptions {
  title?: string;
  description?: string;
  copyButtonLabel?: string;
}

export interface MemberInviteInviteOptions {
  link: string;
  onCopyLink?: (link: string) => void;
}

export interface MemberInviteProps extends BaseDomainModalProps {
  invite: MemberInviteInviteOptions;
  text?: MemberInviteTextOptions;
}
