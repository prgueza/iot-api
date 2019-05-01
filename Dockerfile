# Source image
FROM node
# Set environment port and expose it
ARG PORT=4000
ENV PORT=$PORT
EXPOSE $PORT
# Update npm to its latest version
RUN npm i npm@latest -g
# Clone repository
RUN git clone --single-branch --branch refactoring https://github.com/pedro-rodalia/iot-api.git
# Move to the directory and install dependencies from the project
WORKDIR /iot-api
RUN npm install
# Unprivileged user
USER node
# Run the app
CMD ["node", "./server.js"]
