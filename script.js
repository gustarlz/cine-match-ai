document.addEventListener('DOMContentLoaded', () => {

    const TMDB_API_KEY = '2b27ba02c4646af199efd3e9f6f37dd7';

    // Seletores de Elementos do DOM
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
    const loadingOverlay = document.getElementById('loading-overlay');
    const resultTemplate = document.getElementById('result-template');
    const chatMessages = document.getElementById('chat-messages');
    const suggestionsContainer = document.getElementById('suggestions-container');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');

    // Estado da Aplicação
    let userProfile = { genres: [], topMovies: [] };
    let recommendationPool = [];
    let currentRecommendation = null;
    let conversationHistory = [];
    let debounceTimer;

    function showScreen(screen) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        screen.classList.add('active');
    }

    function showLoading(show) {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) overlay.classList.toggle('visible', show);
    }
    
    // ... (As funções de Gênero e Profiler continuam as mesmas da versão anterior)
    function initializeGenreScreen(){const genres=[{id:28,name:"Ação"},{id:12,name:"Aventura"},{id:16,name:"Animação"},{id:35,name:"Comédia"},{id:80,name:"Crime"},{id:99,name:"Documentário"},{id:18,name:"Drama"},{id:10751,name:"Família"},{id:14,name:"Fantasia"},{id:36,name:"História"},{id:27,name:"Terror"},{id:10402,name:"Música"},{id:9648,name:"Mistério"},{id:10749,name:"Romance"},{id:878,name:"Ficção Científica"},{id:53,name:"Suspense"},{id:10752,name:"Guerra"},{id:37,name:"Faroeste"}];genreGrid.innerHTML=genres.map(g=>`<button class="genre-btn" data-genre-id="${g.id}">${g.name}</button>`).join(""),genreGrid.querySelectorAll(".genre-btn").forEach(btn=>{btn.addEventListener("click",()=>{const genreId=parseInt(btn.dataset.genreId);btn.classList.toggle("selected"),userProfile.genres=userProfile.genres.includes(genreId)?userProfile.genres.filter(id=>id!==genreId):[...userProfile.genres,genreId],genresNextBtn.disabled=0===userProfile.genres.length})})}
    async function searchMovies(query){if(query.length<3)return void(searchResultsContainer.innerHTML="");try{const response=await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&language=pt-BR&query=${encodeURIComponent(query)}`),data=await response.json();displaySearchResults(data.results)}catch(error){console.error("Erro ao buscar filmes:",error)}}
    function displaySearchResults(movies){searchResultsContainer.innerHTML=movies.slice(0,5).map(movie=>`
            <div class="result-item" data-movie-id="${movie.id}">
                <img src="${movie.poster_path?"https://image.tmdb.org/t/p/w92"+movie.poster_path:"https://via.placeholder.com/40x60?text=N/A"}" alt="poster">
                <div>
                    <strong>${movie.title}</strong>
                    <small>${movie.release_date?movie.release_date.split("-")[0]:"Sem data"}</small>
                </div>
            </div>`).join(""),searchResultsContainer.querySelectorAll(".result-item").forEach(item=>{item.addEventListener("click",()=>{const selectedMovie=movies.find(m=>m.id==item.dataset.movieId);selectMovie(selectedMovie)})})}
    function selectMovie(movie){userProfile.topMovies.length<3&&!userProfile.topMovies.some(m=>m.id===movie.id)&&(userProfile.topMovies.push({id:movie.id,title:movie.title}),renderSelectedMovies()),movieSearchInput.value="",searchResultsContainer.innerHTML="",movieSearchInput.focus()}
    function removeMovie(movieId){userProfile.topMovies=userProfile.topMovies.filter(m=>m.id!==movieId),renderSelectedMovies()}
    function renderSelectedMovies(){selectedMoviesContainer.innerHTML=userProfile.topMovies.map(movie=>`
            <div class="movie-pill" data-movie-id="${movie.id}">
                ${movie.title}
                <span class="remove-movie" data-movie-id="${movie.id}"> &times;</span>
            </div>`).join(""),profilerNextBtn.disabled=0===userProfile.topMovies.length,movieSearchInput.disabled=userProfile.topMovies.length>=3,movieSearchInput.placeholder=userProfile.topMovies.length>=3?"Sua lista está completa!":"Continue digitando..."}

    // NOVA LÓGICA DE RECOMENDAÇÃO
    async function generateAccurateRecommendations() {
        showLoading(true);
        const movieIds = userProfile.topMovies.map(m => m.id);
        try {
            const recommendationPromises = movieIds.map(id => fetch(`https://api.themoviedb.org/3/movie/${id}/recommendations?api_key=${TMDB_API_KEY}&language=pt-BR`).then(res => res.json()));
            const recommendationResults = await Promise.all(recommendationPromises);
            const combinedPool = recommendationResults.flatMap(result => result.results || []);
            const uniqueIds = new Set();
            let uniquePool = combinedPool.filter(movie => {
                if (uniqueIds.has(movie.id) || movieIds.includes(movie.id)) return false;
                uniqueIds.add(movie.id);
                return true;
            });
            const finalPool = uniquePool.filter(movie => movie.genre_ids.some(genreId => userProfile.genres.includes(genreId)));
            recommendationPool = finalPool.sort((a, b) => b.popularity - a.popularity);
            if (recommendationPool.length > 0) await displayNextRecommendation();
            else displayError("Não encontramos recomendações com essa combinação. Tente com outros filmes ou gêneros!");
        } catch (error) { console.error("Erro ao gerar recomendações:", error); displayError("Ocorreu um erro ao buscar suas recomendações."); } 
        finally { showLoading(false); }
    }
    
    async function displayNextRecommendation() {
        if (recommendationPool.length === 0) {
            const btn = document.getElementById('generate-another-btn');
            if (btn) { btn.textContent = "Fim das sugestões!"; btn.disabled = true; }
            return;
        }

        currentRecommendation = recommendationPool.shift();
        const [trailerUrl, providers] = await Promise.all([
            fetchMovieTrailer(currentRecommendation.id),
            fetchWatchProviders(currentRecommendation.id)
        ]);
        
        const clone = resultTemplate.content.cloneNode(true);
        clone.querySelector('h2').textContent = currentRecommendation.title;
        clone.querySelector('p').textContent = currentRecommendation.overview || 'Sinopse não disponível.';
        clone.querySelector('img').src = currentRecommendation.poster_path ? `https://image.tmdb.org/t/p/w500${currentRecommendation.poster_path}` : 'https://via.placeholder.com/500x750?text=Poster+Indisponível';
        
        const trailerContainer = clone.querySelector('#trailer-container');
        if (trailerUrl) trailerContainer.innerHTML = `<iframe src="${trailerUrl}" frameborder="0" allowfullscreen></iframe>`;
        else trailerContainer.innerHTML = '<p class="subtitle">Trailer não disponível.</p>';

        const providersContainer = clone.querySelector('#watch-providers');
        if (providers && providers.length > 0) {
            providersContainer.innerHTML = `<h3>Onde Assistir (Streaming):</h3><div class="provider-logos">${providers.map(p => `<div class="provider-logo" title="${p.provider_name}"><img src="https://image.tmdb.org/t/p/w92${p.logo_path}" alt="${p.provider_name}"></div>`).join('')}</div>`;
        } else {
            providersContainer.innerHTML = '<h3 class="subtitle">Não disponível em serviços de streaming no Brasil.</h3>';
        }

        resultScreen.innerHTML = '';
        resultScreen.appendChild(clone);
        showScreen(resultScreen);

        document.getElementById('generate-another-btn').addEventListener('click', displayNextRecommendation);
        document.getElementById('refine-btn').addEventListener('click', startRefinementChat);
    }
    
    async function fetchWatchProviders(movieId) {
        try {
            const response = await fetch(`https://api.themoviedb.org/3/movie/${movieId}/watch/providers?api_key=${TMDB_API_KEY}`);
            const data = await response.json();
            return data.results.BR?.flatrate || null;
        } catch (error) { console.error("Erro ao buscar providers:", error); return null; }
    }

    async function fetchMovieTrailer(movieId) {
        try {
            const response = await fetch(`https://api.themoviedb.org/3/movie/${movieId}/videos?api_key=${TMDB_API_KEY}`);
            const data = await response.json();
            const trailers = data.results.filter(v => v.type === 'Trailer' && v.site === 'YouTube');
            if (trailers.length === 0) return null;
            const best = trailers.find(t => t.official && t.iso_639_1 === 'en') || trailers.find(t => t.official) || trailers.find(t => t.iso_639_1 === 'en') || trailers[0];
            return `https://www.youtube.com/embed/${best.key}`;
        } catch (error) { console.error("Erro ao buscar trailer:", error); return null; }
    }
    
    function displayError(message) {
        resultScreen.innerHTML = `<div class="card"><h2>${message}</h2><button class="main-action-btn" onclick="location.reload()">Recomeçar</button></div>`;
        showScreen(resultScreen);
    }

    // NOVA LÓGICA DE CHAT PARA REFINAMENTO
    async function startRefinementChat() {
        showScreen(chatScreen);
        showLoading(true);
        conversationHistory = [];
        chatMessages.innerHTML = '';
        
        const aiResponse = await fetchFromAI(currentRecommendation);
        showLoading(false);

        if (aiResponse) {
            conversationHistory.push({ role: 'model', parts: aiResponse.text });
            displayAIResponse(aiResponse);
        }
    }

    async function fetchFromAI(rejectedMovie) {
        try {
            const response = await fetch('/api/generateQuestion', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ conversationHistory, userProfile, rejectedMovie }),
            });
            if (!response.ok) throw new Error('A resposta da rede não foi OK');
            return await response.json();
        } catch (error) {
            console.error("Erro ao buscar da IA:", error);
            addMessage("Desculpe, estou com um probleminha para pensar. Tente novamente.", "ai");
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
    
    function addMessage(text, sender) {
        const bubble = document.createElement('div');
        bubble.classList.add('chat-bubble', `${sender}-message`);
        bubble.textContent = text;
        chatMessages.appendChild(bubble);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    async function handleUserInput(text) {
        // Esta função agora precisa ser implementada para lidar com o refinamento e buscar um novo filme
        alert("Função de refinamento ainda não implementada, mas o chat funciona!");
    }

    function bindEventListeners() {
        if(startBtn) startBtn.addEventListener('click',()=>{showScreen(genreScreen);initializeGenreScreen()});
        if(genresNextBtn) genresNextBtn.addEventListener('click',()=>showScreen(profilerScreen));
        if(profilerNextBtn) profilerNextBtn.addEventListener('click',generateAccurateRecommendations);
        if(movieSearchInput) movieSearchInput.addEventListener('keyup',e=>{clearTimeout(debounceTimer);debounceTimer=setTimeout(()=>searchMovies(e.target.value),300)});
        if(selectedMoviesContainer) selectedMoviesContainer.addEventListener('click',e=>{if(e.target.classList.contains("remove-movie")){const movieId=parseInt(e.target.dataset.movieId);removeMovie(movieId)}});
        if(sendBtn) sendBtn.addEventListener('click',()=>handleUserInput(userInput.value));
        if(userInput) userInput.addEventListener('keyup',e=>{"Enter"===e.key&&handleUserInput(userInput.value)});
    }

    bindEventListeners();
});