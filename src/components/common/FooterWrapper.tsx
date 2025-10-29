
'use client';

import { usePathname } from 'next/navigation';
import { Footer } from '@/components/common/Footer';

export function FooterWrapper() {
  const pathname = usePathname();
  const showFooter = pathname !== '/today';

  return showFooter ? <Footer /> : null;
}
