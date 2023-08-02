import { BufferWindowMemory } from "langchain/memory";

export const bufferWindowMemory = new BufferWindowMemory({
    memoryKey: "chat_history",
    outputKey: "output",
    returnMessages: true,
})