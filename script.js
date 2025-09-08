document.addEventListener('DOMContentLoaded', () => {

    // =========================================================
    // CONFIGURAÇÕES E CHAVES DE API
    // =========================================================
    const TMDB_API_KEY = '2b27ba02c4646af199efd3e9f6f37dd7';

    // =========================================================
    // SELETORES DE ELEMENTOS DO DOM
    // =========================================================
    const welcomeScreen = document.getElementById('welcome-screen');
    const genreScreen = document.getElementById('genre-screen');
    const profilerScreen = document.getElementById('profiler-screen');
    const chatScreen = document.getElementById('chat-screen');
    const resultScreen = document.getElementById('result-screen');
    
    const startBtn = document.getElementById('start-btn');
    const genresNextBtn = document.getElementById('genres-next-btn');
    const profilerNextBtn = document.getElementById('profiler-next-btn');
    
    const genreGrid = document.getElementById('genre-grid');
    const movieSearchInput = document.getElementById('movie-search-input');
    const searchResultsContainer = document.getElementById('search-results');
    const selectedMoviesContainer = document.getElementById('selected-movies');

    const chatMessages = document.getElementById('chat-messages');
    const suggestionsContainer = document.getElementById('suggestions-container');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    
    const loadingOverlay = document.getElementById('loading-overlay');

    // =========================================================
    // ESTADO DA APLICAÇÃO (Onde guardamos as escolhas)
    // =========================================================
    let userProfile = {
        genres: [],
        topMovies: [],
    };
    let conversationHistory = [];
    let debounceTimer;

    // =========================================================
    // FUNÇÕES DE CONTROLE GERAL
    // =========================================================
    function showScreen(screen) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        screen.classList.add('active');
    }

    function showLoading(show) {
        loadingOverlay.classList.toggle('visible', show);
    }

    // =========================================================
    // ETAPA 1: LÓGICA DA TELA DE GÊNEROS
    // =========================================================
    function initializeGenreScreen() {
        const genres = [
            {id: 28, name: 'Ação'}, {id: 12, name: 'Aventura'},
            {id: 16, name: 'Animação'}, {id: 35, name: 'Comédia'},
            {id: 80, name: 'Crime'}, {id: 99, name: 'Documentário'},
            {id: 18, name: 'Drama'}, {id: 10751, name: 'Família'},
            {id: 14, name: 'Fantasia'}, {id: 36, name: 'História'},
            {id: 27, name: 'Terror'}, {id: 10402, name: 'Música'},
            {id: 9648, name: 'Mistério'}, {id: 10749, name: 'Romance'},
            {id: 878, name: 'Ficção Científica'}, {id: 53, name: 'Suspense'},
            {id: 10752, name: 'Guerra'}, {id: 37, name: 'Faroeste'}
        ];
        
        genreGrid.innerHTML = genres.map(g => `<button class="genre-btn" data-genre-id="${g.id}">${g.name}</button>`).join('');
        
        genreGrid.querySelectorAll('.genre-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const genreId = parseInt(btn.dataset.genreId);
                btn.classList.toggle('selected');
                
                if (userProfile.genres.includes(genreId)) {
                    userProfile.genres = userProfile.genres.filter(id => id !== genreId);
                } else {
                    userProfile.genres.push(genreId);
                }
                
                genresNextBtn.disabled = userProfile.genres.length === 0;
            });
        });
    }

    // =========================================================
    // ETAPA 2: LÓGICA DO ANALISADOR DE GOSTO (AUTOCOMPLETE)
    // =========================================================
    async function searchMovies(query) {
        if (query.length < 3) {
            searchResultsContainer.innerHTML = '';
            return;
        }
        try {
            const response = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&language=pt-BR&query=${encodeURIComponent(query)}`);
            const data = await response.json();
            displaySearchResults(data.results);
        } catch (error) {
            console.error("Erro ao buscar filmes:", error);
        }
    }

    function displaySearchResults(movies) {
        searchResultsContainer.innerHTML = movies.slice(0, 5).map(movie => `
            <div class="result-item" data-movie-id="${movie.id}">
                <img src="${movie.poster_path ? 'https://image.tmdb.org/t/p/w92' + movie.poster_path : 'https://via.placeholder.com/40x60?text=N/A'}" alt="poster">
                <div>
                    <strong>${movie.title}</strong>
                    <small>${movie.release_date ? movie.release_date.split('-')[0] : 'Sem data'}</small>
                </div>
            </div>
        `).join('');

        searchResultsContainer.querySelectorAll('.result-item').forEach(item => {
            item.addEventListener('click', () => {
                const selectedMovie = movies.find(m => m.id == item.dataset.movieId);
                selectMovie(selectedMovie);
            });
        });
    }

    function selectMovie(movie) {
        if (userProfile.topMovies.length < 3 && !userProfile.topMovies.some(m => m.id === movie.id)) {
            userProfile.topMovies.push({id: movie.id, title: movie.title}); // Guardamos apenas ID e Título
            renderSelectedMovies();
        }
        movieSearchInput.value = '';
        searchResultsContainer.innerHTML = '';
        movieSearchInput.focus();
    }

    function removeMovie(movieId) {
        userProfile.topMovies = userProfile.topMovies.filter(m => m.id !== movieId);
        renderSelectedMovies();
    }

    function renderSelectedMovies() {
        selectedMoviesContainer.innerHTML = userProfile.topMovies.map(movie => `
            <div class="movie-pill" data-movie-id="${movie.id}">
                ${movie.title}
                <span class="remove-movie" data-movie-id="${movie.id}"> &times;</span>
            </div>
        `).join('');

        profilerNextBtn.disabled = userProfile.topMovies.length === 0;

        if (userProfile.topMovies.length >= 3) {
            movieSearchInput.disabled = true;
            movieSearchInput.placeholder = 'Sua lista está completa!';
        } else {
            movieSearchInput.disabled = false;
            movieSearchInput.placeholder = 'Continue digitando...';
        }
    }

    // =========================================================
    // ETAPA 3 E FINAL: LÓGICA DO CHAT E RESULTADO
    // =========================================================
    function addMessage(text, sender) {
        const bubble = document.createElement('div');
        bubble.classList.add('chat-bubble', `${sender}-message`);
        bubble.textContent = text;
        chatMessages.appendChild(bubble);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    async function fetchFromAI() {
        try {
            const response = await fetch('/api/generateQuestion', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ conversationHistory, userProfile }),
            });
            if (!response.ok) throw new Error('A resposta da rede não foi OK');
            return await response.json();
        } catch (error) {
            console.error("Erro ao buscar da IA:", error);
            addMessage("Desculpe, estou com um probleminha para pensar. Tente novamente mais tarde.", "ai");
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
            console.error("Erro ao buscar recomendação de filme:", error);
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
            console.error("Erro ao buscar trailer:", error);
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
    
        const aiResponse = await fetchFromAI();
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
            resultScreen.innerHTML = `<div class="card"><h2>Ops! Não encontrei o filme perfeito. Que tal tentar de novo?</h2><button class="main-action-btn" onclick="location.reload()">Recomeçar</button></div>`;
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
                        <button class="main-action-btn" onclick="location.reload()" style="margin-top: 20px;">Recomeçar</button>
                    </div>
                </div>
            `;
        }
        showScreen(resultScreen);
    }

    // =========================================================
    // INICIALIZAÇÃO E EVENT LISTENERS
    // =========================================================
    startBtn.addEventListener('click', () => {
        showScreen(genreScreen);
        initializeGenreScreen();
    });

    genresNextBtn.addEventListener('click', () => {
        showScreen(profilerScreen);
    });
    
    profilerNextBtn.addEventListener('click', async () => {
        showScreen(chatScreen);
        showLoading(true);
        conversationHistory = [];
        const aiResponse = await fetchFromAI();
        showLoading(false);
        if (aiResponse) {
            conversationHistory.push({ role: 'model', parts: aiResponse.text });
            displayAIResponse(aiResponse);
        }
    });

    movieSearchInput.addEventListener('keyup', (event) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            searchMovies(event.target.value);
        }, 500); // Espera 500ms após o usuário parar de digitar
    });
    
    // Adiciona listener para remover filmes selecionados (usando delegação de eventos)
    selectedMoviesContainer.addEventListener('click', (event) => {
        if (event.target.classList.contains('remove-movie')) {
            const movieId = parseInt(event.target.dataset.movieId);
            removeMovie(movieId);
        }
    });

    sendBtn.addEventListener('click', () => handleUserInput(userInput.value));
    userInput.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') handleUserInput(userInput.value);
    });

});