/* =====================================================
   BIRTHDAY SURPRISE
   SCRIPT.JS — FULL PREMIUM FINAL
===================================================== */


/* =====================================================
   01. GAME VARIABLES
===================================================== */

const HEARTS_TO_WIN = 5;

let gameCanvas = null;
let gameCtx = null;
let gameRunning = false;
let gameScore = 0;
let gameHearts = [];
let gameArrows = [];
let gameParticles = [];
let gameAnimFrame = null;
let gameStartTime = 0;
let audioUnlocked = false;

const HEART_SYMBOLS = ["♡", "♥", "❤"];
const ARROW_SPEED = 12;
const HEART_SPEED_MIN = 0.6;
const HEART_SPEED_MAX = 1.8;


/* =====================================================
   02. MUSIC VARIABLES
===================================================== */

let music = null;
let musicButton = null;
let mainPlayButton = null;
let progressBar = null;
let currentTimeElement = null;
let durationElement = null;
let currentSongTitle = null;
let currentSongArtist = null;

let currentSongIndex = 0;


/* =====================================================
   03. SONG LIST
   FORMAT: .MP3
===================================================== */

const songs = [
    {
        title: "Jatuh Suka",
        artist: "a song for a special memory",
        file: "music/lagu1.mp3"
    },

    {
        title: "Shape Of My Heart",
        artist: "another little memory",
        file: "music/lagu2.mp3"
    },

    {
        title: "DNA - Lany",
        artist: "one more song for you",
        file: "music/lagu3.mp3"
    }
];


/* =====================================================
   04. PAGE LOADED
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const gamePage =
            document.getElementById("gamePage");

        const mainContent =
            document.getElementById("mainContent");


        /* -------------------------------------------------
           INITIAL SCREEN
        ------------------------------------------------- */

        if (gamePage) {
            gamePage.classList.remove("hidden");
        }

        if (mainContent) {
            mainContent.classList.add("hidden");
        }


        /* -------------------------------------------------
           MUSIC ELEMENTS
        ------------------------------------------------- */

        music =
            document.getElementById("music");

        musicButton =
            document.getElementById("musicButton");

        mainPlayButton =
            document.getElementById("mainPlayButton");

        progressBar =
            document.getElementById("progressBar");

        currentTimeElement =
            document.getElementById("currentTime");

        durationElement =
            document.getElementById("duration");

        currentSongTitle =
            document.getElementById("currentSongTitle");

        currentSongArtist =
            document.getElementById("currentSongArtist");


        /* -------------------------------------------------
           SETUP ALL SYSTEMS
        ------------------------------------------------- */

        createStars();

        setupGame();

        setupMusic();

        setupGift();

        setupMemoryReceipt();

        setupScrollAnimation();

        setupSongKeyboard();


        console.log(
            "♡ Birthday Surprise berhasil dimuat"
        );

    }
);


/* =====================================================
   05. ARCHERY GAME
===================================================== */

function setupGame() {

    gameCanvas =
        document.getElementById(
            "gameCanvas"
        );


    if (!gameCanvas) {
        return;
    }


    gameCtx =
        gameCanvas.getContext("2d");


    resizeCanvas();


    window.addEventListener(
        "resize",
        resizeCanvas
    );


    /* Click / Tap */

    gameCanvas.addEventListener(
        "click",
        function (event) {

            if (!gameRunning) {
                return;
            }


            const rect =
                gameCanvas.getBoundingClientRect();


            const scaleX =
                gameCanvas.width /
                rect.width;


            const scaleY =
                gameCanvas.height /
                rect.height;


            const x =
                (event.clientX - rect.left) *
                scaleX;


            const y =
                (event.clientY - rect.top) *
                scaleY;


            unlockAudio();

            shootArrow(x, y);

        }
    );


    /* Touch */

    gameCanvas.addEventListener(
        "touchstart",
        function (event) {

            event.preventDefault();

            if (!gameRunning) {
                return;
            }


            const touch =
                event.touches[0];


            const rect =
                gameCanvas.getBoundingClientRect();


            const scaleX =
                gameCanvas.width /
                rect.width;


            const scaleY =
                gameCanvas.height /
                rect.height;


            const x =
                (touch.clientX - rect.left) *
                scaleX;


            const y =
                (touch.clientY - rect.top) *
                scaleY;


            unlockAudio();

            shootArrow(x, y);

        },
        { passive: false }
    );


    startGame();

}


/* Unlock audio on first user gesture.
   Browser hanya mengizinkan autoplay kalau
   audio sudah "di-unlock" oleh user gesture. */

function unlockAudio() {

    if (audioUnlocked) {
        return;
    }


    const el =
        document.getElementById("music");


    if (!el) {
        return;
    }


    audioUnlocked = true;


    const previousVolume =
        el.volume;

    el.volume = 0;


    const unlockAttempt =
        el.play();


    if (
        unlockAttempt &&
        typeof unlockAttempt.then ===
        "function"
    ) {

        unlockAttempt.then(
            function () {

                el.pause();

                el.currentTime = 0;

                el.volume =
                    previousVolume;

            }
        ).catch(
            function () {

                el.volume =
                    previousVolume;

            }
        );

    } else {

        el.volume =
            previousVolume;

    }

}


function resizeCanvas() {
    if (!gameCanvas) {
        return;
    }


    const wrap =
        gameCanvas.parentElement;


    if (!wrap) {
        return;
    }


    const rect =
        wrap.getBoundingClientRect();


    gameCanvas.width =
        rect.width * 2;


    gameCanvas.height =
        rect.height * 2;

}


function startGame() {

    gameRunning = true;

    gameScore = 0;

    gameHearts = [];

    gameArrows = [];

    gameParticles = [];

    gameStartTime =
        Date.now();


    updateGameUI();

    spawnHeart();

    spawnHeart();

    spawnHeart();

    gameLoop();

}


