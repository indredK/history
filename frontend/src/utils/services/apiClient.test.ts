/**
 * apiClient.ts 单元测试 (§2.8)
 *
 * 覆盖目标:
 * - createApiClient:
 *   * 返回的 AxiosInstance 默认 baseURL/timeout/Content-Type 正确
 *   * 自定义 baseURL 生效
 *   * 安装了 1 个 request + 1 个 response 拦截器
 * - 响应拦截器(rejected 分支):
 *   * 网络错误(无 response)→ NETWORK_ERROR
 *   * 超时(code=ECONNABORTED) → TIMEOUT_ERROR
 *   * 超时(message 含 timeout) → TIMEOUT_ERROR
 *   * status>=500 → SERVER_ERROR
 *   * status 4xx → CLIENT_ERROR(且不 dispatch 401/403 事件)
 *   * status=401 / 403 → 触发 window 上的 AUTH_REQUIRED_EVENT
 *   * 已经是 ApiError → 直通,不再包装
 *   * response.data.message 优先于 error.message
 * - 请求拦截器(rejected 分支):错误经 normalizeAxiosError 包成 ApiError
 * - getApiStatus:把 fallbackManager.getState() 拍平成对外字段
 * - fallbackControl:5 个方法都是对 fallbackManager 同名方法的薄包装
 * - 模块默认 export 的 apiClient 单例:存在且 baseURL 来自 DATA_SOURCE_CONFIG
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import type { AxiosError, AxiosInstance } from "axios";
import {
  createApiClient,
  getApiStatus,
  fallbackControl,
  AUTH_REQUIRED_EVENT,
  apiClient,
} from "./apiClient";
import { ApiError, ApiErrorType, fallbackManager } from "./errorHandling";
import { DATA_SOURCE_CONFIG } from "@/config/dataSource";

/**
 * 取出 client.interceptors.response 上注册的第一个 rejected handler,
 * 模拟 axios 实际收到响应错误后会调用它的行为。
 *
 * axios 1.x 在 InterceptorManager 上把回调收在 .handlers[] 数组里。
 */
function getResponseRejected(client: AxiosInstance) {
  const handlers = (
    client.interceptors.response as unknown as {
      handlers: Array<{ rejected?: (err: AxiosError) => Promise<unknown> }>;
    }
  ).handlers;
  const fn = handlers.find((h) => typeof h?.rejected === "function")?.rejected;
  if (!fn) {
    throw new Error("response.rejected handler not found");
  }
  return fn;
}

function getRequestRejected(client: AxiosInstance) {
  const handlers = (
    client.interceptors.request as unknown as {
      handlers: Array<{ rejected?: (err: AxiosError) => Promise<unknown> }>;
    }
  ).handlers;
  const fn = handlers.find((h) => typeof h?.rejected === "function")?.rejected;
  if (!fn) {
    throw new Error("request.rejected handler not found");
  }
  return fn;
}

