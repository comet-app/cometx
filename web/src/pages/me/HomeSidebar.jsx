import Sidebar from '@/components/ui/sidebar/Sidebar'
import SidebarSortButtons from '@/components/ui/sidebar/SidebarSortButtons'
import {
  IconFriends,
  IconInbox,
  IconInfinity,
  IconX
} from '@/components/ui/icons/Icons'
import { useHistory, useLocation } from 'react-router-dom'
import UserAvatar from '@/components/user/UserAvatar'
import SidebarLabel from '@/components/ui/sidebar/SidebarLabel'
import SidebarItem from '@/components/ui/sidebar/SidebarItem'
import { useTranslation } from 'react-i18next'
import { useDrop } from 'react-dnd'
import { DragItemTypes } from '@/types/DragItemTypes'
import { useContextMenuTrigger } from '@/components/ui/context'
import { ContextMenuType } from '@/types/ContextMenuType'
import { mergeRefs } from '@/utils/mergeRefs'
import toast from 'react-hot-toast'
import { VectorLogo } from '@/components/ui/vectors'
import { useGroupsAndDms } from '@/providers/DataProvider'
import { HIDE_DM, SEND_MESSAGE } from '@/graphql/mutations'
import { useMutation } from 'urql'

export default function HomeSidebar() {
  const groupsAndDms = useGroupsAndDms()

  const { t } = useTranslation()

  return (
    <Sidebar>
      <div className="h-12 border-b dark:border-gray-850 shadow flex items-center px-5 text-base font-medium">
        <VectorLogo className="h-4" />
      </div>

      <div className="px-1.5 pt-3">
        <div className="space-y-0.5">
          <SidebarItem to="/me/friends">
            <IconFriends className="mr-3 h-5 w-5" />
            {t('user.friends.title')}
          </SidebarItem>

          <SidebarItem to="/me/inbox">
            <IconInbox className="mr-3 h-5 w-5" />
            {t('inbox.title')}
          </SidebarItem>

          <SidebarItem onClick={() => toast.error(t('infinity.comingSoon'))}>
            <IconInfinity className="mr-3 h-5 w-5" />
            {t('infinity.title')}
          </SidebarItem>
        </div>

        <SidebarLabel>{t('post.feed.title')}</SidebarLabel>

        <SidebarSortButtons />

        <SidebarLabel plusLabel="Create DM">{t('dm.title')}</SidebarLabel>

        <div className="space-y-0.5">
          {!!groupsAndDms &&
            groupsAndDms.map(groupOrDm => {
              if (groupOrDm.__typename === 'Group') {
                const group = groupOrDm
                return <div>Group</div>
              } else if (groupOrDm.__typename === 'User') {
                const user = groupOrDm
                return <DirectMessage user={user} key={`user-${user.id}`} />
              }
            })}
        </div>
      </div>
    </Sidebar>
  )
}

function DirectMessage({ user }) {
  const { t } = useTranslation()

  const [_, hideDm] = useMutation(HIDE_DM)

  const { push } = useHistory()
  const { pathname } = useLocation()

  const contextMenuRef = useContextMenuTrigger({
    menuId: ContextMenuType.User,
    data: { user, showCloseDm: true }
  })

  const [_sendMessageRes, sendMessage] = useMutation(SEND_MESSAGE)

  const [{ isOver, canDrop }, dropRef] = useDrop({
    accept: DragItemTypes.Post,
    drop: (post, monitor) => {
      push(`/me/dm/${user.id}`)
      sendMessage({
        userId: user.id,
        text: `${location.origin}${post.relativeUrl}`
      })
    },
    collect: monitor => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop()
    })
  })
  const isActive = isOver && canDrop

  return (
    <SidebarItem
      ref={mergeRefs(contextMenuRef, dropRef)}
      large
      to={`/me/dm/${user.id}`}
      key={`user-${user.id}`}
    >
      <UserAvatar
        size={9}
        showOnline
        user={user}
        dotClassName="ring-3 w-2.5 h-2.5 dark:ring-gray-800"
      />
      <span className="ml-3">{user.name}</span>

      <IconX
        onClick={e => {
          e.stopPropagation()
          e.preventDefault()
          hideDm({ userId: user.id })
          if (pathname === `/me/dm/${user.id}`) push('/me/friends')
        }}
        className="group-hover:block hidden w-5 h-5 ml-auto cursor-pointer text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
      />
    </SidebarItem>
  )
}
