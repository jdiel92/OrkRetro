// Lógica simples do OrkRetro: feed, curtir, amigos, comunidades e mensagens.
// Comentários em português, nível trainee/Jr.

// Espera DOM pronto
document.addEventListener('DOMContentLoaded', () => {
  // ===== Dados iniciais (mock) =====
  const demoPosts = [
    { id: 'p1', user: 'Ana', avatar: 'https://picsum.photos/id/1005/80/80', text: 'Curtindo o fim de semana!', img: 'https://picsum.photos/id/1011/800/400', likes: 3 },
    { id: 'p2', user: 'Bruno', avatar: 'https://picsum.photos/id/1027/80/80', text: 'Aprendendo JS com projeto retro.', img: '', likes: 1 },
    { id: 'p3', user: 'Carla', avatar: 'https://picsum.photos/id/1035/80/80', text: 'Alguém recomenda um café perto?', img: 'https://picsum.photos/id/1043/800/400', likes: 5 }
  ];

  const demoCommunities = [
    { id: 'c1', name: 'Dev Trainee', members: 128 },
    { id: 'c2', name: 'Fotografia Analógica', members: 542 },
    { id: 'c3', name: 'Música Retrô', members: 210 }
  ];

  // ===== Helpers de storage =====
  function read(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) { return fallback; }
  }
  function write(key, val) { localStorage.setItem(key, JSON.stringify(val)); }

  // Inicializa dados no localStorage se não existirem
  if (!read('ork_posts')) write('ork_posts', demoPosts);
  if (!read('ork_friends')) write('ork_friends', []);
  if (!read('ork_communities')) write('ork_communities', demoCommunities);
  if (!read('ork_messages')) write('ork_messages', []);

  // ===== Feed: renderizar posts =====
  function renderPosts(containerId = 'posts') {
    const postsEl = document.getElementById(containerId);
    if (!postsEl) return;
    const posts = read('ork_posts', []);
    postsEl.innerHTML = ''; // limpa

    // cria cards simples para cada post
    posts.forEach(post => {
      const el = document.createElement('article');
      el.className = 'post';
      el.innerHTML = `
        <div class="meta">
          <img src="${post.avatar}" alt="${post.user}">
          <div>
            <div class="who">${post.user}</div>
            <div class="when">agora</div>
          </div>
        </div>
        <p>${escapeHtml(post.text)}</p>
        ${post.img ? `<img class="post-media" src="${post.img}" alt="imagem do post" />` : ''}
        <div class="post-actions">
          <button class="btn btn-like" data-id="${post.id}">Curtir (<span class="like-count">${post.likes}</span>)</button>
          <button class="btn btn-comment ghost" data-id="${post.id}">Comentar</button>
        </div>
      `;
      postsEl.appendChild(el);
    });

    // adiciona eventos de like
    postsEl.querySelectorAll('.btn-like').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        toggleLike(id, btn);
      });
    });
  }

  // pequena função para evitar XSS ao injetar texto
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }

  // ===== Curtir (incremento simples) =====
  function toggleLike(postId, btnEl) {
    const posts = read('ork_posts', []);
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    // incrementa likes (simples; poderia alternar)
    post.likes = (post.likes || 0) + 1;
    write('ork_posts', posts);
    // atualiza contador visual
    if (btnEl) btnEl.querySelector('.like-count').textContent = post.likes;
  }

  // ===== Publicar novo post (local) =====
  const newPostForm = document.getElementById('new-post-form');
  if (newPostForm) {
    newPostForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const text = document.getElementById('post-text').value.trim();
      if (!text) return alert('Escreva algo antes de publicar.');
      const posts = read('ork_posts', []);
      const novo = {
        id: 'p' + Date.now(),
        user: 'Você',
        avatar: 'https://picsum.photos/id/1062/80/80',
        text,
        img: '',
        likes: 0
      };
      posts.unshift(novo); // adiciona no topo
      write('ork_posts', posts);
      document.getElementById('post-text').value = '';
      renderPosts('posts');
    });
  }

  // ===== Amigos: adicionar/remover e renderizar =====
  function renderFriends() {
    const list = document.getElementById('friend-list');
    if (!list) return;
    const friends = read('ork_friends', []);
    list.innerHTML = '';
    if (friends.length === 0) {
      list.innerHTML = '<li class="muted">Nenhum amigo</li>';
      return;
    }
    friends.forEach(f => {
      const li = document.createElement('li');
      li.innerHTML = `<img src="${f.avatar}" alt="${f.name}"> <span>${escapeHtml(f.name)}</span> <button class="btn small btn-remove-friend" data-id="${f.id}">Remover</button>`;
      list.appendChild(li);
    });
    // remover amigo
    list.querySelectorAll('.btn-remove-friend').forEach(b => {
      b.addEventListener('click', () => {
        const id = b.getAttribute('data-id');
        const friends = read('ork_friends', []).filter(x => x.id !== id);
        write('ork_friends', friends);
        renderFriends();
      });
    });
  }

  // botão de adicionar amigo (no index)
  const toggleFriendBtn = document.getElementById('toggle-friend');
  if (toggleFriendBtn) {
    toggleFriendBtn.addEventListener('click', () => {
      // cria um amigo demo e salva
      const friends = read('ork_friends', []);
      const novo = { id: 'f' + Date.now(), name: 'Amigo ' + (friends.length + 1), avatar: `https://picsum.photos/seed/f${Date.now()}/48/48` };
      friends.push(novo);
      write('ork_friends', friends);
      renderFriends();
    });
  }

  // botão no perfil (se existir) para adicionar/remover
  const profileFriendBtn = document.getElementById('profile-friend-btn');
  if (profileFriendBtn) {
    profileFriendBtn.addEventListener('click', () => {
      const friends = read('ork_friends', []);
      const exists = friends.length > 0;
      if (!exists) {
        friends.push({ id: 'f' + Date.now(), name: 'Novo Amigo', avatar: 'https://picsum.photos/id/1006/48/48' });
        write('ork_friends', friends);
        profileFriendBtn.textContent = 'Amigo adicionado';
      } else {
        write('ork_friends', []);
        profileFriendBtn.textContent = 'Adicionar amigo';
      }
      renderFriends();
    });
  }

  // ===== Comunidades: renderizar e juntar/sair =====
  function renderCommunities() {
    const root = document.getElementById('communities');
    if (!root) return;
    const comms = read('ork_communities', []);
    const joined = read('ork_joined', []);
    root.innerHTML = '';
    comms.forEach(c => {
      const el = document.createElement('div');
      el.className = 'community';
      const joinedState = joined.includes(c.id);
      el.innerHTML = `<h3>${escapeHtml(c.name)}</h3><p>${c.members} membros</p><button class="btn small btn-join" data-id="${c.id}">${joinedState ? 'Sair' : 'Entrar'}</button>`;
      root.appendChild(el);
    });
    root.querySelectorAll('.btn-join').forEach(b => {
      b.addEventListener('click', () => {
        const id = b.getAttribute('data-id');
        let joined = read('ork_joined', []);
        if (joined.includes(id)) joined = joined.filter(x => x !== id);
        else joined.push(id);
        write('ork_joined', joined);
        renderCommunities();
      });
    });
  }

  // ===== Mensagens (mock local) =====
  const msgForm = document.getElementById('message-form');
  function renderMessages() {
    const list = document.getElementById('message-list');
    if (!list) return;
    const msgs = read('ork_messages', []);
    list.innerHTML = '';
    if (msgs.length === 0) list.innerHTML = '<p class="muted">Sem mensagens</p>';
    msgs.forEach(m => {
      const div = document.createElement('div');
      div.className = 'message';
      div.innerHTML = `<strong>${escapeHtml(m.to)}</strong><p>${escapeHtml(m.text)}</p><small>${new Date(m.ts).toLocaleString()}</small>`;
      list.appendChild(div);
    });
  }
  if (msgForm) {
    msgForm.addEventListener('submit', e => {
      e.preventDefault();
      const to = document.getElementById('message-to').value.trim();
      const text = document.getElementById('message-text').value.trim();
      if (!to || !text) return alert('Preencha destinatário e mensagem.');
      const msgs = read('ork_messages', []);
      msgs.unshift({ to, text, ts: Date.now() });
      write('ork_messages', msgs);
      document.getElementById('message-to').value = '';
      document.getElementById('message-text').value = '';
      renderMessages();
    });
  }

  // ===== Inicialização: renderizações iniciais =====
  renderPosts();
  renderFriends();
  renderCommunities();
  renderMessages();

  // Se estivermos na profile page, copia posts do usuário
  const profilePostsContainer = document.getElementById('profile-posts');
  if (profilePostsContainer) {
    // filtra posts do usuário 'Você' (simulado)
    const posts = read('ork_posts', []).filter(p => p.user === 'Você');
    profilePostsContainer.innerHTML = '';
    posts.forEach(p => {
      const d = document.createElement('div');
      d.className = 'post';
      d.innerHTML = `<p>${escapeHtml(p.text)}</p><small>${new Date().toLocaleString()}</small>`;
      profilePostsContainer.appendChild(d);
    });
  }

  // atualiza nome do usuário no sidebar se existir
  const userNameEl = document.getElementById('user-name');
  if (userNameEl) userNameEl.textContent = 'Você (treinee)';

}); // fim DOMContentLoaded