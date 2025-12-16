import { Component, ReactNode } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { ErrorOutline } from '@mui/icons-material';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center',
          minHeight: '200px',
          p: 3,
          textAlign: 'center'
        }}>
          <ErrorOutline sx={{ fontSize: 48, color: 'error.main', mb: 2 }} />
          <Typography variant="h6" sx={{ mb: 1 }}>
            出现了一些问题
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {this.state.error?.message || '页面加载失败，请稍后重试'}
          </Typography>
          <Button 
            variant="outlined" 
            onClick={() => window.location.reload()}
          >
            刷新页面
          </Button>
        </Box>
      );
    }

    return this.props.children;
  }
}