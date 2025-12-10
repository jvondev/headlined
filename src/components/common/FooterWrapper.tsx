
'use client';

import { usePathname } from 'next/navigation';
import { Footer } from '@/components/common/Footer';
import { SEO_CONFIG } from '@/lib/seo-config';

export function FooterWrapper() {
  const pathname = usePathname();
  const hiddenRoutes = ['/app/today', '/app/yesterday', '/app/this-week', '/app/this-month', '/app/archive', '/search'];

  const isSeoPage = Object.keys(SEO_CONFIG).some(cat => pathname.startsWith(`/${cat}/`));

  const showFooter = !hiddenRoutes.includes(pathname) && !isSeoPage;

  return showFooter ? <Footer /> : null;
}
