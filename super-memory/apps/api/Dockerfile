FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
COPY apps/api/package*.json ./apps/api/
COPY packages/shared/package*.json ./packages/shared/
RUN npm install
COPY . .
RUN npm run db:generate -w @super-memory/api
EXPOSE 4000
CMD ["sh", "-c", "until npm run db:prepare -w @super-memory/api && npm run db:migrate -w @super-memory/api; do echo 'waiting for postgres'; sleep 2; done; npm run db:seed -w @super-memory/api; npm run start -w @super-memory/api"]
