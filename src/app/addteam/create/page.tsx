'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import CreateTeamCard from '../_domain/components/CreateTeamCard';
import { CREATE_TEAM_MESSAGES } from '../_domain/constants/createTeam';
import { useCreateTeam } from '../_domain/hooks/useCreateTeam';
import { getCreateTeamFailureMessage } from '../_domain/utils/getCreateTeamFailureMessage';
import type { CreateTeamFeedback } from '../_domain/interfaces/feedback';

export default function CreateTeamPage() {
  const [teamName, setTeamName] = useState('');
  const [createTeamFeedback, setCreateTeamFeedback] = useState<CreateTeamFeedback | null>(null);
  const { createTeam, isPending } = useCreateTeam();
  const router = useRouter();

  const isSubmitDisabled = !teamName.trim() || isPending;

  const handleSubmit = async () => {
    if (isSubmitDisabled) return;

    try {
      const group = await createTeam(teamName);
      setTeamName('');
      setCreateTeamFeedback({ type: 'success', message: CREATE_TEAM_MESSAGES.success });
      router.push(`/teams/${group.id}`);
    } catch (error) {
      setCreateTeamFeedback({ type: 'error', message: getCreateTeamFailureMessage(error) });
    }
  };

  const handleTeamNameChange = (value: string) => {
    setTeamName(value);
    setCreateTeamFeedback(null);
  };

  return (
    <CreateTeamCard
      value={teamName}
      disabled={isSubmitDisabled}
      feedback={createTeamFeedback}
      onChange={handleTeamNameChange}
      onSubmit={handleSubmit}
    />
  );
}
