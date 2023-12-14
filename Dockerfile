FROM node:16 as builder

WORKDIR /build

COPY . .

RUN corepack enable

ARG MONGODB_URI=
ENV MONGODB_URI="mongodb+srv://Admin:QmC0mput3r12@cluster0.6lsrk.mongodb.net/stock-fundamentals?retryWrites=true&w=majority"

EXPOSE 8080

RUN npm install
RUN npm run build
CMD ["npm", "start"]

