// { temperature: 0, openAIApiKey: "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" }
import { StructuredAgentZeroShot } from "./agent/structured-agent-zero-shot";
import { bufferWindowMemory } from "./memory/bufferWindowMemory";
import { ticket } from "./tools/tools/ticket";
import { products } from "./tools/tools/product";
import { delivery } from "./tools/tools/delivery";
import { location } from "./tools/tools/location";
import { CALLBACKS } from "./callbacks";
import { ChatbotHibrid } from "./chatbot/chatbot-hibrid";

const chatbot = new ChatbotHibrid('ron')
.addCommand({
    key: 'foo',
    intents: ['foo'],
    return_direct: false,
    action: {
        endpoint_url: 'foo',
        method: 'GET',
        name: 'foo',
        validate_value_return: false
    }

})
.addCommand({
    key: 'detalles',
    intents: ['precios', 'detalles', 'productos'],
    return_direct: false,
    action: {
        endpoint_url: 'precios',
        method: 'GET',
        name: 'foo',
        validate_value_return: false
    }

})

export const run = async () => {
    const handleChainStart = {
        // @ts-ignore
        handleChainStart(chain, inputs, runId, parentRunId, tags, metadata) {
            console.log("handleChainStart", {
                input: inputs.input,
            })
        }
    }

    const agent = new StructuredAgentZeroShot()
        .addMemory(bufferWindowMemory) // SE LE ASIGNA UNA MEMORIA POR DEFECTO BufferWindowMemory
        // Creacion de tools dinamicas
        .addTool(ticket)
        .addTool(products)
        .addTool(delivery)
        .addTool(location)
        
    agent._signal = 10000 // Tiempo de abortaje para los signals
    agent._callbacks = CALLBACKS // Sets de callbacks o handlers functions
    agent.addCallback(handleChainStart) // Build de callbacks
    agent.addChatBot(chatbot)

    const executor = await agent.build_executor() // Se crea el ejecutor para pasarlo a la funcion call la cual necesita llamarlo
    const inputs = ["cual es el precio de los nike air 97"];

    console.log("Loaded agent.");
    for (const input of inputs) {
        console.log(`Executing with input "${input}"...`);

        const output = await agent.call(input, executor);

        console.log({ output });
    }


    /*
      {
         output: {
            command: "detalles",
            details: {},
            message: null,
            claim: null,
            products: [ "hamburguesa de carne" ],
            quantity: null,
            additional_kwargs: {}
        }
      }
    */
};

run()