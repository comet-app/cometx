import React from 'react'
import NavLink from '@/components/NavLink'
import { useRouter } from 'next/router'
import TimePicker from '@/components/sort/TimePicker'

const itemActive = 'text-blue-500'
const itemInactive = 'text-tertiary'
const item =
  'select-none text-xl font-bold tracking-tight leading-none cursor-pointer hover:underline'

export default function SortOptions() {
  const { query, pathname } = useRouter()

  return (
    <div className="flex items-center space-x-4 mb-6">
      <NavLink
        href={{
          pathname,
          query: (() => {
            const q = { ...query }
            delete q.time
            delete q.sort
            return q
          })()
        }}
        className={`${
          !query.sort || query.sort === 'hot' ? itemActive : itemInactive
        } ${item} `}
      >
        Hot
      </NavLink>
      <NavLink
        href={{
          pathname,
          query: (() => {
            const q = { ...query }
            delete q.time
            q.sort = 'new'
            return q
          })()
        }}
        className={`${
          query.sort === 'new' ? itemActive : itemInactive
        } ${item}`}
      >
        New
      </NavLink>
      <NavLink
        href={{ pathname, query: { ...query, sort: 'top' } }}
        className={`${
          query.sort === 'top' ? itemActive : itemInactive
        } ${item} `}
      >
        Top
      </NavLink>

      {query.sort === 'top' && (
        <TimePicker
          item={item}
          itemActive={itemActive}
          itemInactive={itemInactive}
        />
      )}
    </div>
  )
}