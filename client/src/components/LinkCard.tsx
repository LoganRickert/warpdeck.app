import React from 'react';
import {
  Card,
  CardActionArea,
  Typography,
  Box,
  Avatar,
} from '@mui/material';
import { Link } from '../types';

interface LinkCardProps {
  link: Link;
  size?: 'sm' | 'md' | 'lg';
}

const LinkCard: React.FC<LinkCardProps> = ({ link, size = 'md' }) => {
  const handleClick = () => {
    if (link.openInNewTab) {
      window.open(link.url, '_blank', 'noopener,noreferrer');
    } else {
      window.open(link.url, '_self');
    }
  };

  const getMinCardWidth = () => {
    switch (size) {
      case 'sm':
        return 200;
      case 'lg':
        return 300;
      default:
        return 250;
    }
  };

  const minCardWidth = getMinCardWidth();

  return (
    <Card
      sx={{
        minWidth: minCardWidth,
        width: '100%',
        flexGrow: 1,
        overflow: 'hidden',
        borderLeft: link.colorBar ? `4px solid ${link.colorBar}` : (link.color ? `4px solid ${link.color}` : 'none'),
        margin: 0,
        backgroundColor: link.backgroundColor || 'inherit',
        color: link.textColor || 'inherit',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: 4,
        },
        transition: 'all 0.2s ease-in-out',
      }}
    >
      <CardActionArea
        onClick={handleClick}
        sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'stretch',
          justifyContent: 'flex-start',
          p: 2,
        }}
      >
        {/* Left side: Icon/Favicon/Thumbnail */}
        <Box
          sx={{
            width: size === 'sm' ? 32 : size === 'lg' ? 48 : 40,
            height: size === 'sm' ? 32 : size === 'lg' ? 48 : 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mr: 2,
            flexShrink: 0,
            color: link.textColor || link.color || 'primary.main',
          }}
        >
          {link.thumbnail ? (
            <Avatar
              src={link.thumbnail}
              alt={link.label}
              sx={{ 
                width: '100%',
                height: '100%',
              }}
            />
          ) : link.favicon ? (
            <Avatar
              src={`/api/${link.favicon}`}
              alt={link.label}
              sx={{ 
                width: '100%',
                height: '100%',
              }}
            />
          ) : link.icon ? (
            <i 
              className={link.icon} 
              style={{
                fontSize: size === 'sm' ? '1.2rem' : size === 'lg' ? '1.8rem' : '1.5rem',
              }}
            />
          ) : (
            <Box
              sx={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(0, 0, 0, 0.1)',
                borderRadius: '50%',
                color: 'text.secondary',
              }}
            >
              <Typography variant="caption" sx={{ fontSize: size === 'sm' ? '0.6rem' : size === 'lg' ? '1rem' : '0.8rem' }}>
                {link.label.charAt(0).toUpperCase()}
              </Typography>
            </Box>
          )}
        </Box>

        {/* Right side: Content */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          flexGrow: 1, 
          minWidth: 0,
          justifyContent: link.description ? 'flex-start' : 'center'
        }}>
          <Typography
            variant={size === 'sm' ? 'body2' : size === 'lg' ? 'h6' : 'body1'}
            component="div"
            sx={{
              fontWeight: 'bold',
              wordBreak: 'break-word',
              mb: link.description ? 1 : 0,
              color: link.textColor || 'text.primary',
            }}
          >
            {link.label}
          </Typography>

          {link.description && (
            <Typography
              variant={size === 'sm' ? 'caption' : size === 'lg' ? 'body2' : 'body2'}
              color="text.secondary"
              sx={{
                wordBreak: 'break-word',
                lineHeight: 1.3,
                color: link.textColor || 'text.secondary',
              }}
            >
              {link.description}
            </Typography>
          )}
        </Box>
      </CardActionArea>
    </Card>
  );
};

export default LinkCard;
