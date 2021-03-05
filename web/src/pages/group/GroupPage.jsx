import Header from '@/components/ui/header/Header'
import HomeSidebar from '@/pages/home/HomeSidebar'
import React from 'react'
import GroupUsersSidebar from '@/pages/group/GroupSidebar'

export default function GroupPage() {
  return (
    <>
      <Header />
      <HomeSidebar />
      <GroupUsersSidebar />

      <main></main>
    </>
  )
}