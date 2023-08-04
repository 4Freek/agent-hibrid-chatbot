
import { beforeAll, describe, expect, it, test } from 'bun:test'
import { ChatbotHibrid } from '../chatbot/chatbot-hibrid'



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