// ============================================================
// TURMA DO BARALHO — Dados de todas as cartas
// ============================================================

const ENERGY_TYPES = {
  alcohol: { id: 'alcohol', name: 'Álcool', icon: '🍺', color: '#f59e0b' },
  weed:    { id: 'weed',    name: 'Maconha', icon: '🌿', color: '#16a34a' },
  quantum: { id: 'quantum', name: 'Quântica', icon: '⚛️', color: '#7c3aed' },
  colorless: { id: 'colorless', name: 'Incolor', icon: '⭐', color: '#9ca3af' },
};

// ============================================================
// PERSONAGENS
// ============================================================
const CHARACTERS = [

  // ── GC ──────────────────────────────────────────────────
  {
    id: 'gc',
    name: 'GC',
    stage: 'BASIC',
    hp: 80,
    energyType: 'quantum',
    evolvesTo: 'gc_evolved',
    ability: {
      name: 'Dialética do iPhone',
      description: 'Uma vez por turno: se você tiver mais cartas na mão que o oponente, o próximo ataque causa +20 de dano.',
      trigger: 'active_ability',
    },
    attacks: [
      {
        id: 'gc_atk1',
        name: 'Missa do MST',
        cost: ['quantum', 'quantum'],
        damage: 60,
        effect: 'flip_discard_opponent',
        effectDescription: 'Jogue moeda — cara: oponente descarta 1 carta.',
      },
      {
        id: 'gc_atk2',
        name: 'Reza Brava',
        cost: ['quantum', 'quantum', 'quantum'],
        damage: 90,
        effect: 'self_confused',
        effectDescription: 'GC fica Confuso depois.',
      },
    ],
    weakness: { type: 'alcohol', multiplier: 2 },
    resistance: { type: 'weed', value: 30 },
    retreatCost: 2,
    flavorText: 'Comunista de iPhone. Quer a revolução mas o iPhone é de 512GB.',
    color: '#7c3aed',
  },

  {
    id: 'gc_evolved',
    name: 'GC Manifesto',
    stage: 'STAGE1',
    hp: 140,
    energyType: 'quantum',
    evolvesFrom: 'gc',
    ability: {
      name: 'Vanguarda Contraditória',
      description: 'Uma vez por turno: copie a última habilidade usada pelo oponente e aplique em si mesmo.',
      trigger: 'active_ability',
    },
    attacks: [
      {
        id: 'gcevo_atk1',
        name: 'Discurso de 3 Horas',
        cost: ['quantum', 'quantum'],
        damage: 80,
        effect: 'skip_draw_opponent',
        effectDescription: 'Oponente pula a fase de comprar carta no próximo turno.',
      },
      {
        id: 'gcevo_atk2',
        name: 'Greve Geral',
        cost: ['quantum', 'quantum', 'quantum', 'quantum'],
        damage: 150,
        effect: 'no_items_next_turn',
        effectDescription: 'Nenhum jogador pode usar cartas de Item no próximo turno.',
      },
    ],
    weakness: { type: 'alcohol', multiplier: 2 },
    resistance: { type: 'weed', value: 30 },
    retreatCost: 2,
    flavorText: 'Leu O Capital no caminho pro Starbucks.',
    color: '#5b21b6',
  },

  // ── FAEL ────────────────────────────────────────────────
  {
    id: 'fael',
    name: 'Fael',
    stage: 'BASIC',
    hp: 100,
    energyType: 'weed',
    evolvesTo: 'fael_evolved',
    ability: {
      name: 'Cheiro de Churrasco',
      description: 'Seus personagens no Banco curam 10 de dano entre turnos.',
      trigger: 'passive',
    },
    attacks: [
      {
        id: 'fael_atk1',
        name: 'Bafo de Fumaça',
        cost: ['weed'],
        damage: 30,
        effect: 'poison_opponent',
        effectDescription: 'Oponente fica Envenenado.',
      },
      {
    2   id: 'fael_atk2',
        name: 'Brasa do Sítio',
        cost: ['weed', 'weed', 'weed'],
        damage: 100,
        effect: 'discard_own_energy',
        effectDescription: 'Descarte 1 Energia 🌿 deste personagem.',
      },
    ],
    weakness: { type: 'alcohol', multiplier: 2 },
    resistance: { type: 'quantum', value: 30 },
    retreatCost: 1,
    flavorText: 'Cota preta, coração grande, churrasco sagrado.',
    color: '#16a34a',
  },

  {
    id: 'fael_evolved',
    name: 'Fael Churrasqueiro',
    stage: 'STAGE1',
    hp: 170,
    energyType: 'weed',
    evolvesFrom: 'fael',
  2 ability: {
      name: 'Defumação Total',
      description: 'Todos os Pokémon do oponente no Banco ficam Envenenados quando entram no Campo Ativo.',
      trigger: 'passive',
    },
    attacks: [
      {
        id: 'faelevo_atk1',
        name: 'Carvão Vivo',
        cost: ['weed', 'weed'],
        damage: 90,
        effect: 'damage_bench_20',
        effectDescription: 'Cause 20 de dano a 1 personagem do Banco do oponente.',
      },
      {
        id: 'faelevo_atk2',
        name: 'Churrasco Sagrado',
        cost: ['weed', 'weed', 'weed', 'weed'],
        damage: 160,
        effect: 'heal_ally_bench_40',
        effectDescription: 'Cure 40 de dano de qualquer personagem aliado no Banco.',
      },
    ],
    weakness: { type: 'alcohol', multiplier: 2 },
    resistance: { type: 'quantum', value: 30 },
    retreatCost: 1,
    flavorText: 'O fogo dele não apaga. Nunca apagou.',
    color: '#15803d',
  },

  // ── CONRADO ─────────────────────────────────────────────
  {
    id: 'conrado',
    name: 'Conrado',
    stage: 'BASIC',
    hp: 70,
    energyType: 'alcohol',
    evolvesTo: 'conrado_evolved',
    ability: {
      name: 'Defesa Técnica',
      description: 'Uma vez por turno: veja a mão do oponente e escolha 1 carta para ele descartar.',
      trigger: 'active_ability',
    },
    attacks: [
      {
        id: 'conrado_atk1',
        name: 'Calvície Agressiva',
        cost: ['alcohol'],
        damage: 40,
        effect: 'extra_if_less_hp',
        effectDescription: 'Se o oponente tiver mais PS que Conrado, +20 de dano.',
      },
      {
        id: 'conrado_atk2',
        name: 'Aprazolam Overdose',
        cost: ['alcohol', 'alcohol', 'alcohol'],
 2      damage: 120,
        effect: 'self_asleep',
        effectDescription: 'Conrado fica Adormecido depois.',
      },
    ],
    weakness: { type: 'weed', multiplier: 2 },
    resistance: { type: 'quantum', value: 30 },
    retreatCost: 2,
    flavorText: 'Quase advogado, quase careca, definitivamente melancólico.',
    color: '#d97706',
  },

  {
    id: 'conrado_evolved',
    name: 'Dr. Conrado',
    stage: 'STAGE1',
    hp: 130,
    energyType: 'alcohol',
    evolvesFrom: 'conrado',
    ability: {
      name: 'Habeas Corpus',
      description: 'Uma vez por turno: cancele 1 Condição Especial de qualquer personagem aliado.',
      trigger: 'active_ability',
    },
    attacks: [
      {
        id: 'conradoevo_atk1',
        name: 'Processo Cautelar',
        cost: ['alcohol', 'alcohol'],
        damage: 80,
        effect: 'flip_paralyze_opponent',
        effectDescription: 'Jogue moeda — cara: oponente não pode recuar no próximo turno.',
      },
      {
        id: 'conradoevo_atk2',
        name: 'Sustentação Oral',
        cost: ['alcohol', 'alcohol', 'alcohol', 'alcohol'],
        damage: 140,
        effect: 'self_asleep',
        effectDescription: 'Dr. Conrado fica Adormecido depois.',
      },
    ],
    weakness: { type: 'weed', multiplier: 2 },
    resistance: { type: 'quantum', value: 30 },
    retreatCost: 2,
    flavorText: 'Finalmente formado. Mais perigoso. Ainda melancólico.',
    color: '#b45309',
  },

  // ── JOÃOZINHO ───────────────────────────────────────────
  {
    id: 'joao',
    name: 'Joãozinho',
    stage: 'BASIC',
    hp: 90,
    energyType: 'weed',
    evolvesTo: 'joao_evolved',
    ability: {
      name: 'Bom Coração',
      description: 'Quando um aliado é Nocauteado, cure 20 de dano do próximo personagem que entrar em campo.',
      trigger: 'passive',
    },
    attacks: [
      {
        id: 'joao_atk1',
        name: 'Bug no Código',
        cost: ['weed', 'colorless'],
        damage: 50,
        effect: 'flip_confuse_opponent',
        effectDescription: 'Jogue moeda — cara: oponente fica Confuso.',
      },
      {
        id: 'joao_atk2',
        name: 'Ordem da Esposa',
        cost: ['weed', 'weed', 'colorless'],
        damage: 80,
        effect: 'self_retreat_after',
        effectDescription: 'Joãozinho recua automaticamente pro Banco depois.',
      },
    ],
    weakness: { type: 'alcohol', multiplier: 2 },
    resistance: { type: 'quantum', value: 30 },
    retreatCost: 0,
    flavorText: 'Coração de ouro. A esposa mandou atacar.',
    color: '#16a34a',
  },

  {
    id: 'joao_evolved',
    name: 'João Deployou',
    stage: 'STAGE1',
    hp: 160,
    energyType: 'weed',
    evolvesFrom: 'joao',
    ability: {
      name: 'Push na Main',
      description: 'Quando João Deployou entra em campo, compre 2 cartas.',
      trigger: 'on_enter',
    },
    attacks: [
      {
        id: 'joaoevo_atk1',
        name: 'Commit Suicida',
        cost: ['weed', 'weed'],
        damage: 90,
        effect: 'flip_extra_or_self_damage',
        effectDescription: 'Jogue moeda — cara: +40 de dano / coroa: João sofre 30 de dano.',
      },
      {
        id: 'joaoevo_atk2',
        name: 'Sistema em Produção',
        cost: ['weed', 'weed', 'weed', 'colorless'],
        damage: 130,
        effect: 'extra_if_special_condition',
        effectDescription: 'Se o oponente tiver Condição Especial, +50 de dano.',
      },
    ],
    weakness: { type: 'alcohol', multiplier: 2 },
    resistance: { type: 'quantum', value: 30 },
    retreatCost: 0,
    flavorText: 'O código foi pra produção. A esposa aprovou.',
    color: '#15803d',
  },

  // ── GUSTAVIN ────────────────────────────────────────────
  {
    id: 'gustavin',
    name: 'Gustavin',
    stage: 'BASIC',
    hp: 90,
    energyType: 'alcohol',
    evolvesTo: 'gustavin_evolved',
    ability: {
      name: 'Stories Patrocinados',
      description: 'Uma vez por turno: veja a próxima carta do seu baralho e escolha se compra ou deixa.',
      trigger: 'active_ability',
    },
    attacks: [
      {
        id: 'gustavin_atk1',
        name: 'Pitch de Vendas',
        cost: ['alcohol'],
        damage: 20,
        effect: 'draw_2',
        effectDescription: 'Compre 2 cartas.',
      },
      {
        id: 'gustavin_atk2',
        name: 'Bebedeira Verbal',
        cost: ['alcohol', 'alcohol', 'alcohol'],
        damage: 90,
        effect: 'flip2_self_damage',
        effectDescription: 'Jogue 2 moedas — para cada coroa, Gustavin sofre 20 de dano.',
      },
    ],
    weakness: { type: 'weed', multiplier: 2 },
    resistance: { type: 'quantum', value: 30 },
    retreatCost: 3,
    flavorText: 'Bêbado ele não para. Nunca. De jeito nenhum.',
    color: '#f59e0b',
  },

  {
    id: 'gustavin_evolved',
    name: 'Gustavin Bêbado',
    stage: 'STAGE1',
    hp: 160,
    energyType: 'alcohol',
    evolvesFrom: 'gustavin',
    ability: {
      name: 'Sem Filtro',
      description: 'Seus ataques ignoram a Resistência do oponente.',
      trigger: 'passive',
    },
    attacks: [
      {
        id: 'gustavinevo_atk1',
        name: 'Caô Alcóolico',
        cost: ['alcohol', 'alcohol'],
        damage: 70,
        effect: 'draw2_self_damage20',
        effectDescription: 'Compre 2 cartas. Gustavin sofre 20 de dano.',
      },
      {
        id: 'gustavinevo_atk2',
        name: 'Live de Madrugada',
        cost: ['alcohol', 'alcohol', 'alcohol', 'alcohol'],
        damage: 160,
        effect: 'flip3_self_damage30each',
        effectDescription: 'Jogue 3 moedas — para cada coroa, Gustavin sofre 30 de dano.',
      },
    ],
    weakness: { type: 'weed', multiplier: 2 },
    resistance: { type: 'quantum', value: 30 },
    retreatCost: 99,
    retreatText: 'Impossível',
    flavorText: 'Terceira dose. Não tem mais filtro. Nem freio.',
    color: '#d97706',
  },

  // ── CAIO BARRETO ────────────────────────────────────────
  {
    id: 'caio',
    name: 'Caio Barreto',
    stage: 'BASIC',
    hp: 110,
    energyType: 'weed',
    evolvesTo: 'caio_evolved',
 2  ability: {
      name: 'Silêncio Intimidador',
      description: 'O oponente não pode usar cartas de Apoiador no turno em que atacar Caio.',
      trigger: 'passive',
    },
    attacks: [
      {
        id: 'caio_atk1',
        name: 'Agulha',
        cost: ['weed'],
        damage: 40,
        effect: 'extra_if_opponent_status',
        effectDescription: 'Se o oponente tiver Condição Especial, +40 de dano.',
      },
      {
        id: 'caio_atk2',
        name: 'Tatua a Raiva',
        cost: ['weed', 'weed', 'weed'],
        damage: 130,
        effect: 'self_paralyzed',
        effectDescription: 'Caio fica Paralisado depois.',
      },
    ],
    weakness: { type: 'alcohol', multiplier: 2 },
    resistance: { type: 'colorless', value: 30 },
    retreatCost: 4,
    flavorText: 'Não entende piada. Provavelmente não é piada.',
    color: '#166534',
  },

  {
    id: 'caio_evolved',
    name: 'Caio Tatuador',
    stage: 'STAGE1',
    hp: 190,
    energyType: 'weed',
    evolvesFrom: 'caio',
    ability: {
      name: 'Traço Permanente',
      description: 'Quando Caio Tatuador causar dano, coloque 1 marcador de dano extra que não pode ser curado.',
      trigger: 'passive',
    },
    attacks: [
      {
        id: 'caioevo_atk1',
        name: 'Máquina de Tatuar',
        cost: ['weed', 'weed', 'weed'],
        damage: 120,
        effect: 'burn_opponent',
        effectDescription: 'Aplique Queimado no oponente.',
      },
      {
        id: 'caioevo_atk2',
        name: 'Obra Prima',
        cost: ['weed', 'weed', 'weed', 'weed', 'weed'],
        damage: 200,
        effect: 'self_paralyzed',
        effectDescription: 'Caio Tatuador fica Paralisado no próximo turno.',
      },
    ],
    weakness: { type: 'alcohol', multiplier: 2 },
    resistance: { type: 'colorless', value: 30 },
    retreatCost: 99,
    retreatText: 'Impossível',
    flavorText: 'Ainda não riu de nenhuma piada. Nunca vai rir.',
    color: '#14532d',
  },

  // ── TÚLIO ───────────────────────────────────────────────
  {
    id: 'tulio',
    name: 'Túlio',
    stage: 'BASIC',
    hp: 100,
    energyType: 'quantum',
    evolvesTo: 'tulio_evolved',
    ability: {
      name: 'Manipulação Psicológica',
      description: 'Uma vez por turno: veja a mão do oponente sem revelar as suas.',
      trigger: 'active_ability',
    },
    attacks: [
      {
        id: 'tulio_atk1',
        name: 'Mentira Conveniente',
        cost: ['quantum', 'colorless'],
        damage: 50,
        effect: 'extra_if_opponent_used_trainer',
        effectDescription: 'Se o oponente usou carta de Treinador neste turno, +30 de dano.',
      },
      {
        id: 'tulio_atk2',
        name: 'Entrou na Mente',
        cost: ['quantum', 'quantum', 'quantum'],
        damage: 100,
        effect: 'send_opponent_card_to_bottom',
        effectDescription: 'Escolha 1 carta da mão do oponente e coloque-a no fundo do baralho dele.',
      },
    ],
    weakness: { type: 'weed', multiplier: 2 },
    resistance: { type: 'alcohol', value: 30 },
    retreatCost: 1,
    flavorText: 'Psicólogo, flamenguista, morador de praia. Mentiroso profissional.',
    color: '#dc2626',
  },

  {
    id: 'tulio_evolved',
    name: 'Túlio Psicólogo',
    stage: 'STAGE1',
    hp: 170,
    energyType: 'quantum',
    evolvesFrom: 'tulio',
    ability: {
      name: 'Transferência',
      description: 'Uma vez por turno: mova 1 Energia de qualquer personagem do oponente para qualquer personagem seu.',
      trigger: 'active_ability',
    },
    attacks: [
      {
        id: 'tulioevo_atk1',
        name: 'Interpretação Livre',
        cost: ['quantum', 'quantum'],
        damage: 90,
        effect: 'view_hand_choose_discard_or_draw',
        effectDescription: 'Veja a mão do oponente — escolha 1 carta: ele descarta ou você compra.',
      },
      {
        id: 'tulioevo_atk2',
        name: 'Projeção',
        cost: ['quantum', 'quantum', 'quantum', 'quantum'],
        damage: 150,
        effect: 'reflect_damage_next_turn',
        effectDescription: 'Todo dano sofrido no próximo turno do oponente é redirecionado ao oponente.',
      },
    ],
    weakness: { type: 'weed', multiplier: 2 },
    resistance: { type: 'alcohol', value: 30 },
    retreatCost: 1,
    flavorText: 'Moro na praia, leio a sua mente e ainda minto na sua cara.',
    color: '#b91c1c',
  },

  // ── JEFF ────────────────────────────────────────────────
  {
    id: 'jeff',
    name: 'Jeff',
    stage: 'BASIC',
    hp: 80,
    energyType: 'quantum',
    evolvesTo: 'jeff_evolved',
    ability: {
      name: 'Golpe Holístico',
      description: 'Uma vez por turno: veja as 3 cartas do topo do baralho do oponente.',
      trigger: 'active_ability',
    },
    attacks: [
      {
        id: 'jeff_atk1',
        name: 'Namoro Virtual',
        cost: ['quantum'],
        damage: 30,
        effect: 'draw_energy_attach',
        effectDescription: 'Se a carta que você comprar for Energia, ela vai direto ligada a este personagem.',
      },
      {
        id: 'jeff_atk2',
        name: 'Scam da Vovó',
        cost: ['quantum', 'quantum', 'colorless'],
        damage: 80,
        effect: 'discard_opponent_energy',
        effectDescription: 'Oponente descarta 1 Energia de qualquer personagem dele.',
      },
    ],
    weakness: { type: 'weed', multiplier: 2 },
    resistance: { type: 'quantum', value: 30 },
    retreatCost: 1,
    flavorText: 'Holístico, desenvolvedor, namorador virtual, golpista de vovó.',
    color: '#6d28d9',
  },

  {
    id: 'jeff_evolved',
    name: 'Jeff Iluminado',
    stage: 'STAGE1',
    hp: 150,
    energyType: 'quantum',
    evolvesFrom: 'jeff',
    ability: {
      name: 'Consciência Expandida',
      description: 'Uma vez por turno: embaralhe 1 carta da mão de volta no baralho e compre 1 nova.',
      trigger: 'active_ability',
    },
    attacks: [
      {
        id: 'jeffevo_atk1',
        name: 'Constelação Familiar',
        cost: ['quantum', 'quantum'],
        damage: 80,
        effect: 'flip_discard_or_draw',
        effectDescription: 'Jogue moeda — cara: oponente descarta 2 Energias / coroa: Jeff compra 1 carta.',
      },
      {
        id: 'jeffevo_atk2',
        name: 'Golpe Cósmico',
        cost: ['quantum', 'quantum', 'quantum', 'colorless'],
        damage: 140,
        effect: 'discard_opponent_trainer_hand',
        effectDescription: 'Oponente descarta 1 carta de Treinador da mão.',
      },
    ],
    weakness: { type: 'weed', multiplier: 2 },
    resistance: { type: 'quantum', value: 30 },
    retreatCost: 1,
    flavorText: 'Descobriu o chakra do golpe. Namora 4 ao mesmo tempo.',
    color: '#4c1d95',
  },

  // ── LHUCAS ──────────────────────────────────────────────
  {
    id: 'lhucas',
    name: 'Lhucas',
    stage: 'BASIC',
    hp: 90,
    energyType: 'alcohol',
    evolvesTo: 'lhucas_evolved',
    ability: {
      name: 'Amigo Honesto Demais',
      description: 'Depois do seu ataque, o oponente deve revelar a próxima carta que vai comprar.',
      trigger: 'passive',
    },
    attacks: [
      {
        id: 'lhucas_atk1',
        name: 'Ofensa Carinhosa',
        cost: ['alcohol', 'colorless'],
        damage: 40,
        effect: 'confuse_opponent',
        effectDescription: 'Oponente fica Confuso.',
      },
      {
        id: 'lhucas_atk2',
        name: 'Dropship Suspeito',
        cost: ['alcohol', 'alcohol', 'alcohol'],
        damage: 110,
        effect: 'flip_fail',
        effectDescription: 'Jogue moeda — coroa: ataque causa 0 de dano.',
      },
    ],
    weakness: { type: 'weed', multiplier: 2 },
    resistance: { type: 'quantum', value: 30 },
    retreatCost: 1,
    flavorText: 'Te ofende com amor. O produto nunca chega.',
    color: '#b45309',
  },

  {
    id: 'lhucas_evolved',
    name: 'Lhucas CEO',
    stage: 'STAGE1',
    hp: 160,
    energyType: 'alcohol',
    evolvesFrom: 'lhucas',
    ability: {
      name: 'Margem de Lucro',
      description: 'Toda vez que o oponente comprar uma carta, Lhucas CEO cura 10 de dano.',
      trigger: 'passive',
    },
    attacks: [
      {
        id: 'lhucasevo_atk1',
        name: 'Upsell Agressivo',
        cost: ['alcohol', 'alcohol'],
        damage: 90,
        effect: 'force_play_or_discard',
        effectDescription: 'Oponente deve jogar 1 carta da mão no campo ou descartá-la.',
      },
      {
        id: 'lhucasevo_atk2',
        name: 'Frete Grátis*',
        cost: ['alcohol', 'alcohol', 'alcohol', 'alcohol'],
        damage: 170,
        effect: 'flip_fail',
        effectDescription: 'Jogue moeda — coroa: ataque causa 0 de dano. (*não inclui o produto)',
      },
    ],
    weakness: { type: 'weed', multiplier: 2 },
    resistance: { type: 'quantum', value: 30 },
    retreatCost: 1,
    flavorText: 'CNPJ aberto. Produto inexistente. Faturamento real.',
    color: '#92400e',
  },
];

