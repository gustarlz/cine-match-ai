// api/generateQuestion.js

const { GoogleGenerativeAI } = require("@google/generative-ai");

// Pega a API Key das "Environment Variables" da Vercel (o jeito seguro!)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Esta é a sintaxe mais segura para a Vercel
module.exports = async (req, res) => {
  // GARANTE que apenas o método POST seja aceito.
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { conversationHistory } = req.body;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.0-pro" }); // Nome do modelo corrigido

    const prompt = `
        Você é um concierge de cinema IA chamado Cine-Match. Seu objetivo é descobrir o filme perfeito para o usuário fazendo perguntas criativas e pessoais.
        A conversa até agora foi: ${JSON.stringify(conversationHistory)}

        Sua tarefa é:
        1. Se a conversa tiver menos de 3 turnos, gere a PRÓXIMA pergunta para continuar a conversa. A pergunta deve ser aberta e interessante.
        2. Junto com a pergunta, gere 3 ou 4 respostas curtas e sugeridas em botões.
        3. Se a conversa já tiver 3 ou mais turnos, não faça mais perguntas. Em vez disso, analise o histórico e gere um resumo final para uma busca de filme com IDs de gênero do TMDb.

        Responda APENAS com um objeto JSON. Não inclua texto antes ou depois, nem formatação de markdown como \`\`\`json.
        O formato JSON deve ser:
        - Para uma nova pergunta: { "type": "question", "text": "Sua pergunta aqui...", "suggestions": ["Sugestão 1", "Sugestão 2"] }
        - Para o resumo final: { "type": "summary", "query": "filme de ação e aventura com reviravoltas para assistir com amigos", "genre_ids": [28, 12, 53] }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    // Limpa a resposta da IA para garantir que seja um JSON válido
    if (text.includes('```json')) {
      text = text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1).trim();
    } else if (!text.startsWith('{')) {
        const jsonStart = text.indexOf('{');
        if (jsonStart !== -1) {
            text = text.substring(jsonStart);
        }
    }

    const jsonResponse = JSON.parse(text);
    
    res.status(200).json(jsonResponse);

  } catch (error) {
    console.error('--- ERRO DETALHADO ---', error);
    res.status(500).json({ 
        error: 'Falha ao comunicar com a IA.',
        details: error.message 
    });
  }
};