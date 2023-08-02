import { z } from "zod"
import { BehaviorSubject } from "rxjs";
import { httpClient } from "../services/http-client";

const value_return = z.object({
    quantity: z.number().describe('quantities of product').default(0),
    details: z.any().describe('details of product').default({}),
    products: z.array(z.string()).describe('products array').default([]),
    message: z.string().describe('message'),
    claim: z.string().describe('claim').default(''),
    command: z.string().describe('command'),
})

type Commands = {
    key: string; // CLAVE DEL COMANDO
    intents: string[]; // ARRAY DE INTENTS
    default_message?: string|null; // MENSAJE POR DEFECTO
    error_message?: string|undefined; // MENSAJE DE ERROR
    clean_expression?: RegExp; // PARA FUTURAS VALIDACIONES
    fallbacks?: any[];
    return_direct?: boolean; // DECIDE SI RETORNA DIRECTO UNA VEZ ENCUENTRE EL COMANDO
    value_return?: Partial<z.infer<typeof value_return>>; // VALIDA EL VALOR QUE RETORNA DE ACUERDO A SU TIPO DE DATO
    action?: Action // ACCION A REALIZAR
}

type Action = {
    name: string; // NOMBRE DE LA ACCION
    endpoint_url: string; // URL A LA CUAL SE LE PEGARA
    method: string; // TIPO DE REQUEST O VERB REQUEST
    validate_value_return?: boolean; // VALIDA EL VALOR RETORNADO POR LA REQUEST
    return_default?: string; // DECIDE SI RETORNA EL VALOR POR DEFECTO
}

type Callback<T> = (ctx: Commands, err?: Error|unknown) => T;                                                                   

export class ChatbotHibrid {
    private commands: Commands[] = [];
    private ctx$ = new BehaviorSubject<Commands|null>(null)
    

    constructor(private bot_name: string) {}

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

    addCapture() {
        throw new Error(`addCapture not implemented`)
    }

    useFunction<T>(callback: Callback<T>) {
        this._commands = {...this.ctx, fallbacks: [callback]}
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

        command.fallbacks?.forEach(fallback => fallback(this.ctx))
        if (command?.action?.validate_value_return) value_return.parse(command.value_return)

        console.log({
            ...command,
            value_return: data || undefined
        })
        
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