import {POESettings, QuerySender} from "./poe_http";
import {POESocketManager, MessageAdded, AuthorEnum, StateEnum} from "./poe_socket";
import chalk from "chalk";

export class POEClient {
    query_sender: QuerySender
    socket_manager: POESocketManager
    now_text: string = ""
    answer_complete: boolean = false

    constructor(poe_settings: POESettings) {
        this.query_sender = new QuerySender()
        this.socket_manager = new POESocketManager(poe_settings, this.message_handler.bind(this))
    }

    message_handler(message: MessageAdded) {
        // console.log(message)
        if (message.author === AuthorEnum.human) {
            this.human_message_handler(message)
        } else {
            this.bot_message_handler(message)
        }
    }

    human_message_handler(message: MessageAdded) {
    }

    set_answer_complete() {
        this.answer_complete = true
        this.now_text = ""
        process.stdout.write('\n')
        this.out_question_header()
    }

    bot_message_handler(message: MessageAdded) {
        const new_chars = message.text.slice(this.now_text.length)
        if (new_chars && !this.answer_complete) {
            process.stdout.write(new_chars)
            this.now_text = message.text
        }
        if (message.state === StateEnum.complete) {
            if (!this.answer_complete) {
                this.set_answer_complete()
            }
        }
    }

    out_question_header() {
        process.stdout.write(chalk.red('Question: '))
    }

    out_answer_header() {
        process.stdout.write(chalk.green('Answer: '))
    }

    start() {
        this.socket_manager.message_handler = this.message_handler.bind(this)
        this.socket_manager.start()
        process.stdin.on('data', this.stdin_handler.bind(this))
        this.out_question_header()
        process.on('SIGINT', this.exit.bind(this));
    }

    async stdin_handler(data: Buffer) {
        const query = data.toString().trim()
        if (query) {
            await this.send_query(query)
            this.out_answer_header()
            this.answer_complete = false
        }
    }

    exit() {
        this.stop()
        process.stdout.write(chalk.blue('\nBye\n'))
        process.exit()
    }

    stop() {
        this.socket_manager.stop()
    }

    async send_query(query: string) {
        return await this.query_sender.send_query(query)
    }
}