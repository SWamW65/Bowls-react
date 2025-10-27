FROM dpage/pgadmin4:latest

# Подавляем deprecated warnings
ENV PYTHONWARNINGS="ignore::UserWarning"

# Или альтернативно через Python код при старте
RUN echo 'import warnings; warnings.filterwarnings("ignore", category=UserWarning, module="passlib")' > /tmp/suppress_warnings.py

# Можно добавить в entrypoint
CMD ["sh", "-c", "python /tmp/suppress_warnings.py && /entrypoint.sh"]