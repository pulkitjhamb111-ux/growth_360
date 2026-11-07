FROM python:3.12-slim
WORKDIR /app
COPY source.tar.gz /tmp/source.tar.gz
RUN tar -xzf /tmp/source.tar.gz -C /app \
 && rm /tmp/source.tar.gz \
 && pip install --no-cache-dir -r requirements.txt
ENV PORT=8000
EXPOSE 8000
CMD ["sh", "-c", "uvicorn app:app --host 0.0.0.0 --port ${PORT}"]