function gameLoop() {

    if (!gameRunning) {
        return;
    }


    gameCtx.clearRect(
        0, 0,
        gameCanvas.width,
        gameCanvas.height
    );


    /* Spawn hearts periodically */

    const elapsed =
        Date.now() -
        gameStartTime;


    if (
        elapsed > 800 &&
        gameHearts.length < 8 &&
        Math.random() < 0.025
    ) {

        spawnHeart();

    }


    /* Update & draw hearts */

    for (
        let i =
            gameHearts.length - 1;
        i >= 0;
        i--
    ) {

        const heart =
            gameHearts[i];


        heart.x +=
            heart.vx;


        heart.y +=
            heart.vy;


        heart.wobble +=
            heart.wobbleSpeed;


        const wobbleX =
            Math.sin(
                heart.wobble
            ) *
            heart.wobbleAmp;


        /* Remove if off screen */

        if (
            heart.y < -60 ||
            heart.x < -60 ||
            heart.x >
            gameCanvas.width + 60
        ) {

            gameHearts.splice(i, 1);

            continue;

        }


        /* Draw heart */

        drawHeart(
            heart.x + wobbleX,
            heart.y,
            heart.size,
            heart.opacity,
            heart.color
        );

    }


    /* Update & draw arrows */

    for (
        let i =
            gameArrows.length - 1;
        i >= 0;
        i--
    ) {

        const arrow =
            gameArrows[i];


        arrow.x +=
            arrow.vx;


        arrow.y +=
            arrow.vy;


        /* Remove if off screen */

        if (
            arrow.y < -50 ||
            arrow.y >
            gameCanvas.height + 50 ||
            arrow.x < -50 ||
            arrow.x >
            gameCanvas.width + 50
        ) {

            gameArrows.splice(i, 1);

            continue;

        }


        /* Check collision with hearts */

        let hit = false;


        for (
            let j =
                gameHearts.length - 1;
            j >= 0;
            j--
        ) {

            const heart =
                gameHearts[j];


            const dx =
                arrow.x -
                heart.x;


            const dy =
                arrow.y -
                heart.y;


            const dist =
                Math.sqrt(
                    dx * dx +
                    dy * dy
                );


            if (
                dist <
                heart.size + 15
            ) {

                /* HIT! */

                createHeartExplosion(
                    heart.x,
                    heart.y,
                    heart.color
                );


                gameHearts.splice(j, 1);


                gameScore++;


                updateGameUI();


                hit = true;


                if (
                    gameScore >=
                    HEARTS_TO_WIN
                ) {

                    winGame();

                    return;

                }


                break;

            }

        }


        if (hit) {

            gameArrows.splice(i, 1);

            continue;

        }


        /* Draw arrow */

        drawArrow(arrow);

    }


    /* Update & draw particles */

    for (
        let i =
            gameParticles.length - 1;
        i >= 0;
        i--
    ) {

        const p =
            gameParticles[i];


        p.x += p.vx;

        p.y += p.vy;

        p.vy += 0.08;

        p.life -= p.decay;


        if (p.life <= 0) {

            gameParticles.splice(i, 1);

            continue;

        }


        gameCtx.globalAlpha =
            p.life;


        gameCtx.fillStyle =
            p.color;


        gameCtx.beginPath();


        gameCtx.arc(
            p.x, p.y,
            p.size *
            p.life,
            0,
            Math.PI * 2
        );


        gameCtx.fill();

    }


    gameCtx.globalAlpha = 1;


    /* Draw crosshair at bottom center */

    const cx =
        gameCanvas.width / 2;

    const cy =
        gameCanvas.height - 40;


    gameCtx.globalAlpha = 0.3;

    gameCtx.strokeStyle =
        "#e8b4f0";

    gameCtx.lineWidth = 1.5;


    gameCtx.beginPath();

    gameCtx.arc(
        cx, cy, 12,
        0,
        Math.PI * 2
    );

    gameCtx.stroke();


    gameCtx.beginPath();

    gameCtx.moveTo(
        cx - 18, cy
    );

    gameCtx.lineTo(
        cx - 6, cy
    );

    gameCtx.moveTo(
        cx + 6, cy
    );

    gameCtx.lineTo(
        cx + 18, cy
    );

    gameCtx.moveTo(
        cx, cy - 18
    );

    gameCtx.lineTo(
        cx, cy - 6
    );

    gameCtx.moveTo(
        cx, cy + 6
    );

    gameCtx.lineTo(
        cx, cy + 18
    );

    gameCtx.stroke();


    gameCtx.globalAlpha = 1;


    gameAnimFrame =
        requestAnimationFrame(
            gameLoop
        );

}


function spawnHeart() {

    const size =
        22 +
        Math.random() * 18;


    const side =
        Math.random();


    let x, vx, vy;


    if (side < 0.4) {

        /* From left */

        x =
            -30;

        vx =
            0.3 +
            Math.random() * 1.2;

        vy =
            -(HEART_SPEED_MIN +
            Math.random() *
            (HEART_SPEED_MAX -
            HEART_SPEED_MIN));

    } else if (side < 0.8) {

        /* From right */

        x =
            gameCanvas.width +
            30;

        vx =
            -(0.3 +
            Math.random() * 1.2);

        vy =
            -(HEART_SPEED_MIN +
            Math.random() *
            (HEART_SPEED_MAX -
            HEART_SPEED_MIN));

    } else {

        /* From bottom center area */

        x =
            gameCanvas.width *
            (0.2 +
            Math.random() * 0.6);

        vx =
            -0.5 +
            Math.random() * 1;

        vy =
            -(HEART_SPEED_MIN +
            Math.random() *
            (HEART_SPEED_MAX -
            HEART_SPEED_MIN));

    }


    const colors = [
        "#f0baff",
        "#e88fd4",
        "#d99fe7",
        "#f5d4f9",
        "#c77dba",
        "#ffb3d9"
    ];


    gameHearts.push({
        x: x,
        y:
            gameCanvas.height +
            30 +
            Math.random() * 50,
        vx: vx,
        vy: vy,
        size: size,
        opacity:
            0.7 +
            Math.random() * 0.3,
        wobble:
            Math.random() *
            Math.PI * 2,
        wobbleSpeed:
            0.02 +
            Math.random() * 0.03,
        wobbleAmp:
            8 +
            Math.random() * 15,
        color:
            colors[
                Math.floor(
                    Math.random() *
                    colors.length
                )
            ]
    });

}


