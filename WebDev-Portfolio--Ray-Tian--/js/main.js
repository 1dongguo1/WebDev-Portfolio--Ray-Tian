$(document).ready(function() {
    "use strict";

    // save music playing state to localStorage
    function saveMusicState(isPlaying) {
        localStorage.setItem('musicPlaying', isPlaying);
        localStorage.setItem('musicStateChange', Date.now());
    }

    // get music playing state
    function getMusicState() {
        const state = localStorage.getItem('musicPlaying');
        return state === 'true';
    }

    // save music playing time
    function saveMusicTime(time) {
        localStorage.setItem('musicTime', time);
    }

    // get music playing time
    function getMusicTime() {
        return localStorage.getItem('musicTime') || 0;
    }

    // save current playing music tab ID
    function setActiveTabId(tabId) {
        localStorage.setItem('musicActiveTabId', tabId);
    }

    // get current playing music tab ID
    function getActiveTabId() {
        return localStorage.getItem('musicActiveTabId');
    }

    // generate a unique ID for the current tab
    const currentTabId = 'tab-' + Math.random().toString(36).substr(2, 9);

    // check if the current tab is the active playing tab
    function isCurrentTabActive() {
        return getActiveTabId() === currentTabId;
    }

    // background image rotation
    const backgrounds = [
        'img/bg1.jpg',
        'img/bg2.jpg',
        'img/bg3.jpg',
        'img/bg4.jpg',
        'img/bg5.jpg',
        'img/bg6.jpg'
    ];

    let currentBg = 0;

    // preload all background images
    backgrounds.forEach(src => {
        const img = new Image();
        img.src = src;
    });

    // set initial background
    const header = document.querySelector('.top-header');
    if (header) {
        header.style.backgroundImage = `url(${backgrounds[0]})`;
    }

    function switchBackground() {
        const header = document.querySelector('.top-header');
        if (!header) return;
        
        currentBg = (currentBg + 1) % backgrounds.length;
        
        // use CSS transition to achieve smooth transition
        header.style.transition = 'background-image 0.3s ease-in-out';
        header.style.backgroundImage = `url(${backgrounds[currentBg]})`;
    }

    // switch background every 3 seconds
    setInterval(switchBackground, 3000);

    // Mobile Navigation
    if ($('.nav-menu').length) {
        const $mobile_nav = $('.nav-menu').clone().prop({ id: 'mobile-nav' });
        $('body').append($mobile_nav);
        $('body').prepend('<button type="button" id="mobile-nav-toggle"><i class="fa fa-bars"></i></button>');
        $('body').append('<div id="mobile-body-overly"></div>');

        $(document).on('click', '#mobile-nav-toggle', function () {
            $('body').toggleClass('mobile-nav-active');
            $('#mobile-nav-toggle i').toggleClass('fa-times fa-bars');
            $('#mobile-body-overly').toggle();
        });

        $(document).on('click', '#mobile-nav a', function () {
            $('body').removeClass('mobile-nav-active');
            $('#mobile-nav-toggle i').toggleClass('fa-times fa-bars');
            $('#mobile-body-overly').fadeOut();
        });

        $(document).click(function (e) {
            const container = $("#mobile-nav, #mobile-nav-toggle");
            if (!container.is(e.target) && container.has(e.target).length === 0) {
                if ($('body').hasClass('mobile-nav-active')) {
                    $('body').removeClass('mobile-nav-active');
                    $('#mobile-nav-toggle i').toggleClass('fa-times fa-bars');
                    $('#mobile-body-overly').fadeOut();
                }
            }
        });
    }

    // Smooth scroll for anchor links
    $('a[href*="#"]:not([href="#"])').on('click', function() {
        if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') && location.hostname == this.hostname) {
            var target = $(this.hash);
            target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
            if (target.length) {
                // Calculate offset based on header height
                var headerHeight = $('.header').outerHeight();
                $('html, body').animate({
                    scrollTop: target.offset().top - headerHeight
                }, 1000);
                return false;
            }
        }
    });

    // Handle initial hash in URL for smooth scrolling on page load
    if (window.location.hash) {
        var target = $(window.location.hash);
        if (target.length) {
            var headerHeight = $('.header').outerHeight();
            // Give some time for the page to render and header height to be calculated
            setTimeout(function() {
                $('html, body').animate({
                    scrollTop: target.offset().top - headerHeight
                }, 1000);
            }, 100);
        }
    }

    // ------------- audio player and visualizer wave bar function -------------

    function setupAudioAndVisualizer() {
        const audio = document.getElementById('bg-music');
        const visDiv = document.getElementById('audio-visualizer');

        if (!audio || !visDiv) {
            return;
        }

        // create canvas element
        const canvas = document.createElement('canvas');
        canvas.width = visDiv.clientWidth;
        canvas.height = visDiv.clientHeight;
        visDiv.appendChild(canvas);
        const ctx = canvas.getContext('2d');

        // set audio properties
        audio.volume = 0.5;
        audio.loop = true;
        audio.preload = 'auto';
        audio.src = 'audio/Break.mp3';

        let audioCtx = null;
        let analyser;
        let source;
        let isPlaying = getMusicState(); // get playing state from localStorage
        let animationFrameId = null;

        // set AudioContext
        function setupAudioCtx() {
            if (!audioCtx) {
                try {
                    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                    analyser = audioCtx.createAnalyser();
                    source = audioCtx.createMediaElementSource(audio);
                    source.connect(analyser);
                    analyser.connect(audioCtx.destination);
                    analyser.fftSize = 256;
                    analyser.smoothingTimeConstant = 0.8;
                } catch (e) {
                    console.error('Error setting up audio context:', e);
                }
            }
        }

        // start playback
        function startPlayback() {
            if (audioCtx && audioCtx.state === 'suspended') {
                audioCtx.resume().then(() => {
                    audio.play().then(() => {
                        isPlaying = true;
                        saveMusicState(true);
                        setActiveTabId(currentTabId);
                        draw();
                    }).catch(e => console.error('Audio play failed:', e));
                }).catch(e => console.error('AudioContext resume failed:', e));
            } else {
                audio.play().then(() => {
                    isPlaying = true;
                    saveMusicState(true);
                    setActiveTabId(currentTabId);
                    draw();
                }).catch(e => console.error('Audio play failed:', e));
            }
        }

        // stop playback
        function stopPlayback() {
            if (!audio.paused) {
                audio.pause();
            }
            isPlaying = false;
            saveMusicState(false);
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
                animationFrameId = null;
            }
            if (ctx) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
        }

        // draw visualization effect
        function draw() {
            if (!analyser || !ctx || !isPlaying || audio.paused || (audioCtx && audioCtx.state !== 'running')) {
                if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
                animationFrameId = requestAnimationFrame(draw);
                return;
            }

            animationFrameId = requestAnimationFrame(draw);

            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);
            analyser.getByteFrequencyData(dataArray);

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const barWidth = (canvas.width / bufferLength) * 2.5;
            let x = 0;

            for(let i = 0; i < bufferLength; i++) {
                const barHeight = (dataArray[i] / 255) * canvas.height;

                const gradient = ctx.createLinearGradient(x, canvas.height, x + barWidth, canvas.height - barHeight);
                gradient.addColorStop(0, '#1E90FF');
                gradient.addColorStop(0.5, '#87CEFA');
                gradient.addColorStop(1, '#00BFFF');
                ctx.fillStyle = gradient;

                ctx.beginPath();
                ctx.roundRect(x, canvas.height - barHeight, barWidth, barHeight, 5);
                ctx.fill();

                x += barWidth + 1;
            }
        }

        // play automatically after Audio metadata is loaded
        audio.addEventListener('loadedmetadata', function() {
            console.log('Audio metadata loaded.');
            setupAudioCtx();
            const savedTime = getMusicTime();
            if (savedTime > 0) {
                audio.currentTime = savedTime;
            }
            // if the previous state is playing, start playback automatically
            if (isPlaying) {
                startPlayback();
            }
        });

        // save playing time periodically
        audio.addEventListener('timeupdate', function() {
            if (isPlaying && isCurrentTabActive()) {
                saveMusicTime(audio.currentTime);
            }
        });

        // click the visualizer to switch the playback state
        visDiv.addEventListener('click', function(e) {
            e.preventDefault();
            if (isPlaying) {
                stopPlayback();
            } else {
                startPlayback();
            }
        });

        // listen to the state change of other tabs
        window.addEventListener('storage', function(e) {
            if (e.key === 'musicStateChange') {
                const newState = getMusicState();
                if (newState !== isPlaying) {
                    if (newState) {
                        startPlayback();
                    } else {
                        stopPlayback();
                    }
                }
            }
        });

        // save state when the page is closed
        window.addEventListener('beforeunload', function() {
            if (isPlaying && isCurrentTabActive()) {
                saveMusicTime(audio.currentTime);
            }
        });

        // initialize
        setupAudioCtx();
        audio.load();
    }

    // initialize music player and visualizer
    setupAudioAndVisualizer();
});