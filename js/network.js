// ============================================================
// TURMA DO BARALHO — Multiplayer via PeerJS
// ============================================================

class NetworkManager {
  constructor(onMessage, onConnect, onDisconnect) {
    this.peer = null;
    this.conn = null;
    this.myId = null;
    this.isHost = false;
    this.onMessage = onMessage;
    this.onConnect = onConnect;
    this.onDisconnect = onDisconnect;
  }

  // Criar sala (P1 = host)
  createRoom(playerName, onRoomCode) {
    this.isHost = true;
    this.playerName = playerName;

    // Gerar código de 4 letras amigável
    const code = this._generateCode();
    this.peer = new Peer('turma-' + code, {
      debug: 0,
    });

    this.peer.on('open', (id) => {
      this.myId = id;
      onRoomCode(code);
      console.log('Sala criada:', code);
    });

    this.peer.on('connection', (conn) => {
      this.conn = conn;
      this._setupConnection(conn);
    });

    this.peer.on('error', (err) => {
      console.error('PeerJS error:', err);
      if (err.type === 'unavailable-id') {
        // Código já existe, tentar novamente
        this.peer.destroy();
        this.createRoom(playerName, onRoomCode);
      }
    });
  }

  // Entrar em sala (P2 = guest)
  joinRoom(playerName, code, onError) {
    this.isHost = false;
    this.playerName = playerName;
    this.peer = new Peer(undefined, { debug: 0 });

    this.peer.on('open', () => {
      const conn = this.peer.connect('turma-' + code.toUpperCase(), {
        reliable: true,
      });
      this.conn = conn;
      this._setupConnection(conn);

      conn.on('error', (err) => {
        if (onError) onError('Não foi possível conectar. Verifique o código.');
      });

      setTimeout(() => {
        if (!this.conn?.open) {
          if (onError) onError('Sala não encontrada. Verifique o código.');
        }
      }, 5000);
    });

    this.peer.on('error', (err) => {
      console.error(err);
      if (onError) onError('Erro de conexão: ' + err.type);
    });
  }

  // Enviar mensagem ao outro jogador
  send(type, data) {
    if (this.conn?.open) {
      this.conn.send({ type, data, timestamp: Date.now() });
    }
  }

  // Configurar handlers da conexão
  _setupConnection(conn) {
    conn.on('open', () => {
      console.log('Conexão estabelecida!');
      this.onConnect?.();
      // Trocar nomes
      this.send('hello', { name: this.playerName });
    });

    conn.on('data', (msg) => {
      this.onMessage?.(msg);
    });

    conn.on('close', () => {
      this.onDisconnect?.();
    });

    conn.on('error', (err) => {
      console.error('Conn error:', err);
    });
  }

  _generateCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // sem I e O para evitar confusão
    let code = '';
    for (let i = 0; i < 4; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
  }

  disconnect() {
    this.conn?.close();
    this.peer?.destroy();
  }
}

// ============================================================
// TIPOS DE MENSAGENS
// ============================================================
// hello         — apresentação inicial com nome
// game_start    — host envia estado inicial do jogo (host = p1, guest = p2)
// action        — jogador enviou uma ação
// state_sync    — host envia estado autalizado após ação
// chat          — mensagem de chat
// reconnect     — solicitação de reconexão com estado atual
// ============================================================

window.NetworkManager = NetworkManager;