function shootArrow(
    targetX,
    targetY
) {

    const startX =
        gameCanvas.width / 2;

    const startY =
        gameCanvas.height - 40;


    const dx =
        targetX - startX;


    const dy =
        targetY - startY;


    const dist =
        Math.sqrt(
            dx * dx + dy * dy
        );


    if (dist < 1) {
        return;
    }


    const vx =
        (dx / dist) *
        ARROW_SPEED;


    const vy =
        (dy / dist) *
        ARROW_SPEED;


    gameArrows.push({
        x: startX,
        y: startY,
        vx: vx,
        vy: vy,
        angle:
            Math.atan2(
                dy, dx
            )
    });

}


function drawHeart(
    x, y,
    size,
    opacity,
    color
) {

    gameCtx.save();

    gameCtx.globalAlpha =
        opacity;

    gameCtx.fillStyle =
        color;

    gameCtx.font =
        size +
        "px serif";

    gameCtx.textAlign =
        "center";

    gameCtx.textBaseline =
        "middle";


    gameCtx.fillText(
        "♥",
        x, y
    );


    gameCtx.restore();

}


function drawArrow(arrow) {

    gameCtx.save();

    gameCtx.translate(
        arrow.x,
        arrow.y
    );

    gameCtx.rotate(
        arrow.angle
    );


    /* Arrow shaft */

    gameCtx.strokeStyle =
        "#f0d0f5";

    gameCtx.lineWidth = 2;

    gameCtx.beginPath();

    gameCtx.moveTo(
        -18, 0
    );

    gameCtx.lineTo(
        10, 0
    );

    gameCtx.stroke();


    /* Arrowhead */

    gameCtx.fillStyle =
        "#e8b4f0";

    gameCtx.beginPath();

    gameCtx.moveTo(
        14, 0
    );

    gameCtx.lineTo(
        6, -4
    );

    gameCtx.lineTo(
        6, 4
    );

    gameCtx.closePath();

    gameCtx.fill();


    /* Arrow tail */

    gameCtx.strokeStyle =
        "#d090d0";

    gameCtx.lineWidth = 1.5;

    gameCtx.beginPath();

    gameCtx.moveTo(
        -18, 0
    );

    gameCtx.lineTo(
        -22, -3
    );

    gameCtx.moveTo(
        -18, 0
    );

    gameCtx.lineTo(
        -22, 3
    );

    gameCtx.stroke();


    gameCtx.restore();

}


function createHeartExplosion(
    x, y,
    color
) {

    const symbols = [
        "♥", "♡", "✦",
        "✧", "·"
    ];


    for (
        let i = 0;
        i < 12;
        i++
    ) {

        const angle =
            Math.random() *
            Math.PI * 2;


        const speed =
            1.5 +
            Math.random() * 3;


        gameParticles.push({
            x: x,
            y: y,
            vx:
                Math.cos(angle) *
                speed,
            vy:
                Math.sin(angle) *
                speed -
                1.5,
            size:
                3 +
                Math.random() * 4,
            life: 1,
            decay:
                0.015 +
                Math.random() *
                0.015,
            color:
                i < 6
                    ? color
                    : "#ffffff"
        });

    }

}


function updateGameUI() {

    const scoreEl =
        document.getElementById(
            "gameScore"
        );

    const heartsEl =
        document.getElementById(
            "gameHeartsDisplay"
        );

    const msgEl =
        document.getElementById(
            "gameMessage"
        );


    if (scoreEl) {

        scoreEl.textContent =
            gameScore;

    }


    if (heartsEl) {

        let display = "";


        for (
            let i = 0;
            i < HEARTS_TO_WIN;
            i++
        ) {

            display +=
                i < gameScore
                    ? "♥"
                    : "♡";

            if (
                i <
                HEARTS_TO_WIN - 1
            ) {

                display += " ";

            }

        }


        heartsEl.textContent =
            display;

    }


    if (msgEl) {

        if (
            gameScore === 0
        ) {

            msgEl.textContent =
                "Tap the canvas to shoot!";

        } else if (
            gameScore <
            HEARTS_TO_WIN
        ) {

            msgEl.textContent =
                "Nice! " +
                (HEARTS_TO_WIN -
                gameScore) +
                " more to go ♡";

        }

    }

}


function winGame() {

    gameRunning = false;


    if (gameAnimFrame) {

        cancelAnimationFrame(
            gameAnimFrame
        );

    }


    const msgEl =
        document.getElementById(
            "gameMessage"
        );


    if (msgEl) {

        msgEl.textContent =
            "You did it! ♡";

        msgEl.classList.add(
            "success"
        );

    }


    /* Victory particles */

    for (
        let i = 0;
        i < 30;
        i++
    ) {

        setTimeout(
            function () {

                createHeartExplosion(
                    gameCanvas.width *
                    (0.15 +
                    Math.random() *
                    0.7),
                    gameCanvas.height *
                    (0.2 +
                    Math.random() *
                    0.5),
                    "#f0baff"
                );

            },
            i * 60
        );

    }


    /* Transition to main content */

    setTimeout(
        function () {

            const gamePage =
                document.getElementById(
                    "gamePage"
                );

            const mainContent =
                document.getElementById(
                    "mainContent"
                );


            if (gamePage) {

                gamePage.style.transition =
                    "opacity .6s ease, transform .6s ease";

                gamePage.style.opacity =
                    "0";

                gamePage.style.transform =
                    "scale(1.05)";

            }


            setTimeout(
                function () {

                    if (gamePage) {

                        gamePage.classList
                            .add("hidden");

                    }


                    if (mainContent) {

                        mainContent.classList
                            .remove("hidden");

                    }


                    createPetals();

                    createConfetti();


                    /* Auto-play music */

                    setTimeout(
                        function () {

                            playMusic();

                        },
                        300
                    );


                    window.scrollTo({
                        top: 0,
                        behavior: "smooth"
                    });


                    console.log(
                        "♡ Game selesai, musik diputar"
                    );

                },
                650
            );

        },
        1500
    );

}


