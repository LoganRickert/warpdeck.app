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
  hasImageBackground?: boolean; // Add prop to know if dashboard has image background
}

const LinkCard: React.FC<LinkCardProps> = ({ link, size = 'md', hasImageBackground = false }) => {
  const handleClick = () => {
    if (link.openInNewTab) {
      window.open(link.url, '_blank', 'noopener,noreferrer');
    } else {
      window.open(link.url, '_self', 'noopener,noreferrer');
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleClick();
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

  // Create accessible description for screen readers
  const getAccessibleDescription = () => {
    const parts = [];
    if (link.description) {
      parts.push(link.description);
    }
    parts.push(`URL: ${link.url}`);
    if (link.openInNewTab) {
      parts.push('Opens in new tab');
    }
    return parts.join('. ');
  };

  return (
    <Card
      sx={{
        minWidth: minCardWidth,
        width: '100%',
        height: '100%',
        flexGrow: 1,
        overflow: 'hidden',
        borderLeft: link.colorBar ? `4px solid ${link.colorBar}` : (link.color ? `4px solid ${link.color}` : 'none'),
        margin: 0,
        backgroundColor: link.backgroundColor || 'inherit',
        color: link.textColor || 'inherit',
        position: 'relative', // Add position relative for overlay positioning
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: 4,
        },
        '&:focus-within': {
          outline: '2px solid #667eea',
          outlineOffset: '2px',
        },
        transition: 'all 0.2s ease-in-out',
      }}
      role="article"
      aria-labelledby={`link-title-${link.id}`}
      aria-describedby={`link-desc-${link.id}`}
    >
      {/* Theme-based overlay for image backgrounds */}
      {hasImageBackground && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: (theme) => theme.palette.mode === 'dark' 
              ? 'rgba(18, 18, 18, 0.5)' 
              : 'rgba(204, 204, 204, 0.5)',
            zIndex: 0,
            pointerEvents: 'none', // Ensure overlay doesn't interfere with clicks
          }}
          aria-hidden="true"
        />
      )}
      
      <CardActionArea
        onClick={handleClick}
        onKeyDown={handleKeyPress}
        sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'flex-start',
          height: '100%',
          p: 2,
          position: 'relative',
          zIndex: 1, // Ensure content appears above overlay
        }}
        aria-label={`Open ${link.label}`}
        aria-describedby={`link-desc-${link.id}`}
        tabIndex={0}
        role="button"
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
          aria-hidden="true"
        >
          {link.thumbnail ? (
            <Avatar
              src={link.thumbnail}
              alt=""
              sx={{ 
                width: '100%',
                height: '100%',
              }}
            />
          ) : link.favicon ? (
            <Avatar
              src={`/api/${link.favicon}`}
              alt=""
              sx={{ 
                width: '100%',
                height: '100%',
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
          height: '100%',
          justifyContent: link.description ? 'space-between' : 'center'
        }}>
          <Typography
            id={`link-title-${link.id}`}
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
                flexGrow: 1,
              }}
            >
              {link.description}
            </Typography>
          )}
          
          {/* Hidden description for screen readers */}
          <Box
            id={`link-desc-${link.id}`}
            sx={{
              position: 'absolute',
              left: '-10000px',
              width: '1px',
              height: '1px',
              overflow: 'hidden',
            }}
            aria-live="polite"
          >
            {getAccessibleDescription()}
          </Box>
        </Box>
      </CardActionArea>
    </Card>
  );
};

export default LinkCard;
