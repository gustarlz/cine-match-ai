// api/generateQuestion.js
const Groq = require('groq-sdk');

// Inicializa o cliente da Groq com a nossa chave secreta
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

const { conversationHistory, userProfile } = req.body; // Agora recebemos o perfil do usuário!

const messages = [
  {
    role: 'system',
    content: `
      Você é um concierge de cinema IA chamado Cine-Match Pro. Sua tarefa é fazer UMA ÚNICA pergunta final e inteligente para dar a recomendação de filme perfeita.
      Você já tem estas informações sobre o usuário:
      - Gêneros Favoritos: ${JSON.stringify(userProfile.genres)} (use os IDs para saber os gêneros)
      - Top 3 Filmes: ${JSON.stringify(userProfile.topMovies.map(m => m.title))}

      Sua tarefa é:
      1. Analise os gêneros e os filmes favoritos para entender o "gosto" do usuário.
      2. Faça UMA pergunta de "ajuste fino" baseada nesse gosto. Exemplo: "Vejo que você gosta de ficção científica complexa. Para hoje, busca algo nesse estilo ou uma aventura mais leve?".
      3. Gere 3 ou 4 sugestões de resposta para essa pergunta.
      4. Se a conversa já tiver UMA resposta do usuário, não faça mais perguntas. Gere o resumo final.

      Responda APENAS com um objeto JSON válido.
      - Para a pergunta de ajuste fino: { "type": "question", "text": "Sua pergunta aqui...", "suggestions": ["Sugestão 1", "Sugestão 2"] }
      - Para o resumo final: { "type": "summary", "query": "filme...", "genre_ids": [28, 12, 53] }
    `
  },
  // Adiciona o histórico da conversa atual
  ...conversationHistory.map(turn => ({
    role: turn.role === 'model' ? 'assistant' : 'user',
    content: turn.parts
  }))
];

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant", // Um excelente modelo de código aberto e rápido
      messages: messages,
      response_format: { type: "json_object" },
    });

    const jsonResponse = JSON.parse(completion.choices[0].message.content);
    res.status(200).json(jsonResponse);

  } catch (error) {
    console.error('--- ERRO DETALHADO GROQ ---', error);
    res.status(500).json({ 
        error: 'Falha ao comunicar com a IA da Groq.',
        details: error.message 
    });
  }
};