# Use an official Node.js runtime as the base image
FROM node:14

# Set the working directory in the Docker image
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the Docker image
COPY package*.json ./

# Install the application dependencies inside the Docker image
RUN npm install

#Copy everything except for the node_modules folder
COPY . .

# Expose the port the application runs on
EXPOSE 3002


# Define the command to run the application
CMD [ "node", "bot.js" ]