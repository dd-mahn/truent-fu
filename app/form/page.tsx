'use client'
import {motion} from 'motion/react'
import FormClient from './FormClient'; // We will create this client component next

export default function FormPage() {
  return (
    // The container class from globals.css (.content-wrapper) will be applied in RootLayout
    // FormClient will now contain all the form elements including the header inputs
    <motion.div initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} transition={{duration: 0.5}} className="flex-1 flex-col items-center bg-crumpled-paper justify-start">
      <FormClient />
    </motion.div>
  );
} 