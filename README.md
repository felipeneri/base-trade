# Desafio Front-End: Módulo de Gerenciamento de Ordens - Base Exchange

Este projeto foi desenvolvido como parte de um desafio para a criação de um módulo de gerenciamento de ordens para a plataforma de negociação de ativos financeiros da Base Exchange. O objetivo foi criar uma interface de usuário rica, intuitiva e eficiente, seguindo as melhores práticas de desenvolvimento e experiência do usuário.

## 🚀 Estrutura do Projeto

O repositório está organizado em duas pastas principais:

- `backend/`: Contém o arquivo `db.json` que simula uma API RESTful utilizando o **JSON Server**.
- `frontend/`: A aplicação principal construída com **React** e **TypeScript**.

## ▶️ Como Executar o Projeto

Siga os passos abaixo para executar a aplicação localmente.

**1. Backend (API Simulada)**

O backend utiliza o `json-server` para simular uma API RESTful.

- Navegue até o diretório do backend:
  ```bash
  cd backend/json-server
  ```
- Inicie o servidor:
  ```bash
  npx json-server --watch db.json --port 3000
  ```
  O servidor estará disponível em `http://localhost:3000`.

**2. Frontend (Aplicação React)**

O frontend é uma aplicação React construída com Vite.

- Navegue até o diretório do frontend:
  ```bash
  cd frontend/base-trade
  ```
- Instale as dependências:
  ```bash
  pnpm install
  ```
- Inicie o servidor de desenvolvimento:
  ```bash
  pnpm dev
  ```
  A aplicação estará disponível em `http://localhost:5173` (ou outra porta indicada pelo Vite).

## 🛠️ Stack de Tecnologias (Frontend)

A seleção de tecnologias visou a criação de uma aplicação moderna, performática e de fácil manutenção.

- **Core:**

  - **React & TypeScript:** Para uma base de código robusta, tipada e componentizada.
  - **Vite:** Build tool de alta performance para um desenvolvimento mais ágil.

- **Gerenciamento de Estado:**

  - **Zustand:** Um gerenciador de estado global minimalista, usado para controlar estados da UI, como a abertura de modais e o tema (claro/escuro).
  - **TanStack React Query (React Query):** Gerencia o estado do servidor (server state), tratando de forma inteligente o cache, a revalidação e o fetching de dados da API, eliminando a necessidade de gerenciar estados de `loading` e `error` manualmente.

- **Formulários e Validação:**

  - **React Hook Form:** Para a criação de formulários performáticos e flexíveis.
  - **Yup:** Utilizado como schema de validação para garantir a integridade dos dados enviados no formulário de criação de ordens.

- **UI & Estilização:**

  - **shadcn/ui:** Biblioteca de componentes "un-styled" que oferece blocos de construção acessíveis e customizáveis.
  - **TailwindCSS:** Framework CSS utility-first para estilização rápida e consistente.
  - **Framer Motion:** Para a criação de animações suaves e elegantes, melhorando a experiência do usuário em transições e interações.
  - **Lucide React:** Pacote de ícones leve e de fácil customização.
  - **Sonner:** Para a exibição de notificações (toasts) de sucesso e erro de forma não intrusiva.

- **Utilitários:**
  - **Decimal.js:** Essencial para garantir a precisão em todos os cálculos monetários (preços, totais), evitando os problemas de arredondamento inerentes ao tipo `Number` do JavaScript.

## 🎨 Identidade Visual

Para criar uma conexão com a marca, a identidade visual do projeto foi inspirada no site oficial da **Base Exchange**. Foram utilizados:

- **Fontes:** `Pressio-Regular` e `RedHatDisplay-Regular`.
- **Logo e Animações:** O logo oficial e algumas animações em Lottie foram incorporados para manter a consistência visual.

Essa abordagem foi combinada com a estética limpa e moderna dos componentes da `shadcn/ui`, resultando em uma interface que é, ao mesmo tempo, familiar à marca e altamente funcional.

## 🧠 Lógica de Execução de Ordens (Prioridade Preço-Tempo)

A simulação da execução de ordens na API (JSON Server) segue o princípio universal de **Prioridade Preço-Tempo**, o padrão em todas as bolsas de valores.

1.  **Prioridade de Preço:** A ordem com o preço mais "agressivo" tem preferência absoluta.
    - **Compradores:** O preço mais alto tem prioridade.
    - **Vendedores:** O preço mais baixo tem prioridade.
2.  **Prioridade de Tempo:** Se duas ordens possuem o mesmo preço, a que foi criada primeiro (FIFO - First-In, First-Out) é executada antes.

Quando uma nova ordem é criada, a API busca por ordens de contraparte compatíveis (status "Aberta" ou "Parcial") e as executa seguindo essa regra, atualizando os status e as quantidades restantes de ambas as ordens envolvidas no negócio.

## ✅ Testes Automatizados

Foram criados exemplos de testes automatizados para demonstrar a abordagem de qualidade e garantir o funcionamento correto de componentes e hooks críticos.

## ⚠️ Limitações Conhecidas

- **Filtragem por Data:** A funcionalidade de filtrar ordens por um intervalo de datas não funciona com 100% de precisão. Isso ocorre devido a uma limitação do **JSON Server**, que não oferece suporte nativo para queries complexas de data (como `maior que` e `menor que` em campos de data).

## 🔮 Melhorias Futuras

Esta é uma lista de funcionalidades e melhorias que poderiam ser implementadas para evoluir o projeto:

- **Dashboard com Preços em Tempo Real:** Criar um painel com cards exibindo os preços de diferentes ações, consumindo dados de uma API pública como a do **Yahoo Finance**.
- **Autenticação de Usuário:** Implementar um sistema de login para que cada usuário possa ver e gerenciar apenas suas próprias ordens, além de visualizar seu balanço financeiro.
- **Componente de "Order Book":** Desenvolver uma visualização de "livro de ofertas" mais tradicional, mostrando as listas de ordens de compra e venda de forma organizada por preço.
- **Atualizações em Tempo Real com WebSockets:** Integrar WebSockets para que as atualizações de status das ordens e novos negócios sejam refletidos na tela instantaneamente, sem a necessidade de revalidações manuais.
- **Refinamento da UI/UX:** Adicionar mais feedback visual, como "flashes" em tabelas quando os dados são atualizados, para melhorar a percepção do usuário sobre as mudanças.
