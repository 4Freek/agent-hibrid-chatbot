import { DynamicStructuredTool } from "langchain/tools"
import { z } from "zod"

export const ticket = new DynamicStructuredTool({
    name: "Ticket",
    description: "Util si la persona se queja del servico, atencion o caracteristicas",
    schema: z.object({
        ticket: z.string().describe("the input question you must answer"),
    }),
    func: async ({ ticket }): Promise<any> => {
        console.log({ ticket })
        return {
            command: "ticket",
            message: null,
            claim: ticket,
            products: null,
            details: null,
            quantity: null
        }
    }, // Outputs still must be strings
    returnDirect: true, // This is an option that allows the tool to return the output directly
})