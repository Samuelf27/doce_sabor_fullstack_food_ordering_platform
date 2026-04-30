-- =====================================================
-- DOCE SABOR — Schema do Banco de Dados
-- =====================================================

CREATE DATABASE IF NOT EXISTS doce_sabor
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE doce_sabor;

-- Tabela de Usuários
CREATE TABLE IF NOT EXISTS usuarios (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  nome          VARCHAR(100) NOT NULL,
  email         VARCHAR(100) UNIQUE NOT NULL,
  senha         VARCHAR(255) NOT NULL,
  telefone      VARCHAR(20),
  endereco      TEXT,
  role          ENUM('cliente','admin') DEFAULT 'cliente',
  ativo         BOOLEAN DEFAULT TRUE,
  criado_em     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabela de Categorias
CREATE TABLE IF NOT EXISTS categorias (
  id        INT AUTO_INCREMENT PRIMARY KEY,
  nome      VARCHAR(50) NOT NULL,
  descricao VARCHAR(200),
  icone     VARCHAR(10) DEFAULT '🍦',
  ativo     BOOLEAN DEFAULT TRUE
);

-- Tabela de Produtos
CREATE TABLE IF NOT EXISTS produtos (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  nome         VARCHAR(100) NOT NULL,
  descricao    TEXT,
  preco        DECIMAL(10,2) NOT NULL,
  categoria_id INT,
  imagem_emoji VARCHAR(10) DEFAULT '🍨',
  disponivel   BOOLEAN DEFAULT TRUE,
  destaque     BOOLEAN DEFAULT FALSE,
  criado_em    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE SET NULL
);

-- Tabela de Pedidos
CREATE TABLE IF NOT EXISTS pedidos (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id       INT,
  status           ENUM('pendente','confirmado','preparando','saiu_entrega','entregue','cancelado') DEFAULT 'pendente',
  total            DECIMAL(10,2) NOT NULL,
  endereco_entrega TEXT NOT NULL,
  observacoes      TEXT,
  tipo_pagamento   ENUM('dinheiro','cartao_credito','cartao_debito','pix') DEFAULT 'pix',
  criado_em        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
);

-- Tabela de Itens do Pedido
CREATE TABLE IF NOT EXISTS pedido_itens (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  pedido_id      INT NOT NULL,
  produto_id     INT,
  nome_produto   VARCHAR(100) NOT NULL,
  quantidade     INT NOT NULL,
  preco_unitario DECIMAL(10,2) NOT NULL,
  subtotal       DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE,
  FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE SET NULL
);

-- =====================================================
-- Dados Iniciais
-- =====================================================

-- Admin padrão (senha: admin123)
INSERT INTO usuarios (nome, email, senha, role) VALUES
('Administrador', 'admin@docesabor.com',
 '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWq', 'admin');

-- Categorias
INSERT INTO categorias (nome, descricao, icone) VALUES
('Sorvetes',    'Sorvetes cremosos artesanais',          '🍨'),
('Açaí',        'Açaí puro da Amazônia',                 '🫐'),
('Milkshakes',  'Milkshakes cremosos e gelados',         '🥛'),
('Picolés',     'Picolés artesanais de frutas e cremes', '🍡'),
('Sundaes',     'Sundaes com caldas especiais',          '🍧'),
('Açaí Bowl',   'Bowls completos com frutas e granola',  '🥣');

-- Produtos
INSERT INTO produtos (nome, descricao, preco, categoria_id, imagem_emoji, disponivel, destaque) VALUES
('Sorvete de Chocolate',  'Cremoso sorvete de chocolate belga com calda especial',    12.90, 1, '🍫', TRUE,  TRUE),
('Sorvete de Morango',    'Artesanal de morango com pedaços da fruta fresca',         10.90, 1, '🍓', TRUE,  FALSE),
('Sorvete de Baunilha',   'Clássico sorvete de baunilha com fava natural',            10.90, 1, '🍦', TRUE,  FALSE),
('Sorvete de Pistache',   'Premium de pistache importado, irresistível',              16.90, 1, '🟢', TRUE,  TRUE),
('Sorvete de Menta',      'Refrescante menta com pedaços de chocolate',               13.90, 1, '🌿', TRUE,  FALSE),
('Açaí 300ml',            'Açaí puro com granola e banana',                           18.90, 2, '🫐', TRUE,  TRUE),
('Açaí 500ml',            'Açaí puro com granola, banana e mel',                      24.90, 2, '🫐', TRUE,  FALSE),
('Açaí 700ml',            'Açaí puro com acompanhamentos à escolha',                  32.90, 2, '🫐', TRUE,  FALSE),
('Milkshake de Chocolate','Cremoso milkshake de chocolate com chantilly',             22.90, 3, '🍫', TRUE,  TRUE),
('Milkshake de Morango',  'Milkshake de morango fresco com chantilly',               22.90, 3, '🍓', TRUE,  FALSE),
('Milkshake de Ovomaltine','Especial de ovomaltine com calda crocante',              25.90, 3, '🟤', TRUE,  TRUE),
('Picolé de Limão',       'Picolé artesanal de limão siciliano refrescante',          6.90, 4, '🍋', TRUE,  FALSE),
('Picolé de Manga',       'Picolé tropical de manga com tajín',                        7.90, 4, '🥭', TRUE,  FALSE),
('Picolé de Coco',        'Picolé cremoso de coco com pedaços',                        7.90, 4, '🥥', TRUE,  FALSE),
('Sundae de Caramelo',    'Baunilha com calda de caramelo e amendoim crocante',       19.90, 5, '🍮', TRUE,  TRUE),
('Sundae de Chocolate',   'Chocolate com calda quente e marshmallow',                 19.90, 5, '🍫', TRUE,  FALSE),
('Açaí Bowl Premium',     'Bowl grande com açaí, frutas tropicais, granola e mel',   35.90, 6, '🥣', TRUE,  TRUE);
