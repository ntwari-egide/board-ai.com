import * as React from 'react';

import BoardLayout from '@/components/board/BoardLayout';

import Seo from '@/component/seo';

export default function HomePage() {
  return (
    <>
      <Seo templateTitle='Board' />
      <BoardLayout
        userName='Winter Aconite'
        userAvatar='/images/user-avatar.jpg' // Replace with actual avatar path
      />
    </>
  );
}
