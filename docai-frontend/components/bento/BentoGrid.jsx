// components/bento/BentoGrid.jsx

import clsx from 'clsx';

export function BentoGrid({ 
  children, 
  columns = 3, 
  gap = 6,
  className = '',
  ...props 
}) {
  const gridClasses = clsx(
    'grid',
    `gap-${gap}`,
    {
      'grid-cols-1 md:grid-cols-2 lg:grid-cols-3': columns === 3,
      'grid-cols-1 md:grid-cols-2': columns === 2,
      'grid-cols-1 md:grid-cols-2 lg:grid-cols-4': columns === 4,
    },
    className
  );

  return (
    <div className={gridClasses} {...props}>
      {children}
    </div>
  );
}