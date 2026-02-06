import React from 'react';

interface NavLinkProps {
  Icon: React.ElementType;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

export const NavLink: React.FC<NavLinkProps> = ({ Icon, label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
      isActive
        ? 'bg-primary/20 text-primary'
        : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
    }`}
  >
    <Icon className="h-5 w-5" />
    <span className="font-medium">{label}</span>
  </button>
);
