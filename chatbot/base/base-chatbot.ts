import z from "zod"

export const value_return = z.object({
    quantity: z.number().describe('quantities of product').default(0),
    details: z.any().describe('details of product').default({}),
    products: z.array(z.string()).describe('products array').default([]),
    message: z.string().describe('message'),
    claim: z.string().describe('claim').default(''),
    command: z.string().describe('command'),
})

export type Commands = {
    key: string; // CLAVE DEL COMANDO
    intents: string[]; // ARRAY DE INTENTS
    user_extra_intent?: string|null;
    default_message?: string|null; // MENSAJE POR DEFECTO
    error_message?: string|undefined; // MENSAJE DE ERROR
    clean_expression?: RegExp; // PARA FUTURAS VALIDACIONES
    fallbacks?: any[];
    captureFunction?: any|undefined;
    return_direct?: boolean; // DECIDE SI RETORNA DIRECTO UNA VEZ ENCUENTRE EL COMANDO
    value_return?: Partial<z.infer<typeof value_return>>; // VALIDA EL VALOR QUE RETORNA DE ACUERDO A SU TIPO DE DATO
    action?: Action // ACCION A REALIZAR
}

export type Action = {
    name: string; // NOMBRE DE LA ACCION
    endpoint_url: string; // URL A LA CUAL SE LE PEGARA
    method: string; // TIPO DE REQUEST O VERB REQUEST
    validate_value_return?: boolean; // VALIDA EL VALOR RETORNADO POR LA REQUEST
    return_default?: string; // DECIDE SI RETORNA EL VALOR POR DEFECTO
}

export type Callback<T> = (ctx?: Commands, err?: Error|unknown) => T;                                                                   


export abstract class BaseChatbot {
    // abstract addCapture(args: any[]): this   
    abstract addCommand(command: Commands): this
    abstract useFunction<T>(callback: Callback<T>): this
    abstract addIntentToCommand(key: string, intent: string): this
    abstract addActionToCommand(key: string, action: Action): this


    abstract call(input: string, data: any): Promise<any>
}