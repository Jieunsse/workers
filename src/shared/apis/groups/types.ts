export interface CreateGroupBody {
  name: string;
  image?: string;
}

export interface Group {
  id: number;
  name: string;
  image: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AcceptInvitationBody {
  token: string;
}

export interface InvitationInfo {
  id: number;
  name: string;
  image: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AddMemberBody {
  email: string;
}

export interface GroupMember {
  userId: number;
  name: string;
  email?: string;
  image?: string | null;
}

export interface GroupTask {
  id: number;
  name?: string;
  title?: string;
  done?: boolean;
  date?: string;
}