// ============================================================
// CARTAS DE TREINADOR
// ============================================================
const TRAINERS = [
  // ── ITENS ──
  {
    id: 'baseado',
    name: 'Baseado',
    trainerType: 'ITEM',
    icon: '🌿',
    description: 'Compre 2 cartas.',
    effect: 'draw_2',
    flavorText: '"Dá uma relaxada."',
    color: '#16a34a',
  },
  {
    id: 'porre',
    name: 'Porre',
    trainerType: 'ITEM',
    icon: '🍺',
    description: 'Cure 30 de dano de 1 personagem seu.',
    effect: 'heal_30',
    flavorText: '"Dói agora, dói mais amanhã."',
    color: '#f59e0b',
  },
  {
    id: 'alprazolam',
    name: 'Alprazolam',
    trainerType: 'ITEM',
    icon: '💊',
    description: 'Remova todas as Condições Especiais de 1 personagem seu.',
    effect: 'cure_all_status',
    flavorText: '"Conrado deixou alguns pra emergência."',
    color: '#6b7280',
  },
  {
    id: 'print_do_zap',
    name: 'Print do Zap',
    trainerType: 'ITEM',
    icon: '📱',
    description: 'Olhe a mão do oponente. Ele não vê a sua.',
    effect: 'peek_opponent_hand',
    flavorText: '"Printou antes de deletar."',
    color: '#0ea5e9',
  },
  {
    id: 'churrasquinho',
    name: 'Churrasquinho',
    trainerType: 'ITEM',
    icon: '🥩',
    description: 'Cure 20 de dano de todos os seus personagens no Banco.',
    effect: 'heal_bench_20',
    flavorText: '"Fael mandou um prato pro banco."',
    color: '#dc2626',
  },
  {
    id: 'pix_suspeito',
    name: 'PIX Suspeito',
    trainerType: 'ITEM',
    icon: '💸',
    description: 'O oponente descarta 1 Energia de qualquer personagem dele.',
    effect: 'discard_opponent_energy',
    flavorText: '"Jeff mandou: \'pode confiar, sou eu\'."',
    color: '#7c3aed',
  },
  {
    id: 'meme_do_grupo',
    name: 'Meme do Grupo',
    trainerType: 'ITEM',
    icon: '😂',
    description: 'Compre 3 cartas, depois descarte 1 da sua mão.',
    effect: 'draw_3_discard_1',
    flavorText: '"Às 3 da manhã no zap."',
    color: '#f59e0b',
  },
  {
    id: 'frete_gratis',
    name: 'Frete Grátis*',
    trainerType: 'ITEM',
    icon: '📦',
    description: 'Troque seu Campo Ativo com 1 personagem do Banco sem pagar custo de recuo. Jogue moeda — coroa: a troca não acontece.',
    effect: 'free_retreat_flip',
    flavorText: '"(*não inclui o produto)"',
    color: '#b45309',
  },
  {
    id: 'sessao_de_terapia',
    name: 'Sessão de Terapia',
    trainerType: 'ITEM',
    icon: '🛋️',
    description: 'Compre 1 carta. Se você tiver 3 ou menos cartas na mão, compre até completar 4.',
    effect: 'draw_up_to_4',
    flavorText: '"Túlio cobrou caro."',
    color: '#dc2626',
  },
  {
    id: 'golpe_holistico',
    name: 'Golpe Holístico',
    trainerType: 'ITEM',
    icon: '✨',
    description: 'Jogue moeda — cara: veja 3 cartas do topo do baralho do oponente e reordene como quiser. Coroa: nada.',
    effect: 'flip_peek_reorder_3',
    flavorText: '"Os chakras do oponente estão desalinhados."',
    color: '#6d28d9',
  },

  // ── APOIADORES ──
  {
    id: 'esposa_do_joao',
    name: 'Esposa do Joãozinho',
    trainerType: 'SUPPORTER',
    icon: '👩',
    description: 'Seu oponente recua o Campo Ativo imediatamente, sem pagar custo de recuo. Ele escolhe o substituto.',
    effect: 'force_opponent_retreat',
    flavorText: '"Ela ligou. Ele voltou."',
    color: '#ec4899',
  },
  {
    id: 'vovo_do_jeff',
    name: 'Vovó do Jeff',
    trainerType: 'SUPPORTER',
    icon: '👵',
    description: 'Descarte 2 cartas aleatórias da mão do oponente.',
    effect: 'discard_2_opponent_random',
    flavorText: '"Ela não sabia que era golpe."',
    color: '#6d28d9',
  },
  {
    id: 'professor_de_exatas',
    name: 'Professor de Exatas',
    trainerType: 'SUPPORTER',
    icon: '📐',
  2 description: 'Descarte sua mão atual e compre 4 novas cartas.',
    effect: 'discard_hand_draw_4',
    flavorText: '"GC entendeu na terceira aula."',
    color: '#7c3aed',
  },
  {
    id: 'padre_comunista',
    name: 'Padre Comunista',
    trainerType: 'SUPPORTER',
    icon: '✝️',
    description: 'Converta até 3 Energias de qualquer tipo ligadas aos seus personagens em ⚛️ Quântica.',
    effect: 'convert_3_energy_to_quantum',
    flavorText: '"Deus é de esquerda, segundo o GC."',
    color: '#1e3a5f',
  },
  {
    id: 'consultoria_de_marketing',
    name: 'Consultoria de Marketing',
    trainerType: 'SUPPORTER',
    icon: '📊',
    description: 'Veja as 5 cartas do topo do seu baralho. Escolha 2 para a mão, reembaralhe o resto.',
    effect: 'look_top_5_take_2',
    flavorText: '"Gustavin cobrou R$2.000 por isso."',
    color: '#f59e0b',
  },

  // ── ESTÁDIOS ──
  {
    id: 'sitio_do_fael',
    name: 'Sítio do Fael',
    trainerType: 'STADIUM',
    icon: '🌾',
    description: 'Personagens 🌿 curam 10 de dano entre turnos. Custo de recuo de 🌿 reduzido em 1.',
    effect: 'stadium_sitio',
    flavorText: '"O churrasco nunca acaba."',
    color: '#16a34a',
  },
  {
    id: 'bar_do_gustavin',
    name: 'Bar do Gustavin',
    trainerType: 'STADIUM',
    icon: '🍺',
    description: 'Ambos compram 1 carta extra por turno, mas sofrem 10 de dano ao fazê-lo.',
    effect: 'stadium_bar',
    flavorText: '"Aberto. Sempre aberto."',
    color: '#f59e0b',
  },
  {
    id: 'praia_do_tulio',
    name: 'Praia do Túlio',
    trainerType: 'STADIUM',
    icon: '🏖️',
    description: 'Personagens ⚛️ causam +20 de dano em todos os ataques.',
    effect: 'stadium_praia',
    flavorText: '"Rio de Janeiro. Flamengo. Mentira."',
    color: '#dc2626',
  },
  {
    id: 'escritorio_do_conrado',
    name: 'Escritório do Dr. Conrado',
    trainerType: 'STADIUM',
    icon: '⚖️',
    description: 'Nenhum jogador pode usar mais de 1 carta de Item por turno.',
    effect: 'stadium_escritorio',
    flavorText: '"Ordem no tribunal."',
    color: '#d97706',
  },
  {
    id: 'quarto_do_caio',
    name: 'Quarto do Caio',
    trainerType: 'STADIUM',
    icon: '🔇',
    description: 'Nenhum jogador pode usar cartas de Apoiador enquanto este Estádio estiver em jogo.',
    effect: 'stadium_quarto',
    flavorText: '"Silêncio absoluto. Sem piadas."',
    color: '#166534',
  },
];