/* =====================================================
   07. CREATE PETALS
===================================================== */

function createPetals() {

    const container =
        document.getElementById(
            "petals"
        );


    if (!container) {
        return;
    }


    /* Prevent duplicates */

    if (
        container.children.length > 0
    ) {
        return;
    }


    for (
        let i = 0;
        i < 32;
        i++
    ) {

        const petal =
            document.createElement(
                "div"
            );


        petal.className =
            "petal";


        const size =
            7 +
            Math.random() * 10;


        const left =
            Math.random() * 100;


        const duration =
            5 +
            Math.random() * 8;


        const delay =
            Math.random() * 8;


        const rotation =
            Math.random() * 360;


        petal.style.left =
            left + "vw";


        petal.style.width =
            size + "px";


        petal.style.height =
            size * 1.45 +
            "px";


        petal.style.animationDuration =
            duration + "s";


        petal.style.animationDelay =
            delay + "s";


        petal.style.transform =
            "rotate(" +
            rotation +
            "deg)";


        container.appendChild(
            petal
        );

    }

}


/* =====================================================
   07b. CREATE STARS
===================================================== */

function createStars() {

    const container =
        document.getElementById(
            "stars"
        );


    if (!container) {
        return;
    }


    if (
        container.children.length > 0
    ) {
        return;
    }


    for (
        let i = 0;
        i < 70;
        i++
    ) {

        const star =
            document.createElement(
                "div"
            );


        star.className =
            "star";


        const size =
            1 +
            Math.random() * 2.5;


        const left =
            Math.random() * 100;


        const top =
            Math.random() * 100;


        const duration =
            2 +
            Math.random() * 4;


        const delay =
            Math.random() * 5;


        star.style.left =
            left + "%";


        star.style.top =
            top + "%";


        star.style.width =
            size + "px";


        star.style.height =
            size + "px";


        star.style.animationDuration =
            duration + "s";


        star.style.animationDelay =
            delay + "s";


        container.appendChild(
            star
        );

    }

}


/* =====================================================
   07c. CREATE CONFETTI
===================================================== */

function createConfetti() {

    const container =
        document.getElementById(
            "confettiContainer"
        );


    if (!container) {
        return;
    }


    const colors = [
        "#f0baff",
        "#d99fe7",
        "#e8c4f0",
        "#ffffff",
        "#c77dba",
        "#f5d4f9",
        "#b868a8",
        "#dfb8e8"
    ];


    for (
        let i = 0;
        i < 80;
        i++
    ) {

        const piece =
            document.createElement(
                "div"
            );


        piece.className =
            "confetti-piece";


        const color =
            colors[
                Math.floor(
                    Math.random() *
                    colors.length
                )
            ];


        const left =
            10 +
            Math.random() * 80;


        const duration =
            2.5 +
            Math.random() * 2;


        const delay =
            Math.random() * 0.8;


        const x =
            -80 +
            Math.random() * 160;


        const rot =
            360 +
            Math.random() * 720;


        piece.style.left =
            left + "%";


        piece.style.background =
            color;


        piece.style.animationDuration =
            duration + "s";


        piece.style.animationDelay =
            delay + "s";


        piece.style.setProperty(
            "--confetti-x",
            x + "px"
        );


        piece.style.setProperty(
            "--confetti-rot",
            rot + "deg"
        );


        const w =
            5 +
            Math.random() * 6;


        const h =
            10 +
            Math.random() * 8;


        piece.style.width =
            w + "px";


        piece.style.height =
            h + "px";


        container.appendChild(
            piece
        );

    }


    setTimeout(
        function () {

            container.innerHTML = "";

        },
        5000
    );

}


/* =====================================================
   08. MUSIC SETUP
===================================================== */

function setupMusic() {

    if (!music) {

        console.warn(
            "Audio #music tidak ditemukan."
        );

        return;
    }


    /* Time */

    music.addEventListener(
        "timeupdate",
        updateProgress
    );


    /* Metadata */

    music.addEventListener(
        "loadedmetadata",
        function () {

            if (durationElement) {

                durationElement.textContent =
                    formatTime(
                        music.duration
                    );
            }

        }
    );


    /* Play */

    music.addEventListener(
        "play",
        function () {

            updatePlayButtons(
                true
            );

        }
    );


    /* Pause */

    music.addEventListener(
        "pause",
        function () {

            updatePlayButtons(
                false
            );

        }
    );


    /* End */

    music.addEventListener(
        "ended",
        function () {

            nextSong(true);

        }
    );


    /* Error */

    music.addEventListener(
        "error",
        function () {

            console.error(
                "Musik gagal dimuat:",
                songs[currentSongIndex].file
            );

        }
    );


    /* Progress */

    if (progressBar) {

        progressBar.addEventListener(
            "input",
            function () {

                if (
                    !music.duration ||
                    isNaN(music.duration)
                ) {
                    return;
                }


                const percentage =
                    Number(
                        progressBar.value
                    ) / 100;


                music.currentTime =
                    percentage *
                    music.duration;

            }
        );

    }


    /* First song */

    loadSong(
        0,
        false
    );

}


/* =====================================================
   09. LOAD SONG
===================================================== */

function loadSong(
    index,
    autoPlay
) {

    if (!music) {
        return;
    }


    if (
        index < 0 ||
        index >= songs.length
    ) {
        return;
    }


    currentSongIndex =
        index;


    const song =
        songs[
            currentSongIndex
        ];


    /* Pause */

    music.pause();


    /* Change source */

    music.src =
        song.file;


    music.load();


    /* Title */

    if (currentSongTitle) {

        currentSongTitle.textContent =
            song.title;

    }


    /* Artist */

    if (currentSongArtist) {

        currentSongArtist.textContent =
            song.artist;

    }


    /* Reset progress */

    if (progressBar) {
        progressBar.value = 0;
    }


    if (currentTimeElement) {

        currentTimeElement.textContent =
            "0:00";

    }


    if (durationElement) {

        durationElement.textContent =
            "0:00";

    }


    updateActiveSong();

    updatePlayButtons(
        false
    );


    /* Autoplay after user action */

    if (autoPlay) {

        playMusic();

    }

}


