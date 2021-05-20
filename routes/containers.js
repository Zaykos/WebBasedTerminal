const express = require('express');
const router = express.Router();

const Docker = require('dockerode');
const stream = require('stream');
const docker = new Docker();

const returnContainersRouter = (io) => {
    // Get the list of containers
    router.get('/', (req, res, next) => {
        docker.listContainers({all: true}, (err, containers) => {
            res.locals.formatName = (str) => {
                return str[0].split('/')[1];
            };
            docker.listImages(null, (err, listImages) => {
                res.render('containers',
                    {
                        containers: containers,
                        images: listImages,
                    });
            });
        });
    });

    // Start a container by using his id at the creation
    router.get('/start/:id', (req, res, next) => {
        const container = docker.getContainer(req.params.id);
        container.start(null, (err, data) => {
            res.redirect('/containers');
        });
    });


    // Stop a container with his id of creation 
    router.get('/stop/:id', (req, res, next) => {
        const container = docker.getContainer(req.params.id);
        container.stop(null, (err, data) => {
            res.redirect('/containers');
        });
    });


    // Remove a container with his id of creation 
    router.get('/remove/:id', (req, res, next) => {
        const container = docker.getContainer(req.params.id);
        container.remove({force: true}, (err, data) => {
            if (err) {
                res.render('error', {error: err, message: err.json.message});
            } else {
                res.redirect('/containers');
            }
        });
    });


    // Create a container with a volumes, ports, and option to restart or not 
    router.post('/create', (req, res, next) => {
        let options = {
            Image: req.body.containerImage,
            AttachStdin: false,
            AttachStdout: true,
            AttachStderr: true,
            Tty: false,
            HostConfig: {
                PortBindings: {},
                Privileged: true,
            },
        };

        // The name of your container when it will run 
        if (req.body.containerName !== '') {
            options = {
                ...options,
                name: req.body.containerName,
            };
        }

        // Link the volume host and container volume to the created container
        if (req.body.containerVolumeSource !== '' &&
            req.body.containerVolumeDistination !== '') {

            const src = req.body.containerVolumeSource;
            const dis = req.body.containerVolumeDistination;

            options['Volumes'] = JSON.parse('{"' + dis + '": {}}');

            options.HostConfig = {
                'Binds': [src + ':' + dis],
                'RestartPolicy': {
                    'Name': req.body.isAlways === 'on' ? 'always' : '',
                    'MaximumRetryCount': 5,
                },
            };
        }

            // Link the exposed ports at the creation of the container
                if (req.body.containerPortSource !== '' &&
                        req.body.containerPortDistination !== '') {

                        const src = req.body.containerPortSource + '/tcp';
                        const dis = req.body.containerPortDistination;
                        
                        options['ExposedPorts'] = JSON.parse('{"' + src + '": {}}');
                        
                        const tmp = '{ "' + src + '": [{ "HostPort":"' + dis + '" }]}';
                        options.HostConfig.PortBindings = JSON.parse(tmp);

                        docker.createContainer(options, (err, container) => {
                            if (err) throw err;
                            container.start(null, (err, data) => {
                                res.redirect('/containers/');
                            });
                        });

                    }  else {
            // However if none of those options is completed the options below are on default.

            const runOpt = {
                Image: req.body.containerImage,
                AttachStdin: true,
                AttachStdout: true,
                AttachStderr: true,
                Tty: true,
                //Cmd: ['/bin/bash'],
                OpenStdin: true,
                StdinOnce: true,
                ...options,
            };
            docker.createContainer(runOpt).then(function(container) {
                return container.start(null);

            }).then((container) => {
                res.redirect('/containers/');
            });

        }

    });

    // Get the web console interface
    router.get('/console/:id', (req, res, next) => {
        res.render('terminal');
    });

    // When the socket receive the connection from the client he opens a stream of data that is sent to the container
    io.on('connection', (socket) => {
        socket.on('exec', (id, w, h) => {
            const container = docker.getContainer(id);
            
            let cmd = {
                'AttachStdout': true,
                'AttachStderr': true,
                'AttachStdin': true,
                'Tty': true,
                Cmd: ['/bin/sh'],
            };

            // The exec function will execute the run options to be able to get the terminal on the container
            container.exec(cmd, (err, exec) => {
                let options = {
                    'Tty': true,
                    stream: true,
                    stdin: true,
                    stdout: true,
                    stderr: true,
                    hijack: true,
                };

                // If there is an error in the process the end event will be sent to end the connection
                container.wait((err, data) => {
                    socket.emit('end', 'ended');
                });

                if (err) {
                    return;
                }

                exec.start(options, (err, stream) => {

                   const dimensions = {h: 380, w: 133 };
                    
                    if (dimensions.h != 0 && dimensions.w != 0) {
                        exec.resize(dimensions, () => {
                        });
                    }
                    
                    // Whenever data is sent the show event is called to be able to show the terminal container to the DOM 
                    stream.on('data', (chunk) => {
                        socket.emit('show', chunk.toString());
                    });
                    
                    // When the socket receive commands from the client he writes the data to the backend container
                    socket.on('cmd', (data) => {
                        stream.write(data);
                    });

                });
            });
        });


    });

    return router;
};

module.exports = returnContainersRouter;
