import { useRouter } from 'next/router';
import * as React from 'react';

import BoardLayout from '@/components/board/BoardLayout';

import Seo from '@/component/seo';

export default function ConversationPage() {
  const router = useRouter();
  const { conversationId } = router.query as { conversationId?: string };

  return (
    <>
      <Seo templateTitle='Board Conversation' />
      <BoardLayout conversationId={conversationId} />
    </>
  );
}
