// api/generateQuestion.js
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Pega a API Key das "Environment Variables" da Vercel (o jeito seguro!)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { conversationHistory } = req.body;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

    const prompt = `
        Você é um concierge de cinema IA chamado Cine-Match. Seu objetivo é descobrir o filme perfeito para o usuário fazendo perguntas criativas e pessoais.
        A conversa até agora foi: ${JSON.stringify(conversationHistory)}

        Sua tarefa é:
        1. Se a conversa tiver menos de 3 turnos, gere a PRÓXIMA pergunta para continuar a conversa. A pergunta deve ser aberta e interessante.
        2. Junto com a pergunta, gere 3 ou 4 respostas curtas e sugeridas em botões.
        3. Se a conversa já tiver 3 ou mais turnos, não faça mais perguntas. Em vez disso, analise o histórico e gere um resumo final para uma busca de filme.

        Responda APENAS com um objeto JSON. Não inclua texto antes ou depois.
        O formato JSON deve ser:
        - Para uma nova pergunta: { "type": "question", "text": "Sua pergunta aqui...", "suggestions": ["Sugestão 1", "Sugestão 2"] }
        - Para o resumo final: { "type": "summary", "query": "filme de ação e aventura com reviravoltas para assistir com amigos", "genre_ids": [28, 12, 53] }
        
        Exemplo de conversa:
        Histórico: [{ "user": "Tive um dia estressante" }]
        Sua resposta JSON: { "type": "question", "text": "Entendo. Você quer algo para desligar a mente ou algo que te ajude a processar esse estresse?", "suggestions": ["Desligar a mente", "Processar o estresse", "Tanto faz"] }

        Histórico: [{...}, { "user": "desligar a mente" }, {...}, { "user": "com a galera"}]
        Sua resposta JSON: { "type": "summary", "query": "filme de comédia ou ação leve para assistir com amigos e relaxar", "genre_ids": [35, 28] }

        Comece a conversa!
    `;

    const result = await model.generateContent(prompt);
const response = await result.response;
let text = response.text();

// Tenta limpar a resposta da IA para extrair apenas o JSON
if (text.includes('```json')) {
  text = text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1);
} else if (text.startsWith('{') === false) {
  text = '{' + text.substring(text.indexOf('"type"'));
}

// Tenta parsear o JSON limpo
const jsonResponse = JSON.parse(text);

res.status(200).json(jsonResponse);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Falha ao comunicar com a IA.' });
  }
}