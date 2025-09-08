# Cine-Match Pro 🎬

![Status](https://img.shields.io/badge/status-em--desenvolvimento-yellow)
![Vercel](https://img.shields.io/badge/deploy-Vercel-black?logo=vercel)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow?logo=javascript)
![Node.js](https://img.shields.io/badge/Node.js-Serverless-green?logo=nodedotjs)

<br>
 
<p align="center">
![Demo](https://i.imgur.com/LQE6oFD.gif)


</p>

<h2 align="center">
  <a href="https://cine-match-o1oc3hawp-gustavo-rosas-projects-c2c1e6dc.vercel.app//"><strong>Acesse a demonstração ao vivo!</strong></a>
</h2>

<br>

**Cine-Match Pro** é uma aplicação web moderna que atua como um assistente de recomendação de filmes. O projeto foi desenvolvido para explorar a integração de APIs de IA (Groq) com uma base de dados externa (TMDB) para criar uma experiência de usuário interativa e inteligente, que se aprofunda no gosto do usuário para fornecer sugestões de alta precisão.

---

### ▼ Versão em Português (Brasil)

#### **Sobre o Projeto**

A ideia central do Cine-Match Pro é ir além das recomendações genéricas baseadas apenas em gênero. A aplicação simula uma conversa com um especialista em cinema, coletando informações sobre os filmes favoritos do usuário e utilizando um chat de refinamento para entender *por que* uma sugestão inicial pode não ter agradado. Isso permite que a IA ajuste seus parâmetros e ofereça um resultado muito mais alinhado com as expectativas.

#### **Como Funciona?**

O fluxo do usuário foi projetado para ser simples e intuitivo:
1.  **Seleção de Gêneros:** O usuário escolhe um ou mais gêneros de sua preferência.
2.  **Análise de Gosto:** O usuário informa seus 3 filmes favoritos de todos os tempos.
3.  **Primeira Sugestão:** Com base nos dados iniciais, a IA gera uma lista de recomendações e apresenta a primeira.
4.  **Resultado Detalhado:** O filme sugerido é exibido com pôster, sinopse, trailer e onde assistir (streaming no Brasil).
5.  **Refinamento (Opcional):** Se não for "bem isso", o usuário clica no botão de refinar, abre um chat e explica o que não gostou. A IA processa o feedback e gera uma nova sugestão.

#### **Funcionalidades Principais**
-   ✅ **Onboarding Personalizado:** Coleta de preferências através de gêneros e filmes de referência.
-   🧠 **Motor de IA (Groq):** Geração de recomendações iniciais e refinamento baseado em feedback de linguagem natural.
-   📊 **Integração com TMDB:** Busca de metadados, pôsteres, trailers e provedores de streaming em tempo real.
-   💬 **Chat Interativo de Refinamento:** Permite ao usuário dialogar com a IA para ajustar as sugestões.
-   📱 **UI Responsiva e Moderna:** Interface limpa e agradável, construída com HTML, CSS e JavaScript puros.

#### **Tecnologias Utilizadas**

| Tecnologia | Papel na Aplicação |
| :--- | :--- |
| **HTML5 / CSS3** | Estrutura e estilização da interface do usuário. |
| **JavaScript (ES6+)** | Manipulação do DOM, lógica de front-end e comunicação com as APIs. |
| **Vercel Functions**| Backend serverless (Node.js) que hospeda a lógica da IA, protegendo a chave da API do Groq. |
| **Groq API** | Fornece o modelo de linguagem (LLM) para gerar as recomendações com base nos prompts. |
| **TMDB API** | Fonte de todos os dados dos filmes, incluindo detalhes, imagens e disponibilidade de streaming. |

#### **Estrutura do Projeto**

/
├── api/
│ └── generateQuestion.js # Função Serverless que se comunica com a API da Groq
├── index.html # Estrutura principal da página
├── script.js # Lógica do front-end e chamadas de API
├── style.css # Estilização da aplicação
├── package.json # Dependências do projeto (Groq SDK)
└── README.md # Este arquivo

code
Code
download
content_copy
expand_less
IGNORE_WHEN_COPYING_START
IGNORE_WHEN_COPYING_END
#### **Como Executar Localmente**

1.  **Pré-requisitos:**
    -   Node.js (v18 ou mais recente)
    -   Git
    -   Uma chave de API gratuita do [The Movie Database (TMDB)](https://www.themoviedb.org/signup)
    -   Uma chave de API gratuita do [GroqCloud](https://console.groq.com/keys)

2.  **Clone o repositório:**
    ```bash
    git clone https://github.com/gustarlz/cine-match-ai.git # (Confirme se o nome do repo está correto)
    cd cine-match-ai
    ```

3.  **Instale as dependências:**
    ```bash
    npm install
    ```

4.  **Configure as Variáveis de Ambiente:**
    -   **Chave TMDB:** No arquivo `script.js`, substitua o valor da constante `TMDB_API_KEY` pela sua chave.
    -   **Chave Groq:** Crie um arquivo chamado `.env` na raiz do projeto e adicione sua chave:
        ```bash
        GROQ_API_KEY="SUA_CHAVE_SECRETA_DA_GROQ_AQUI"
        ```

5.  **Execute com a Vercel CLI:**
    Para uma simulação perfeita do ambiente de produção, instale a Vercel CLI (`npm i -g vercel`) e rode:
    ```bash
    vercel dev
    ```
    Sua aplicação estará rodando em `http://localhost:3000`.

---

<details>
<summary>▼ EN English Version</summary>

### **About The Project**

The core idea behind Cine-Match Pro is to move beyond generic recommendations based solely on genre. The application simulates a conversation with a film expert, gathering information about the user's favorite movies and using a refinement chat to understand *why* an initial suggestion might have missed the mark. This allows the AI to adjust its parameters and offer a result that is much more aligned with the user's expectations.

### **Key Features**
-   ✅ **Personalized Onboarding:** Gathers user preferences through genres and reference films.
-   🧠 **AI Engine (Groq):** Generates initial recommendations and refines them based on natural language feedback.
-   📊 **TMDB Integration:** Fetches metadata, posters, trailers, and streaming providers in real-time.
-   💬 **Interactive Refinement Chat:** Allows the user to dialogue with the AI to fine-tune suggestions.
-   📱 **Modern & Responsive UI:** A clean and pleasant interface built with pure HTML, CSS, and JavaScript.

### **Tech Stack**

| Technology | Role in the Application |
| :--- | :--- |
| **HTML5 / CSS3** | Structure and styling of the user interface. |
| **JavaScript (ES6+)** | DOM manipulation, front-end logic, and API communication. |
| **Vercel Functions**| Serverless backend (Node.js) that hosts the AI logic, protecting the Groq API key. |
| **Groq API** | Provides the Large Language Model (LLM) to generate recommendations based on prompts. |
| **TMDB API** | The data source for all movie information, including details, images, and streaming availability. |

### **How to Run Locally**

1.  **Prerequisites:**
    -   Node.js (v18 or newer)
    -   Git
    -   A free API key from [The Movie Database (TMDB)](https://www.themoviedb.org/signup)
    -   A free API key from [GroqCloud](https://console.groq.com/keys)

2.  **Clone the repository:**
    ```bash
    git clone https://github.com/gustarlz/cine-match-ai.git # (Please confirm repo name is correct)
    cd cine-match-ai
    ```

3.  **Install dependencies:**
    ```bash
    npm install
    ```

4.  **Configure Environment Variables:**
    -   **TMDB Key:** In the `script.js` file, replace the value of the `TMDB_API_KEY` constant with your key.
    -   **Groq Key:** Create a file named `.env` in the project's root and add your key:
        ```bash
        GROQ_API_KEY="YOUR_SECRET_GROQ_KEY_HERE"
        ```

5.  **Run with the Vercel CLI:**
    For a perfect simulation of the production environment, install the Vercel CLI (`npm i -g vercel`) and run:
    ```bash
    vercel dev
    ```
    Your application will be running at `http://localhost:3000`.

</details>

---

<p align="center">Desenvolvido por <a href="https://github.com/gustarlz">gustarlz</a></p>
