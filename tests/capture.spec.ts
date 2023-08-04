import { beforeAll, describe, expect, it, test } from 'bun:test'
import { ChatbotHibrid } from '../chatbot/chatbot-hibrid'

describe('addCapture', () => { 
    let chatbot: any
    beforeAll(() => {
        chatbot = new ChatbotHibrid('pepitongo')
        chatbot.addCommand({
            key: 'foo',
            intents: ['foo'],
            default_message: 'cuanto es 2 + 2',
            return_direct: true,
        }).addCapture(() => {
            return 'hola'
        })
    })

    test('should return same value that addCapture fallback', async () => {
        expect(await chatbot.call('foo')).toEqual('hola')
    })

    test('should return a error Key: (tutu) not found', async () => {
        async function fail () {
            try {
                return await chatbot.call('tutu')
            }catch (err: any) {
                return err.message
            }
        }
        expect(await fail()).toEqual('Key: (tutu) not found')
    })

 })

 describe('useFunction return', () => { 
    let chatbot: any
    beforeAll(() => {
        chatbot = new ChatbotHibrid('pepitongo')
        chatbot.addCommand({
            key: 'foo',
            intents: ['foo'],
            default_message: 'cuanto es 2 + 2',
            return_direct: true,
            validate_value_return: true
        }).useFunction((ctx: any, err: any) => {
            throw new Error('fail useFunction')
        })
    })


    test('should return a error fail useFunction', async () => {
        async function fail () {
            try {
                return await chatbot.call('foo')
            }catch (err: any) {
                return err.message
            }
        }
        expect(await fail()).toEqual('fail useFunction')
    })

 })