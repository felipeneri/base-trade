import { setupServer } from "msw/node";
import { handlers } from "./handlers";

// Isso configura um servidor de requisições de teste com os handlers de rota fornecidos.
export const server = setupServer(...handlers);
