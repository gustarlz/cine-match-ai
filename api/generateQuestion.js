const Groq = require('groq-sdk');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Agora podemos receber o filme rejeitado também
  const { conversationHistory, userProfile, rejectedMovie } = req.body;

  let prompt;
  if (rejectedMovie) {
    // Prompt de Refinamento
    prompt = `
      Você é um concierge de cinema IA. O usuário tem este perfil de gosto:
      - Gêneros Favoritos: ${JSON.stringify(userProfile.genres)}
      - Top 3 Filmes: ${JSON.stringify(userProfile.topMovies.map(m => m.title))}
      
      Eu sugeri o filme "${rejectedMovie.title}", mas o usuário não gostou.
      Sua tarefa é fazer UMA ÚNICA pergunta para entender o que ele não gostou e encontrar uma alternativa melhor.
      Exemplos de perguntas: "Entendido. O que te desagradou em '${rejectedMovie.title}'? Foi o ritmo, o tema, ou outra coisa?", "Certo. O que faltou em '${rejectedMovie.title}' para ser o filme ideal para hoje?".
      
      Responda APENAS com um objeto JSON no formato: { "type": "question", "text": "Sua pergunta aqui...", "suggestions": ["Foi o ritmo", "O tema não me interessou", "Busco algo mais intenso", "Outro motivo"] }
    `;
  } else {
    // Prompt inicial (foi removido do fluxo principal, mas mantemos como fallback)
    prompt = `
      Você é um concierge de cinema IA. Baseado no perfil do usuário, gere uma ÚNICA pergunta para refinar a busca.
      - Gêneros: ${JSON.stringify(userProfile.genres)}
      - Top Filmes: ${JSON.stringify(userProfile.topMovies.map(m => m.title))}
      Responda APENAS com um objeto JSON no formato: { "type": "question", "text": "Sua pergunta aqui...", "suggestions": ["Sugestão 1", "Sugestão 2"] }
    `;
  }

  const messages = [
    { role: 'system', content: prompt },
    ...conversationHistory.map(turn => ({
      role: turn.role === 'model' ? 'assistant' : 'user',
      content: turn.parts
    }))
  ];

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant", // Use o modelo que sabemos que funciona
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