// ============================================================
// TURMA DO BARALHO — Motor do Jogo
// ============================================================

const { buildDeck, shuffle, generateId } = window.CARDS_DATA;

// ── Estado inicial de um jogador ───────────────────────────
function createPlayerState(id, name, deckType) {
  const deck = shuffle(buildDeck(deckType));
  return {
    id,
    name,
    deckType,
    deck,
    hand: [],
    active: null,       // carta de personagem ativo no campo
    bench: [],          // até 3 personagens no banco
    prizeCards: [],     // 3 cartas de prêmio
    discardPile: [],
    // flags de turno
    energyAttachedThisTurn: false,
    supporterUsedThisTurn: false,
    itemsUsedThisTurn: 0,
    abilityUsedThisTurn: false,
    hasAttackedThisTurn: false,
    // efeitos temporários
    nextAttackBonus: 0,
    reflectNextTurn: false,
    skipDrawNextTurn: false,
    noItemsNextTurn: false,
    noSupporterThisTurn: false,
    cantRetreatNextTurn: false,
  };
}

// ── Estado global do jogo ──────────────────────────────────
function createGameState(p1Name, p1Deck, p2Name, p2Deck) {
  const p1 = createPlayerState('p1', p1Name, p1Deck);
  const p2 = createPlayerState('p2', p2Name, p2Deck);

  // Distribuir mão inicial (5 cartas) + 3 prêmios
  setupInitialHand(p1);
  setupInitialHand(p2);

  return {
    phase: 'p1_turn',   // p1_turn | p2_turn | ended
    turn: 1,
    activePlayer: 'p1',
    firstTurn: true,
    winner: null,
    stadium: null,      // carta de estádio em campo
    log: [],
    pendingEffect: null, // efeito aguardando input do jogador
    noItemsThisTurn: false,
    p1,
    p2,
  };
}

function setupInitialHand(player) {
  // Garante pelo menos 1 básico na mão
  let attempts = 0;
  do {
    player.hand = player.deck.splice(0, 5);
    player.deck = shuffle([...player.deck, ...player.hand.filter(c => !isBasicCharacter(c))]);
    player.hand = player.hand.filter(isBasicCharacter);
    const remaining = player.deck.splice(0, 5 - player.hand.length);
    player.hand = [...player.hand, ...remaining];
    attempts++;
  } while (!player.hand.some(isBasicCharacter) && attempts < 5);

  // Separar 3 cartas de prêmio do baralho
  player.prizeCards = player.deck.splice(0, 3);
}

function isBasicCharacter(card) {
  return card.cardType === 'CHARACTER' && card.stage === 'BASIC';
}

// ── Helpers ────────────────────────────────────────────────
function getPlayer(state, id) { return state[id]; }
function getOpponent(state, id) { return state[id === 'p1' ? 'p2' : 'p1']; }

function addLog(state, msg) {
  state.log = [{ text: msg, turn: state.turn }, ...state.log.slice(0, 49)];
}

function coinFlip() { return Math.random() < 0.5 ? 'heads' : 'tails'; }

// ── Condições Especiais no personagem ativo ────────────────
// status: { poisoned, burned, asleep, confused, paralyzed }
function applyStatus(pokemon, status) {
  if (!pokemon.status) pokemon.status = {};
  pokemon.status[status] = true;
}

function clearStatus(pokemon) {
  pokemon.status = {};
}

// ── Dano e cura ────────────────────────────────────────────
function dealDamage(pokemon, amount) {
  if (amount <= 0) return;
  pokemon.damage = (pokemon.damage || 0) + amount;
}

function healDamage(pokemon, amount) {
  pokemon.damage = Math.max(0, (pokemon.damage || 0) - amount);
  // Não cura marcadores permanentes (Traço Permanente de Caio Tatuador)
}

function isKnockedOut(pokemon) {
  return (pokemon.damage || 0) >= pokemon.hp;
}

// ── Início do turno ────────────────────────────────────────
function startTurn(state) {
  const player = state[state.activePlayer];
  const opponent = getOpponent(state, state.activePlayer);

  // Resetar flags do turno
  player.energyAttachedThisTurn = false;
  player.supporterUsedThisTurn = false;
  player.itemsUsedThisTurn = 0;
  player.abilityUsedThisTurn = false;
  player.hasAttackedThisTurn = false;
  player.noSupporterThisTurn = false;

  // Efeito Quarto do Caio
  if (state.stadium?.effect === 'stadium_quarto') {
    player.noSupporterThisTurn = true;
  }

  // Sem itens por bloqueio (Greve Geral)
  state.noItemsThisTurn = player.noItemsNextTurn;
  player.noItemsNextTurn = false;

  // Comprar carta (exceto se bloqueado)
  if (!player.skipDrawNextTurn) {
    drawCards(state, state.activePlayer, 1);
    // Bar do Gustavin: compra extra + 10 de dano
    if (state.stadium?.effect === 'stadium_bar' && player.active) {
      drawCards(state, state.activePlayer, 1);
      dealDamage(player.active, 10);
      addLog(state, `🍺 Bar do Gustavin: ${player.name} comprou carta extra e sofreu 10 de dano!`);
    }
  } else {
    player.skipDrawNextTurn = false;
    addLog(state, `😴 ${player.name} perdeu a compra desta rodada!`);
  }

  // Checape entre turnos: veneno, queimadura, sítio
  pokemonCheck(state, state.activePlayer);

  addLog(state, `🎴 Turno ${state.turn} — vez de ${player.name}`);

  return state;
}

