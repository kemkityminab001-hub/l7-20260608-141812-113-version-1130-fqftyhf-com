(() => {
    window.setupMoviePlayer = function setupMoviePlayer(videoId, overlayId, source) {
        const video = document.getElementById(videoId);
        const overlay = document.getElementById(overlayId);

        if (!video || !source) {
            return;
        }

        let loaded = false;
        let hls = null;

        const attachSource = () => {
            if (loaded) {
                return;
            }

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hls.loadSource(source);
                hls.attachMedia(video);
            } else {
                video.src = source;
            }

            loaded = true;
        };

        const play = () => {
            attachSource();
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
            video.controls = true;
            const playRequest = video.play();
            if (playRequest && typeof playRequest.catch === 'function') {
                playRequest.catch(() => {
                    if (overlay) {
                        overlay.classList.remove('is-hidden');
                    }
                });
            }
        };

        if (overlay) {
            overlay.addEventListener('click', play);
        }

        video.addEventListener('click', () => {
            if (!loaded) {
                play();
            }
        });

        video.addEventListener('play', () => {
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
        });

        window.addEventListener('beforeunload', () => {
            if (hls) {
                hls.destroy();
            }
        });
    };
})();
