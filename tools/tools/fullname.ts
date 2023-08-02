import { DynamicStructuredTool } from "langchain/tools"
import { z } from "zod"

export const _getFullname = new DynamicStructuredTool({
    name: "Fullname",
    description: "Capitalize the name of the a person",
    schema: z.object({
        fullname: z.string().describe("The full name of the person"),
    }),
    func: async ({ fullname }) => {
        console.log({ fullname })
        const [firts, ...rest] = fullname
        return firts.toUpperCase() + rest.join(' ')
    }, // Outputs still must be strings
    returnDirect: false, // This is an option that allows the tool to return the output directly
})