// ── Checape Pokémon (entre turnos) ────────────────────────
function pokemonCheck(state, playerId) {
  const player = state[playerId];
  if (!player.active) return;

  const poke = player.active;

  // Veneno
  if (poke.status?.poisoned) {
    dealDamage(poke, 10);
    addLog(state, `☠️ ${poke.name} sofreu 10 de dano do veneno!`);
  }

  // Queimado: 20 de dano, joga moeda para curar
  if (poke.status?.burned) {
    dealDamage(poke, 20);
    addLog(state, `🔥 ${poke.name} sofreu 20 de dano da queimadura!`);
    const flip = coinFlip();
    if (flip === 'heads') {
      delete poke.status.burned;
      addLog(state, `🎲 Cara! ${poke.name} se recuperou da queimadura.`);
    }
  }

  // Adormecido: joga moeda para acordar
  if (poke.status?.asleep) {
    const flip = coinFlip();
    if (flip === 'heads') {
      delete poke.status.asleep;
      addLog(state, `🎲 Cara! ${poke.name} acordou!`);
    } else {
      addLog(state, `💤 ${poke.name} continua dormindo...`);
    }
  }

  // Paralisado: cura no checape
  if (poke.status?.paralyzed) {
    delete poke.status.paralyzed;
    addLog(state, `⚡ ${poke.name} se recuperou da paralisia.`);
  }

  // Sítio do Fael: cura 10 para 🌿
  if (state.stadium?.effect === 'stadium_sitio' && poke.energyType === 'weed') {
    healDamage(poke, 10);
    addLog(state, `🌾 Sítio do Fael: ${poke.name} curou 10 de dano!`);
  }

  // Cheiro de Churrasco (Fael básico no banco)
  const hasFaelInBench = player.bench.some(b => b.id === 'fael');
  if (hasFaelInBench) {
    player.bench.forEach(b => {
      if (b.damage > 0) {
        healDamage(b, 10);
      }
    });
  }

  // Verificar nocaute após checape
  checkKnockout(state, playerId);
}

// ── Comprar cartas ─────────────────────────────────────────
function drawCards(state, playerId, amount) {
  const player = state[playerId];
  for (let i = 0; i < amount; i++) {
    if (player.deck.length === 0) {
      // Sem cartas = derrota
      endGame(state, playerId === 'p1' ? 'p2' : 'p1', 'deck_empty');
      return;
    }
    player.hand.push(player.deck.shift());
  }
}

// ── Colocar básico no banco ────────────────────────────────
function playBasicToBench(state, playerId, cardInstanceId) {
  const player = state[playerId];
  if (player.bench.length >= 3) {
    return { error: 'Banco cheio (máx. 3)!' };
  }
  const idx = player.hand.findIndex(c => c.instanceId === cardInstanceId);
  if (idx === -1) return { error: 'Carta não encontrada na mão.' };
  const card = player.hand[idx];
  if (card.cardType !== 'CHARACTER' || card.stage !== 'BASIC') {
    return { error: 'Só Pokémon Básicos podem ser colocados no Banco.' };
  }
  player.hand.splice(idx, 1);
  card.damage = 0;
  card.attachedEnergies = [];
  card.status = {};
  player.bench.push(card);
  addLog(state, `➕ ${player.name} colocou ${card.name} no Banco.`);
  return { success: true };
}

// ── Colocar ativo (setup inicial) ──────────────────────────
function playActiveFromHand(state, playerId, cardInstanceId) {
  const player = state[playerId];
  if (player.active) return { error: 'Já tem um Pokémon Ativo.' };
  const idx = player.hand.findIndex(c => c.instanceId === cardInstanceId);
  if (idx === -1) return { error: 'Carta não encontrada.' };
  const card = player.hand[idx];
  if (card.cardType !== 'CHARACTER' || card.stage !== 'BASIC') {
    return { error: 'Só Pokémon Básicos podem ser o Ativo inicial.' };
  }
  player.hand.splice(idx, 1);
  card.damage = 0;
  card.attachedEnergies = [];
  card.status = {};
  player.active = card;
  addLog(state, `⚔️ ${player.name} colocou ${card.name} no Campo Ativo.`);
  return { success: true };
}

// ── Ligar Energia ──────────────────────────────────────────
function attachEnergy(state, playerId, energyInstanceId, targetInstanceId) {
  const player = state[playerId];
  if (player.energyAttachedThisTurn) {
    return { error: 'Você só pode ligar 1 Energia por turno.' };
  }
  const energyIdx = player.hand.findIndex(c => c.instanceId === energyInstanceId);
  if (energyIdx === -1) return { error: 'Energia não encontrada na mão.' };
  const energy = player.hand[energyIdx];
  if (energy.cardType !== 'ENERGY') return { error: 'Esta carta não é uma Energia.' };

  // Encontrar alvo (ativo ou banco)
  let target = null;
  if (player.active?.instanceId === targetInstanceId) {
    target = player.active;
  } else {
    target = player.bench.find(b => b.instanceId === targetInstanceId);
  }
  if (!target) return { error: 'Alvo não encontrado.' };

  player.hand.splice(energyIdx, 1);
  if (!target.attachedEnergies) target.attachedEnergies = [];
  target.attachedEnergies.push(energy);
  player.energyAttachedThisTurn = true;
  addLog(state, `⚡ ${player.name} ligou ${energy.icon} ${energy.name} a ${target.name}.`);
  return { success: true };
}

