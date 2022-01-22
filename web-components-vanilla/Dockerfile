FROM scratch as static-site
WORKDIR /app
COPY /dist .
FROM nginx:1.21.5 as server
COPY --from=static-site /app /usr/share/nginx/html
EXPOSE 80
CMD ["nginx","-g","daemon off;"]