/* =====================================================
   10. PLAY MUSIC
===================================================== */

function playMusic() {

    if (!music) {
        return;
    }


    const playPromise =
        music.play();


    if (
        playPromise &&
        typeof playPromise.then ===
        "function"
    ) {

        playPromise.then(
            function () {

                updatePlayButtons(
                    true
                );

            }
        ).catch(
            function (error) {

                console.warn(
                    "Musik tidak dapat diputar:",
                    error
                );


                updatePlayButtons(
                    false
                );


                /* Fallback hint */

                const player =
                    document.querySelector(
                        ".music-player"
                    );


                if (
                    player &&
                    !player.dataset
                        .autoplayBlocked
                ) {

                    player.dataset
                        .autoplayBlocked =
                        "true";


                    const hint =
                        document.createElement(
                            "p"
                        );


                    hint.className =
                        "music-hint";

                    hint.textContent =
                        "♫ tap ▶ to play the song";


                    player.appendChild(
                        hint
                    );

                }

            }
        );

    }

}


/* =====================================================
   11. PAUSE MUSIC
===================================================== */

function pauseMusic() {

    if (!music) {
        return;
    }


    music.pause();


    updatePlayButtons(
        false
    );

}


/* =====================================================
   12. TOGGLE MUSIC
===================================================== */

function toggleMusic() {

    if (!music) {
        return;
    }


    if (music.paused) {

        playMusic();

    } else {

        pauseMusic();

    }

}


/* =====================================================
   13. UPDATE PLAY BUTTONS
===================================================== */

function updatePlayButtons(
    isPlaying
) {

    const icon =
        isPlaying
            ? "Ⅱ"
            : "▶";


    /* Hapus fallback hint
       saat musik berhasil diputar */

    if (isPlaying) {

        const hint =
            document.querySelector(
                ".music-hint"
            );


        if (hint) {
            hint.remove();
        }

    }


    if (musicButton) {

        musicButton.innerHTML =
            icon;

    }


    if (mainPlayButton) {

        mainPlayButton.innerHTML =
            icon;

    }


    const cards =
        document.querySelectorAll(
            ".song-card"
        );


    cards.forEach(
        function (card) {

            const index =
                Number(
                    card.dataset.index
                );


            const playIcon =
                card.querySelector(
                    ".song-play"
                );


            if (!playIcon) {
                return;
            }


            if (
                index === currentSongIndex &&
                isPlaying
            ) {

                playIcon.innerHTML =
                    "Ⅱ";

            } else {

                playIcon.innerHTML =
                    "▶";

            }

        }
    );

}


/* =====================================================
   14. NEXT SONG
===================================================== */

function nextSong(
    autoPlay
) {

    currentSongIndex++;


    if (
        currentSongIndex >=
        songs.length
    ) {

        currentSongIndex = 0;

    }


    loadSong(
        currentSongIndex,
        autoPlay !== false
    );

}


/* =====================================================
   15. PREVIOUS SONG
===================================================== */

function previousSong() {

    if (!music) {
        return;
    }


    if (
        music.currentTime > 3
    ) {

        music.currentTime = 0;

        return;
    }


    currentSongIndex--;


    if (
        currentSongIndex < 0
    ) {

        currentSongIndex =
            songs.length - 1;

    }


    loadSong(
        currentSongIndex,
        true
    );

}


/* =====================================================
   16. SELECT SONG
===================================================== */

function selectSong(
    index
) {

    if (
        index < 0 ||
        index >= songs.length
    ) {
        return;
    }


    if (
        index === currentSongIndex
    ) {

        toggleMusic();

        return;
    }


    loadSong(
        index,
        true
    );

}


/* =====================================================
   17. ACTIVE SONG
===================================================== */

function updateActiveSong() {

    const cards =
        document.querySelectorAll(
            ".song-card"
        );


    cards.forEach(
        function (card) {

            const index =
                Number(
                    card.dataset.index
                );


            card.classList.toggle(
                "active",
                index === currentSongIndex
            );

        }
    );

}


/* =====================================================
   18. SONG KEYBOARD
===================================================== */

function setupSongKeyboard() {

    const cards =
        document.querySelectorAll(
            ".song-card"
        );


    cards.forEach(
        function (card) {

            card.addEventListener(
                "keydown",
                function (event) {

                    if (
                        event.key === "Enter" ||
                        event.key === " "
                    ) {

                        event.preventDefault();


                        selectSong(
                            Number(
                                card.dataset.index
                            )
                        );

                    }

                }
            );

        }
    );

}


/* =====================================================
   19. UPDATE PROGRESS
===================================================== */

function updateProgress() {

    if (!music) {
        return;
    }


    if (
        !music.duration ||
        isNaN(music.duration)
    ) {
        return;
    }


    const percentage =
        (
            music.currentTime /
            music.duration
        ) * 100;


    if (progressBar) {

        progressBar.value =
            percentage;

    }


    if (currentTimeElement) {

        currentTimeElement.textContent =
            formatTime(
                music.currentTime
            );

    }


    if (durationElement) {

        durationElement.textContent =
            formatTime(
                music.duration
            );

    }

}


/* =====================================================
   20. FORMAT TIME
===================================================== */

function formatTime(
    seconds
) {

    if (
        !seconds ||
        isNaN(seconds)
    ) {

        return "0:00";

    }


    const minutes =
        Math.floor(
            seconds / 60
        );


    const remainingSeconds =
        Math.floor(
            seconds % 60
        );


    return (
        minutes +
        ":" +
        String(
            remainingSeconds
        ).padStart(
            2,
            "0"
        )
    );

}


