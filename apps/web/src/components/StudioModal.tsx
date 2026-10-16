import React from 'react';
import { AboutUsView } from './AboutUsView';

interface StudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartProject: () => void;
  onNavigateHome?: () => void;
  onNavigateWork?: () => void;
  onNavigateClients?: () => void;
  onNavigateProcess?: () => void;
}

export const StudioModal: React.FC<StudioModalProps> = ({
  isOpen,
  onClose,
  onStartProject,
  onNavigateHome = onClose,
  onNavigateWork = onClose,
  onNavigateClients = onClose,
  onNavigateProcess = onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[80] bg-[#0d0d0d] overflow-y-auto animate-fadeIn"
    >
      <AboutUsView
        onClose={onClose}
        onNavigateHome={onNavigateHome}
        onNavigateWork={onNavigateWork}
        onNavigateClients={onNavigateClients}
        onNavigateProcess={onNavigateProcess}
        onOpenScheduler={() => {
          onClose();
          onStartProject();
        }}
      />
    </div>
  );
};
