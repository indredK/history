/**
 * apiTest.ts 单元测试 (§2.8)
 *
 * 覆盖 4 个对外 fetch 包装器:
 * - testApiConnection:成功(success=true+data) / 后端格式错误 / HTTP 非 2xx / fetch 抛错
 * - testApiEndpoint:成功 / data.message 兜底 / HTTP 错 / fetch 抛错
 * - testAllApiEndpoints:全部成功 → success=true,任意一个失败 → success=false
 * - testFrontendProxy:成功 / 格式错误 / HTTP 错 / fetch 抛错
 *
 * fetch 用 vi.spyOn(global, 'fetch') 桩,不发真实网络请求。
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  testApiConnection,
  testApiEndpoint,
  testAllApiEndpoints,
  testFrontendProxy,
} from "./apiTest";
import { DATA_SOURCE_CONFIG } from "@/config/dataSource";

/**
 * 用闭包合成一个 Response-like 对象,够用于源码里的
 * response.ok / response.status / response.statusText / response.json()
 */
function fakeResponse(opts: {
  ok: boolean;
  status?: number;
  statusText?: string;
  body?: unknown;
}): Response {
  return {
    ok: opts.ok,
    status: opts.status ?? (opts.ok ? 200 : 500),
    statusText: opts.statusText ?? (opts.ok ? "OK" : "Internal Server Error"),
    json: () => Promise.resolve(opts.body),
  } as unknown as Response;
}

describe("testApiConnection", () => {
  beforeEach(() => {
    vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("后端 success=true + data 时返回 success=true 与组装好的 details", async () => {
    const payload = { success: true, data: { status: "ok", uptime: 123 } };
    vi.spyOn(global, "fetch").mockResolvedValue(
      fakeResponse({ ok: true, status: 200, body: payload }),
    );

    const result = await testApiConnection();
    expect(result.success).toBe(true);
    expect(result.message).toContain("API连接成功");
    expect(result.details).toEqual(
      expect.objectContaining({
        status: 200,
        data: payload.data,
        url: `${DATA_SOURCE_CONFIG.api.baseURL}/health`,
        backendResponse: payload,
      }),
    );
  });

  it("响应 ok=true 但格式不符(无 success/data)→ 走 catch,返回失败", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(
      fakeResponse({ ok: true, body: { foo: "bar" } }),
    );

    const result = await testApiConnection();
    expect(result.success).toBe(false);
    expect(result.message).toContain("API连接失败");
    expect(result.details?.error).toContain("后端响应格式不正确");
  });

  it("HTTP 非 2xx → 抛错并返回失败,details 含 url", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(
      fakeResponse({
        ok: false,
        status: 503,
        statusText: "Service Unavailable",
      }),
    );

    const result = await testApiConnection();
    expect(result.success).toBe(false);
    expect(result.message).toContain("HTTP 503");
    expect(result.details?.url).toBe(
      `${DATA_SOURCE_CONFIG.api.baseURL}/health`,
    );
  });

  it("fetch 直接抛错 → 返回失败,details.error 是原始消息", async () => {
    vi.spyOn(global, "fetch").mockRejectedValue(new Error("network down"));

    const result = await testApiConnection();
    expect(result.success).toBe(false);
    expect(result.message).toContain("network down");
    expect(result.details?.error).toBe("network down");
  });
});

