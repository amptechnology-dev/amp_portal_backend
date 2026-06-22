FROM oven/bun:1
WORKDIR /usr/src/app

# Copy dependencies
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# Copy app code
COPY . .

# Production environment
ENV NODE_ENV=production

# Expose app port
EXPOSE 9001

CMD ["bun", "run", "start"]