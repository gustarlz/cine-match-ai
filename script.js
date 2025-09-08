document.addEventListener('DOMContentLoaded', () => {

    const TMDB_API_KEY = '2b27ba02c4646af199efd3e9f6f37dd7';

    // Seletores de Elementos do DOM
    const welcomeScreen = document.getElementById('welcome-screen');
    const genreScreen = document.getElementById('genre-screen');
    const profilerScreen = document.getElementById('profiler-screen');
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

    // Estado da Aplicação
    let userProfile = { genres: [], topMovies: [] };
    let recommendationPool = [];
    let debounceTimer;

    function showScreen(screen) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        screen.classList.add('active');
    }

    function showLoading(show) {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) overlay.classList.toggle('visible', show);
    }

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
                userProfile.genres = userProfile.genres.includes(genreId) ? userProfile.genres.filter(id => id !== genreId) : [...userProfile.genres, genreId];
                genresNextBtn.disabled = userProfile.genres.length === 0;
            });
        });
    }

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
            userProfile.topMovies.push({id: movie.id, title: movie.title});
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
        movieSearchInput.disabled = userProfile.topMovies.length >= 3;
        movieSearchInput.placeholder = userProfile.topMovies.length >= 3 ? 'Sua lista está completa!' : 'Continue digitando...';
    }

    // =========================================================
    // NOVA LÓGICA DE RECOMENDAÇÃO COM KEYWORDS
    // =========================================================
    async function fetchMovieKeywords(movieId) {
        try {
            const response = await fetch(`https://api.themoviedb.org/3/movie/${movieId}/keywords?api_key=${TMDB_API_KEY}`);
            const data = await response.json();
            return data.keywords || [];
        } catch (error) {
            console.error(`Erro ao buscar keywords para o filme ${movieId}:`, error);
            return [];
        }
    }

    async function generateAccurateRecommendations() {
        showLoading(true);
        const movieIds = userProfile.topMovies.map(m => m.id);

        try {
            // 1. Analisar o DNA Cinematográfico
            const keywordPromises = movieIds.map(fetchMovieKeywords);
            const userKeywordsArrays = await Promise.all(keywordPromises);
            const keywordProfile = new Map();
            userKeywordsArrays.flat().forEach(keyword => {
                keywordProfile.set(keyword.id, (keywordProfile.get(keyword.id) || 0) + 1);
            });

            // 2. Criar a Piscina de Candidatos
            const recommendationPromises = movieIds.map(id => 
                fetch(`https://api.themoviedb.org/3/movie/${id}/recommendations?api_key=${TMDB_API_KEY}&language=pt-BR`).then(res => res.json())
            );
            const recommendationResults = await Promise.all(recommendationPromises);
            const combinedPool = recommendationResults.flatMap(result => result.results || []);

            const uniqueIds = new Set();
            let uniquePool = combinedPool.filter(movie => {
                if (uniqueIds.has(movie.id) || movieIds.includes(movie.id)) return false;
                uniqueIds.add(movie.id);
                return true;
            });
            
            // 3. Pontuar os Candidatos
            const scoredPoolPromises = uniquePool.map(async movie => {
                const movieKeywords = await fetchMovieKeywords(movie.id);
                let matchScore = 0;
                movieKeywords.forEach(keyword => {
                    if (keywordProfile.has(keyword.id)) {
                        matchScore += keywordProfile.get(keyword.id); // Adiciona pontos baseados na frequência no perfil do usuário
                    }
                });
                return { ...movie, matchScore };
            });
            const scoredPool = await Promise.all(scoredPoolPromises);

            // 4. Filtrar por Gênero e Ordenar
            let finalPool = scoredPool.filter(movie => 
                movie.genre_ids.some(genreId => userProfile.genres.includes(genreId))
            );
            
            finalPool.sort((a, b) => {
                if (b.matchScore !== a.matchScore) {
                    return b.matchScore - a.matchScore; // Prioriza a pontuação de keywords
                }
                return b.popularity - a.popularity; // Usa popularidade como desempate
            });
            
            recommendationPool = finalPool;

            if (recommendationPool.length > 0) {
                await displayNextRecommendation();
            } else {
                displayError("Não encontramos recomendações com essa combinação. Tente com outros filmes ou gêneros!");
            }

        } catch (error) {
            console.error("Erro ao gerar recomendações:", error);
            displayError("Ocorreu um erro ao buscar suas recomendações. Tente novamente.");
        } finally {
            showLoading(false);
        }
    }
    
    async function displayNextRecommendation() {
        if (recommendationPool.length === 0) {
            const btn = document.getElementById('generate-another-btn');
            if(btn) {
                btn.textContent = "Fim das sugestões!";
                btn.disabled = true;
            }
            return;
        }

        const movie = recommendationPool.shift();
        const trailerUrl = await fetchMovieTrailer(movie.id);
        
        const clone = resultTemplate.content.cloneNode(true);
        clone.querySelector('h2').textContent = movie.title;
        clone.querySelector('p').textContent = movie.overview || 'Sinopse não disponível.';
        clone.querySelector('img').src = movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : 'https://via.placeholder.com/500x750?text=Poster+Indisponível';
        clone.querySelector('img').alt = `Pôster de ${movie.title}`;
        
        const trailerContainer = clone.querySelector('#trailer-container');
        if (trailerUrl) {
            trailerContainer.innerHTML = `<iframe src="${trailerUrl}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
        } else {
            trailerContainer.innerHTML = '<p class="subtitle">Trailer não disponível.</p>';
        }

        resultScreen.innerHTML = '';
        resultScreen.appendChild(clone);
        showScreen(resultScreen);

        const generateAnotherBtn = document.getElementById('generate-another-btn');
        if (generateAnotherBtn) {
            generateAnotherBtn.addEventListener('click', displayNextRecommendation);
        }
    }
    
    function displayError(message) {
        resultScreen.innerHTML = `<div class="card"><h2>${message}</h2><button class="main-action-btn" onclick="location.reload()">Recomeçar</button></div>`;
        showScreen(resultScreen);
    }

    async function fetchMovieTrailer(movieId) {
        try {
            const response = await fetch(`https://api.themoviedb.org/3/movie/${movieId}/videos?api_key=${TMDB_API_KEY}`);
            const data = await response.json();
            const trailers = data.results.filter(video => video.type === 'Trailer' && video.site === 'YouTube');
            if (trailers.length === 0) return null;
            let bestTrailer = trailers.find(t => t.official && t.iso_639_1 === 'en') || trailers.find(t => t.official) || trailers.find(t => t.iso_639_1 === 'en') || trailers[0];
            return `https://www.youtube.com/embed/${bestTrailer.key}`;
        } catch (error) {
            console.error("Erro ao buscar trailer:", error);
            return null;
        }
    }

    function bindEventListeners() {
        if (startBtn) startBtn.addEventListener('click', () => {
            showScreen(genreScreen);
            initializeGenreScreen();
        });
        if (genresNextBtn) genresNextBtn.addEventListener('click', () => showScreen(profilerScreen));
        if (profilerNextBtn) profilerNextBtn.addEventListener('click', generateAccurateRecommendations);
        if (movieSearchInput) movieSearchInput.addEventListener('keyup', (event) => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => searchMovies(event.target.value), 300);
        });
        if (selectedMoviesContainer) selectedMoviesContainer.addEventListener('click', (event) => {
            if (event.target.classList.contains('remove-movie')) {
                const movieId = parseInt(event.target.dataset.movieId);
                removeMovie(movieId);
            }
        });
    }

    bindEventListeners();
});