describe("testApiEndpoint", () => {
  beforeEach(() => {
    vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("success=true + data → 返回 data 与 success=true", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(
      fakeResponse({
        ok: true,
        body: { success: true, data: [{ id: 1 }] },
      }),
    );

    const result = await testApiEndpoint("/dynasties");
    expect(result.success).toBe(true);
    expect(result.message).toContain("/dynasties");
    expect(result.data).toEqual([{ id: 1 }]);
  });

  it("success=false + 自带 message → catch 把 message 抛出来", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(
      fakeResponse({
        ok: true,
        body: { success: false, message: "找不到表" },
      }),
    );

    const result = await testApiEndpoint("/persons");
    expect(result.success).toBe(false);
    expect(result.message).toContain("/persons");
    expect(result.error).toBe("找不到表");
  });

  it("success=false 且没有 message → 走默认 '后端返回错误'", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(
      fakeResponse({ ok: true, body: { success: false } }),
    );

    const result = await testApiEndpoint("/events");
    expect(result.success).toBe(false);
    expect(result.error).toBe("后端返回错误");
  });

  it("HTTP 非 2xx → HTTP {status} 错误", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(
      fakeResponse({ ok: false, status: 404, statusText: "Not Found" }),
    );

    const result = await testApiEndpoint("/missing");
    expect(result.success).toBe(false);
    expect(result.error).toContain("HTTP 404");
  });

  it("fetch 抛错 → 失败 + error 是错误消息", async () => {
    vi.spyOn(global, "fetch").mockRejectedValue(new Error("ETIMEDOUT"));

    const result = await testApiEndpoint("/x");
    expect(result.success).toBe(false);
    expect(result.error).toBe("ETIMEDOUT");
  });

  it("fetch 拒绝且抛非 Error 值时 → error 是原始非 Error 值", async () => {
    // 源码对 `error instanceof Error` 走 else 分支,直接把非 Error 透出
    vi.spyOn(global, "fetch").mockRejectedValue("string-error");

    const result = await testApiEndpoint("/y");
    expect(result.success).toBe(false);
    expect(result.error).toBe("string-error");
  });
});

describe("testAllApiEndpoints", () => {
  beforeEach(() => {
    vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("逐个调用 5 个端点,全部成功 → success=true,results 长度=5", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(
      fakeResponse({
        ok: true,
        body: { success: true, data: { ok: true } },
      }),
    );

    const result = await testAllApiEndpoints();
    expect(result.success).toBe(true);
    expect(result.results).toHaveLength(5);
    expect(result.results.map((r) => r.endpoint)).toEqual([
      "/health",
      "/dynasties",
      "/persons",
      "/events",
      "/emperors",
    ]);
    expect(result.results.every((r) => r.success)).toBe(true);
  });

  it("任意一个端点失败 → success=false,仍返回所有 results", async () => {
    // 依次:health ok / dynasties ok / persons 失败 / events ok / emperors ok
    let call = 0;
    vi.spyOn(global, "fetch").mockImplementation(() => {
      call++;
      if (call === 3) {
        return Promise.resolve(
          fakeResponse({
            ok: true,
            body: { success: false, message: "boom" },
          }),
        );
      }
      return Promise.resolve(
        fakeResponse({ ok: true, body: { success: true, data: { ok: 1 } } }),
      );
    });

    const result = await testAllApiEndpoints();
    expect(result.success).toBe(false);
    expect(result.results).toHaveLength(5);
    const failed = result.results.find((r) => !r.success);
    expect(failed?.endpoint).toBe("/persons");
    expect(failed?.error).toBe("boom");
  });
});

describe("testFrontendProxy", () => {
  beforeEach(() => {
    vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("通过代理返回正确格式 → success=true,details.url 是 /api/v1/health", async () => {
    const payload = { success: true, data: { proxy: "ok" } };
    vi.spyOn(global, "fetch").mockResolvedValue(
      fakeResponse({ ok: true, status: 200, body: payload }),
    );

    const result = await testFrontendProxy();
    expect(result.success).toBe(true);
    expect(result.message).toContain("前端代理工作正常");
    expect(result.details).toEqual(
      expect.objectContaining({
        status: 200,
        data: payload.data,
        url: "/api/v1/health",
      }),
    );
  });

  it("响应 ok=true 但格式不对 → catch,details.suggestion 提示 Vite 代理配置", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(
      fakeResponse({ ok: true, body: { success: false } }),
    );

    const result = await testFrontendProxy();
    expect(result.success).toBe(false);
    expect(result.message).toContain("前端代理失败");
    expect(result.details?.suggestion).toContain("Vite");
  });

  it("HTTP 非 2xx → 返回 HTTP {status} 失败", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(
      fakeResponse({ ok: false, status: 502, statusText: "Bad Gateway" }),
    );

    const result = await testFrontendProxy();
    expect(result.success).toBe(false);
    expect(result.message).toContain("HTTP 502");
  });

  it("fetch 抛错 → 失败,details.error 是错误消息", async () => {
    vi.spyOn(global, "fetch").mockRejectedValue(new Error("CORS denied"));

    const result = await testFrontendProxy();
    expect(result.success).toBe(false);
    expect(result.details?.error).toBe("CORS denied");
  });
});
