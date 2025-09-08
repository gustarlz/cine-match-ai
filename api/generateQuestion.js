const Groq = require('groq-sdk');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { userProfile, feedback, rejectedMovieTitle } = req.body;

  if (!userProfile) {
    return res.status(400).json({ error: "O perfil do usuário é necessário." });
  }

  let prompt;

  if (feedback && rejectedMovieTitle) {
    // LÓGICA DE REFINAMENTO (quando há feedback)
    prompt = `
      Você é um especialista em cinema. O perfil do usuário é:
      - Gêneros Favoritos (IDs): ${JSON.stringify(userProfile.genres)}
      - Top Filmes: ${JSON.stringify(userProfile.topMovies.map(m => m.title))}

      A última recomendação foi "${rejectedMovieTitle}".
      O feedback do usuário sobre este filme foi: "${feedback}".

      Sua tarefa é analisar o feedback e sugerir UM ÚNICO novo título de filme que se ajuste melhor.
      
      Responda APENAS com um objeto JSON no formato:
      { "type": "refined_recommendation", "title": "Nome do Novo Filme" }
    `;
  } else {
    // LÓGICA INICIAL (primeira chamada)
    prompt = `
      Você é um especialista em cinema. Analise o seguinte perfil de gosto:
      - Gêneros Favoritos (IDs): ${JSON.stringify(userProfile.genres)}
      - Top 3 Filmes: ${JSON.stringify(userProfile.topMovies.map(m => m.title))}

      Sua tarefa é gerar uma lista de 5 títulos de filmes que seriam uma combinação perfeita para este usuário.
      
      Responda APENAS com um objeto JSON no formato:
      { "type": "recommendation_list", "titles": ["Título do Filme 1", "Título do Filme 2", "Filme 3", "Filme 4", "Filme 5"] }
    `;
  }

  const messages = [{ role: 'system', content: prompt }];

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant  ",
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