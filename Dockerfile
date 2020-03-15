#Get the node.js base Docker image
FROM node:carbon

#set the directory to run Docker commands in
WORKDIR /app

#Copy application source to this directory
COPY . .

#start application
CMD ["node", "index.js"]
