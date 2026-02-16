'use client';

import { type ReactNode, useState } from 'react';
import { MobileHeader, Sidebar } from '@/components/sidebar';
import CreateTeamCard from './_components/CreateTeamCard';
import JoinTeamCard from './_components/JoinTeamCard';
import NoTeamState from './_components/NoTeamState';
import { CREATE_TEAM_MESSAGES, ENABLE_NO_TEAM_STATE_PREVIEW } from './_constants/createTeam';
import { useCreateTeam } from './_hooks/useCreateTeam';
import type { CreateTeamFeedback } from './_interfaces/feedback';
import { getCreateTeamFailureMessage } from './_utils/getCreateTeamFailureMessage';
import styles from './page.module.css';

type AddTeamView = 'empty' | 'create' | 'join';
const INITIAL_VIEW: AddTeamView = ENABLE_NO_TEAM_STATE_PREVIEW ? 'empty' : 'create';

export default function AddTeamPage() {
  const [teamName, setTeamName] = useState('');
  const [teamLink, setTeamLink] = useState('');
  const [createTeamFeedback, setCreateTeamFeedback] = useState<CreateTeamFeedback | null>(null);
  const [view, setView] = useState<AddTeamView>(INITIAL_VIEW);
  const { createTeam, isPending } = useCreateTeam();

  const isSubmitDisabled = !teamName.trim() || isPending;

  const handleSubmit = async () => {
    if (isSubmitDisabled) return;

    try {
      await createTeam(teamName);
      setTeamName('');
      setCreateTeamFeedback({ type: 'success', message: CREATE_TEAM_MESSAGES.success });
    } catch (error) {
      setCreateTeamFeedback({ type: 'error', message: getCreateTeamFailureMessage(error) });
    }
  };

  const handleGoCreateView = () => setView('create');
  const handleGoJoinView = () => setView('join');

  const handleTeamNameChange = (value: string) => {
    setTeamName(value);
    setCreateTeamFeedback(null);
  };

  const contentByView = {
    create: (
      <CreateTeamCard
        value={teamName}
        disabled={isSubmitDisabled}
        feedback={createTeamFeedback}
        onChange={handleTeamNameChange}
        onSubmit={handleSubmit}
      />
    ),
    join: <JoinTeamCard teamLink={teamLink} onTeamLinkChange={setTeamLink} />,
    empty: (
      <NoTeamState onCreateTeamClick={handleGoCreateView} onJoinTeamClick={handleGoJoinView} />
    ),
  } satisfies Record<AddTeamView, ReactNode>;

  return (
    <main className={styles.page}>
      <Sidebar />
      <div className={styles.mobileOnlyHeader}>
        <MobileHeader />
      </div>
      <section className={styles.mainContents}>{contentByView[view]}</section>
    </main>
  );
}
