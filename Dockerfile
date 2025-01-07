FROM node:18-alpine  
WORKDIR /usr/src/app

# Install dependencies
COPY package*.json tsconfig.json ./
RUN npm install

# Copy the rest of the files
COPY . .

# Fix timezone
RUN apk add --no-cache tzdata
ARG TZ
ENV TZ=${TZ}
RUN cp /usr/share/zoneinfo/${TZ} /etc/localtime \
&& echo "${TZ}" > /etc/timezone

# Start the bot
CMD [ "npm", "start" ]
