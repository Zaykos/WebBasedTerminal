$(document).ready(function () {
    var currentPage = $("[data-page]").attr("data-page");

    $('#' + currentPage + 'Nav').addClass('active');


    // Whenever somethings is loading the button loading with the circle appears
    loading();

    // If the user get to the terminal endpoint then we render the terminal container
    if (currentPage == 'terminal') {
        terminal();
    }

    // Same for the images endpoint we render the images list page

    if (currentPage == 'images') {
        $('#pullImage').on('click', function () {
            pullIamges();
        });


        // List the images from the docker hub repository in case the name of the image is matching official images 
        $('#imageName').typeahead({
            limit: 10,
            source: function (query, process) {
                return $.get("/images/search/" + $('#imageName').val(), function (data) {
                    return process(data);
                });
            }
        });
        
    }
});

// Function to configure the Xterm.js instance with different options 
function terminal() {
    Terminal.applyAddon(attach);
    Terminal.applyAddon(fit);
    var term = new Terminal({
        useStyle: true,
        convertEol: true,
        screenKeys: true,
        cursorBlink: false,
        visualBell: true,
        //colors: Terminal.xtermColors
    });
    

    // We open the DOM terminal container in Xterm.js to connect the process 
    term.open(document.getElementById('terminal'));
    
    // Then we fit the terminal to the DOM container
    term.fit();

    // We get the id and the host from the user 
    var id = window.location.pathname.split('/')[3];
    var host = window.location.origin;

    // And then we connect the socket to the client 
    var socket = io.connect(host);


    // We execute the commands coming from the client and set the right height and width
    socket.emit('exec', id, $('#terminal').width(), $('#terminal').height());


    // Whenever data is sent from the client we emit the command event and sends the output to the container
    term.on('data', (data) => {
        socket.emit('cmd', data);
    });

    // When the terminal DOM container is open by the client we emit the show event
    socket.on('show', (data) => {
        term.write(data);
    });

    // When the client terminate the terminal process or close the windows we emit the end event 
    // And then disconnect the socket from the client 
    socket.on('end', (status) => {
        $('#terminal').empty();
        socket.disconnect();
    });
}

// Same function as terminal but for the logs
function logs() {
    Terminal.applyAddon(attach);
    Terminal.applyAddon(fit);
    var term = new Terminal({
        useStyle: true,
        convertEol: true,
        screenKeys: false,
        cursorBlink: false,
        visualBell: false,
        colors: Terminal.xtermColors
    });

    term.open(document.getElementById('terminal'));
    term.fit();
    var id = window.location.pathname.split('/')[3];

    var host = window.location.origin;
    var socket = io.connect(host);

    socket.emit('attach', id, $('#terminal').width(), $('#terminal').height());

    socket.on('show', (data) => {
        term.write(data);
    });

    socket.on('end', (status) => {
        socket.disconnect();
    });
}

// Same process as the terminal execution to pull images 
function pullImages() {
    Terminal.applyAddon(attach);
    Terminal.applyAddon(fit);
    var term = new Terminal({
        useStyle: true,
        convertEol: true,
        screenKeys: false,
        cursorBlink: false,
        visualBell: false,
        colors: Terminal.xtermColors
    });

    term.open(document.getElementById('terminal'));
    term.fit();
    var imagesName = $('#imageName').val();
    var version = $('#imageVersionName').val();

    // When the version is explicitly written by the client we sends it to pull it 
    if (version) {
        imagesName = imagesName + ':' + version;
    } 
    
    // Else if the version is not written by default we pull the latest version of the image
    else {
        imagesName = imagesName + ':latest';
    }

    
    var host = window.location.origin;
    var socket = io.connect(host);
    
    socket.emit('pull', imagesName, $('#terminal').width(), $('#terminal').height());
    
    socket.on('show', (data) => {
        term.write(data);
    });

    socket.on('end', (status) => {
        socket.disconnect();
        location.reload();
    });
}

function loading() {
    $('a.btn').on('click', function () {
        var $btn = $(this).button('loading');
    });
    $('#create').on('click', function () {
        var $btn = $(this).button('loading');
    })
    $('#pullImage').on('click', function () {
        var $btn = $(this).button('loading');
    })
}