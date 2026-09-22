let lives = 3;

let badges = [];

let patternAttempts = 2;

let codeAttempts = 2;


// -------------------------
// SCREEN CONTROL
// -------------------------

function hideAllScreens() {

    document
        .querySelectorAll(
            ".overlay-panel, .game-screen, .puzzle-screen, .result-screen"
        )
        .forEach(screen => {

            screen.classList.add("hidden");

        });

}


// -------------------------
// START GAME
// -------------------------

function startGame() {

    hideAllScreens();

    document
        .getElementById("door-screen")
        .classList.remove("hidden");

    updateDisplay();
}


// -------------------------
// NEW GAME
// -------------------------

function startNewGame() {

    fetch("/reset", {
        method: "POST"
    })

    .then(response => response.json())

    .then(data => {

        lives = data.lives;

        badges = [];

        patternAttempts = 2;

        codeAttempts = 2;

        updateDisplay();

        startGame();

    });

}


// -------------------------
// OPEN DOOR
// -------------------------

function openDoor(number) {

    hideAllScreens();


    if (number === 1) {

        document
            .getElementById("math-screen")
            .classList.remove("hidden");

        document
            .getElementById("math-answer")
            .value = "";

        document
            .getElementById("math-answer")
            .focus();
    }


    if (number === 2) {

        document
            .getElementById("pattern-screen")
            .classList.remove("hidden");

        document
            .getElementById("pattern-answer")
            .value = "";

        updateAttempts();

        document
            .getElementById("pattern-answer")
            .focus();
    }


    if (number === 3) {

        document
            .getElementById("code-screen")
            .classList.remove("hidden");

        document
            .getElementById("code-answer")
            .value = "";

        updateAttempts();

        document
            .getElementById("code-answer")
            .focus();
    }

}


// -------------------------
// MATH
// -------------------------

function submitMath() {

    const answer =
        document
            .getElementById("math-answer")
            .value;


    fetch("/door1", {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            answer: answer
        })

    })

    .then(response => response.json())

    .then(data => {

        processResult(data);

    });

}


// -------------------------
// PATTERN
// -------------------------

function submitPattern() {

    const guess =
        document
            .getElementById("pattern-answer")
            .value;


    fetch("/door2", {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            guess: guess
        })

    })

    .then(response => response.json())

    .then(data => {

        if (data.attempts_left !== undefined) {

            patternAttempts =
                data.attempts_left;

            updateAttempts();

        }

        processResult(data);

    });

}


// -------------------------
// CODE
// -------------------------

function submitCode() {

    const guess =
        document
            .getElementById("code-answer")
            .value;


    fetch("/door3", {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            guess: guess
        })

    })

    .then(response => response.json())

    .then(data => {

        if (data.attempts_left !== undefined) {

            codeAttempts =
                data.attempts_left;

            updateAttempts();

        }

        processResult(data);

    });

}


// -------------------------
// DARE
// -------------------------

function openDare() {

    fetch("/dare", {

        method: "POST"

    })

    .then(response => response.json())

    .then(data => {

        if (data.badge) {

            badges.push(data.badge);

        }

        updateDisplay();

        hideAllScreens();

        document
            .getElementById("escape-screen")
            .classList.remove("hidden");

        document
            .getElementById("final-badge")
            .innerHTML =
                "🏆 BADGE UNLOCKED: <strong>" +
                data.badge +
                "</strong>";

    });

}


// -------------------------
// RESULT
// -------------------------

function processResult(data) {

    if (data.lives !== undefined) {

        lives = data.lives;

    }


    updateDisplay();


    if (data.game_over) {

        hideAllScreens();

        document
            .getElementById("gameover-screen")
            .classList.remove("hidden");

        return;

    }


    /*
       If an attempt failed but the player
       still has another attempt,
       don't show the full result screen.
    */

    if (data.attempt_failed) {

        showTemporaryFailure(data);

        return;

    }


    if (data.success) {

        if (data.badge) {

            badges.push(data.badge);

        }


        updateDisplay();

        hideAllScreens();

        document
            .getElementById("result-screen")
            .classList.remove("hidden");


        document
            .getElementById("result-icon")
            .textContent = "✓";


        document
            .getElementById("result-title")
            .textContent =
                "DOOR UNLOCKED";


        document
            .getElementById("result-message")
            .textContent =
                data.message;


        document
            .getElementById("new-badge")
            .innerHTML =
                "🏆 BADGE: <strong>" +
                data.badge +
                "</strong>";

    }

    else {

        hideAllScreens();

        document
            .getElementById("result-screen")
            .classList.remove("hidden");


        document
            .getElementById("result-icon")
            .textContent = "✕";


        document
            .getElementById("result-title")
            .textContent =
                "CHALLENGE FAILED";


        document
            .getElementById("result-message")
            .textContent =
                data.message;


        document
            .getElementById("new-badge")
            .textContent =
                "❤️ LIVES LEFT: " + lives;

    }

}


// -------------------------
// TEMPORARY FAILURE
// -------------------------

function showTemporaryFailure(data) {

    const screen =
        document.getElementById("result-screen");

    hideAllScreens();

    screen.classList.remove("hidden");


    document
        .getElementById("result-icon")
        .textContent = "⚠";


    document
        .getElementById("result-title")
        .textContent =
            "INCORRECT";


    document
        .getElementById("result-message")
        .textContent =
            data.message +
            " Attempts remaining: " +
            data.attempts_left;


    document
        .getElementById("new-badge")
        .textContent =
            "❤️ Lives: " + lives;


    const button =
        document.getElementById("continue-button");


    button.textContent = "TRY AGAIN";


    button.onclick = function () {

        backToDoors();

    };

}


// -------------------------
// BACK TO DOORS
// -------------------------

function backToDoors() {

    hideAllScreens();

    document
        .getElementById("door-screen")
        .classList.remove("hidden");

    updateDisplay();

}


// -------------------------
// UPDATE HUD
// -------------------------

function updateDisplay() {

    document
        .getElementById("lives")
        .textContent = lives;


    document
        .getElementById("badge-count")
        .textContent =
            badges.length;


    const container =
        document.getElementById("badges");


    if (badges.length === 0) {

        container.innerHTML =
            '<span class="empty-badge">' +
            'NO BADGES COLLECTED' +
            '</span>';

        return;

    }


    container.innerHTML = "";


    badges.forEach(badge => {

        const element =
            document.createElement("span");

        element.className = "badge";

        element.textContent =
            "🏆 " + badge;

        container.appendChild(element);

    });

}


// -------------------------
// ATTEMPTS
// -------------------------

function updateAttempts() {

    document
        .getElementById("pattern-attempts")
        .textContent =
            patternAttempts;


    document
        .getElementById("code-attempts")
        .textContent =
            codeAttempts;

}


// -------------------------
// ENTER KEY SUPPORT
// -------------------------

document.addEventListener("keydown", function(event) {

    if (event.key !== "Enter") {
        return;
    }


    if (
        !document
            .getElementById("math-screen")
            .classList.contains("hidden")
    ) {

        submitMath();

    }


    else if (
        !document
            .getElementById("pattern-screen")
            .classList.contains("hidden")
    ) {

        submitPattern();

    }


    else if (
        !document
            .getElementById("code-screen")
            .classList.contains("hidden")
    ) {

        submitCode();

    }

});