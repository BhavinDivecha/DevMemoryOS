FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
COPY apps ./apps
COPY packages ./packages
RUN npm ci
RUN npm run build -w @super-memory/worker
CMD ["npm", "run", "start", "-w", "@super-memory/worker"]
