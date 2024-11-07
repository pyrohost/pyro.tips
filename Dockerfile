FROM oven/bun

WORKDIR /app
COPY package.json package.json
RUN bun install

COPY . .

EXPOSE 3000

# Add an entrypoint script to write environment variables to .env
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
CMD ["bun", "./build"]