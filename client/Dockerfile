# Build stage
FROM node:14 as build-stage

WORKDIR /app

COPY package*.json ./

RUN npm install

# If you need to add environment variables, you can add them here
# ENV REACT_APP_API_URL=http://backend:3001

COPY . .

EXPOSE 3000

CMD ["npm", "start"]

# RUN npm run build

# # Production stage
# FROM nginx:stable-alpine as production-stage

# COPY --from=build-stage /app/build /usr/share/nginx/html

# EXPOSE 3000

# CMD ["nginx", "-g", "daemon off;"]
