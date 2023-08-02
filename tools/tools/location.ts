import { DynamicStructuredTool } from "langchain/tools"
import { z } from "zod"

export const location = new DynamicStructuredTool({
    name: "Location",
    description: "Util solo si la persona pregunta la ubicacion",
    schema: z.object({
        myLocation: z.string().describe("la ubicacion de la persona"),
    }),
    func: async ({ myLocation }): Promise<any> => {
        console.log({ myLocation })

        return {
            command: "location",
            message: null,
            claim: null,
            products: null,
            details: null,
            quantity: null
        }
    }, // Outputs still must be strings
    returnDirect: true, // This is an option that allows the tool to return the output directly
})
