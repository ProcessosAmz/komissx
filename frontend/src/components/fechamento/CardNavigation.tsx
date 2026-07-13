import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, LucideIcon } from 'lucide-react';

interface NavigationCardItem {
  id: string;
  title: string;
  description: string;
  path: string;
  icon: LucideIcon;
}

interface CardNavigationProps {
  card: NavigationCardItem;
}

export const CardNavigation: React.FC<CardNavigationProps> = ({ card }) => {
  const navigate = useNavigate();
  const Icon = card.icon;

  return (
    <motion.div
      onClick={() => navigate(card.path)}
      whileHover={{ y: -4, scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="group relative cursor-pointer overflow-hidden rounded-xl border border-slate-800/60 bg-[#0b0f19]/40 p-6 backdrop-blur-sm transition-colors duration-300 hover:border-indigo-500/40 hover:bg-[#0b0f19]/60"
    >
      {/* Efeito de iluminação sutil de fundo (Glow) */}
      <div className="absolute -inset-px bg-gradient-to-r from-indigo-500/10 to-emerald-500/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="relative flex items-start justify-between space-x-4">
        <div className="flex flex-1 items-start space-x-4">
          {/* Container do Ícone */}
          <div className="flex p-3 rounded-lg bg-slate-900/80 border border-slate-800 group-hover:border-indigo-500/30 group-hover:text-indigo-400 transition-colors duration-300 text-slate-400">
            <Icon className="h-6 w-6" />
          </div>

          {/* Conteúdo Informativo */}
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-slate-200 group-hover:text-white transition-colors duration-200">
              {card.title}
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors duration-200">
              {card.description}
            </p>
          </div>
        </div>

        {/* Seta de Navegação com Micro-Animação */}
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900/50 border border-slate-800 text-slate-400 group-hover:border-indigo-500/30 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
          <ArrowRight className="h-4 w-4 transform transition-transform duration-300 group-hover:translate-x-0.5" />
        </div>
      </div>
    </motion.div>
  );
};