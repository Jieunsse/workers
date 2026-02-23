import Image from 'next/image';
import MemberKebabMenu from './MemberKebabMenu';
import styles from './MemberCard.module.css';
import type { GroupMember } from '../../apis/types';
import { useRemoveMemberMutation } from '../../queries/useRemoveMemberMutation';

interface MemberCardProps {
  member: GroupMember;
  isAdmin: boolean;
  groupId: number;
}

export default function MemberCard({ member, isAdmin, groupId }: MemberCardProps) {
  const removeMemberMutation = useRemoveMemberMutation(groupId);

  const handleDelete = () => {
    removeMemberMutation.mutate(member.userId);
  };

  return (
    <div className={styles.card}>
      <div className={styles.avatar} aria-hidden="true">
        {member.userImage ? (
          <Image
            src={member.userImage}
            alt=""
            width={32}
            height={32}
            className={styles.avatarImg}
          />
        ) : (
          <span className={styles.avatarFallback}>{member.userName.charAt(0)}</span>
        )}
      </div>
      <div className={styles.info}>
        <span className={styles.name}>{member.userName}</span>
        <span className={styles.email}>{member.userEmail}</span>
      </div>
      {isAdmin && (
        <div className={styles.kebab}>
          <MemberKebabMenu onDelete={handleDelete} />
        </div>
      )}
    </div>
  );
}
