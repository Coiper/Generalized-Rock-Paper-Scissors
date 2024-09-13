import crypto from "crypto";
import readlineSync from "readline-sync";
import AsciiTable from "ascii-table";
import chalk from "chalk";
const moves = process.argv.slice(2);
const size = 32;

class HMAC {
    constructor(move) {
        this.move = move;
        this.key = this.keyGenerate();
    }
    keyGenerate() {
        return crypto.randomBytes(size).toString("hex");
    }
    generateHMAC() {
        return crypto
            .createHmac("sha3-256", this.key)
            .update(this.move)
            .digest("hex");
    }
}

class Rules {
    constructor(moves) {
        this.moves = moves;
    }

    gameRules() {
        let count = (this.moves.length - 1) / 2;
        let table = [];
        let s = [
            "Draw",
            ..."Lose ".repeat(count).slice(0, -1).split(" "),
            ..."Win ".repeat(count).slice(0, -1).split(" "),
        ];
        for (let i in this.moves) {
            table.push(s);
            s = [].concat(s.slice(-1), s.slice(0, -1));
        }
        return table;
    }
}

class Table {
    printHelp() {
        var table = AsciiTable.factory("title");
        const heading = ["v PC | User >"].concat(moves);
        let movesRowes = new Rules(moves).gameRules();
        const tableRows = movesRowes.map((row, index) => [
            moves[index],
            ...row,
        ]);
        var table = AsciiTable.factory({
            title: "RULES",
            heading: heading,
            rows: tableRows,
        });
        const tableString = table.toString();

        const lines = tableString.split("\n");
        for (let i = 5; i < lines.length - 1; i++) {
            let lineParts = lines[i].split(" ");
            lineParts[1] = chalk.red(lineParts[1]);
            lines[i] = lineParts.join(" ");
        }
        lines[1] = chalk.bgBlueBright.white(lines[1]);
        lines[3] = chalk.red(lines[3]);
        console.log(lines.join("\n"));
    }
}

class Main {
    isDataWrong(data) {
        if (!(data.length % 2 !== 0 && data.length > 1)) return true;
        for (let i in data) if (i != data.lastIndexOf(data[i])) return true;
        return false;
    }

    menu(data) {
        for (let i in data) console.log(`${+i + 1} - ${data[i]}`);
        console.log("0 - Exit\n? - help");
    }

    askQuestion(query) {
        return readlineSync
            .question(query)
            .replace(/ + /g, " ")
            .trim()
            .split(" ");
    }

    checkInputData() {
        let rightInput = "Rock Paper Scissors";
        let data = [];
        for (let i = 2; i < process.argv.length; i++)
            data[i - 2] = process.argv[i];
        while (this.isDataWrong(data)) {
            console.log(
                "Wrong data. The number of parameters must be odd and non-repeating. Example: " +
                    rightInput
            );
            data = this.askQuestion("Please, enter data again:\n");
        }
        return data;
    }

    isKeyValid(userKey, data) {
        if (userKey == "0") {
            console.log("Goodbye!");
            console.log("");
        } else if (userKey != "?" && !(userKey >= "0" && userKey <= data)) {
            console.log(
                `The move is not correct.\nYou need to enter a number from "1" to "${moves.length}". "0" to exit or "?" for help`
            );
            return false;
        }
        return true;
    }

    startGame() {
        let userMove;
        let inputData = this.checkInputData();
        while (userMove != 0) {
            let computerMove =
                inputData[Math.floor(Math.random() * inputData.length)];

            let rules = new Rules(inputData).gameRules();
            let table = new Table();
            let hash = new HMAC(computerMove);
            console.log("HMAC: " + hash.generateHMAC());
            this.menu(inputData);
            userMove = this.askQuestion("Enter your move: ");
            if (this.isKeyValid(userMove, inputData.length))
                if (userMove == "?") table.printHelp(inputData, rules);
                else if (userMove != 0) {
                    console.log(`Your move: ${inputData[userMove - 1]}`);
                    console.log(`Computer move: ${computerMove}`);
                    console.log(
                        "You " +
                            rules[userMove - 1][
                                inputData.lastIndexOf(computerMove)
                            ]
                    );
                    console.log(`HMAC key: ${hash.key}`);
                    console.log("\nNEXT GAME");
                }
        }
    }
}
let main = new Main();
main.startGame();
