FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_ROOT_USER_ACTION=ignore \
    UV_NO_CACHE=1

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

RUN python -m pip install --no-cache-dir pip==26.1 uv==0.9.30

COPY pyproject.toml README.md LICENSE ./
COPY src ./src
RUN uv pip install --system --no-cache . \
    && rm -rf /root/.cache/pip /root/.cache/uv

ENV FOVUX_HOME=/data/.fovux
ENV FOVUX_LOG_LEVEL=INFO

VOLUME ["/data"]
EXPOSE 7823

ENTRYPOINT ["fovux-mcp"]
CMD ["serve", "--http", "--host", "0.0.0.0", "--port", "7823"]
