FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
COPY apps/web/package*.json ./apps/web/
COPY packages/shared/package*.json ./packages/shared/
RUN npm install
COPY . .
RUN npm run build -w @super-memory/web
EXPOSE 5173
CMD ["npm", "run", "preview", "-w", "@super-memory/web", "--", "--host", "0.0.0.0", "--port", "5173"]
