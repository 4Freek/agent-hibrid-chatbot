import { DynamicStructuredTool } from "langchain/tools"
import { z } from "zod"

export const products = new DynamicStructuredTool({
    name: "Products",
    description: "Util si la persona necesita detalles o precios de uno o mas productos",
    schema: z.object({
        products: z.array(z.string()).describe("lista de productos si no hay ningundo debe estar vacio"),
        details: z.any().describe("Los detalles del producto o productos que busca el usuario debe ser un objeto donde la key (EN ESPAÑOL) es la caracteristica y el value (EN ESPAÑOL) es lo que busca el usuario")
    }),
    func: async ({ products, details }): Promise<any> => {
        console.log({ products, details })
        return {
            command: "detalles",
            details,
            message: null,
            claim: null,
            products: products,
            quantity: null
        }
    }, // Outputs still must be strings
    returnDirect: true, // This is an option that allows the tool to return the output directly
})
