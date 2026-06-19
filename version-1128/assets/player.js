(function () {
  function bindStream(video, src) {
    if (!video || video.getAttribute('data-ready') === '1') {
      return;
    }
    video.setAttribute('data-ready', '1');
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(src);
      hls.attachMedia(video);
      video._hls = hls;
      return;
    }
    video.src = src;
  }

  window.initMoviePlayer = function (videoId, src, layerId) {
    var video = document.getElementById(videoId);
    var layer = document.getElementById(layerId);
    if (!video || !src) {
      return;
    }

    function start() {
      bindStream(video, src);
      if (layer) {
        layer.classList.add('is-hidden');
      }
      var playResult = video.play();
      if (playResult && typeof playResult.catch === 'function') {
        playResult.catch(function () {});
      }
    }

    if (layer) {
      layer.addEventListener('click', start);
    }
    video.addEventListener('click', function () {
      if (video.paused) {
        start();
      }
    });
    video.addEventListener('play', function () {
      if (layer) {
        layer.classList.add('is-hidden');
      }
    });
    window.addEventListener('hls-library-ready', function () {
      if (video.getAttribute('data-ready') === '1' && video.src.indexOf('.m3u8') !== -1) {
        return;
      }
      if (!video.paused || video.currentTime > 0) {
        bindStream(video, src);
      }
    });
  };
})();
