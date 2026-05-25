import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorBoundary } from './ErrorBoundary';

describe('ErrorBoundary', () => {
  const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

  afterEach(() => {
    errorSpy.mockClear();
  });

  it('should render children when no error', () => {
    render(
      <ErrorBoundary>
        <div>正常内容</div>
      </ErrorBoundary>
    );
    expect(screen.getByText('正常内容')).toBeInTheDocument();
  });

  it('should render fallback when error occurs', () => {
    const ThrowError = () => {
      throw new Error('Test error');
    };

    render(
      <ErrorBoundary fallback={<div>出错了</div>}>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText('出错了')).toBeInTheDocument();
  });

  it('should render default fallback when no fallback provided', () => {
    const ThrowError = () => {
      throw new Error('Test error');
    };

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText(/出现了一些问题/)).toBeInTheDocument();
  });

  it('默认 fallback 渲染时显示具体错误 message', () => {
    const ThrowError = () => {
      throw new Error('数据库连接失败');
    };

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText('数据库连接失败')).toBeInTheDocument();
  });

  it('componentDidCatch 触发 console.error 上报', () => {
    const ThrowError = () => {
      throw new Error('上报测试');
    };

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    // React 自身的 dev 报错可能也会走 console.error,所以只校验我们这条
    expect(errorSpy).toHaveBeenCalledWith(
      'ErrorBoundary caught an error:',
      expect.any(Error),
      expect.anything(),
    );
  });

  it('点击 "刷新页面" 调用 window.location.reload', () => {
    const ThrowError = () => {
      throw new Error('reload 测试');
    };
    const reloadSpy = vi.fn();
    const originalReload = window.location.reload;
    // 部分 JSDOM 版本里 reload 是只读,用 defineProperty 临时覆盖
    Object.defineProperty(window.location, 'reload', {
      configurable: true,
      value: reloadSpy,
    });

    try {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );
      const button = screen.getByRole('button', { name: '刷新页面' });
      fireEvent.click(button);
      expect(reloadSpy).toHaveBeenCalledTimes(1);
    } finally {
      Object.defineProperty(window.location, 'reload', {
        configurable: true,
        value: originalReload,
      });
    }
  });
});
