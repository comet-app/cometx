import { useRouter } from 'next/router'
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react'
import {
  FiBell,
  FiGlobe,
  FiHome,
  FiLogIn,
  FiSettings,
  FiStar,
  FiUser,
} from 'react-icons/fi'
import { gql, useQuery } from '@apollo/client'
import { NavLink } from './NavLink'

const TOP_PLANETS = gql`
  query TopPlanets {
    planets(sort: TOP, pageSize: 5) {
      id
      name
      profile {
        avatarURL
      }
    }
  }
`

function TopPlanets() {
  const { data, loading, error } = useQuery(TOP_PLANETS)

  if (loading || error) return null

  return (
    <div>
      {data.planets.map(planet => (
        <NavLink
          className="navitem"
          key={planet.id}
          href="/+[planet]"
          as={`/+${planet.name}`}
        >
          <img
            src={planet.profile.avatarURL}
            className="w-8 h-8 mr-6 rounded-full bg-gray-200"
            alt={planet.name}
          />
          <span className="text-tertiary">+{planet.name}</span>
        </NavLink>
      ))}
    </div>
  )
}

function LeftNavDrawer() {
  const router = useRouter()

  return (
    <OverlayScrollbarsComponent>
      <nav className="navdrawer">
        <div className="mx-5 pt-7 pb-5 mb-4 border-b border-gray-200 dark:border-gray-700 flex flex-row items-center">
          <NavLink href="/" className="ml-1.5 mr-auto">
            <img
              src="/logos/logo_white_noio.svg"
              className="w-32"
              alt="CometX logo"
            />
          </NavLink>
          <NavLink
            href="/settings"
            className="hover:scale-125 transform duration-150 ease-in-out text-gray-500"
          >
            <FiSettings className="w-4 h-4" />
          </NavLink>
          <NavLink
            href="/notifications"
            className="ml-4 hover:scale-125 transform duration-150 ease-in-out text-gray-500"
          >
            <FiBell className="w-4 h-4" />
          </NavLink>
        </div>
        <div className="text-gray-500">
          <NavLink href="/" className="navitem border-indigo-600">
            <FiHome className="w-6 h-6" />
            <span className="ml-6">Home</span>
          </NavLink>
          <NavLink href="/universe" className="navitem border-black">
            <FiGlobe className="w-6 h-6" />
            <span className="ml-6">Universe</span>
          </NavLink>
          <NavLink href="/~Test" className="navitem border-purple-600">
            <FiStar className="w-6 h-6" />
            <span className="ml-6">Galaxies</span>
          </NavLink>
          <NavLink
            href="/login"
            className="navitem cursor-pointer text-green-600"
          >
            <FiLogIn className="w-6 h-6" />
            <span className="ml-6">Log In</span>
          </NavLink>
        </div>

        <NavLink
          href={router.pathname}
          as="/login"
          className="m-4 shadow-md px-6 py-2.5 bg-indigo-500 hover:bg-indigo-600 rounded-full text-white text-sm flex flex-row items-center cursor-pointer hover:scale-105 transform duration-150 ease-in-out"
        >
          <div className="mx-auto inline-flex flex-row items-center">
            <FiUser className="w-6 h-6 mr-4" />
            <span className="font-medium">Sign Up</span>
          </div>
        </NavLink>

        <div className="px-5 mt-9 mb-3 flex flex-row items-center">
          <div className="text-tiny font-bold tracking-widest uppercase text-tertiary">
            Top Planets
          </div>
          <div className="ml-auto rounded-full border border-gray-200 dark:border-gray-700 text-tiny font-bold tracking-widest uppercase text-tertiary py-1 px-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition ease-in-out duration-100 inline-flex items-center">
            EXPLORE
          </div>
        </div>

        <TopPlanets />
      </nav>
    </OverlayScrollbarsComponent>
  )
}

export default LeftNavDrawer
