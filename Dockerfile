# Source image
FROM node:10.15.0
# Set environment port and expose it
ARG PORT=4000
ENV PORT=$PORT
EXPOSE $PORT
# Update npm to its latest version
RUN npm i npm@latest -g
# Move to the home directory
WORKDIR /home/app
# Clone repository
RUN git clone --single-branch --branch master https://github.com/pedro-rodalia/iot-api.git
# Move to the directory and install dependencies from the project
WORKDIR /home/app/iot-api
RUN npm install
# Run the app
CMD ["node", "./server.js"]
