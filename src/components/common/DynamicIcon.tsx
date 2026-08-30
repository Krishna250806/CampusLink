import React from 'react';
import * as Icons from 'lucide-react';
import type { LucideProps } from 'lucide-react';

interface DynamicIconProps extends LucideProps {
  name: string;
}

export const DynamicIcon: React.FC<DynamicIconProps> = ({ name, ...props }) => {
  const IconComponent = (Icons as unknown as Record<string, React.FC<LucideProps>>)[name] || Icons.Link;
  return <IconComponent {...props} />;
};

export const LINK_TYPE_ICONS: Record<string, string> = {
  registration: 'UserPlus',
  schedule: 'Calendar',
  rulebook: 'BookOpen',
  venue: 'MapPin',
  results: 'Trophy',
  instagram: 'Instagram',
  whatsapp: 'MessageSquare',
  contact: 'PhoneCall',
  sponsorship: 'BadgeDollarSign',
  volunteer: 'HeartHandshake',
  feedback: 'MessageCircle',
  drive: 'FolderCheck',
  youtube: 'Video',
  website: 'Globe',
  custom: 'Link'
};
