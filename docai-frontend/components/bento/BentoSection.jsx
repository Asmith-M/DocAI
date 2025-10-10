import clsx from 'clsx';

export function BentoSection({ 
  children, 
  className = '',
  background = 'default',
  ...props 
}) {
  const bgClasses = {
    default: 'bg-gradient-lavender-soft',
    white: 'bg-white dark:bg-lavender-900',
    transparent: 'bg-transparent',
  };

  return (
    <section 
      className={clsx(
        'bento-section py-16 px-4',
        bgClasses[background],
        className
      )}
      {...props}
    >
      {children}
    </section>
  );
}