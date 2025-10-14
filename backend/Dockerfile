FROM python:3.12

WORKDIR /app

# Копируем requirements и устанавливаем зависимости
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Копируем ВСЕ файлы из папки app в контейнер
COPY app/ .

CMD ["python", "main.py"]