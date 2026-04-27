export interface RunSummary {
  id: string;
  status: string;
  model: string;
  epochs: number;
  run_path?: string;
  current_epoch?: number | null;
  best_map50?: number | null;
  created_at: string | null;
}

export interface RunDetail extends RunSummary {
  run_path?: string;
  current_epoch?: number | null;
  best_map50?: number | null;
}

export interface MetricPayload {
  runId: string;
  epoch: number;
  metrics: Record<string, number>;
}

export interface HttpClientConfig {
  baseUrl: string;
  authToken: string | null;
}

export async function listRuns(config: HttpClientConfig): Promise<RunSummary[]> {
  const response = await fetch(`${config.baseUrl}/runs`, {
    headers: authHeaders(config.authToken),
  });
  return handleResponse<RunSummary[]>(response);
}

export async function getRun(config: HttpClientConfig, runId: string): Promise<RunDetail> {
  const response = await fetch(`${config.baseUrl}/runs/${runId}`, {
    headers: authHeaders(config.authToken),
  });
  return handleResponse<RunDetail>(response);
}

export async function invokeTool<T>(
  config: HttpClientConfig,
  name: string,
  payload: Record<string, unknown>
): Promise<T> {
  const response = await fetch(`${config.baseUrl}/tools/${name}`, {
    method: "POST",
    headers: authHeaders(config.authToken),
    body: JSON.stringify(payload),
  });
  return handleResponse<T>(response);
}

export function subscribeToMetrics(
  config: HttpClientConfig,
  runId: string,
  onMetric: (payload: MetricPayload) => void,
  onError?: (error: string) => void
): () => void {
  const controller = new AbortController();

  void streamEvents(config, runId, controller.signal, onMetric, onError);

  return () => {
    controller.abort();
  };
}

async function streamEvents(
  config: HttpClientConfig,
  runId: string,
  signal: AbortSignal,
  onMetric: (payload: MetricPayload) => void,
  onError?: (error: string) => void
): Promise<void> {
  let attempt = 0;
  while (!signal.aborted) {
    try {
      await connectAndStream(config, runId, signal, onMetric);
      if (!signal.aborted) {
        throw new Error(`Metric stream for ${runId} closed.`);
      }
    } catch (error) {
      if (signal.aborted) {
        break;
      }
      const delayMs = Math.min(1000 * 2 ** attempt, 30_000);
      attempt += 1;
      onError?.(
        `Reconnecting in ${delayMs}ms (attempt ${attempt}): ${
          error instanceof Error ? error.message : String(error)
        }`
      );
      await sleep(delayMs, signal);
    }
    attempt = 0;
  }
}

async function connectAndStream(
  config: HttpClientConfig,
  runId: string,
  signal: AbortSignal,
  onMetric: (payload: MetricPayload) => void
): Promise<void> {
  const response = await fetch(`${config.baseUrl}/runs/${runId}/metrics`, {
    headers: authHeaders(config.authToken),
    signal,
  });
  if (!response.ok || response.body === null) {
    throw new Error(`Metric stream failed for ${runId} (HTTP ${response.status}).`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (!signal.aborted) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }
    buffer += decoder.decode(value, { stream: true });
    const events = buffer.split("\n\n");
    buffer = events.pop() ?? "";
    for (const eventChunk of events) {
      const payload = parseMetricEvent(eventChunk);
      if (payload !== null) {
        onMetric(payload);
      }
    }
  }
}

export function parseMetricEvent(chunk: string): MetricPayload | null {
  let eventName = "";
  const dataLines: string[] = [];
  for (const line of chunk.split("\n")) {
    if (line.startsWith(":") || line.trim() === "") {
      continue;
    }
    if (line.startsWith("event:")) {
      eventName = line.slice("event:".length).trim();
      continue;
    }
    if (line.startsWith("data:")) {
      dataLines.push(line.slice("data:".length).trim());
    }
  }
  if (eventName !== "metric" || dataLines.length === 0) {
    return null;
  }
  return JSON.parse(dataLines.join("\n")) as MetricPayload;
}

function sleep(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve) => {
    const timer = setTimeout(resolve, ms);
    signal.addEventListener(
      "abort",
      () => {
        clearTimeout(timer);
        resolve();
      },
      { once: true }
    );
  });
}

function authHeaders(authToken: string | null): HeadersInit {
  const headers: Record<string, string> = { "content-type": "application/json" };
  if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`;
  }
  return headers;
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const detail = await safeJson(response);
    throw new Error(extractErrorMessage(detail, response));
  }
  return response.json() as Promise<T>;
}

async function safeJson(response: Response): Promise<unknown> {
  try {
    return (await response.json()) as unknown;
  } catch {
    return { status: response.status, statusText: response.statusText };
  }
}

function extractErrorMessage(detail: unknown, response: Response): string {
  if (typeof detail === "string") {
    return detail;
  }
  if (detail && typeof detail === "object") {
    const record = detail as Record<string, unknown>;
    const nested = record["detail"];
    if (typeof nested === "string") {
      return nested;
    }
    if (nested && typeof nested === "object") {
      const nestedRecord = nested as Record<string, unknown>;
      const code = typeof nestedRecord["code"] === "string" ? `${nestedRecord["code"]}: ` : "";
      if (typeof nestedRecord["message"] === "string") {
        return `${code}${nestedRecord["message"]}`;
      }
    }
    if (typeof record["message"] === "string") {
      return record["message"];
    }
  }
  return `HTTP ${response.status} ${response.statusText}`;
}
