const express = require('express');
const router = express.Router();

const createDockerClient = require('../middlewares/dockerClient');
const docker = createDockerClient();

// This file serve all the JSON rendering of the data that has been collected by containers.js 


// We get the list of containers available 
router.get('/containers', (req, res, next) => {
    docker.listContainers({all: true}, (err, containers) => {
        res.json(containers);
    });
});

// We start the container by its id 
router.get('/containers/start/:id', (req, res, next) => {
    const container = docker.getContainer(req.params.id);
    container.start(null, (err, data) => {

        // If data is coming clear we send a 200 HTTP Response

        if (!err) {
            res.json({
                code: 200,
                msg: 'OK',
            });

        // Else there is an error we send a 400 HTTP Response

        } else {
            res.json({
                code: 400,
                msg: err.toString(),
            });
        }
    });
});


// We stop the container by its id 
router.get('/containers/stop/:id', (req, res, next) => {

    const container = docker.getContainer(req.params.id);

    container.stop(null, (err, data) => {

        if (!err) {
            res.json({
                code: 200,
                msg: 'OK',
            });

        } else {
            res.json({
                code: 400,
                msg: err.toString(),
            });
        }
    });
});


// We remove the container by its id 

router.get('/containers/remove/:id', (req, res, next) => {

    const container = docker.getContainer(req.params.id);

    container.remove({force: true}, (err, data) => {

        if (!err) {
            res.json({
                code: 200,
                msg: 'OK',
            });

        } else {
            res.json({
                code: 400,
                msg: err.toString(),
            });
        }
    });
});


// Get the list of images that has been pulled 
router.get('/images', (req, res, next) => {
    docker.listImages(null, (err, listImages) => {
        if (err) {
            res.json(err);
        } else {
            res.json(listImages);
        }
    });
});

// Remove an image by its id 
router.get('/images/remove/:id', (req, res, next) => {
    let imageId = req.params.id;
    if (imageId.indexOf(':') > 0) {
        imageId = imageId.split(':')[1];
    }
    const image = docker.getImage(imageId);
    image.remove({force: true}, (err, data) => {
        if (err) {
            res.json(err);
        } else {
            res.json(data);
        }
    });
});


// Get the list of image and then search for an image by its name or tag
router.get('/search/:name', (req, res, next) => {
    const name = req.params.name;
    docker.searchImages({term: name}, (err, data) => {
        if (err) throw err;
        res.json(data);
    });
});

module.exports = router;
