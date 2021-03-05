import React, { Suspense } from 'react'
import { Redirect, Route, Switch } from 'react-router-dom'
import LandingPage from '@/pages/LandingPage'
import HomePage from '@/pages/home/HomePage'
import ExplorePage from '@/pages/explore/ExplorePage'
import LoginPage from '@/pages/auth/LoginPage'
import RegisterPage from '@/pages/auth/RegisterPage'
import AuthLayout from '@/pages/auth/AuthLayout'
import LoadingScreen from '@/pages/LoadingScreen'
import { BrowserRouter } from 'react-router-dom'
import PlanetPostsPage from '@/pages/planet/PlanetPostsPage'
import PlanetScroller from '@/components/planet-scroller/PlanetScroller'
import HomeLayout from '@/pages/home/HomeLayout'
import PlanetLayout from '@/pages/planet/PlanetLayout'
import GroupPage from '@/pages/group/GroupPage'
import FolderPage from '@/pages/folder/FolderPage'
import PlanetChannelPage from '@/pages/channel/PlanetChannelPage'
import PlanetPostPage from '@/pages/post/PlanetPostPage'
import PlanetFolderPage from '@/pages/folder/PlanetFolderPage'
import NotFound from '@/pages/NotFound'
import { useQuery } from 'urql'
import { GET_CURRENT_USER } from '@/graphql/queries'

export default function Router() {
  const [{ data }] = useQuery({
    query: GET_CURRENT_USER,
    context: { suspense: false }
  })
  const currentUser = data?.currentUser
  return (
    <BrowserRouter>
      <Switch>
        <Route
          path="/"
          exact
          render={() => {
            if (window.electron) {
              if (currentUser) return <Redirect to="/home" />
              return <Redirect to="/login" />
            } else {
              return <LandingPage currentUser={currentUser} />
            }
          }}
        />

        <Route path={['/login', '/register']}>
          <AuthLayout>
            <Switch>
              <Route
                path="/login"
                render={() =>
                  currentUser ? <Redirect to="/home" /> : <LoginPage />
                }
              />
              <Route
                path="/register"
                render={() =>
                  currentUser ? <Redirect to="/home" /> : <RegisterPage />
                }
              />
            </Switch>
          </AuthLayout>
        </Route>

        <Route
          path={[
            '/home',
            '/home/folder/:folderId',
            '/home/chat/:groupId',
            '/explore',
            '/planet/:planetId',
            '/planet/:planetId/channel/:channelId',
            '/planet/:planetId/post/:postId',
            '/planet/:planetId/folder/:folderId'
          ]}
          exact
        >
          <Suspense fallback={<LoadingScreen />}>
            <PlanetScroller />
            <Switch>
              <PrivateRoute path="/home">
                <HomeLayout>
                  <Switch>
                    <PrivateRoute path="/home" exact>
                      <HomePage />
                    </PrivateRoute>
                    <PrivateRoute path="/home/folder/:folderId">
                      <FolderPage />
                    </PrivateRoute>
                    <PrivateRoute path="/home/chat/:groupId">
                      <GroupPage />
                    </PrivateRoute>
                  </Switch>
                </HomeLayout>
              </PrivateRoute>
              <PrivateRoute path="/explore">
                <ExplorePage />
              </PrivateRoute>
              <PrivateRoute path="/planet/:planetId">
                <PlanetLayout>
                  <Switch>
                    <PrivateRoute path="/planet/:planetId" exact>
                      <PlanetPostsPage />
                    </PrivateRoute>
                    <PrivateRoute path="/planet/:planetId/channel/:channelId">
                      <PlanetChannelPage />
                    </PrivateRoute>
                    <PrivateRoute path="/planet/:planetId/post/:postId">
                      <PlanetPostPage />
                    </PrivateRoute>
                    <PrivateRoute path="/planet/:planetId/folder/:folderId">
                      <PlanetFolderPage />
                    </PrivateRoute>
                  </Switch>
                </PlanetLayout>
              </PrivateRoute>
            </Switch>
          </Suspense>
        </Route>

        <Route>
          <NotFound />
        </Route>
      </Switch>
    </BrowserRouter>
  )
}

function PrivateRoute({ children, ...rest }) {
  const [{ data }] = useCurrentUserQuery()
  const currentUser = data?.currentUser

  return (
    <Route
      {...rest}
      render={() => (currentUser ? children : <Redirect to="/login" />)}
    />
  )
}
