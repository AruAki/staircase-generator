FROM node:24.2.0-alpine

RUN npm install -g pnpm
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

ENV BODY_SIZE_LIMIT=Infinity
ENV PUBLIC_APPWRITE_ENDPOINT=https://appwrite.aruaki.ca/v1
ENV PUBLIC_APPWRITE_PROJECT_ID=684203ae001bccfcbf90

COPY . .
RUN pnpm build

EXPOSE 3000
CMD ["node", "build"]