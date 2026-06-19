import { H as Hls } from './hls.js';

var boxes = document.querySelectorAll('[data-player]');

boxes.forEach(function (box) {
    var video = box.querySelector('video');
    var layer = box.querySelector('[data-play-layer]');
    var button = box.querySelector('[data-play-button]');
    var source = video ? video.getAttribute('data-hls') : '';
    var ready = false;
    var hls = null;

    function attachSource() {
        if (!video || ready || !source) {
            return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
        } else if (Hls && Hls.isSupported()) {
            hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            hls.on(Hls.Events.ERROR, function (_, data) {
                if (!data || !data.fatal) {
                    return;
                }
                if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                    hls.startLoad();
                } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                    hls.recoverMediaError();
                } else {
                    hls.destroy();
                }
            });
        } else {
            video.src = source;
        }

        ready = true;
    }

    function startPlayback() {
        if (!video) {
            return;
        }
        attachSource();
        box.classList.add('is-playing');
        video.controls = true;
        var action = video.play();
        if (action && typeof action.catch === 'function') {
            action.catch(function () {});
        }
    }

    if (layer) {
        layer.addEventListener('click', startPlayback);
    }

    if (button) {
        button.addEventListener('click', function (event) {
            event.stopPropagation();
            startPlayback();
        });
    }

    if (video) {
        video.addEventListener('click', function () {
            if (video.paused) {
                startPlayback();
            }
        });
    }

    window.addEventListener('pagehide', function () {
        if (hls) {
            hls.destroy();
        }
    });
});
