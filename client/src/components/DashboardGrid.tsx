import React from 'react';
import { Box } from '@mui/material';
import LinkCard from './LinkCard';
import { Dashboard, Link } from '../types';

interface DashboardGridProps {
  dashboard: Dashboard;
}

const DashboardGrid: React.FC<DashboardGridProps> = ({ dashboard }) => {
  const { links, layout } = dashboard;
  const { cardSize = 'md' } = layout || {};

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: `repeat(auto-fit, minmax(${getCardWidth(cardSize)}px, 1fr))`,
        gap: '20px',
        p: 2,
        maxWidth: '100%',
        alignItems: 'start',
        width: '100%',
        justifyContent: 'center',
        justifyItems: 'center',
        '& > *': {
          maxWidth: '100%',
        },
        '@media (max-width: 700px)': {
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        },
      }}
    >
      {links.map((link: Link) => (
        <Box 
          key={link.id} 
          sx={{ 
            width: '100%', 
            minWidth: 0,
            gridColumn: `span ${link.gridColumns || 1}`,
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <LinkCard link={link} size={cardSize} />
        </Box>
      ))}
    </Box>
  );
};

const getCardWidth = (size: 'sm' | 'md' | 'lg'): number => {
  switch (size) {
    case 'sm':
      return 200;
    case 'lg':
      return 300;
    default:
      return 250;
  }
};

export default DashboardGrid;
