FROM node:20-alpine
WORKDIR /usr/src/app

# Copy dependencies
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy app code
COPY . .

# Production environment
ENV NODE_ENV=production

# Expose app port
EXPOSE 9001

CMD ["node", "src/index.js"]