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

  const { conversationHistory } = req.body;

  const messages = [
    {
      role: 'system',
      content: `
        Você é um concierge de cinema IA chamado Cine-Match. Seu objetivo é descobrir o filme perfeito para o usuário fazendo perguntas criativas e pessoais.
        Sua tarefa é:
        1. Se a conversa tiver menos de 3 turnos, gere a PRÓXIMA pergunta para continuar a conversa.
        2. Junto com a pergunta, gere 3 ou 4 respostas curtas e sugeridas em botões.
        3. Se a conversa já tiver 3 ou mais turnos, não faça mais perguntas. Em vez disso, gere um resumo final para uma busca de filme com IDs de gênero do TMDb.
        Responda APENAS com um objeto JSON válido. Não inclua texto antes ou depois, nem formatação de markdown.
        O formato JSON deve ser:
        - Para uma nova pergunta: { "type": "question", "text": "Sua pergunta aqui...", "suggestions": ["Sugestão 1", "Sugestão 2"] }
        - Para o resumo final: { "type": "summary", "query": "filme de ação e aventura...", "genre_ids": [28, 12, 53] }
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
      model: "llama-3.1-70b-versatile", // Um excelente modelo de código aberto e rápido
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