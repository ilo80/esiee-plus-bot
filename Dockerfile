FROM node:18-alpine  
WORKDIR /usr/src/app

# Install dependencies
COPY package*.json tsconfig.json ./
RUN npm install

# Copy the rest of the files
COPY . .

# Start the bot
CMD [ "npm", "start" ]