// ── Verificar se tem energia suficiente para o ataque ─────
function hasEnoughEnergy(pokemon, attack) {
  if (!pokemon.attachedEnergies) return attack.cost.length === 0;
  const available = {};
  pokemon.attachedEnergies.forEach(e => {
    available[e.type] = (available[e.type] || 0) + 1;
    available['colorless'] = (available['colorless'] || 0) + 1;
  });
  const needed = {};
  attack.cost.forEach(c => { needed[c] = (needed[c] || 0) + 1; });

  // Checar específicos primeiro
  for (const [type, count] of Object.entries(needed)) {
    if (type === 'colorless') continue;
    const have = pokemon.attachedEnergies.filter(e => e.type === type).length;
    if (have < count) return false;
  }
  // Checar incolor (qualquer tipo)
  if (needed['colorless']) {
    const usedSpecific = Object.entries(needed).filter(([t]) => t !== 'colorless').reduce((s, [, v]) => s + v, 0);
    const totalHave = (pokemon.attachedEnergies || []).length;
    if (totalHave < usedSpecific + needed['colorless']) return false;
  }
  return true;
}

// ── Executar Ataque ────────────────────────────────────────
function executeAttack(state, playerId, attackId) {
  if (state.activePlayer !== playerId) return { error: 'Não é sua vez.' };
  const player = state[playerId];
  const opponent = getOpponent(state, playerId);

  if (player.hasAttackedThisTurn) return { error: 'Você já atacou neste turno.' };
  if (state.firstTurn && playerId === 'p1') return { error: 'O primeiro jogador não pode atacar no 1º turno.' };
  if (!player.active) return { error: 'Você não tem um Pokémon Ativo.' };
  if (!opponent.active) return { error: 'Oponente não tem um Pokémon Ativo.' };

  const poke = player.active;
  const target = opponent.active;

  // Condição especial: adormecido ou paralisado não pode atacar
  if (poke.status?.asleep) return { error: `${poke.name} está Adormecido e não pode atacar!` };
  if (poke.status?.paralyzed) return { error: `${poke.name} está Paralisado e não pode atacar!` };

  // Confuso: joga moeda
  if (poke.status?.confused) {
    const flip = coinFlip();
    addLog(state, `🌀 ${poke.name} está Confuso! Joga moeda... ${flip === 'heads' ? '👑 Cara — ataca normalmente!' : '🪙 Coroa — confusão! 30 de dano em si mesmo.'}`);
    if (flip === 'tails') {
      dealDamage(poke, 30);
      player.hasAttackedThisTurn = true;
      checkKnockout(state, playerId);
      endTurn(state);
      return { success: true, flipped: 'tails' };
    }
  }

  const attack = poke.attacks.find(a => a.id === attackId);
  if (!attack) return { error: 'Ataque não encontrado.' };
  if (!hasEnoughEnergy(poke, attack)) return { error: `Energia insuficiente para ${attack.name}.` };

  // Calcular dano base
  let damage = attack.damage;

  // Bônus de habilidade (Dialética do iPhone)
  if (poke.ability?.name === 'Dialética do iPhone' && player.abilityUsedThisTurn) {
    damage += player.nextAttackBonus || 0;
    player.nextAttackBonus = 0;
  }

  // Estádio Praia do Túlio: +20 para quânticos
  if (state.stadium?.effect === 'stadium_praia' && poke.energyType === 'quantum') {
    damage += 20;
  }

  // Fraqueza
  if (target.weakness?.type === poke.energyType) {
    damage *= target.weakness.multiplier || 2;
    addLog(state, `💥 Fraqueza! Dano dobrado!`);
  }

  // Resistência (ignorada por Gustavin Bêbado)
  const ignoreResistance = poke.ability?.name === 'Sem Filtro';
  if (!ignoreResistance && target.resistance?.type === poke.energyType) {
    damage -= target.resistance.value || 30;
    if (damage < 0) damage = 0;
  }

  // Efeito reflexo (Projeção de Túlio Psicólogo)
  if (opponent.reflectNextTurn) {
    opponent.reflectNextTurn = false;
    dealDamage(poke, damage);
    addLog(state, `🪞 Projeção! ${player.name} sofreu ${damage} de dano de volta!`);
    player.hasAttackedThisTurn = true;
    checkKnockout(state, playerId);
    endTurn(state);
    return { success: true };
  }

  // Aplicar efeitos do ataque
  applyAttackEffect(state, playerId, attack, damage);

  player.hasAttackedThisTurn = true;

  // Verificar nocautes
  checkKnockout(state, getOpponentId(playerId));
  checkKnockout(state, playerId);

  if (!state.winner) {
    endTurn(state);
  }
  return { success: true };
}

