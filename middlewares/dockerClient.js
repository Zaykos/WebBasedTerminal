const Docker = require('dockerode');

function createDockerClient() {
    return new Docker();
}

module.exports = createDockerClient;
