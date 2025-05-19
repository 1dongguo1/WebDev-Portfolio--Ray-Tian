$(document).ready(function() {
    "use strict";

    // 保存音乐播放状态到localStorage
    function saveMusicState(isPlaying) {
        localStorage.setItem('musicPlaying', isPlaying);
        localStorage.setItem('musicStateChange', Date.now());
    }

    // 获取音乐播放状态
    function getMusicState() {
        const state = localStorage.getItem('musicPlaying');
        return state === 'true';
    }

    // 保存音乐播放时间
    function saveMusicTime(time) {
        localStorage.setItem('musicTime', time);
    }

    // 获取音乐播放时间
    function getMusicTime() {
        return localStorage.getItem('musicTime') || 0;
    }

    // 保存当前播放音乐的标签页ID
    function setActiveTabId(tabId) {
        localStorage.setItem('musicActiveTabId', tabId);
    }

    // 获取当前播放音乐的标签页ID
    function getActiveTabId() {
        return localStorage.getItem('musicActiveTabId');
    }

    // 为当前标签页生成一个唯一的ID
    const currentTabId = 'tab-' + Math.random().toString(36).substr(2, 9);

    // 检查当前标签页是否是活跃的播放标签页
    function isCurrentTabActive() {
        return getActiveTabId() === currentTabId;
    }

    // 背景图片轮换
    const backgrounds = [
        'img/bg1.jpg',
        'img/bg2.jpg',
        'img/bg3.jpg',
        'img/bg4.jpg',
        'img/bg5.jpg',
        'img/bg6.jpg'
    ];

    let currentBg = 0;

    // 预加载所有背景图片
    backgrounds.forEach(src => {
        const img = new Image();
        img.src = src;
    });

    // 设置初始背景
    const header = document.querySelector('.top-header');
    if (header) {
        header.style.backgroundImage = `url(${backgrounds[0]})`;
    }

    function switchBackground() {
        const header = document.querySelector('.top-header');
        if (!header) return;
        
        currentBg = (currentBg + 1) % backgrounds.length;
        
        // 使用 CSS transition 实现平滑过渡
        header.style.transition = 'background-image 0.3s ease-in-out';
        header.style.backgroundImage = `url(${backgrounds[currentBg]})`;
    }

    // 每3秒切换一次背景
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

    // 确保所有页面都有返回顶部按钮
    if (!$('.back-to-top').length) {
        $('body').append('<a href="#" class="back-to-top"><i class="fa fa-chevron-up"></i></a>');
    }

    // 返回顶部按钮样式
    $('<style>')
        .text(`
            .back-to-top {
                position: fixed;
                left: 15px;
                bottom: 15px;
                display: none;
                width: 40px;
                height: 40px;
                line-height: 40px;
                text-align: center;
                background: #1E90FF;
                color: #fff;
                border-radius: 50%;
                z-index: 999;
                text-decoration: none;
                transition: all 0.3s ease;
                box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            }
            .back-to-top:hover {
                background: #187bcd;
                color: #fff;
                transform: translateY(-3px);
            }
            .back-to-top i {
                font-size: 20px;
                line-height: 40px;
            }
            .nav-menu {
                display: flex;
                margin: 0;
                padding: 0;
                list-style: none;
                justify-content: center;
                flex: 1;
                min-width: 600px;
            }
            .nav-menu li {
                margin: 0 10px;
            }
            .nav-menu a {
                color: #fff;
                text-decoration: none;
                padding: 5px 8px;
                font-size: 0.95rem;
                transition: all 0.3s ease;
                position: relative;
                white-space: nowrap;
            }
        `)
        .appendTo('head');

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

    // Back to top button
    $(window).scroll(function() {
        if ($(this).scrollTop() > 100) {
            $('.back-to-top').fadeIn('slow');
        } else {
            $('.back-to-top').fadeOut('slow');
        }
    });

    $('.back-to-top').click(function() {
        $('html, body').animate({ scrollTop: 0 }, 1500, 'easeInOutExpo');
        return false;
    });

    // ------------- 音频播放器和可视化波浪条功能 -------------

    function setupAudioAndVisualizer() {
        const audio = document.getElementById('bg-music');
        const visDiv = document.getElementById('audio-visualizer');

        if (!audio || !visDiv) {
            return;
        }

        // 创建 canvas 元素
        const canvas = document.createElement('canvas');
        canvas.width = visDiv.clientWidth;
        canvas.height = visDiv.clientHeight;
        visDiv.appendChild(canvas);
        const ctx = canvas.getContext('2d');

        // 设置音频属性
        audio.volume = 0.5;
        audio.loop = true;
        audio.preload = 'auto';
        audio.src = 'audio/Break.mp3';

        let audioCtx = null;
        let analyser;
        let source;
        let isPlaying = getMusicState(); // 从localStorage获取播放状态
        let animationFrameId = null;

        // 设置 AudioContext
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

        // 开始播放
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

        // 停止播放
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

        // 绘制可视化效果
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

        // 在Audio元数据加载完成后自动播放
        audio.addEventListener('loadedmetadata', function() {
            console.log('Audio metadata loaded.');
            setupAudioCtx();
            const savedTime = getMusicTime();
            if (savedTime > 0) {
                audio.currentTime = savedTime;
            }
            // 如果之前是播放状态，则自动开始播放
            if (isPlaying) {
                startPlayback();
            }
        });

        // 定期保存播放时间
        audio.addEventListener('timeupdate', function() {
            if (isPlaying && isCurrentTabActive()) {
                saveMusicTime(audio.currentTime);
            }
        });

        // 点击可视化器切换播放状态
        visDiv.addEventListener('click', function(e) {
            e.preventDefault();
            if (isPlaying) {
                stopPlayback();
            } else {
                startPlayback();
            }
        });

        // 监听其他标签页的状态变化
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

        // 页面关闭时保存状态
        window.addEventListener('beforeunload', function() {
            if (isPlaying && isCurrentTabActive()) {
                saveMusicTime(audio.currentTime);
            }
        });

        // 初始化
        setupAudioCtx();
        audio.load();
    }

    // 初始化音乐播放器和可视化
    setupAudioAndVisualizer();
});