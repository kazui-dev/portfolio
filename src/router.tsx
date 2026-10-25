import { createRouter } from '@tanstack/react-router'

import { routeTree } from './routeTree.gen'
import { getScrollRestorationKey } from './lib/scroll-restoration'

export const getRouter = () => {
  const router = createRouter({
    routeTree,
    context: {},

    scrollRestoration: true,
    scrollRestorationBehavior: 'instant',
    getScrollRestorationKey,
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