/* =====================================================
   21. MEMORY RECEIPT SETUP
===================================================== */

const bookPages = [

    {
        eyebrow: "MEMORY 01 · LITTLE MOMENT",
        title: "a little memory",
        note: "Momen kecil yang ternyata membekas lebih lama dari yang aku kira.",
        image: "images/foto1.jpeg",
        special: false
    },

    {
        eyebrow: "MEMORY 02 · FAVORITE MOMENT",
        title: "one of my favorites",
        note: "Kalau boleh milih satu untuk diputar ulang, mungkin ini salah satunya.",
        image: "images/foto2.jpeg",
        special: false
    },

    {
        eyebrow: "MEMORY 03 · THIS MOMENT",
        title: "this moment ♡",
        note: "Sederhana, tapi entah kenapa selalu aku ingat detailnya.",
        image: "images/foto3.jpeg",
        special: false
    },

    {
        eyebrow: "MEMORY 04 · SPECIAL MEMORY",
        title: "always remember ♡",
        note: "Halaman terakhir, tapi bukan berarti ceritanya selesai di sini.",
        image: "images/foto4.jpeg",
        special: true
    }

];

let bookPageIndex = 0;


function setupMemoryReceipt() {

    const cards =
        document.querySelectorAll(
            ".memory-ticket"
        );


    cards.forEach(
        function (card) {

            card.addEventListener(
                "click",
                function () {

                    const index =
                        parseInt(
                            card.dataset.memory,
                            10
                        ) - 1;

                    openBook(
                        Number.isNaN(index)
                            ? 0
                            : index
                    );

                }
            );


            card.addEventListener(
                "keydown",
                function (event) {

                    if (
                        event.key === "Enter" ||
                        event.key === " "
                    ) {

                        event.preventDefault();

                        const index =
                            parseInt(
                                card.dataset.memory,
                                10
                            ) - 1;

                        openBook(
                            Number.isNaN(index)
                                ? 0
                                : index
                        );

                    }

                }
            );

        }
    );

}


/* =====================================================
   22. OPEN PHOTO BOOK
===================================================== */

function openBook(
    startIndex
) {

    /* Close old book */

    closeReceipt();


    bookPageIndex =
        startIndex || 0;


    /* Overlay */

    const overlay =
        document.createElement(
            "div"
        );


    overlay.className =
        "book-overlay";


    /* Book */

    const book =
        document.createElement(
            "div"
        );


    book.className =
        "photo-book";


    book.innerHTML = `

        <button
            class="book-close"
            type="button"
            aria-label="Close"
        >
            ×
        </button>

        <div class="book-ribbon">
            OUR LITTLE PHOTO BOOK
        </div>

        <div class="book-cover">

            <div class="book-spread" id="bookSpread"></div>

            <div class="book-controls">

                <button
                    class="book-nav"
                    id="bookPrev"
                    type="button"
                    aria-label="Previous page"
                >
                    ‹
                </button>

                <div
                    class="book-dots"
                    id="bookDots"
                ></div>

                <button
                    class="book-nav"
                    id="bookNext"
                    type="button"
                    aria-label="Next page"
                >
                    ›
                </button>

            </div>

        </div>

    `;


    overlay.appendChild(
        book
    );


    document.body.appendChild(
        overlay
    );


    renderBookPage(
        false
    );


    /* -------------------------------------------------
       BOOK CLICK
       Prevent close
    ------------------------------------------------- */

    book.addEventListener(
        "click",
        function (event) {

            event.stopPropagation();

        }
    );


    /* -------------------------------------------------
       CLOSE BUTTON
    ------------------------------------------------- */

    const closeButton =
        book.querySelector(
            ".book-close"
        );


    if (closeButton) {

        closeButton.addEventListener(
            "click",
            function (event) {

                event.stopPropagation();

                closeReceipt();

            }
        );

    }


    /* -------------------------------------------------
       PREV / NEXT
    ------------------------------------------------- */

    const prevButton =
        book.querySelector(
            "#bookPrev"
        );

    const nextButton =
        book.querySelector(
            "#bookNext"
        );


    if (prevButton) {

        prevButton.addEventListener(
            "click",
            function () {

                turnBookPage(
                    -1
                );

            }
        );

    }


    if (nextButton) {

        nextButton.addEventListener(
            "click",
            function () {

                turnBookPage(
                    1
                );

            }
        );

    }


    /* -------------------------------------------------
       OVERLAY CLICK
    ------------------------------------------------- */

    overlay.addEventListener(
        "click",
        function () {

            closeReceipt();

        }
    );


    /* -------------------------------------------------
       ESC + ARROW KEYS
    ------------------------------------------------- */

    document.addEventListener(
        "keydown",
        receiptEscape
    );


    /* -------------------------------------------------
       TOUCH SWIPE
    ------------------------------------------------- */

    let touchStartX = 0;
    let touchStartY = 0;
    let touchCurrentX = 0;
    let isSwiping = false;


    book.addEventListener(
        "touchstart",
        function (event) {

            touchStartX =
                event.touches[0].clientX;

            touchStartY =
                event.touches[0].clientY;

            touchCurrentX =
                touchStartX;

            isSwiping = false;

        },
        { passive: true }
    );


    book.addEventListener(
        "touchmove",
        function (event) {

            const dx =
                event.touches[0].clientX -
                touchStartX;

            const dy =
                event.touches[0].clientY -
                touchStartY;


            if (
                Math.abs(dx) > 15 &&
                Math.abs(dx) >
                Math.abs(dy)
            ) {

                isSwiping = true;

                touchCurrentX =
                    event.touches[0]
                        .clientX;


                const spread =
                    document.getElementById(
                        "bookSpread"
                    );


                if (spread) {

                    const offset =
                        dx * 0.4;

                    spread.style.transition =
                        "none";

                    spread.style.transform =
                        "translateX(" +
                        offset +
                        "px) rotateY(" +
                        (dx > 0 ? -3 : 3) +
                        "deg)";

                }

            }

        },
        { passive: true }
    );


    book.addEventListener(
        "touchend",
        function () {

            if (!isSwiping) {
                return;
            }


            const dx =
                touchCurrentX -
                touchStartX;


            const spread =
                document.getElementById(
                    "bookSpread"
                );


            if (spread) {

                spread.style.transition =
                    "";

                spread.style.transform =
                    "";

            }


            if (dx < -50) {

                turnBookPage(1);

            } else if (dx > 50) {

                turnBookPage(-1);

            }


            isSwiping = false;

        },
        { passive: true }
    );

}


