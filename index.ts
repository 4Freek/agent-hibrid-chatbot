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
    default_message: 'cuanto es 2 + 2',
    return_direct: true,
}).addCapture(() => {
    return { message: 'Indicame lo que necesitas' }
})

const inputs = ['foo', '3']

for (const input of inputs) {
    console.log(await chatbot.call(input))
}

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

    // console.log("Loaded agent.");
    // for (const input of inputs) {
    //     console.log(`Executing with input "${input}"...`);

    //     const output = await agent.call(input, executor);

    //     console.log({ output });
    // }


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