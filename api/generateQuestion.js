const Groq = require('groq-sdk');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { userProfile, rejectedMovie, feedback } = req.body;

  if (!userProfile) {
    return res.status(400).json({ error: "O perfil do usuário é necessário." });
  }

  let prompt;

  // LÓGICA DE DECISÃO: Verificamos se há 'feedback' para saber se é um refinamento
  if (feedback && rejectedMovie) {
    // PERSONALIDADE 2: O REFINADOR
    // Esta parte só é executada quando o usuário dá feedback sobre um filme.
    prompt = `
      Você é um especialista em cinema analisando o feedback de um usuário.
      O perfil do usuário é:
      - Top Filmes: ${JSON.stringify(userProfile.topMovies.map(m => m.title))}
      - Gêneros Favoritos (IDs): ${JSON.stringify(userProfile.genres)}

      A última recomendação foi "${rejectedMovie.title}".
      O feedback do usuário foi: "${feedback}".

      Sua tarefa é analisar o feedback e o perfil original para sugerir UM ÚNICO novo título de filme que se ajuste melhor.
      
      Responda APENAS com um objeto JSON no formato:
      { "type": "refined_recommendation", "title": "Nome do Novo Filme" }
    `;
  } else {
    // PERSONALIDADE 1: O GERADOR DE LISTA INICIAL
    // Esta parte só é executada na primeira vez.
    prompt = `
      Você é um especialista em cinema. Analise o seguinte perfil de gosto de um usuário:
      - Gêneros Favoritos (IDs): ${JSON.stringify(userProfile.genres)}
      - Top 3 Filmes: ${JSON.stringify(userProfile.topMovies.map(m => m.title))}

      Sua tarefa é gerar uma lista de 5 títulos de filmes que seriam uma combinação perfeita para este usuário. Pense nos temas, no ritmo e no estilo dos filmes favoritos dele.
      
      Responda APENAS com um objeto JSON no formato:
      { "type": "recommendation_list", "titles": ["Título do Filme 1", "Título do Filme 2", "Título do Filme 3", "Título do Filme 4", "Título do Filme 5"] }
    `;
  }

  const messages = [{ role: 'system', content: prompt }];

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: messages,
      response_format: { type: "json_object" },
    });
    const jsonResponse = JSON.parse(completion.choices[0].message.content);
    res.status(200).json(jsonResponse);
  } catch (error) {
    console.error('--- ERRO DETALHADO GROQ ---', error);
    res.status(500).json({ error: 'Falha ao comunicar com a IA da Groq.' });
  }
};