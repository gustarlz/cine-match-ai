// api/generateQuestion.js
const OpenAI = require('openai');

// Inicializa o cliente da OpenAI com a nossa chave secreta
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { conversationHistory } = req.body;

  // O histórico de conversa para o ChatGPT tem um formato específico
  const messages = [
    {
      role: 'system',
      content: `
        Você é um concierge de cinema IA chamado Cine-Match. Seu objetivo é descobrir o filme perfeito para o usuário fazendo perguntas criativas e pessoais.
        Sua tarefa é:
        1. Se a conversa tiver menos de 3 turnos, gere a PRÓXIMA pergunta para continuar a conversa.
        2. Junto com a pergunta, gere 3 ou 4 respostas curtas e sugeridas em botões.
        3. Se a conversa já tiver 3 ou mais turnos, não faça mais perguntas. Em vez disso, gere um resumo final para uma busca de filme com IDs de gênero do TMDb.
        Responda APENAS com um objeto JSON. O formato deve ser:
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
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // O modelo principal e mais rápido da OpenAI
      messages: messages,
      response_format: { type: "json_object" }, // Pede para a IA garantir uma resposta em JSON
    });

    const jsonResponse = JSON.parse(completion.choices[0].message.content);
    res.status(200).json(jsonResponse);

  } catch (error) {
    console.error('--- ERRO DETALHADO OPENAI ---', error);
    res.status(500).json({ 
        error: 'Falha ao comunicar com a IA da OpenAI.',
        details: error.message 
    });
  }
};