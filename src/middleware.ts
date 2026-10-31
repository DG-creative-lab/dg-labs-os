import { defineMiddleware } from 'astro/middleware';
import { isMobileUserAgent } from './utils/deviceDetection';
import { isPotentialPublicProfilePath } from './utils/profileRoutes';

export const onRequest = defineMiddleware((context, next) => {
  const pathname = new URL(context.request.url).pathname;
  const userAgent = context.request.headers.get('user-agent');

  const isMobile = isMobileUserAgent(userAgent);
  const isMobilePath = pathname.startsWith('/mobile');
  const isDesktopPath = pathname.startsWith('/desktop');
  const isStandaloneResponsivePath =
    pathname === '/' ||
    pathname === '/systems' ||
    pathname.startsWith('/apply/') ||
    isPotentialPublicProfilePath(pathname);
  const isAsset =
    pathname.startsWith('/_astro') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/assets') ||
    pathname.startsWith('/api');

  if (!isAsset && isMobile && !isMobilePath && !isStandaloneResponsivePath) {
    const mobileCompatibilityRoutes: Record<string, string> = {
      '/apps/projects': '/@dessi/workbench',
      '/apps/evolution': '/@dessi/evolution',
      '/apps/notes': '/@dessi/writing',
      '/apps/resume': '/@dessi/resume',
      '/apps/network': '/@dessi/network',
      '/apps/terminal': '/mobile/apps/terminal',
    };
    return context.redirect(mobileCompatibilityRoutes[pathname] ?? '/@dessi');
  }

  if (!isAsset && !isMobile && isMobilePath && !isDesktopPath) {
    return context.redirect('/desktop');
  }

  return next();
});
