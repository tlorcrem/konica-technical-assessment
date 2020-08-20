'use strict';

const node = document.getElementById('app');

const app = Elm.Main.embed(node, {
    api: 'Client',
    hostname: '',
});

var arrOfPointsUsed = []; //all
var startAndEndPoints = []; //current line

app.ports.request.subscribe((message) => {
    message = JSON.parse(message);

    var msg;
    var body_newLine = null;
    var body_heading = "Player 1";
    var body_message = null;

    if (message.msg == "NODE_CLICKED") {
            if (startAndEndPoints.length == 0) {
                // is entry point
                if (!checkIfStartingPointValid(message.body)) {
                    console.log('not valid starting point')
                    msg = "INVALID_START_NODE";
                    body_message = "Not a valid starting position."
                } else {
                    msg = "VALID_START_NODE";
                    startAndEndPoints.push(message.body);
                    body_message = "Select a second node to complete the line.";
                }

            } else {
                // is second point
                startAndEndPoints.push(message.body);
                if (checkIfLineValid(startAndEndPoints)) {
                    arrOfPointsUsed.push(startAndEndPoints);
                    msg = "VALID_END_NODE";
                    body_newLine = {
                        "start": startAndEndPoints[0],
                        "end": startAndEndPoints[1]
                    };
                    startAndEndPoints = [];
                    if (body_heading == "Player 1") {
                        body_heading = "Player 2";
                    } else {
                        body_heading = "Player 1";
                    }
                } else {
                    startAndEndPoints = [];
                    msg = "INVALID_END_NODE";
                    body_message = "Invalid move!";
                }
                if (checkIfGameOver(message.body)) {
                    msg = "GAME_OVER";
                    body_message = body_heading + " Wins!";
                }
        }
        app.ports.response.send({
            "msg": msg,
            "body": {
                "newLine": body_newLine,
                "heading": body_heading,
                "message": body_message
            }
        });
    } else if (message.msg == "ERROR") {
        app.ports.response.send({
            "msg": "ERROR",
            "body": "Invalid type for `id`: Expected INT but got a STRING"
        });
    } else if (message.msg == "INITIALIZE") {
        app.ports.response.send({
            "msg": "INITIALIZE",
            "body": {
                "newLine": null,
                "heading": "Player 1",
                "message": "Awaiting Player 1's Move"
            }
        });
    }
});

function checkIfStartingPointValid(firstPoint) {
    var firstCheck = false,
        flatArrOfPointsUsed = arrOfPointsUsed.flat();
    if (arrOfPointsUsed.length > 0) {
        for (var i = 0; i < flatArrOfPointsUsed.length; i++) {
            //check that starting point is already included in arr of all points used
            if (flatArrOfPointsUsed[i].x == firstPoint.x && flatArrOfPointsUsed[i].y == firstPoint.y) {
                firstCheck = true;
            }
        }
        if (firstCheck) {
            //check if starting point is first index of one line and second index of another in arr of all lines
            var firstIndex = arrOfPointsUsed.findIndex(([{ x, y }]) => x == firstPoint.x && y == firstPoint.y);
            var secondIndex = firstIndex === -1 ? -1 : arrOfPointsUsed.findIndex(([{ x, y }], index) => index > firstIndex && x == firstPoint.x && y == firstPoint.y);
            if (arrOfPointsUsed.some(([{ x, y }]) => x === firstPoint.x && y == firstPoint.y) && arrOfPointsUsed.some(([, { x, y }]) => x === firstPoint.x && y == firstPoint.y) || secondIndex !== -1) {
                return false;
            }
        }
        return true;

    } else {
        return true;
    }

    return false;
}

function checkIfLineValid(twoPoints) {
    //first, check that end of line point isn't already being used
    var flatArrOfPointsUsed = arrOfPointsUsed.flat();
    if (arrOfPointsUsed.length > 0) {
        for (var i = 0; i < flatArrOfPointsUsed.length; i++) {
            if (flatArrOfPointsUsed[i].x == twoPoints[1].x && flatArrOfPointsUsed[i].y == twoPoints[1].y) {
                return false;
            }
        }
    }
    //check that it's one right/left
    if (twoPoints[0].x == twoPoints[1].x && (twoPoints[1].y == twoPoints[0].y - 1 || twoPoints[1].y == twoPoints[0].y + 1)) {
        return true;
    }
    //check that it's one up/down
    if (twoPoints[0].y == twoPoints[1].y && (twoPoints[1].x == twoPoints[0].x - 1 || twoPoints[1].x == twoPoints[0].x + 1)) {
        return true;
    }
    //check that it's one diagonal
    if (twoPoints[1].x == twoPoints[0].x - 1 && (twoPoints[1].y == twoPoints[0].y + 1 || twoPoints[1].y == twoPoints[0].y - 1)) {
        return true;
    }
    if (twoPoints[1].x == twoPoints[0].x + 1 && (twoPoints[1].y == twoPoints[0].y + 1 || twoPoints[1].y == twoPoints[0].y - 1)) {
        return true;
    }

    //return false;
}

function removeDuplicates(arr) {
    return arr.filter((v, i, a) => a.findIndex(t => (JSON.stringify(t) === JSON.stringify(v))) === i);
}

function checkIfGameOver(points) {
    //check if 3 points up down right or left are activated
    var pointUp = { "x": points.x, "y": points.y - 1 },
        pointRight = { "x": points.x + 1, "y": points.y },
        pointDown = { "x": points.x, "y": points.y + 1 },
        pointLeft = { "x": points.x - 1, "y": points.y },
        countSurroundingPoints = 0,
        flatArrOfPointsUsed = arrOfPointsUsed.flat(),
        duplicatesRemovedPointsArr = removeDuplicates(flatArrOfPointsUsed);

    for (var i = 0; i < duplicatesRemovedPointsArr.length; i++) {
        if (duplicatesRemovedPointsArr[i].x == pointUp.x && duplicatesRemovedPointsArr[i].y == pointUp.y) {
            countSurroundingPoints++;
        }
        if (duplicatesRemovedPointsArr[i].x == pointRight.x && duplicatesRemovedPointsArr[i].y == pointRight.y) {
            countSurroundingPoints++;
        }
        if (duplicatesRemovedPointsArr[i].x == pointDown.x && duplicatesRemovedPointsArr[i].y == pointDown.y) {
            countSurroundingPoints++;
        }
        if (duplicatesRemovedPointsArr[i].x == pointLeft.x && duplicatesRemovedPointsArr[i].y == pointLeft.y) {
            countSurroundingPoints++;
        }
        if (countSurroundingPoints >= 3) {
            return true;
        }
    }

    return false;
}