// ── Aplicar efeitos dos ataques ────────────────────────────
function applyAttackEffect(state, playerId, attack, damage) {
  const player = state[playerId];
  const oppId = getOpponentId(playerId);
  const opponent = state[oppId];
  const poke = player.active;
  const target = opponent.active;

  const addDmg = () => {
    if (damage > 0) {
      dealDamage(target, damage);
      addLog(state, `⚔️ ${player.name} usou ${attack.name} — ${damage} de dano em ${target.name}!`);
    }
  };

  switch (attack.effect) {
    case 'flip_discard_opponent': {
      addDmg();
      const flip = coinFlip();
      addLog(state, `🎲 ${flip === 'heads' ? 'Cara! Oponente descarta 1 carta.' : 'Coroa. Sem efeito.'}`);
      if (flip === 'heads' && opponent.hand.length > 0) {
        const idx = Math.floor(Math.random() * opponent.hand.length);
        const discarded = opponent.hand.splice(idx, 1)[0];
        opponent.discardPile.push(discarded);
        addLog(state, `🗑️ ${opponent.name} descartou ${discarded.name}!`);
      }
      break;
    }
    case 'self_confused':
      addDmg();
      applyStatus(poke, 'confused');
      addLog(state, `🌀 ${poke.name} ficou Confuso!`);
      break;

    case 'skip_draw_opponent':
      addDmg();
      opponent.skipDrawNextTurn = true;
      addLog(state, `😴 ${opponent.name} não poderá comprar carta no próximo turno!`);
      break;

    case 'no_items_next_turn':
      addDmg();
      player.noItemsNextTurn = true;
      opponent.noItemsNextTurn = true;
      addLog(state, `🚫 Greve Geral! Nenhum jogador pode usar Itens no próximo turno!`);
      break;

    case 'poison_opponent':
      addDmg();
    0 applyStatus(target, 'poisoned');
      addLog(state, `☠️ ${target.name} ficou Envenenado!`);
      break;

    case 'discard_own_energy': {
      addDmg();
      if (poke.attachedEnergies?.length > 0) {
        const e = poke.attachedEnergies.pop();
        player.discardPile.push(e);
        addLog(state, `⬇️ ${poke.name} descartou 1 energia ${e.icon}.`);
      }
      break;
    }

    case 'damage_bench_20': {
      addDmg();
      // Escolher um alvo do banco do oponente automaticamente (primeiro disponível)
      if (opponent.bench.length > 0) {
        dealDamage(opponent.bench[0], 20);
        addLog(state, `💥 ${opponent.bench[0].name} no banco sofreu 20 de dano!`);
      }
      break;
    }

    case 'heal_ally_bench_40':
      addDmg();
      if (player.bench.length > 0) {
        healDamage(player.bench[0], 40);
        addLog(state, `💚 ${player.bench[0].name} no banco curou 40 de dano!`);
      }
      break;

    case 'extra_if_less_hp': {
      let dmg = damage;
      if (target.hp > poke.hp) dmg += 20;
      dealDamage(target, dmg);
      addLog(state, `⚔️ ${player.name} usou ${attack.name} — ${dmg} de dano!`);
      break;
    }

    case 'self_asleep':
      addDmg();
      applyStatus(poke, 'asleep');
      addLog(state, `💤 ${poke.name} ficou Adormecido!`);
      break;

    case 'flip_paralyze_opponent': {
      addDmg();
      const flip = coinFlip();
      addLog(state, `🎲 ${flip === 'heads' ? 'Cara! Oponente não pode recuar no próximo turno.' : 'Coroa. Sem efeito.'}`);
      if (flip === 'heads') opponent.cantRetreatNextTurn = true;
      break;
    }

    case 'flip_confuse_opponent': {
      addDmg();
      const flip = coinFlip();
      addLog(state, `🎲 ${flip === 'heads' ? 'Cara! Oponente ficou Confuso.' : 'Coroa. Sem efeito.'}`);
      if (flip === 'heads') applyStatus(target, 'confused');
      break;
    }

    case 'self_retreat_after':
      addDmg();
      addLog(state, `👩 A esposa ligou! ${poke.name} vai pro Banco.`);
      state.pendingEffect = { type: 'auto_retreat', playerId };
      break;

    case 'draw_2':
      addDmg();
      drawCards(state, playerId, 2);
      addLog(state, `🃏 ${player.name} comprou 2 cartas!`);
      break;

    case 'flip_extra_or_self_damage': {
      const flip = coinFlip();
      addLog(state, `🎲 ${flip === 'heads' ? 'Cara! +40 de dano!' : 'Coroa. João sofre 30 de dano.'}`);
      if (flip === 'heads') {
        dealDamage(target, damage + 40);
        addLog(state, `⚔️ ${player.name} usou ${attack.name} — ${damage + 40} de dano!`);
      } else {
        dealDamage(target, damage);
        dealDamage(poke, 30);
        addLog(state, `⚔️ ${player.name} usou ${attack.name} — ${damage} de dano e ${poke.name} sofreu 30!`);
      }
      break;
    }

    case 'extra_if_special_condition': {
      let dmg = damage;
      if (target.status && Object.keys(target.status).length > 0) dmg += 50;
      dealDamage(target, dmg);
      addLog(state, `⚔️ ${player.name} usou ${attack.name} — ${dmg} de dano!`);
      break;
    }

    case 'draw2_self_damage20':
      addDmg();
      drawCards(state, playerId, 2);
      dealDamage(poke, 20);
      addLog(state, `🃏 Comprou 2 cartas e sofreu 20 de dano.`);
      break;

    case 'flip2_self_damage':
    case 'flip3_self_damage30each': {
      addDmg();
      const flips = attack.effect === 'flip2_self_damage' ? 2 : 3;
      const dmgPerTail = attack.effect === 'flip2_self_damage' ? 20 : 30;
      let selfDmg = 0;
      for (let i = 0; i < flips; i++) {
        const f = coinFlip();
        addLog(state, `🎲 Moeda ${i + 1}: ${f === 'heads' ? 'Cara' : 'Coroa' + ` → ${poke.name} sofreu ${dmgPerTail}!`}`);
        if (f === 'tails') selfDmg += dmgPerTail;
      }
      if (selfDmg > 0) dealDamage(poke, selfDmg);
      break;
    }

    case 'self_paralyzed':
      addDmg();
      applyStatus(poke, 'paralyzed');
      addLog(state, `⚡ ${poke.name} ficou Paralisado!`);
      break;

    case 'extra_if_opponent_used_trainer': {
      let dmg = damage;
      if (opponent.usedTrainerThisTurn) dmg += 30;
      dealDamage(target, dmg);
      addLog(state, `⚔️ ${player.name} usou ${attack.name} — ${dmg} de dano!`);
      break;
    }

    case 'send_opponent_card_to_bottom':
    0 addDmg();
      state.pendingEffect = { type: 'choose_opponent_hand', playerId, action: 'send_to_bottom' };
      break;

    case 'view_hand_choose_discard_or_draw':
      addDmg();
      state.pendingEffect = { type: 'choose_opponent_hand', playerId, action: 'discard_or_draw' };
      break;

  0 case 'reflect_damage_next_turn':
      addDmg();
      player.reflectNextTurn = true;
      addLog(state, `🪞 Projeção ativa! Próximo dano sofrido por ${player.name} é refletido.`);
      break;

    case 'draw_energy_attach': {
      addDmg();
      drawCards(state, playerId, 1);
      const drawn = player.hand[player.hand.length - 1];
      if (drawn?.cardType === 'ENERGY') {
        player.hand.pop();
        if (!poke.attachedEnergies) poke.attachedEnergies = [];
        poke.attachedEnergies.push(drawn);
        addLog(state, `⚡ Jeff ligou ${drawn.name} direto em si mesmo!`);
  0   }
      break;
    }

    case 'discard_opponent_energy': {
      addDmg();
      const targets = [opponent.active, ...opponent.bench].filter(Boolean);
      const withEnergy = targets.filter(t => t.attachedEnergies?.length > 0);
      if (withEnergy.length > 0) {
        const t = withEnergy[0];
        const e = t.attachedEnergies.pop();
        opponent.discardPile.push(e);
        addLog(state, `💸 ${t.name} perdeu 1 energia ${e.icon}!`);
      }
      break;
    }

    case 'flip_discard_or_draw': {
      addDmg();
      const flip = coinFlip();
      addLog(state, `🎲 ${flip === 'heads' ? 'Cara! Oponente descarta 2 Energias.' : 'Coroa. Jeff compra 1 carta.'}`);
      if (flip === 'heads') {
        [opponent.active, ...opponent.bench].filter(Boolean).forEach(t => {
          if (t.attachedEnergies?.length > 0) {
            const e = t.attachedEnergies.pop();
            opponent.discardPile.push(e);
          }
        });
      } else {
        drawCards(state, playerId, 1);
      }
      break;
    }

    case 'discard_opponent_trainer_hand': {
      addDmg();
      const trainerIdx = opponent.hand.findIndex(c => c.cardType === 'TRAINER');
      if (trainerIdx !== -1) {
        const t = opponent.hand.splice(trainerIdx, 1)[0];
        opponent.discardPile.push(t);
        addLog(state, `🗑️ ${opponent.name} descartou ${t.name}!`);
      }
      break;
    }

    case 'confuse_opponent':
      addDmg();
      applyStatus(target, 'confused');
      addLog(state, `🌀 ${target.name} ficou Confuso!`);
      break;

    case 'flip_fail': {
      const flip = coinFlip();
      addLog(state, `🎲 ${flip === 'heads' ? 'Cara! Ataque acontece!' : 'Coroa. O produto não chegou. Ataque falhou.'}`);
      if (flip === 'heads') {
        dealDamage(target, damage);
        addLog(state, `⚔️ ${player.name} usou ${attack.name} — ${damage} de dano!`);
      }
      break;
    }

    case 'force_play_or_discard':
      addDmg();
      state.pendingEffect = { type: 'force_opponent_play_or_discard', playerId: oppId };
      break;

    case 'burn_opponent':
      addDmg();
      applyStatus(target, 'burned');
      addLog(state, `🔥 ${target.name} ficou Queimado!`);
      break;

    default:
      addDmg();
  }
}

