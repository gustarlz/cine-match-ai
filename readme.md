# Cine-Match Pro

> **Atenção:** Este projeto é um trabalho em andamento. Novas funcionalidades e melhorias estão sendo implementadas ativamente.

<br>

🌐 **[Acesse a demonstração ao vivo aqui!](https://cine-match-ai.vercel.app/)** 

Um sistema de recomendação de filmes inteligente, construído como um exercício prático para explorar o uso de grandes modelos de linguagem (LLMs) em interações de UI dinâmicas, combinado com o consumo de APIs externas para dados em tempo real. O projeto serve como um teste funcional de como essas tecnologias podem trabalhar juntas para criar uma experiência de usuário personalizada e responsiva.

---

### ▼ Versão em Português (Brasil)

#### **Contexto do Projeto**

Para demonstrar as capacidades de personalização do assistente, ele foi configurado para atuar como um especialista em recomendação de filmes. A aplicação, "Cine-Match Pro", guia o usuário por um processo de múltiplas etapas para entender seu gosto cinematográfico antes de fornecer sugestões personalizadas. Todas as interações, desde a seleção de gêneros até o chat de refinamento com IA, fazem parte de uma simulação para apresentar um caso de uso real de descoberta de conteúdo personalizado.

#### **Funcionalidades**

-   **Processo de Onboarding:** Coleta as preferências do usuário através da seleção de gêneros e de um perfil com seus "Top 3 Filmes".
-   **Recomendações via IA:** Utiliza a API do Groq para gerar uma lista inicial de sugestões de filmes com base no perfil do usuário.
-   **Chat Interativo de Refinamento:** Se o usuário não estiver satisfeito, ele pode iniciar um chat para dar feedback (ex: "gostaria de algo mais recente" ou "não gosto desse ator"), e a IA irá gerar uma nova recomendação mais adequada.
-   **Exibição Dinâmica de Resultados:** Apresenta o filme recomendado com pôster em alta resolução, sinopse, trailer do YouTube incorporado e informações de onde assistir (streaming) no Brasil.
-   **UI Moderna e Elegante:** Uma interface limpa, responsiva e com animações suaves, construída com HTML, CSS e JavaScript puros.

#### **Tecnologias Utilizadas**

-   **Backend:** Vercel Serverless Functions (Node.js)
-   **Frontend:** HTML, CSS, JavaScript
-   **APIs:**
    -   Groq API (para a lógica de recomendação da IA)
    -   The Movie Database (TMDB) API (para todos os dados de filmes, pôsteres, trailers e provedores de streaming)
-   **Bibliotecas Node.js:** `groq-sdk`

#### **Como Executar Localmente**

1.  **Pré-requisitos:** Node.js (v18 ou mais recente) e Git.

2.  **Clone o repositório:**
    ```bash
    git clone https://github.com/SEU-USUARIO/SEU-REPOSITORIO.git
    cd SEU-REPOSITORIO
    ```

3.  **Instale as dependências:**
    ```bash
    npm install
    ```

4.  **Configure as Variáveis de Ambiente:**
    -   **Chave TMDB:** A chave da API do TMDB está diretamente no arquivo `script.js`. Para testes locais com sua própria chave, altere a linha `const TMDB_API_KEY = '...'`.
    -   **Chave Groq:** Crie um arquivo chamado `.env` na raiz do projeto e adicione sua chave da API da Groq. Este arquivo será lido pelo servidor de desenvolvimento da Vercel.
        ```        GROQ_API_KEY="SUA_CHAVE_SECRETA_DA_GROQ_AQUI"
        ```

    > **Importante para Deploy:** Para publicar na Vercel, você **deve** adicionar `GROQ_API_KEY` como uma "Environment Variable" nas configurações do seu projeto na Vercel para que a função da API funcione.

5.  **Execute o servidor de desenvolvimento:**
    Para a melhor experiência, que simula o ambiente da Vercel, instale a Vercel CLI (`npm i -g vercel`) e rode:
    ```bash
    vercel dev
    ```
    O site estará disponível em `http://localhost:3000`.

---

<details>
<summary>▼ EN English Version</summary>

### **Project Context Note**

To demonstrate the assistant's customization capabilities, it has been designed to act as a movie recommendation expert. The application, "Cine-Match Pro," engages the user in a multi-step process to understand their cinematic taste before providing tailored suggestions. All interactions, from genre selection to the AI refinement chat, are part of a simulation to showcase a real-world use case for personalized content discovery.

### **Features**

-   **Multi-Step Onboarding:** Gathers user preferences through genre selection and a "Top 3 Movies" profiler.
-   **AI-Powered Recommendations:** Uses the Groq API to generate an initial pool of movie suggestions based on the user's profile.
-   **Interactive Refinement Chat:** If the user is not satisfied, they can start a chat to provide feedback (e.g., "I'd like something more recent" or "I don't like this actor"), and the AI will generate a new, more suitable recommendation.
-   **Dynamic Results Display:** Presents the recommended movie with a high-resolution poster, synopsis, embedded YouTube trailer, and streaming provider information for Brazil.
-   **Sleek & Modern UI:** A clean, responsive interface with smooth animations built with pure HTML, CSS, and JavaScript.

### **Tech Stack**

-   **Backend:** Vercel Serverless Functions (Node.js)
-   **Frontend:** HTML, CSS, JavaScript
-   **APIs:**
    -   Groq API (for AI-driven recommendation logic)
    -   The Movie Database (TMDB) API (for all movie data, posters, trailers, and watch providers)
-   **Node.js Libraries:** `groq-sdk`

### **How to Run Locally**

1.  **Prerequisites:** Node.js (v18 or newer) and Git.

2.  **Clone the repository:**
    ```bash
    git clone https://github.com/YOUR-USERNAME/YOUR-REPOSITORY.git
    cd YOUR-REPOSITORY
    ```

3.  **Install dependencies:**
    ```bash
    npm install
    ```

4.  **Configure Environment Variables:**
    -   **TMDB Key:** The TMDB API key is hardcoded in the `script.js` file. For local testing with your own key, change the line `const TMDB_API_KEY = '...'`.
    -   **Groq Key:** Create a file named `.env` in the project's root directory and add your Groq API key. This file will be read by the Vercel development server.
        ```
        GROQ_API_KEY="YOUR_SECRET_GROQ_KEY_HERE"
        ```

    > **Important for Deployment:** To deploy on Vercel, you **must** add `GROQ_API_KEY` as an Environment Variable in your Vercel project settings for the API function to work.

5.  **Run the development server:**
    For the best experience, which simulates the Vercel environment, install the Vercel CLI (`npm i -g vercel`) and run:
    ```bash
    vercel dev
    ```
    The site will be available at `http://localhost:3000`.

</details>
