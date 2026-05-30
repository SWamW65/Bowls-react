FROM python:3.12-slim

# Устанавливаем системные зависимости
RUN apt-get update && apt-get install -y \
    gcc \
    python3-dev \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

# Создаем non-root пользователя
RUN adduser --disabled-password --gecos '' myuser

WORKDIR /app

# Копируем и устанавливаем зависимости
COPY requirements.txt .
RUN python -c "from pathlib import Path; data = Path('requirements.txt').read_bytes(); text = data.decode('utf-16') if data.startswith((b'\xff\xfe', b'\xfe\xff')) else data.decode('utf-8'); Path('/tmp/requirements.txt').write_text(text.replace('\r\n', '\n'), encoding='utf-8')" && \
    pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r /tmp/requirements.txt

# Копируем исходный код
COPY app/ .

# Меняем владельца и переключаем пользователя
RUN chown -R myuser:myuser /app
USER myuser

# Переменные окружения
ENV PYTHONPATH=/app
ENV PYTHONUNBUFFERED=1

CMD ["python", "main.py"]