// ── Usar Habilidade ────────────────────────────────────────
function useAbility(state, playerId, targetInfo) {
  const player = state[playerId];
  if (player.abilityUsedThisTurn) return { error: 'Habilidade já usada neste turno.' };
  if (!player.active) return { error: 'Sem Pokémon Ativo.' };
  const poke = player.active;
  const oppId = getOpponentId(playerId);
  const opponent = state[oppId];

  switch (poke.ability?.trigger) {
    case 'active_ability': {
      player.abilityUsedThisTurn = true;
      switch (poke.ability.name) {
        case 'Dialética do iPhone':
          if (player.hand.length > opponent.hand.length) {
            player.nextAttackBonus = 20;
            addLog(state, `📱 GC ativou Dialética do iPhone! Próximo ataque +20 de dano.`);
          } else {
            addLog(state, `📱 GC tentou Dialética do iPhone, mas não tem mais cartas que o oponente.`);
          }
          break;
        case 'Defesa Técnica':
          state.pendingEffect = { type: 'peek_and_discard', playerId };
          addLog(state, `⚖️ Conrado ativou Defesa Técnica! Escolha uma carta da mão do oponente.`);
          break;
        case 'Manipulação Psicológica':
          state.pendingEffect = { type: 'peek_opponent_hand', playerId };
          addLog(state, `🧠 Túlio ativou Manipulação Psicológica! Veja a mão do oponente.`);
          break;
        case 'Golpe Holístico':
          state.pendingEffect = { type: 'peek_opponent_deck_3', playerId };
          addLog(state, `✨ Jeff ativou Golpe Holístico! Veja as 3 primeiras cartas do baralho do oponente.`);
          break;
        case 'Stories Patrocinados':
          state.pendingEffect = { type: 'peek_own_top', playerId };
          addLog(state, `📊 Gustavin ativou Stories Patrocinados!`);
          break;
        case 'Consciência Expandida':
          state.pendingEffect = { type: 'return_and_draw', playerId };
          addLog(state, `✨ Jeff Iluminado ativou Consciência Expandida!`);
          break;
        case 'Habeas Corpus':
          if (targetInfo?.targetId) {
            const t = findCharacter(state, playerId, targetInfo.targetId);
            if (t) { clearStatus(t); addLog(state, `⚖️ Habeas Corpus! Condições de ${t.name} removidas.`); }
          }
          break;
        case 'Transferência':
          state.pendingEffect = { type: 'transfer_energy', playerId };
          addLog(state, `🔀 Túlio Psicólogo ativou Transferência! Escolha a energia a mover.`);
          break;
        case 'Vanguarda Contraditória':
          addLog(state, `☭ GC Manifesto copiou a última habilidade usada!`);
          break;
        default:
          break;
      }
      return { success: true };
    }
    default:
      return { error: 'Esta habilidade não pode ser ativada manualmente.' };
  }
}

