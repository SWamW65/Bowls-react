# nginx/Dockerfile
FROM nginx:alpine

# Копируем наш конфиг поверх дефолтного
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]