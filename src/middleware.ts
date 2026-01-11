import { defineMiddleware } from 'astro/middleware';
import { isMobileUserAgent } from './utils/deviceDetection';

export const onRequest = defineMiddleware((context, next) => {
  const pathname = new URL(context.request.url).pathname;
  const userAgent = context.request.headers.get('user-agent');

  const isMobile = isMobileUserAgent(userAgent);
  const isMobilePath = pathname.startsWith('/mobile');
  const isDesktopPath = pathname.startsWith('/desktop');
  const isAsset =
    pathname.startsWith('/_astro') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/assets') ||
    pathname.startsWith('/api');

  if (!isAsset && isMobile && !isMobilePath) {
    return context.redirect('/mobile/lock');
  }

  if (!isAsset && !isMobile && isMobilePath && !isDesktopPath) {
    return context.redirect('/desktop');
  }

  return next();
});