// ── Recuar ─────────────────────────────────────────────────
function retreat(state, playerId, benchTargetInstanceId) {
  const player = state[playerId];
  if (!player.active) return { error: 'Sem Pokémon Ativo.' };
  if (player.cantRetreatNextTurn) return { error: 'Seu Pokémon Ativo não pode recuar agora!' };

  const poke = player.active;
  let cost = poke.retreatCost;

  // Impossível recuar (custo 99)
  if (cost >= 99) return { error: `${poke.name} não pode recuar!` };

  // Sítio do Fael: reduz 1 de recuo para 🌿
  if (state.stadium?.effect === 'stadium_sitio' && poke.energyType === 'weed') {
    cost = Math.max(0, cost - 1);
  }

  // Verificar energias suficientes
  if ((poke.attachedEnergies?.length || 0) < cost) {
    return { error: `Energia insuficiente para recuar (precisa de ${cost}).` };
  }

  const benchIdx = player.bench.findIndex(b => b.instanceId === benchTargetInstanceId);
  if (benchIdx === -1) return { error: 'Alvo do Banco não encontrado.' };

  // Descartar energias de recuo
  for (let i = 0; i < cost; i++) {
    const e = poke.attachedEnergies.pop();
    player.discardPile.push(e);
  }

  // Trocar
  const newActive = player.bench.splice(benchIdx, 1)[0];
  clearStatus(poke); // Condições especiais são curadas ao recuar
  player.bench.push(poke);
  player.active = newActive;

  addLog(state, `🔄 ${player.name} recuou ${poke.name} e colocou ${newActive.name} no Campo Ativo.`);
  return { success: true };
}

// ── Evoluir ────────────────────────────────────────────────
function evolve(state, playerId, baseInstanceId, evolvedCardInstanceId) {
  const player = state[playerId];
  const evolvedIdx = player.hand.findIndex(c => c.instanceId === evolvedCardInstanceId);
  if (evolvedIdx === -1) return { error: 'Carta de evolução não encontrada na mão.' };
  const evolved = player.hand[evolvedIdx];
  if (evolved.cardType !== 'CHARACTER' || evolved.stage !== 'STAGE1') {
    return { error: 'Carta não é uma evolução.' };
  }

  // Encontrar o básico a evoluir
  let base = null;
  let inActive = false;
  if (player.active?.instanceId === baseInstanceId) {
    base = player.active;
    inActive = true;
  } else {
    base = player.bench.find(b => b.instanceId === baseInstanceId);
  }
  if (!base) return { error: 'Pokémon base não encontrado.' };
  if (evolved.evolvesFrom !== base.id) {
    return { error: `${evolved.name} não evolui de ${base.name}.` };
  }

  // Aplicar evolução: manter energias e dano
  player.hand.splice(evolvedIdx, 1);
  evolved.damage = base.damage || 0;
  evolved.attachedEnergies = base.attachedEnergies || [];
  evolved.status = {}; // limpa condições especiais
  evolved.permanentDamage = base.permanentDamage || 0;

  player.discardPile.push({ ...base, attachedEnergies: [], damage: 0 });

  if (inActive) {
    player.active = evolved;
  } else {
    const idx = player.bench.findIndex(b => b.instanceId === baseInstanceId);
    player.bench[idx] = evolved;
  }

  // Habilidade on_enter
  if (evolved.ability?.trigger === 'on_enter') {
    if (evolved.ability.name === 'Push na Main') {
      drawCards(state, playerId, 2);
      addLog(state, `🚀 Push na Main! ${player.name} comprou 2 cartas.`);
    }
  }

  addLog(state, `✨ ${player.name} evoluiu ${base.name} para ${evolved.name}!`);
  return { success: true };
}

