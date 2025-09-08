const Groq = require('groq-sdk');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { userProfile, rejectedMovie, feedback } = req.body;

  // ESTE É O NOVO PROMPT INTELIGENTE
  const prompt = `
    Você é um especialista em cinema analisando o feedback de um usuário.
    O perfil do usuário é:
    - Top Filmes: ${JSON.stringify(userProfile.topMovies.map(m => m.title))}

    A última recomendação foi "${rejectedMovie.title}".
    O feedback do usuário foi: "${feedback}".

    Sua tarefa é traduzir o feedback vago do usuário em dados úteis. Analise o feedback no contexto dos filmes favoritos e do filme rejeitado.
    Gere uma lista de até 3 palavras-chave (em inglês, se possível) a serem EVITADAS na próxima busca.
    Gere uma lista de até 3 palavras-chave (em inglês, se possível) a serem PRIORIZADAS na próxima busca.

    Exemplo de feedback: "não gostei da vibe" para um filme de ação. Sua análise pode ser que o usuário busca algo menos genérico.
    Exemplo de resposta JSON: { "type": "refinement_analysis", "avoid_keywords": ["action", "explosions"], "prioritize_keywords": ["sci-fi", "dystopian", "mind-bending"] }
    
    Responda APENAS com um objeto JSON no formato:
    { "type": "refinement_analysis", "avoid_keywords": ["palavra1", "palavra2"], "prioritize_keywords": ["palavra3", "palavra4"] }
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