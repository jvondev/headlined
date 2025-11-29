
'use client';

import { usePathname } from 'next/navigation';
import { Footer } from '@repo/ui/components/common/Footer';

export function FooterWrapper() {
  const pathname = usePathname();
  const hiddenRoutes = ['/today', '/yesterday', '/this-week', '/this-month', '/archive', '/search'];
  const showFooter = !hiddenRoutes.includes(pathname);

  return showFooter ? <Footer /> : null;
}