// ── Usar Carta de Treinador ────────────────────────────────
function playTrainer(state, playerId, trainerInstanceId, targetInfo) {
  const player = state[playerId];
  const oppId = getOpponentId(playerId);
  const opponent = state[oppId];
  const idx = player.hand.findIndex(c => c.instanceId === trainerInstanceId);
  if (idx === -1) return { error: 'Carta não encontrada na mão.' };
  const trainer = player.hand[idx];
  if (trainer.cardType !== 'TRAINER') return { error: 'Carta não é um Treinador.' };

  // Apoiador: 1 por turno
  if (trainer.trainerType === 'SUPPORTER') {
    if (player.supporterUsedThisTurn) return { error: 'Você já usou um Apoiador neste turno.' };
    if (player.noSupporterThisTurn) return { error: 'Você não pode usar Apoiadores neste turno (Quarto do Caio ou Silêncio Intimidador).' };
  }

  // Item: bloqueado por Greve Geral ou Escritório
  if (trainer.trainerType === 'ITEM') {
    if (state.noItemsThisTurn) return { error: 'Greve Geral! Sem Itens neste turno.' };
    if (state.stadium?.effect === 'stadium_escritorio' && player.itemsUsedThisTurn >= 1) {
      return { error: 'Escritório do Dr. Conrado: máximo 1 Item por turno.' };
    }
  }

  // Caio Barreto: oponente não pode usar Apoiador no turno que atacar
  if (trainer.trainerType === 'SUPPORTER' && opponent.active?.ability?.name === 'Silêncio Intimidador') {
    if (opponent.hasAttackedThisTurn) {
      return { error: 'Silêncio Intimidador! Caio bloqueou o uso de Apoiadores neste turno.' };
    }
  }

  player.hand.splice(idx, 1);
  player.usedTrainerThisTurn = true;
  if (trainer.trainerType === 'SUPPORTER') player.supporterUsedThisTurn = true;
  if (trainer.trainerType === 'ITEM') player.itemsUsedThisTurn++;

  // Executar efeito
  const result = applyTrainerEffect(state, playerId, trainer, targetInfo);

  if (trainer.trainerType !== 'STADIUM') {
    player.discardPile.push(trainer);
  }

  addLog(state, `🃏 ${player.name} jogou ${trainer.icon} ${trainer.name}.`);
  return result;
}

function applyTrainerEffect(state, playerId, trainer, targetInfo) {
  const player = state[playerId];
  const oppId = getOpponentId(playerId);
  const opponent = state[oppId];

  switch (trainer.effect) {
    case 'draw_2': drawCards(state, playerId, 2); break;
    case 'heal_30': {
      const t = findCharacter(state, playerId, targetInfo?.targetId) || player.active;
      if (t) healDamage(t, 30);
      break;
    }
    case 'cure_all_status': {
      const t = findCharacter(state, playerId, targetInfo?.targetId) || player.active;
      if (t) clearStatus(t);
      break;
    }
    case 'peek_opponent_hand':
      state.pendingEffect = { type: 'peek_opponent_hand', playerId };
      break;
    case 'heal_bench_20':
      player.bench.forEach(b => healDamage(b, 20));
      break;
    case 'discard_opponent_energy': {
      const targets = [opponent.active, ...opponent.bench].filter(Boolean).filter(t => t.attachedEnergies?.length > 0);
      if (targets.length > 0) {
        const t = targets[0];
        const e = t.attachedEnergies.pop();
        opponent.discardPile.push(e);
      }
      break;
    }
    case 'draw_3_discard_1':
      drawCards(state, playerId, 3);
      state.pendingEffect = { type: 'discard_1_from_hand', playerId };
      break;
    case 'free_retreat_flip': {
      const flip = coinFlip();
      addLog(state, `🎲 Frete Grátis — ${flip === 'heads' ? 'Cara! Troca acontece.' : 'Coroa. O produto não chegou. Troca cancelada.'}`);
      if (flip === 'heads') {
        state.pendingEffect = { type: 'free_retreat', playerId };
      }
      break;
    }
    case 'draw_up_to_4': {
      const needed = Math.max(0, 4 - player.hand.length);
      drawCards(state, playerId, Math.max(1, needed));
      break;
    }
    case 'flip_peek_reorder_3': {
      const flip = coinFlip();
      addLog(state, `🎲 ${flip === 'heads' ? 'Cara! Veja e reordene 3 cartas.' : 'Coroa. Nada.'}`);
      if (flip === 'heads') state.pendingEffect = { type: 'peek_reorder_3_opp', playerId };
      break;
    }
    case 'force_opponent_retreat':
      state.pendingEffect = { type: 'force_retreat', playerId: oppId };
      break;
    case 'discard_2_opponent_random':
      for (let i = 0; i < 2; i++) {
        if (opponent.hand.length > 0) {
          const ri = Math.floor(Math.random() * opponent.hand.length);
          opponent.discardPile.push(opponent.hand.splice(ri, 1)[0]);
        }
      }
      break;
    case 'discard_hand_draw_4':
      player.discardPile.push(...player.hand);
      player.hand = [];
      drawCards(state, playerId, 4);
      break;
    case 'convert_3_energy_to_quantum': {
      let converted = 0;
      [player.active, ...player.bench].filter(Boolean).forEach(p => {
        p.attachedEnergies?.forEach(e => {
          if (converted < 3 && e.type !== 'quantum') {
            e.type = 'quantum';
            e.icon = '⚛️';
            e.name = 'Energia Quântica';
            converted++;
          }
        });
      });
      addLog(state, `✝️ ${converted} Energias convertidas em Quântica!`);
      break;
    }
    case 'look_top_5_take_2':
      state.pendingEffect = { type: 'look_top_5_take_2', playerId };
      break;

    // Estádios
    case 'stadium_sitio':
    case 'stadium_bar':
    case 'stadium_praia':
    case 'stadium_escritorio':
    case 'stadium_quarto':
      if (state.stadium) player.discardPile.push(state.stadium);
      state.stadium = trainer;
      addLog(state, `🏟️ Novo Estádio: ${trainer.name}!`);
      break;
  }
  return { success: true };
}