describe("createApiClient", () => {
  beforeEach(() => {
    // 默认抑制 dev 日志,避免污染输出
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("默认 baseURL=/api/v1, timeout=10000, Content-Type=application/json", () => {
    const client = createApiClient();
    expect(client.defaults.baseURL).toBe("/api/v1");
    expect(client.defaults.timeout).toBe(10000);
    expect(client.defaults.headers["Content-Type"]).toBe("application/json");
  });

  it("自定义 baseURL 透传给 axios.create", () => {
    const client = createApiClient("/v2/custom");
    expect(client.defaults.baseURL).toBe("/v2/custom");
  });

  it("实例上安装了 request + response 拦截器(各 ≥1 条 handler)", () => {
    const client = createApiClient();
    const reqHandlers = (
      client.interceptors.request as unknown as { handlers: unknown[] }
    ).handlers;
    const resHandlers = (
      client.interceptors.response as unknown as { handlers: unknown[] }
    ).handlers;
    expect(reqHandlers.length).toBeGreaterThanOrEqual(1);
    expect(resHandlers.length).toBeGreaterThanOrEqual(1);
  });
});

describe("响应拦截器:normalizeAxiosError 分支", () => {
  beforeEach(() => {
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("无 response 且 code=ECONNABORTED → TIMEOUT_ERROR", async () => {
    const client = createApiClient();
    const rejected = getResponseRejected(client);
    const err = Object.assign(new Error("aborted"), {
      isAxiosError: true,
      code: "ECONNABORTED",
    }) as AxiosError;

    await expect(rejected(err)).rejects.toMatchObject({
      type: ApiErrorType.TIMEOUT_ERROR,
      message: "请求超时",
    });
  });

  it("无 response 且 message 含 timeout → TIMEOUT_ERROR", async () => {
    const client = createApiClient();
    const rejected = getResponseRejected(client);
    const err = Object.assign(new Error("Request timeout of 1000ms"), {
      isAxiosError: true,
    }) as AxiosError;

    await expect(rejected(err)).rejects.toMatchObject({
      type: ApiErrorType.TIMEOUT_ERROR,
    });
  });

  it("无 response 的普通错误 → NETWORK_ERROR", async () => {
    const client = createApiClient();
    const rejected = getResponseRejected(client);
    const err = Object.assign(new Error("connection refused"), {
      isAxiosError: true,
    }) as AxiosError;

    await expect(rejected(err)).rejects.toMatchObject({
      type: ApiErrorType.NETWORK_ERROR,
      message: "网络连接失败",
    });
  });

  it("status≥500 → SERVER_ERROR,message 走 error.message 兜底", async () => {
    const client = createApiClient();
    const rejected = getResponseRejected(client);
    const err = {
      isAxiosError: true,
      message: "Internal",
      response: { status: 503, data: {} },
      config: { url: "/x" },
    } as unknown as AxiosError;

    await expect(rejected(err)).rejects.toMatchObject({
      type: ApiErrorType.SERVER_ERROR,
      message: "Internal",
    });
  });

  it("status=400 → CLIENT_ERROR", async () => {
    const client = createApiClient();
    const rejected = getResponseRejected(client);
    const err = {
      isAxiosError: true,
      message: "bad",
      response: { status: 400, data: {} },
      config: { url: "/x" },
    } as unknown as AxiosError;

    await expect(rejected(err)).rejects.toMatchObject({
      type: ApiErrorType.CLIENT_ERROR,
    });
  });

  it("response.data.message 优先于 error.message", async () => {
    const client = createApiClient();
    const rejected = getResponseRejected(client);
    const err = {
      isAxiosError: true,
      message: "fallback",
      response: { status: 422, data: { message: "字段校验失败" } },
      config: { url: "/x" },
    } as unknown as AxiosError;

    await expect(rejected(err)).rejects.toMatchObject({
      type: ApiErrorType.CLIENT_ERROR,
      message: "字段校验失败",
    });
  });

  it("原本就是 ApiError → 直通,不再包装", async () => {
    const client = createApiClient();
    const rejected = getResponseRejected(client);
    const inner = new ApiError(ApiErrorType.CIRCUIT_BREAKER_OPEN, "熔断器开");
    // 模拟 axios 把 ApiError 透出来(实际更可能来自 request 拦截器链)
    await expect(rejected(inner as unknown as AxiosError)).rejects.toBe(inner);
  });
});

describe("AUTH_REQUIRED_EVENT 派发", () => {
  beforeEach(() => {
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("status=401 → dispatch CustomEvent(app:auth-required)", async () => {
    const client = createApiClient();
    const rejected = getResponseRejected(client);
    const listener = vi.fn();
    window.addEventListener(AUTH_REQUIRED_EVENT, listener);

    const err = {
      isAxiosError: true,
      message: "unauthorized",
      response: { status: 401, data: {} },
      config: { url: "/secret" },
    } as unknown as AxiosError;

    await rejected(err).catch(() => {
      /* 预期会 reject */
    });

    expect(listener).toHaveBeenCalledTimes(1);
    const event = listener.mock.calls[0]?.[0] as CustomEvent;
    expect(event.detail).toEqual({ status: 401, url: "/secret" });
    window.removeEventListener(AUTH_REQUIRED_EVENT, listener);
  });

  it("status=403 → 同样 dispatch CustomEvent(app:auth-required)", async () => {
    const client = createApiClient();
    const rejected = getResponseRejected(client);
    const listener = vi.fn();
    window.addEventListener(AUTH_REQUIRED_EVENT, listener);

    const err = {
      isAxiosError: true,
      message: "forbidden",
      response: { status: 403, data: {} },
      config: { url: "/admin" },
    } as unknown as AxiosError;

    await rejected(err).catch(() => {
      /* 预期会 reject */
    });

    expect(listener).toHaveBeenCalledTimes(1);
    const event = listener.mock.calls[0]?.[0] as CustomEvent;
    expect(event.detail).toEqual({ status: 403, url: "/admin" });
    window.removeEventListener(AUTH_REQUIRED_EVENT, listener);
  });

  it("非 401/403 不触发事件", async () => {
    const client = createApiClient();
    const rejected = getResponseRejected(client);
    const listener = vi.fn();
    window.addEventListener(AUTH_REQUIRED_EVENT, listener);

    const err = {
      isAxiosError: true,
      message: "bad",
      response: { status: 400, data: {} },
      config: { url: "/x" },
    } as unknown as AxiosError;

    await rejected(err).catch(() => {
      /* 预期会 reject */
    });

    expect(listener).not.toHaveBeenCalled();
    window.removeEventListener(AUTH_REQUIRED_EVENT, listener);
  });
});

describe("请求拦截器", () => {
  beforeEach(() => {
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("rejected 分支:把 axios 错误转成 ApiError", async () => {
    const client = createApiClient();
    const rejected = getRequestRejected(client);

    const err = Object.assign(new Error("aborted"), {
      isAxiosError: true,
      code: "ECONNABORTED",
    }) as AxiosError;

    await expect(rejected(err)).rejects.toBeInstanceOf(ApiError);
    await expect(rejected(err)).rejects.toMatchObject({
      type: ApiErrorType.TIMEOUT_ERROR,
    });
  });
});

describe("getApiStatus", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    fallbackManager.reset();
  });

  it("返回 fallback.{ isActive, failureCount, lastError, config }", () => {
    fallbackManager.reset();
    const snap = getApiStatus();
    expect(snap.fallback.isActive).toBe(false);
    expect(snap.fallback.failureCount).toBe(0);
    expect(snap.fallback.lastError).toBeUndefined();
    expect(snap.fallback.config).toEqual(
      expect.objectContaining({
        enableAutoFallback: true,
        fallbackThreshold: 3,
      }),
    );
  });

  it("手动激活后 isActive=true", () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    fallbackManager.manualActivate();
    expect(getApiStatus().fallback.isActive).toBe(true);
  });
});

describe("fallbackControl", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    fallbackManager.reset();
  });

  it("activate 代理到 fallbackManager.manualActivate", () => {
    const spy = vi
      .spyOn(fallbackManager, "manualActivate")
      .mockImplementation(() => {});
    fallbackControl.activate();
    expect(spy).toHaveBeenCalledOnce();
  });

  it("deactivate 代理到 fallbackManager.manualDeactivate", () => {
    const spy = vi
      .spyOn(fallbackManager, "manualDeactivate")
      .mockImplementation(() => {});
    fallbackControl.deactivate();
    expect(spy).toHaveBeenCalledOnce();
  });

  it("reset 代理到 fallbackManager.reset", () => {
    const spy = vi.spyOn(fallbackManager, "reset").mockImplementation(() => {});
    fallbackControl.reset();
    expect(spy).toHaveBeenCalledOnce();
  });

  it("updateConfig 把入参透传给 fallbackManager.updateConfig", () => {
    const spy = vi
      .spyOn(fallbackManager, "updateConfig")
      .mockImplementation(() => {});
    fallbackControl.updateConfig({ fallbackThreshold: 7 });
    expect(spy).toHaveBeenCalledWith({ fallbackThreshold: 7 });
  });

  it("getState 直接返回 fallbackManager.getState()", () => {
    const fake = {
      isActive: true,
      activatedAt: 123,
      failureCount: 5,
      config: {
        enableAutoFallback: false,
        fallbackThreshold: 9,
        fallbackDuration: 1,
      },
    };
    vi.spyOn(fallbackManager, "getState").mockReturnValue(
      fake as unknown as ReturnType<typeof fallbackManager.getState>,
    );
    expect(fallbackControl.getState()).toEqual(fake);
  });
});

describe("默认 apiClient 单例", () => {
  it("使用 DATA_SOURCE_CONFIG.api.baseURL 创建", () => {
    expect(apiClient.defaults.baseURL).toBe(DATA_SOURCE_CONFIG.api.baseURL);
  });

  it("和 createApiClient() 的返回值是不同的实例", () => {
    const fresh = createApiClient();
    expect(fresh).not.toBe(apiClient);
  });
});
