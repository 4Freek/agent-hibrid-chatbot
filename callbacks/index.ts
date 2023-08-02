import { Callbacks } from "langchain/callbacks";

export const CALLBACKS: Callbacks = [
    {
        handleLLMStart(llm, prompts, runId, parentRunId, extraParams, tags, metadata) {
            console.log("handleLLMStart", {
                prompts,
            })
        },
        handleAgentAction(action) {
            const { tool, toolInput, log } = action;
            // console.log("\nhandleAgentAction", { tool, log });

            if (tool === "ticket") {
                const intent = log.split("\n")[0].replace(/Question:/gim, '').trim()
                // console.log({
                //     intent
                // })
                // @ts-ignore
                toolInput["ticket"] = intent
            }
        },
        handleAgentEnd(action) {
            // console.log("\nhandleAgentEnd", action);
        },
        handleToolEnd(output) {
            // console.log("\nhandleToolEnd", output);
        },
        handleToolError(error: Error) {
            console.log("\nhandleToolError", error);
        }
    },
]