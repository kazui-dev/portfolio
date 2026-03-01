import { createRouter } from '@tanstack/react-router'

import { routeTree } from './routeTree.gen'

export const getRouter = () => {
  const router = createRouter({
    routeTree,
    context: {},

    scrollRestoration: true,
    scrollRestorationBehavior: 'instant',
    getScrollRestorationKey(location) {
      return location.pathname + location.search;
    },
    defaultPreloadStaleTime: 0,
    defaultPreload: 'intent',
    defaultNotFoundComponent: () => (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold">404 - ページが見つかりません</h1>
      </div>
    ),
  })

  return router
}
