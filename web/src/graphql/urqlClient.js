import {
  createClient,
  dedupExchange,
  subscriptionExchange,
  errorExchange
} from 'urql'
import { authExchange } from '@urql/exchange-auth'
import { multipartFetchExchange } from '@urql/exchange-multipart-fetch'
import { makeOperation } from '@urql/core'
import { SubscriptionClient } from 'subscriptions-transport-ws'
import { cacheExchange } from '@urql/exchange-graphcache'
import { devtoolsExchange } from '@urql/devtools'
import { GET_MESSAGES } from '@/graphql/queries'
import { simplePagination } from '@urql/exchange-graphcache/extras'
import toast from 'react-hot-toast'

const subscriptionClient = new SubscriptionClient(
  process.env.NODE_ENV === 'production'
    ? `wss://${process.env.APP_DOMAIN}/${process.env.SERVER_PATH}/graphql`
    : 'ws://localhost:4000/graphql',
  {
    reconnect: true,
    connectionParams: () => {
      const token = localStorage.getItem('token')
      return {
        authorization: token ? `Bearer ${token}` : ''
      }
    }
  }
)

const getAuth = async ({ authState }) => {
  if (!authState) {
    const token = localStorage.getItem('token')
    if (token) {
      return { token }
    }
    return null
  }
  localStorage.removeItem('token')
  return null
}

const addAuthToOperation = ({ authState, operation }) => {
  /*if (operation.kind === 'subscription') {
    console.log(operation)
    return operation
  }*/

  if (!authState || !authState.token) {
    return operation
  }

  const fetchOptions =
    typeof operation.context.fetchOptions === 'function'
      ? operation.context.fetchOptions()
      : operation.context.fetchOptions || {}
  return makeOperation(operation.kind, operation, {
    ...operation.context,
    fetchOptions: {
      ...fetchOptions,
      headers: {
        ...fetchOptions.headers,
        authorization: `Bearer ${authState.token}`
      }
    }
  })
}

export const urqlClient = createClient({
  url:
    process.env.NODE_ENV === 'production'
      ? `https://${process.env.APP_DOMAIN}/${process.env.SERVER_PATH}/graphql`
      : 'http://localhost:4000/graphql',
  requestPolicy: 'cache-and-network',
  exchanges: [
    devtoolsExchange,
    dedupExchange,
    cacheExchange({
      keys: {
        GetPostsResponse: () => null,
        LinkMetadata: () => null,
        GetMessagesResponse: () => null,
        MessageSentResponse: () => null,
        MessageRemovedResponse: () => null
      },
      /*resolvers: {
        Query: {
          getMessages: simplePagination({
            offsetArgument: 'page',
            limitArgument: 'pageSize',
            mergeMode: 'before'
          }),
          getPosts: simplePagination({
            offsetArgument: 'page',
            limitArgument: 'pageSize',
            mergeMode: 'after'
          })
        }
      },*/
      updates: {
        Subscription: {
          messageSent: (
            { messageSent: { userId, groupId, channelId, message } },
            _variables,
            cache
          ) => {
            let variables
            if (userId) variables = { page: 0, userId }
            if (groupId) variables = { page: 0, groupId }
            if (channelId) variables = { page: 0, channelId }
            cache.updateQuery({ query: GET_MESSAGES, variables }, data => {
              if (data !== null) {
                data.getMessages.messages.push(message)
                return data
              } else {
                return null
              }
            })
          },
          messageUpdated: (
            { messageUpdated: { userId, groupId, channelId, message } },
            _variables,
            cache
          ) => {
            let variables = { page: 0, userId, groupId, channelId }
            cache.updateQuery({ query: GET_MESSAGES, variables }, data => {
              if (data !== null) {
                const i = data.getMessages.messages.findIndex(
                  m => m.id === message.id
                )
                data.getMessages.messages[i] = message
                return data
              } else {
                return null
              }
            })
          },
          messageRemoved: (
            { messageRemoved: { userId, groupId, channelId, messageId } },
            _variables,
            cache
          ) => {
            let variables = { page: 0, userId, groupId, channelId }
            cache.updateQuery({ query: GET_MESSAGES, variables }, data => {
              if (data !== null) {
                data.getMessages.messages = data.getMessages.messages.filter(
                  m => m.id !== messageId
                )
                return data
              } else {
                return null
              }
            })
          }
        }
      }
    }),
    authExchange({
      getAuth,
      addAuthToOperation
    }),
    errorExchange({
      onError(error) {
        toast.error(error.message.substring(10))
        if (process.env.NODE_ENV !== 'production') console.error(error)
      }
    }),
    multipartFetchExchange,
    subscriptionExchange({
      forwardSubscription(operation) {
        return subscriptionClient.request(operation)
      }
    })
  ]
})
