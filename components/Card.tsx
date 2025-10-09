import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <motion.div
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 dark:border dark:border-gray-700 ${className}`}
    >
      {children}
    </motion.div>
  );
};

export default Card;
