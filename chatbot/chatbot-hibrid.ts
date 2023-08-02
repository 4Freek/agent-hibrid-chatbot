import { BehaviorSubject, combineAll } from "rxjs";
import { httpClient } from "../services/http-client";
import { Action, BaseChatbot, Callback, Commands, value_return } from "./base/base-chatbot";

export class ChatbotHibrid extends BaseChatbot {
    private commands: Commands[] = [];
    private ctx$ = new BehaviorSubject<Commands|null>(null)
    

    constructor(private bot_name: string) {
        super()
        // this.ctx$.subscribe((value) => console.log('subscribing value:' ,{value}))
    }

    get name() { return this.bot_name; }

    get ctx () {
        return this.ctx$.getValue() as Commands
    }

    private set _commands (command: Commands) {
        this.commands = this.commands.filter(_command => _command.key !== command.key)
        this.commands = [...this.commands, command]
        
        this.ctx$.next(command)
    }

    private findKeyOrFail(keyOrIntent: string, return_intent = false) {
        const command_regexp = (intents: string[]) => new RegExp(`${(intents.map(i => i.trim()).join('|'))}`, 'gim')
        const [possible_command, ...rest] = Array.isArray(keyOrIntent) ? keyOrIntent : keyOrIntent.split(' ')

        const command = this.commands.find(c => c.key === possible_command || c.intents.includes(possible_command))
        
        if (!command) throw new Error(`Key: (${possible_command}) not found`)
        
        if (return_intent) {
            return {
                command,
                intent: keyOrIntent.match(command_regexp(command.intents)) ?? null
            }
        }

        return command
    }

    private validateExpression = (expression: 'only-letters'|'only-numbers'|'letters-numbers') => {
        const expr = {
            // 'only-letters'|'only-numbers'|'letters-numbers'
            'only-letters': new RegExp('[a-zA-Z]', 'gim'),
            'only-numbers': new RegExp('[0-9]', 'gim'),
            'letters-numbers': new RegExp('[a-zA-Z0-9]', 'gim')
        }

        return expr[expression] ? expr[expression] : expr['only-letters']

    }

    private searchIntentOrFail(input: string, expression_regexp: 'only-letters'|'only-numbers'|'letters-numbers'|undefined = undefined) {
        if (expression_regexp) {
            const expr = this.validateExpression(expression_regexp)
            input = input.replace(expr, '')
        }

        const { command, intent } = this.findKeyOrFail(input, true) as { command: Commands, intent: RegExpMatchArray|null }
        this.ctx$.next(command)

        return { command, intent }
    }

    addCapture<T>(callback: Callback<T>) {
        this.ctx.captureFunction = callback

        return this
    }

    useFunction<T>(callback: Callback<T>) {
        this._commands = {...this.ctx, fallbacks: [
            this.ctx.fallbacks ? this.ctx?.fallbacks : [], 
            callback
        ].flat()
    }
        return this
    }

    addCommand(command: Commands) {
        const keys = this.commands?.map(command => command.key)

        if (keys.includes(command.key)) throw new Error(`Key: ${command.key} already exists`)
        
        this.commands.push(command);
        this.ctx$.next(command)

        return this
    }

    addIntentToCommand(key: string, intent: string) {
        const command = this.findKeyOrFail(key) as Commands

        command.intents.push(intent)
        this._commands = command

        return this
    }

    addDefaultCommandMessage(key: string, default_message: string) {
        const command = this.findKeyOrFail(key) as Commands

        command.default_message = default_message
        this._commands = command

        return this
    }

    addActionToCommand(key: string, action: Action) {
        const command = this.findKeyOrFail(key) as Commands

        command.action = action
        this._commands = command

        return this
    }

    async call (input: string, data?: any) {
        const { command, intent } = this.searchIntentOrFail(input) as { command: Commands, intent: RegExpMatchArray|null }
            
        if (intent) {
            input = input.replace(intent[0], '').trim()
        }
        
        console.log(this.ctx)
        if (command.captureFunction) return command.captureFunction(this.ctx)
        command.fallbacks?.forEach(fallback => fallback(this.ctx))
        if (command?.action?.validate_value_return) value_return.parse(command.value_return)

        return {
            ...command,
            value_return: data || undefined
        }
        
        // return 
        // await httpClient({
        //     url: command?.action?.endpoint_url,
        //     headers: {
        //         "Content-Type": "application/json"
        //     },
        //     method: command?.action?.method,
        //     data: {
        //         // bot_name,
        //         // chatter_phone: phone.split('@')[0],
        //         // products: [],
        //         // code: command,
        //         // chatter_name: user.username,
        //         // quantity: 0,
        //         // claim: null
        //     }
        // })
    }
}