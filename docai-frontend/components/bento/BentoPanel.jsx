import { motion } from 'framer-motion';
import clsx from 'clsx';

export function BentoPanel({ 
  children, 
  className = '',
  layered = true,
  ...props 
}) {
  return (
    <motion.div
      className={clsx(
        'bento-panel p-8',
        layered && 'relative',
        className
      )}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      {...props}
    >
      {layered && (
        <div className="absolute inset-0 bg-gradient-to-br from-lavender-100/30 via-transparent to-lavender-200/30 dark:from-lavender-700/20 dark:via-transparent dark:to-lavender-800/20 rounded-bento-lg pointer-events-none" />
      )}
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
}