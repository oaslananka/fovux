FROM python:3.12-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    libglib2.0-0 \
    libgl1 \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

RUN pip install --no-cache-dir uv==0.9.30

COPY pyproject.toml .
RUN uv pip install --system fovux-mcp

ENV fovux_HOME=/data/.fovux
ENV fovux_LOG_LEVEL=INFO

VOLUME ["/data"]
EXPOSE 7823

ENTRYPOINT ["fovux-mcp"]
CMD ["serve", "--http", "--host", "0.0.0.0", "--port", "7823"]
