'use client';

import NextLink from 'next/link';
import { useParams as useNextParams, usePathname, useRouter, useSearchParams as useNextSearchParams } from 'next/navigation';
import { useEffect } from 'react';

export function Link({ to, href, replace: _replace, ...props }) {
  return <NextLink href={href || to || '/'} {...props} />;
}

export function useParams() {
  return useNextParams();
}

export function useNavigate() {
  const router = useRouter();
  return (to, options = {}) => {
    if (typeof to === 'number') {
      if (to < 0) router.back();
      return;
    }
    if (options.replace) router.replace(to);
    else router.push(to);
  };
}

export function useSearchParams() {
  const params = useNextSearchParams();
  // React Router returns [params, setter]. Existing DOMERA only reads params.
  return [params, () => {}];
}

export function useLocation() {
  const pathname = usePathname();
  const params = useNextSearchParams();
  const search = params?.toString() ? `?${params.toString()}` : '';
  return { pathname, search, hash: '', state: null, key: pathname };
}

export function useNavigationType() {
  return 'PUSH';
}

export function Navigate({ to, replace = false }) {
  const router = useRouter();
  useEffect(() => {
    replace ? router.replace(to) : router.push(to);
  }, [router, to, replace]);
  return null;
}

export function NavLink({ to, className, children, ...props }) {
  const pathname = usePathname();
  const active = pathname === to || pathname?.startsWith(`${to}/`);
  const resolvedClass = typeof className === 'function' ? className({ isActive: active }) : className;
  return <NextLink href={to} className={resolvedClass} {...props}>{typeof children === 'function' ? children({ isActive: active }) : children}</NextLink>;
}

// Compatibility placeholder. App Router pages should render nested content directly.
export function Outlet() {
  return null;
}
