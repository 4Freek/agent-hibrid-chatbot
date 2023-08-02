import { AgentExecutor, initializeAgentExecutorWithOptions } from "langchain/agents";
import { BaseLanguageModel } from "langchain/base_language";
import { Callbacks } from "langchain/callbacks";
import { BaseChatModelParams } from "langchain/chat_models/base";
import { AzureOpenAIInput, ChatOpenAI, OpenAIChatInput } from "langchain/chat_models/openai";
import { BaseMemory, BufferWindowMemory } from "langchain/memory";
import { MessagesPlaceholder } from "langchain/prompts";
import { DynamicStructuredTool } from "langchain/tools";
import { ChatbotHibrid } from "../chatbot/chatbot-hibrid";

import { config } from "dotenv";
config()

export class StructuredAgentZeroShot {
    private TYPE_AGENT: "structured-chat-zero-shot-react-description" = "structured-chat-zero-shot-react-description"
    private tools: DynamicStructuredTool[] = []
    private memory: BaseMemory | undefined = undefined
    private callbacks: Callbacks = []
    private chatbot!: ChatbotHibrid
    private signalAbortMs = 5000

    constructor(
        private agentConfig: Partial<OpenAIChatInput> & Partial<AzureOpenAIInput> & BaseChatModelParams = {
            // modelName: 'text-davinci-003',
            temperature: 0,
            openAIApiKey: process.env.OPEN_API_KEY,
        },
        // @ts-ignore
        private model: BaseLanguageModel = undefined
    ) {
        this.model ||= new ChatOpenAI(this.agentConfig)
    }

    private get names_tools() {
        return this.tools.map(_tool => _tool.name)
    }

    private signal = () => {
        const controller = (new AbortController)

        setTimeout(() => {
            controller.abort()
        }, this.signalAbortMs)

        return controller.signal
    }

    set _signal(msAbort: number) {
        this.signalAbortMs = msAbort
    }

    get _signal(): any {
        const signal = this.signal()

        return signal
    }

    set _callbacks(callbacks: Callbacks) {
        this.callbacks = callbacks
    }

    set _tools(tools: DynamicStructuredTool[]) {
        this.tools = tools
    }

    /**
     * 
     * @param tool {DynamicStructuredTool}
     * @returns this
     * @example
     * const fooTool = new DynamicStructuredTool({
     *     name: "foo",
     *     description: "foo",
     *     schema: z.object({
     *         foo: z.string().describe("foo"),
     *     }),
     *     func: async ({ foo }): Promise<any> => {
     *        console.log({ foo })
     *
     *        return 'foo'
     *     }, // Outputs still must be strings
     *     returnDirect: true, // This is an option that allows the tool to return the output directly
     * })
     * 
     * .addTool(fooTool)
     */
    addTool(tool: DynamicStructuredTool) {

        if (this.names_tools.includes(tool.name)) throw new Error(`${tool.name} already exists`)

        this.tools.push(tool);

        return this
    }

    /**
     * 
     * @param tool {any}
     * @returns this
     * @example
     * const handleChainStart = {
     *      handleChainStart(chain, inputs, runId, parentRunId, tags, metadata) {
     *           console.log("handleChainStart", {
     *               input: inputs.input,
     *           })
     *       }
     * }
     * 
     * .addCallback(handleChainStart)
     */
    addCallback(callback: any) {
        // @ts-ignore
        this.callbacks = [Object.assign(...this.callbacks, callback)]

        return this
    }

    /**
     * 
     * @param memory {BaseMemory}
     * @returns this
     * @example
     * const memory = new BufferWindowMemory({
     *       memoryKey: "chat_history",
     *       outputKey: "output",
     *       returnMessages: true,
     * })
     * 
     * .addMemory(memory)
     */
    addMemory(memory: BaseMemory) {
        this.memory = memory

        return this
    }

    deleteTool(tool_name: string) {
        if (!this.names_tools.includes(tool_name)) throw new Error(`${tool_name} not found`)

        this.tools = this.tools.filter(tool => tool.name !== tool_name)
    }

    addChatBot(chatBot: ChatbotHibrid) {
        this.chatbot = chatBot

        return this
    }

    async build_executor() {
        if (!this.tools.length) throw new Error(`${this.tools} not must be empty`)

        return await initializeAgentExecutorWithOptions(this.tools, this.model, {
            // maxIterations: 2,
            memory: this.memory,
            agentArgs: {
                memoryPrompts: [new MessagesPlaceholder("chat_history")],
                inputVariables: ["input", "agent_scratchpad", "chat_history"],
            },
            earlyStoppingMethod: "force",
            returnIntermediateSteps: false,
            callbacks: this.callbacks,
            agentType: this.TYPE_AGENT,
            verbose: false,
        })
    }

    async call(input: string, executor: AgentExecutor) {
        const { output } = await executor.call({ input, signal: this._signal });

        if (this.chatbot) {
            return await this.chatbot.call(output.command, output)
        }

        return output
    }
}