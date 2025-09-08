// =========================================================
// CONFIG & API KEYS (Apenas a chave do TMDb fica aqui)
// =========================================================
const TMDB_API_KEY = '2b27ba02c4646af199efd3e9f6f37dd7'; 

// =========================================================
// ELEMENT SELECTORS
// =========================================================
const welcomeScreen = document.getElementById('welcome-screen');
const chatScreen = document.getElementById('chat-screen');
const resultScreen = document.getElementById('result-screen');
const startBtn = document.getElementById('start-btn');
const chatMessages = document.getElementById('chat-messages');
const suggestionsContainer = document.getElementById('suggestions-container');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const loadingOverlay = document.getElementById('loading-overlay');

// =========================================================
// APP STATE
// =========================================================
let conversationHistory = [];

// =========================================================
// FUNCTIONS
// =========================================================

function showScreen(screen) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    screen.classList.add('active');
}

function showLoading(show) {
    loadingOverlay.classList.toggle('visible', show);
}

function addMessage(text, sender) {
    const bubble = document.createElement('div');
    bubble.classList.add('chat-bubble', `${sender}-message`);
    bubble.textContent = text;
    chatMessages.appendChild(bubble);
    chatMessages.scrollTop = chatMessages.scrollHeight; // Auto-scroll
}

async function fetchFromAI(history) {
    try {
        const response = await fetch('/api/generateQuestion', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ conversationHistory: history }),
        });
        if (!response.ok) throw new Error('Network response was not ok');
        return await response.json();
    } catch (error) {
        console.error("Error fetching from AI:", error);
        addMessage("Desculpe, estou com um probleminha para pensar. Tente novamente mais tarde.", "ai");
        return null;
    }
}

async function fetchMovieTrailer(movieId) {
    try {
        const response = await fetch(`https://api.themoviedb.org/3/movie/${movieId}/videos?api_key=${TMDB_API_KEY}&language=pt-BR`);
        const data = await response.json();
        const trailer = data.results.find(video => video.type === 'Trailer' && video.site === 'YouTube');
        return trailer ? `https://www.youtube.com/embed/${trailer.key}` : null;
    } catch (error) {
        console.error("Error fetching trailer:", error);
        return null;
    }
}

async function fetchMovieRecommendation(genre_ids) {
    try {
        const response = await fetch(`https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_API_KEY}&language=pt-BR&sort_by=popularity.desc&include_adult=false&with_genres=${genre_ids.join(',')}`);
        const data = await response.json();
        if (data.results && data.results.length > 0) {
            const movie = data.results[Math.floor(Math.random() * Math.min(data.results.length, 10))];
            const trailerUrl = await fetchMovieTrailer(movie.id);
            movie.trailerUrl = trailerUrl;
            return movie;
        }
        return null;
    } catch (error) {
        console.error("Error fetching movie:", error);
        return null;
    }
}

function displayAIResponse(data) {
    addMessage(data.text, "ai");
    suggestionsContainer.innerHTML = '';
    if (data.suggestions) {
        data.suggestions.forEach(sug => {
            const btn = document.createElement('button');
            btn.classList.add('suggestion-btn');
            btn.textContent = sug;
            btn.onclick = () => handleUserInput(sug);
            suggestionsContainer.appendChild(btn);
        });
    }
}

async function handleUserInput(text) {
    if (!text.trim()) return;

    addMessage(text, "user");
    conversationHistory.push({ role: 'user', parts: text });
    userInput.value = '';
    suggestionsContainer.innerHTML = '';
    showLoading(true);

    const aiResponse = await fetchFromAI(conversationHistory);
    showLoading(false);

    if (aiResponse) {
        if (aiResponse.type === 'question') {
            conversationHistory.push({ role: 'model', parts: aiResponse.text });
            displayAIResponse(aiResponse);
        } else if (aiResponse.type === 'summary') {
            const movie = await fetchMovieRecommendation(aiResponse.genre_ids);
            displayFinalResult(movie);
        }
    }
}

function displayFinalResult(movie) {
    if (!movie) {
        resultScreen.innerHTML = `<h2>Ops! Não encontrei o filme perfeito. Que tal tentar de novo?</h2>`;
    } else {
        resultScreen.innerHTML = `
            <div class="result-content">
                <div class="result-poster">
                    <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="Pôster de ${movie.title}">
                </div>
                <div class="result-details">
                    <h2>${movie.title}</h2>
                    <p>${movie.overview}</p>
                    ${movie.trailerUrl ? `<div id="trailer-container"><iframe src="${movie.trailerUrl}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>` : '<p>Trailer não disponível.</p>'}
                </div>
            </div>
        `;
    }
    showScreen(resultScreen);
}

async function startConversation() {
    showScreen(chatScreen);
    showLoading(true);
    conversationHistory = [];
    const aiResponse = await fetchFromAI(conversationHistory);
    showLoading(false);
    if (aiResponse) {
        conversationHistory.push({ role: 'model', parts: aiResponse.text });
        displayAIResponse(aiResponse);
    }
}

// =========================================================
// EVENT LISTENERS
// =========================================================
startBtn.addEventListener('click', startConversation);
sendBtn.addEventListener('click', () => handleUserInput(userInput.value));
userInput.addEventListener('keyup', (event) => {
    if (event.key === 'Enter') handleUserInput(userInput.value);
});