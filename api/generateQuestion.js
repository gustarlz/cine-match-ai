const Groq = require('groq-sdk');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { userProfile, conversationHistory } = req.body;

  // ESTE É O NOVO PROMPT INTELIGENTE E UNIFICADO
  const prompt = `
    Você é um especialista em cinema da Cine-Match. Sua missão é ajudar um usuário a encontrar um filme.

    **PERFIL DO USUÁRIO:**
    - Gêneros Favoritos (IDs): ${JSON.stringify(userProfile.genres)}
    - Top 3 Filmes: ${JSON.stringify(userProfile.topMovies.map(m => m.title))}

    **HISTÓRICO DA CONVERSA ATÉ AGORA:**
    ${JSON.stringify(conversationHistory)}

    **SUA TAREFA:**
    Analise a ÚLTIMA MENSAGEM DO USUÁRIO no histórico e decida sua próxima ação.

    1.  **SE a última mensagem do usuário der uma pista clara sobre o que ele quer ou não quer** (ex: "foi muito lento", "queria algo mais divertido", "não gosto de drama"), sua tarefa é sugerir UM ÚNICO novo título de filme que leve esse feedback em consideração.
        Neste caso, responda com o JSON: { "type": "recommendation", "title": "Nome do Novo Filme Sugerido" }

    2.  **SE a última mensagem do usuário for vaga, confusa ou fizer uma pergunta** (ex: "não sei", "não gostei da vibe", "o que você sugere?"), sua tarefa é fazer uma PERGUNTA CLARIFICADORA para entender melhor o gosto dele.
        Neste caso, responda com o JSON: { "type": "clarifying_question", "text": "Sua pergunta aqui...", "suggestions": ["Sugestão 1", "Sugestão 2"] }

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