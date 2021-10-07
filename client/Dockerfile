FROM node:14.17.0-alpine

# Set working directory
WORKDIR /usr/src/app

# Install dependencies
COPY ./package*.json ./
RUN npm install --silent

# Copy source code
COPY . .

# Run client
EXPOSE 3000

# Start up client
CMD ["npm", "start"]