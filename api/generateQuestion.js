const Groq = require('groq-sdk');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Recebemos todo o contexto, algumas partes podem estar vazias/nulas
  const { userProfile, conversationHistory, rejectedMovie, feedback } = req.body;

  // ESTE É O NOVO PROMPT UNIFICADO E INTELIGENTE
  const prompt = `
    Você é um especialista em cinema da Cine-Match. Sua tarefa é analisar o contexto e decidir a próxima ação.

    **Contexto do Usuário:**
    - Gêneros Favoritos: ${JSON.stringify(userProfile.genres)}
    - Top 3 Filmes: ${JSON.stringify(userProfile.topMovies.map(m => m.title))}

    **Situação Atual:**
    - Conversa até agora: ${JSON.stringify(conversationHistory)}
    - Último filme rejeitado: ${rejectedMovie ? `"${rejectedMovie.title}"` : 'Nenhum'}
    - Feedback do usuário: ${feedback ? `"${feedback}"` : 'Nenhum'}

    **Sua Decisão:**

    1. **SE a conversa está vazia (primeira chamada)**, sua tarefa é gerar uma lista inicial de 5 títulos de filmes que combinam com o perfil do usuário.
       Responda com o JSON: { "type": "recommendation_list", "titles": ["Filme 1", "Filme 2", ...] }

    2. **SE a conversa NÃO está vazia (o usuário deu feedback)**, sua tarefa é analisar o feedback e o filme rejeitado para sugerir UM ÚNICO novo título.
       Responda com o JSON: { "type": "refined_recommendation", "title": "Nome do Novo Filme Sugerido" }

    **Responda APENAS com o objeto JSON apropriado para a sua decisão.** Não inclua nenhum outro texto.
  `;

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