// ── Verificar nocaute ──────────────────────────────────────
function checkKnockout(state, playerId) {
  const player = state[playerId];
  const opponent = getOpponent(state, playerId);
  if (!player.active) return;

  if (isKnockedOut(player.active)) {
    const ko = player.active;
    addLog(state, `💀 ${ko.name} de ${player.name} foi Nocauteado!`);

    // Mover para descarte
    player.discardPile.push(ko, ...(ko.attachedEnergies || []));
    player.active = null;

    // Oponente pega 1 carta de prêmio
    if (opponent.prizeCards.length > 0) {
      const prize = opponent.prizeCards.pop();
      opponent.hand.push(prize);
      addLog(state, `🏆 ${opponent.name} pegou 1 carta de Prêmio! (${opponent.prizeCards.length} restantes)`);

      // Defumação Total de Fael Churrasqueiro
      if (opponent.active?.ability?.name === 'Defumação Total') {
        player.bench.forEach(b => applyStatus(b, 'poisoned'));
      }
    }

    // Verificar vitória
    if (opponent.prizeCards.length === 0) {
      endGame(state, opponent.id, 'prizes');
      return;
    }

    // Jogador precisa escolher novo ativo
    if (player.bench.length > 0) {
      state.pendingEffect = { type: 'choose_new_active', playerId };
    } else {
      endGame(state, opponent.id, 'no_pokemon');
    }
  }
}

// ── Escolher novo Ativo após nocaute ──────────────────────
function chooseNewActive(state, playerId, benchInstanceId) {
  const player = state[playerId];
  const idx = player.bench.findIndex(b => b.instanceId === benchInstanceId);
  if (idx === -1) return { error: 'Personagem não encontrado no Banco.' };
  player.active = player.bench.splice(idx, 1)[0];
  addLog(state, `⚔️ ${player.name} colocou ${player.active.name} no Campo Ativo.`);

  // Limpar pending effect
  if (state.pendingEffect?.type === 'choose_new_active') {
    state.pendingEffect = null;
  }
  return { success: true };
}

// ── Fim do turno ───────────────────────────────────────────
function endTurn(state) {
  state.firstTurn = false;
  state.activePlayer = state.activePlayer === 'p1' ? 'p2' : 'p1';
  state.turn++;
  // Resetar flag de treinador usado
  state.p1.usedTrainerThisTurn = false;
  state.p2.usedTrainerThisTurn = false;
  startTurn(state);
}

// ── Fim de jogo ────────────────────────────────────────────
function endGame(state, winnerId, reason) {
  state.phase = 'ended';
  state.winner = winnerId;
  const reasons = {
    prizes: '🏆 coletou todas as cartas de Prêmio!',
    no_pokemon: '💀 o oponente ficou sem Pokémon!',
    deck_empty: '📭 o oponente ficou sem cartas no baralho!',
  };
  addLog(state, `🎉 ${state[winnerId].name} venceu! Motivo: ${reasons[reason] || reason}`);
}

// ── Helpers internos ───────────────────────────────────────
function getOpponentId(playerId) { return playerId === 'p1' ? 'p2' : 'p1'; }

function findCharacter(state, playerId, instanceId) {
  const player = state[playerId];
  if (player.active?.instanceId === instanceId) return player.active;
  return player.bench.find(b => b.instanceId === instanceId) || null;
}

// ── Exportar ───────────────────────────────────────────────
window.GAME_ENGINE = {
  createGameState,
  startTurn,
  drawCards,
  playBasicToBench,
  playActiveFromHand,
  attachEnergy,
  executeAttack,
  useAbility,
  retreat,
  evolve,
  playTrainer,
  chooseNewActive,
  endTurn,
  hasEnoughEnergy,
  isKnockedOut,
  getOpponentId,
  coinFlip,
};