/* =====================================================
   23. RENDER BOOK PAGE
===================================================== */

function renderBookPage(
    animate
) {

    const spread =
        document.getElementById(
            "bookSpread"
        );

    const dots =
        document.getElementById(
            "bookDots"
        );

    const prevButton =
        document.getElementById(
            "bookPrev"
        );

    const nextButton =
        document.getElementById(
            "bookNext"
        );


    if (!spread) {
        return;
    }


    const page =
        bookPages[bookPageIndex];


    function fill() {

        spread.innerHTML = `

            <div class="book-page book-page-left">

                <div class="page-photo-frame">
                    <img
                        src="${page.image}"
                        alt="${page.title}"
                        loading="lazy"
                    >
                </div>

            </div>


            <div
                class="
                    book-page
                    book-page-right
                    ${page.special ? "page-special" : ""}
                "
            >

                <div class="page-eyebrow">
                    ${page.eyebrow}
                </div>

                <h3 class="page-title">
                    ${page.title}
                </h3>

                <div class="page-divider"></div>

                <p class="page-note">
                    ${page.note}
                </p>

                <div class="page-date">
                    02 · 10 · 2007
                </div>

                <div class="page-number">
                    ${
                        String(bookPageIndex + 1)
                            .padStart(2, "0")
                    } / ${
                        String(bookPages.length)
                            .padStart(2, "0")
                    }
                </div>

            </div>

        `;

        if (dots) {

            dots.innerHTML =
                bookPages
                    .map(
                        function (item, index) {

                            return (
                                '<span class="book-dot' +
                                (
                                    index === bookPageIndex
                                        ? " active"
                                        : ""
                                ) +
                                '"></span>'
                            );

                        }
                    )
                    .join("");

        }

        if (prevButton) {

            prevButton.disabled =
                bookPageIndex === 0;

        }

        if (nextButton) {

            nextButton.disabled =
                bookPageIndex === bookPages.length - 1;

        }

    }


    if (!animate) {

        fill();

        return;
    }


    spread.classList.add(
        "turning"
    );


    setTimeout(
        function () {

            fill();

            spread.classList.remove(
                "turning"
            );

        },
        220
    );

}


/* =====================================================
   23b. TURN BOOK PAGE
===================================================== */

function turnBookPage(
    direction
) {

    const nextIndex =
        bookPageIndex + direction;


    if (
        nextIndex < 0 ||
        nextIndex > bookPages.length - 1
    ) {
        return;
    }


    bookPageIndex =
        nextIndex;


    renderBookPage(
        true
    );

}


/* =====================================================
   24. CLOSE PHOTO BOOK
===================================================== */

function closeReceipt() {

    const overlay =
        document.querySelector(
            ".book-overlay"
        );


    if (overlay) {

        overlay.remove();

    }


    document.removeEventListener(
        "keydown",
        receiptEscape
    );

}


/* =====================================================
   25. PHOTO BOOK KEYBOARD
===================================================== */

function receiptEscape(
    event
) {

    if (
        event.key === "Escape"
    ) {

        closeReceipt();

        return;

    }


    if (
        event.key === "ArrowRight"
    ) {

        turnBookPage(
            1
        );

        return;

    }


    if (
        event.key === "ArrowLeft"
    ) {

        turnBookPage(
            -1
        );

    }

}


/* =====================================================
   26. GIFT SETUP
===================================================== */

function setupGift() {

    const gift =
        document.getElementById(
            "giftBox"
        );


    const flowers =
        document.querySelectorAll(
            "#giftFlowers span"
        );


    if (!gift) {
        return;
    }


    /* -------------------------------------------------
       GIFT KEYBOARD
    ------------------------------------------------- */

    gift.addEventListener(
        "keydown",
        function (event) {

            if (
                event.target !== gift
            ) {
                return;
            }


            if (
                event.key === "Enter" ||
                event.key === " "
            ) {

                event.preventDefault();

                openGift(event);

            }

        }
    );


    /* -------------------------------------------------
       FLOWER EVENTS
    ------------------------------------------------- */

    flowers.forEach(
        function (flower) {

            flower.addEventListener(
                "click",
                function (event) {

                    event.preventDefault();

                    event.stopPropagation();


                    if (
                        !gift.classList.contains(
                            "opened"
                        )
                    ) {
                        return;
                    }


                    bloomFlower(
                        flower
                    );

                }
            );


            flower.addEventListener(
                "keydown",
                function (event) {

                    if (
                        event.key !== "Enter" &&
                        event.key !== " "
                    ) {
                        return;
                    }


                    event.preventDefault();

                    event.stopPropagation();


                    if (
                        !gift.classList.contains(
                            "opened"
                        )
                    ) {
                        return;
                    }


                    bloomFlower(
                        flower
                    );

                }
            );

        }
    );

}


/* =====================================================
   27. OPEN GIFT
===================================================== */

function openGift(
    event
) {

    if (event) {
        event.stopPropagation();
    }


    const gift =
        document.getElementById(
            "giftBox"
        );


    if (!gift) {
        return;
    }


    const opening =
        !gift.classList.contains(
            "opened"
        );


    gift.classList.toggle(
        "opened"
    );


    const hint =
        document.getElementById(
            "giftHint"
        );


    const message =
        document.getElementById(
            "giftOpenMessage"
        );


    if (opening) {

        if (hint) {

            hint.textContent =
                "Tap a flower ♡";

        }


        if (message) {

            message.textContent =
                "A little something for you ♡";

        }


        createGiftSparkles();

        createConfetti();

    } else {

        if (hint) {

            hint.textContent =
                "A little gift for you";

        }


        if (message) {

            message.textContent =
                "A little something for you ♡";

        }


        resetFlowers();

    }

}


