import { DynamicStructuredTool } from "langchain/tools"
import { z } from "zod"

export const delivery = new DynamicStructuredTool({
    name: "Delivery",
    description: "Util si la persona entrega su ubicacion",
    schema: z.object({
        location: z.string().describe("la ubicacion de la persona"),
    }),
    func: async ({ location }): Promise<any> => {
        console.log({ location })

        return {
            command: "delivery",
            message: null,
            claim: null,
            details: null,
            products: null,
            quantity: null
        }
    }, // Outputs still must be strings
    returnDirect: true, // This is an option that allows the tool to return the output directly
})