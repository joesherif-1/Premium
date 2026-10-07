import { motion } from 'motion/react';
import type { ReactNode } from 'react';
import { useFeatured } from '../hooks/useFeatured';

/** Shared frame for sign in and sign up: the form on the left, one catalogue plate on the right. */
export function AuthShell({
  title,
  subtitle,
  footer,
  children,
}: {
  title: string;
  subtitle?: string;
  footer: ReactNode;
  children: ReactNode;
}) {
  const { products, loading } = useFeatured(1);
  const product = products[0];

  return (
    <div className="page grid12 min-h-[calc(100dvh-4rem)] items-center gap-y-12 py-12">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as const }}
        className="col-span-12 w-full max-w-md lg:col-span-5"
      >
        <h1 className="display text-5xl md:text-6xl">{title}</h1>
        {subtitle && <p className="mt-4 text-muted">{subtitle}</p>}
        <div className="mt-8">{children}</div>
        <p className="mt-6 text-sm text-muted">{footer}</p>
      </motion.div>

      <figure className="col-span-6 col-start-7 hidden lg:block" aria-hidden={!product}>
        <div className="aspect-[4/5] max-h-[620px] overflow-hidden bg-sunken">
          {loading ? (
            <div className="skeleton size-full rounded-none" />
          ) : (
            product?.image_url && (
              <img src={product.image_url} alt="" className="size-full object-cover" />
            )
          )}
        </div>
        {product && (
          <figcaption className="border-t border-ink pt-3 text-sm font-semibold">
            {product.name}
          </figcaption>
        )}
      </figure>
    </div>
  );
}
