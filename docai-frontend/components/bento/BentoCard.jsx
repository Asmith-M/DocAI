import { motion } from 'framer-motion';
import clsx from 'clsx';

export function BentoCard({ 
  children, 
  className = '', 
  hover = true,
  gradient = false,
  onClick,
  ...props 
}) {
  const baseClasses = clsx(
    'bento-card p-6',
    hover && 'bento-card-hover cursor-pointer',
    gradient && 'bg-gradient-to-br from-white/95 to-lavender-50/95 dark:from-lavender-800/95 dark:to-lavender-900/95',
    className
  );

  return (
    <motion.div
      className={baseClasses}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onClick={onClick}
      whileHover={hover ? { scale: 1.02 } : {}}
      whileTap={hover ? { scale: 0.98 } : {}}
      {...props}
    >
      {children}
    </motion.div>
  );
}