// ============================================================
// CARTAS DE ENERGIA
// ============================================================
const ENERGIES = [
  { id: 'energy_alcohol', name: 'Energia Álcool', type: 'alcohol', icon: '🍺', color: '#f59e0b' },
  { id: 'energy_weed',    name: 'Energia Maconha', type: 'weed', icon: '🌿', color: '#16a34a' },
  { id: 'energy_quantum', name: 'Energia Quântica', type: 'quantum', icon: '⚛️', color: '#7c3aed' },
];

// ============================================================
// BARALHOS PRÉ-MONTADOS
// ============================================================
function buildDeck(type) {
  // Cada baralho tem 30 cartas:
  // 6 básicos (2x de cada 3 personagens do tipo)
  // 6 evoluídos (2x de cada 3 evoluídos)
  // 8 cartas de Treinador (mix)
  // 10 cartas de Energia

  const deckConfigs = {
    alcohol: {
      basics:   ['conrado', 'conrado', 'gustavin', 'gustavin', 'lhucas', 'lhucas'],
      evolved:  ['conrado_evolved', 'conrado_evolved', 'gustavin_evolved', 'gustavin_evolved', 'lhucas_evolved', 'lhucas_evolved'],
      trainers: ['porre', 'porre', 'alprazolam', 'meme_do_grupo', 'frete_gratis', 'esposa_do_joao', 'consultoria_de_marketing', 'bar_do_gustavin'],
      energies: Array(8).fill('energy_alcohol').concat(['energy_quantum', 'energy_weed']),
    },
    weed: {
      basics:   ['fael', 'fael', 'joao', 'joao', 'caio', 'caio'],
      evolved:  ['fael_evolved', 'fael_evolved', 'joao_evolved', 'joao_evolved', 'caio_evolved', 'caio_evolved'],
      trainers: ['baseado', 'baseado', 'churrasquinho', 'churrasquinho', 'alprazolam', 'vovo_do_jeff', 'sitio_do_fael', 'quarto_do_caio'],
      energies: Array(8).fill('energy_weed').concat(['energy_alcohol', 'energy_quantum']),
    },
    quantum: {
      basics:   ['gc', 'gc', 'tulio', 'tulio', 'jeff', 'jeff'],
      evolved:  ['gc_evolved', 'gc_evolved', 'tulio_evolved', 'tulio_evolved', 'jeff_evolved', 'jeff_evolved'],
      trainers: ['print_do_zap', 'sessao_de_terapia', 'golpe_holistico', 'pix_suspeito', 'meme_do_grupo', 'professor_de_exatas', 'padre_comunista', 'praia_do_tulio'],
      energies: Array(8).fill('energy_quantum').concat(['energy_alcohol', 'energy_weed']),
    },
  };

  const config = deckConfigs[type];
  const allIds = [...config.basics, ...config.evolved, ...config.trainers, ...config.energies];

  return allIds.map(id => {
    const char = CHARACTERS.find(c => c.id === id);
    if (char) return { ...char, cardType: 'CHARACTER', instanceId: generateId() };
    const trainer = TRAINERS.find(t => t.id === id);
    if (trainer) return { ...trainer, cardType: 'TRAINER', instanceId: generateId() };
    const energy = ENERGIES.find(e => e.id === id);
    if (energy) return { ...energy, cardType: 'ENERGY', instanceId: generateId() };
    return null;
  }).filter(Boolean);
}

function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

window.CARDS_DATA = { CHARACTERS, TRAINERS, ENERGIES, ENERGY_TYPES, buildDeck, shuffle, generateId };
