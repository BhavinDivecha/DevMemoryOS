FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
COPY apps/mcp-server/package*.json ./apps/mcp-server/
COPY apps/api/package*.json ./apps/api/
COPY packages/shared/package*.json ./packages/shared/
RUN npm install
COPY . .
RUN npm run build -w @super-memory/mcp-server
CMD ["npm", "run", "start", "-w", "@super-memory/mcp-server"]
