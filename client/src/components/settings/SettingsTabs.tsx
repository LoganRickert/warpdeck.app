import React from 'react';
import {
  Box,
  Paper,
  Tabs,
  Tab,
} from '@mui/material';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

interface SettingsTabsProps {
  value: number;
  onChange: (newValue: number) => void;
  children: React.ReactNode;
}

const SettingsTabs: React.FC<SettingsTabsProps> = ({
  value,
  onChange,
  children,
}) => {
  return (
    <Paper sx={{ width: '100%' }}>
      <Tabs value={value} onChange={(_, newValue) => onChange(newValue)}>
        <Tab label="Dashboards" />
        <Tab label="Global Settings" />
      </Tabs>
      {children}
    </Paper>
  );
};

export { TabPanel };
export default SettingsTabs;