/* =====================================================
   28. RESET FLOWERS
===================================================== */

function resetFlowers() {

    const flowers =
        document.querySelectorAll(
            "#giftFlowers span"
        );


    flowers.forEach(
        function (flower) {

            flower.classList.remove(
                "bloom"
            );

        }
    );

}


/* =====================================================
   29. BLOOM FLOWER
===================================================== */

function bloomFlower(
    flower
) {

    if (!flower) {
        return;
    }


    flower.classList.remove(
        "bloom"
    );


    void flower.offsetWidth;


    flower.classList.add(
        "bloom"
    );


    createFlowerBurst(
        flower
    );


    createHeartBurst(
        flower
    );


    setTimeout(
        function () {

            flower.classList.remove(
                "bloom"
            );

        },
        1000
    );

}


/* =====================================================
   30. GIFT SPARKLES
===================================================== */

function createGiftSparkles() {

    const gift =
        document.getElementById(
            "giftBox"
        );


    const container =
        document.getElementById(
            "effectContainer"
        );


    if (
        !gift ||
        !container
    ) {
        return;
    }


    const rect =
        gift.getBoundingClientRect();


    const symbols = [
        "✦",
        "✧",
        "♡",
        "·"
    ];


    for (
        let i = 0;
        i < 14;
        i++
    ) {

        createParticle(
            container,
            rect,
            symbols,
            45,
            85
        );

    }

}


/* =====================================================
   31. FLOWER BURST
===================================================== */

function createFlowerBurst(
    flower
) {

    const container =
        document.getElementById(
            "effectContainer"
        );


    if (!container) {
        return;
    }


    const rect =
        flower.getBoundingClientRect();


    const symbols = [
        "✦",
        "✧",
        "♡",
        "•"
    ];


    for (
        let i = 0;
        i < 12;
        i++
    ) {

        createParticle(
            container,
            rect,
            symbols,
            30,
            70
        );

    }

}


/* =====================================================
   32. HEART BURST
===================================================== */

function createHeartBurst(
    flower
) {

    const container =
        document.getElementById(
            "effectContainer"
        );


    if (!container) {
        return;
    }


    const rect =
        flower.getBoundingClientRect();


    const symbols = [
        "♡"
    ];


    for (
        let i = 0;
        i < 5;
        i++
    ) {

        const particle =
            createParticle(
                container,
                rect,
                symbols,
                20,
                45
            );


        if (particle) {

            const currentDy =
                parseFloat(
                    particle.dataset.dy
                );


            particle.style.setProperty(
                "--dy",
                (
                    currentDy - 20
                ) + "px"
            );

        }

    }

}


/* =====================================================
   33. PARTICLE
===================================================== */

function createParticle(
    container,
    rect,
    symbols,
    minDistance,
    maxDistance
) {

    const particle =
        document.createElement(
            "span"
        );


    particle.className =
        "flower-burst";


    particle.textContent =
        symbols[
            Math.floor(
                Math.random() *
                symbols.length
            )
        ];


    particle.style.left =
        (
            rect.left +
            rect.width / 2
        ) + "px";


    particle.style.top =
        (
            rect.top +
            rect.height / 2
        ) + "px";


    const angle =
        Math.random() *
        Math.PI *
        2;


    const distance =
        minDistance +
        Math.random() *
        (
            maxDistance -
            minDistance
        );


    const dx =
        Math.cos(angle) *
        distance;


    const dy =
        Math.sin(angle) *
        distance;


    particle.dataset.dy =
        String(dy);


    particle.style.setProperty(
        "--dx",
        dx + "px"
    );


    particle.style.setProperty(
        "--dy",
        dy + "px"
    );


    container.appendChild(
        particle
    );


    setTimeout(
        function () {

            particle.remove();

        },
        1100
    );


    return particle;

}


/* =====================================================
   34. SCROLL REVEAL
===================================================== */

function setupScrollAnimation() {

    const elements =
        document.querySelectorAll(
            ".letter, .memory-ticket, .reason, .music-player, .song-card, .final-section"
        );


    if (
        !("IntersectionObserver" in window)
    ) {

        elements.forEach(
            function (element) {

                element.classList.add(
                    "show"
                );

            }
        );

        return;
    }


    const observer =
        new IntersectionObserver(
            function (entries) {

                entries.forEach(
                    function (entry) {

                        if (
                            entry.isIntersecting
                        ) {

                            entry.target.classList.add(
                                "show"
                            );


                            if (
                                entry.target.classList
                                    .contains(
                                        "final-section"
                                    )
                            ) {

                                setTimeout(
                                    createConfetti,
                                    400
                                );

                            }


                            observer.unobserve(
                                entry.target
                            );

                        }

                    }
                );

            },
            {
                threshold: 0.12
            }
        );


    elements.forEach(
        function (element) {

            observer.observe(
                element
            );

        }
    );

}


/* =====================================================
   35. HERO FADE
===================================================== */

window.addEventListener(
    "scroll",
    function () {

        const hero =
            document.querySelector(
                ".hero"
            );


        if (!hero) {
            return;
        }


        const scroll =
            window.scrollY || 0;


        if (
            scroll < 500
        ) {

            const opacity =
                Math.max(
                    0.35,
                    1 - scroll / 700
                );


            hero.style.opacity =
                opacity;

        } else {

            hero.style.opacity =
                "0.35";

        }

    }
);


/* =====================================================
   36. FINAL
===================================================== */

console.log(
    "♡ Archery game system ready"
);

console.log(
    "♡ MP3 music system ready"
);

console.log(
    "♡ Gift box system ready"
);

console.log(
    "♡ Flower bloom system ready"
);

console.log(
    "♡ Memory receipt system ready"
);

console.log(
    "♡ Confetti system ready"
);

console.log(
    "♡ Stars system ready"
);

console.log(
    "♡ Birthday Surprise ready"
);