FROM node:20-alpine

# Set Winston daily-rotate log folder environment path
ENV NODE_ENV=production

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

# Expose port and start process
EXPOSE 5000
CMD ["node", "server.js"]
