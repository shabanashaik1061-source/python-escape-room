from flask import Flask, render_template, request, jsonify
import random
import os

app = Flask(
    __name__,
    template_folder=os.path.join(os.path.dirname(os.path.abspath(__file__)), "templates"),
    static_folder=os.path.join(os.path.dirname(os.path.abspath(__file__)), "static")
)

MAX_LIVES = 3

game = {
    "lives": MAX_LIVES,
    "badges": [],
    "pattern_attempts": 0,
    "code_attempts": 0,
    "lucky_number": random.randint(1, 5)
}


def reset_game():
    game["lives"] = MAX_LIVES
    game["badges"] = []
    game["pattern_attempts"] = 0
    game["code_attempts"] = 0
    game["lucky_number"] = random.randint(1, 5)


def reward_badge(*badges):
    return random.choice(badges)


# HOME PAGE
@app.route("/")
def home():
    print("Looking for templates here:")
    print(app.template_folder)

    return render_template("index.html")


# RESET GAME
@app.route("/reset", methods=["POST"])
def reset():
    reset_game()

    return jsonify({
        "success": True,
        "lives": game["lives"],
        "badges": game["badges"]
    })


# MATH DOOR
@app.route("/door1", methods=["POST"])
def door_one():

    data = request.get_json()
    answer = data.get("answer")

    try:
        answer = int(answer)
    except (ValueError, TypeError):
        answer = None

    if answer == 50:

        badge = reward_badge(
            "Logic Master",
            "Math Whiz"
        )

        game["badges"].append(badge)

        return jsonify({
            "success": True,
            "message": "The mathematical lock clicks open!",
            "badge": badge,
            "lives": game["lives"]
        })

    game["lives"] -= 1

    return jsonify({
        "success": False,
        "message": "Wrong calculation. The room becomes darker...",
        "lives": game["lives"],
        "game_over": game["lives"] <= 0
    })


# PATTERN DOOR
@app.route("/door2", methods=["POST"])
def door_two():

    data = request.get_json()

    guess = data.get("guess", "").strip().lower()

    game["pattern_attempts"] += 1

    if guess == "mystery":

        badge = reward_badge(
            "Pattern Pro",
            "Code Breaker"
        )

        game["badges"].append(badge)

        game["pattern_attempts"] = 0

        return jsonify({
            "success": True,
            "message": "The secret word was correct! The lock opens.",
            "badge": badge,
            "lives": game["lives"]
        })

    if game["pattern_attempts"] < 2:

        remaining = 2 - game["pattern_attempts"]

        return jsonify({
            "success": False,
            "attempt_failed": True,
            "message": "Wrong secret word!",
            "attempts_left": remaining,
            "lives": game["lives"]
        })

    game["pattern_attempts"] = 0

    game["lives"] -= 1

    return jsonify({
        "success": False,
        "message": "Both attempts failed! You lost one life.",
        "lives": game["lives"],
        "game_over": game["lives"] <= 0
    })


# CODE DOOR
@app.route("/door3", methods=["POST"])
def door_three():

    data = request.get_json()

    guess = data.get("guess")

    try:
        guess = int(guess)
    except (ValueError, TypeError):
        guess = None

    game["code_attempts"] += 1

    if guess == game["lucky_number"]:

        badge = reward_badge(
            "Lucky Star",
            "Risk Taker"
        )

        game["badges"].append(badge)

        game["code_attempts"] = 0

        return jsonify({
            "success": True,
            "message": "Perfect! You found the lucky number!",
            "badge": badge,
            "lives": game["lives"]
        })

    if game["code_attempts"] < 2:

        remaining = 2 - game["code_attempts"]

        return jsonify({
            "success": False,
            "attempt_failed": True,
            "message": "Wrong number!",
            "attempts_left": remaining,
            "lives": game["lives"]
        })

    game["code_attempts"] = 0

    game["lives"] -= 1

    return jsonify({
        "success": False,
        "message": "Two guesses failed! You lost one life.",
        "lives": game["lives"],
        "game_over": game["lives"] <= 0
    })


# DARE DOOR
@app.route("/dare", methods=["POST"])
def dare():

    badge = reward_badge(
        "Clever Star",
        "Clever Chooser"
    )

    game["badges"].append(badge)

    return jsonify({
        "success": True,
        "escaped": True,
        "message": "You chose the forbidden door... and escaped!",
        "badge": badge,
        "lives": game["lives"]
    })


if __name__ == "__main__":
    app.run(debug=True)