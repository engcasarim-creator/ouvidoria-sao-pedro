-- phpMyAdmin SQL Dump — versão consolidada para entrega
-- Ouvidoria São Pedro do Paraná
-- Gerar novamente pelo phpMyAdmin (Exportar) depois de rodar este arquivo,
-- para a entrega final refletir o timestamp real do seu ambiente.

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

-- ============================================================
-- 1) TABELAS
-- ============================================================

DROP TABLE IF EXISTS `vw_manifestacoes_detalhadas`;
DROP TABLE IF EXISTS `manifestacoes`;
DROP TABLE IF EXISTS `temas`;
DROP TABLE IF EXISTS `secretarias`;
DROP TABLE IF EXISTS `usuarios`;

CREATE TABLE `secretarias` (
  `id` int(11) NOT NULL,
  `nome` varchar(150) NOT NULL,
  `ativa` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `temas` (
  `id` int(11) NOT NULL,
  `secretaria_id` int(11) NOT NULL,
  `nome` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `manifestacoes` (
  `id` int(11) NOT NULL,
  `protocolo` varchar(20) NOT NULL,
  `tipo` enum('anonimo','identificado') NOT NULL,
  `nome` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `telefone` varchar(20) DEFAULT NULL,
  `secretaria_id` int(11) NOT NULL,
  `tema_id` int(11) NOT NULL,
  `descricao` text NOT NULL,
  `anexo` varchar(255) DEFAULT NULL,
  `anexo_url` varchar(255) DEFAULT NULL,
  `status` enum('Pendente','Respondida','Arquivada','Cancelada') NOT NULL DEFAULT 'Pendente',
  `resposta` text DEFAULT NULL,
  `canal_resposta` varchar(50) DEFAULT NULL,
  `data_resposta` datetime DEFAULT NULL,
  `dias_atendimento` int(11) DEFAULT 0,
  `data_criacao` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL,
  `nome` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `senha` varchar(255) NOT NULL,
  `cargo` varchar(50) DEFAULT 'Atendente',
  `data_criacao` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 2) DADOS
-- ============================================================

INSERT INTO `secretarias` (`id`, `nome`, `ativa`) VALUES
(1, 'Secretaria de Indústria, Comércio e Fomento Agropecuário', 1),
(2, 'Secretaria de Esportes', 1),
(3, 'Secretaria de Assistência Social', 1),
(4, 'Secretaria da Educação', 1),
(5, 'Secretaria da Saúde', 1),
(6, 'Secretaria de Administração Geral', 1),
(7, 'Secretaria de Diretoria de Viação, Obras e Urbanismo', 1),
(8, 'Secretaria do Meio Ambiente e Turismo', 1);

INSERT INTO `temas` (`id`, `secretaria_id`, `nome`) VALUES
(1, 5, 'Atendimento no Posto de Saúde'),
(2, 5, 'Falta de Medicamentos'),
(3, 7, 'Iluminação Pública'),
(4, 7, 'Tapa-buracos / Pavimentação'),
(5, 4, 'Merenda Escolar'),
(6, 4, 'Transporte Escolar');

INSERT INTO `manifestacoes` (`id`, `protocolo`, `tipo`, `nome`, `email`, `telefone`, `secretaria_id`, `tema_id`, `descricao`, `anexo`, `anexo_url`, `status`, `resposta`, `canal_resposta`, `data_resposta`, `dias_atendimento`, `data_criacao`) VALUES
(1, 'M20260918-A992', 'identificado', 'Renan Albuquerque', 'engcasarim@gmail.com', '44999003035', 2, 1, 'Teste', NULL, NULL, 'Respondida', 'Testado', NULL, '2026-09-17 23:48:43', 0, '2026-09-17 23:47:24'),
(2, 'M20260918-0F59', 'identificado', 'Renan Albuquerque', 'engcasarim@gmail.com', '44999003035', 5, 1, 'Falta médico no postinho', NULL, NULL, 'Pendente', NULL, NULL, NULL, 0, '2026-09-17 23:51:36'),
(3, 'M20260918-567E', 'identificado', 'Renan Henrique Casarim de Albuquerque', 'engcasarim@gmail.com', '44999003035', 4, 1, 'Falta professor', NULL, NULL, 'Respondida', 'Testando', 'Telefone / WhatsApp', '2026-09-18 00:04:40', 0, '2026-09-18 00:04:12'),
(4, 'M20260918-8E19', 'identificado', 'Renan Albuquerque', 'engcasarim@gmail.com', '44999003035', 8, 2, 'Falta luz no bosque', NULL, NULL, 'Arquivada', 'Lampada comprada', 'email', '2026-09-18 00:15:48', 0, '2026-09-18 00:11:48');

INSERT INTO `usuarios` (`id`, `nome`, `email`, `senha`, `cargo`, `data_criacao`) VALUES
(2, 'Administrador Ouvidoria', 'admin@saopedrodoparana.pr.gov.br', '$2y$10$XmS583cU4qTo2aI3p1rt4ecbfPDV9IGuHENZLscFhuLYbgZ2KltG2', 'Administrador', '2026-09-17 01:32:15');

-- ============================================================
-- 3) TRIGGER
-- ============================================================

DELIMITER $$
CREATE TRIGGER `trg_valida_dias_atendimento` BEFORE UPDATE ON `manifestacoes` FOR EACH ROW BEGIN
    IF NEW.dias_atendimento < 0 THEN
        SET NEW.dias_atendimento = 0;
    END IF;
END$$
DELIMITER ;

-- ============================================================
-- 4) FUNCTION
-- ============================================================

DELIMITER $$
CREATE FUNCTION `fn_formatar_protocolo` (`id_manifestacao` INT, `ano` INT)
RETURNS VARCHAR(20)
CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci
DETERMINISTIC
BEGIN
    RETURN CONCAT('OUV-', LPAD(id_manifestacao, 5, '0'), '/', ano);
END$$
DELIMITER ;

-- ============================================================
-- 5) VIEW DETALHADA (usa a function acima — item deixa de ser decorativo)
-- ============================================================

CREATE VIEW `vw_manifestacoes_detalhadas` AS
SELECT
    m.`id`, m.`protocolo`,
    `fn_formatar_protocolo`(m.`id`, YEAR(m.`data_criacao`)) AS `protocolo_oficial`,
    m.`tipo`, m.`nome`, m.`email`, m.`telefone`,
    m.`secretaria_id`, s.`nome` AS `secretaria_nome`,
    m.`tema_id`, t.`nome` AS `tema_nome`,
    m.`descricao`, m.`anexo_url`, m.`status`,
    m.`resposta`, m.`canal_resposta`, m.`data_resposta`,
    m.`dias_atendimento`, m.`data_criacao`
FROM `manifestacoes` m
JOIN `secretarias` s ON m.`secretaria_id` = s.`id`
JOIN `temas`       t ON m.`tema_id`       = t.`id`;

-- ============================================================
-- 6) VIEW ANALÍTICA COM CTE (indicadores por secretaria)
-- ============================================================

CREATE VIEW `vw_indicadores_secretaria` AS
WITH `base` AS (
    SELECT
        m.`id`,
        m.`secretaria_id`,
        m.`status`,
        m.`data_criacao`,
        m.`data_resposta`,
        CASE WHEN m.`data_resposta` IS NOT NULL
             THEN TIMESTAMPDIFF(DAY, m.`data_criacao`, m.`data_resposta`)
             ELSE NULL
        END AS `dias_ate_resposta`
    FROM `manifestacoes` m
),
`consolidado` AS (
    SELECT
        b.`secretaria_id`,
        COUNT(*)                                                      AS `total`,
        SUM(CASE WHEN b.`status` = 'Pendente'   THEN 1 ELSE 0 END)     AS `pendentes`,
        SUM(CASE WHEN b.`status` = 'Respondida' THEN 1 ELSE 0 END)     AS `respondidas`,
        SUM(CASE WHEN b.`status` = 'Arquivada'  THEN 1 ELSE 0 END)     AS `arquivadas`,
        ROUND(AVG(b.`dias_ate_resposta`), 1)                           AS `media_dias_resposta`
    FROM `base` b
    GROUP BY b.`secretaria_id`
)
SELECT
    s.`id`                                   AS `secretaria_id`,
    s.`nome`                                 AS `secretaria_nome`,
    COALESCE(c.`total`, 0)                   AS `total_manifestacoes`,
    COALESCE(c.`pendentes`, 0)               AS `pendentes`,
    COALESCE(c.`respondidas`, 0)             AS `respondidas`,
    COALESCE(c.`arquivadas`, 0)              AS `arquivadas`,
    COALESCE(c.`media_dias_resposta`, 0)     AS `media_dias_resposta`,
    CASE WHEN COALESCE(c.`total`, 0) = 0 THEN 0
         ELSE ROUND(((COALESCE(c.`respondidas`,0) + COALESCE(c.`arquivadas`,0)) / c.`total`) * 100, 1)
    END                                      AS `taxa_resolucao`
FROM `secretarias` s
LEFT JOIN `consolidado` c ON c.`secretaria_id` = s.`id`;

-- ============================================================
-- 7) PROCEDURES (busca + filtros + paginação, chamadas via CALL na API)
-- ============================================================

DELIMITER $$

CREATE PROCEDURE `sp_listar_manifestacoes` (
    IN `p_exibir`        VARCHAR(20),   -- 'ativas' | 'arquivadas' | 'todas'
    IN `p_secretaria_id` INT,
    IN `p_status`        VARCHAR(20),
    IN `p_busca`         VARCHAR(100),  -- protocolo, nome ou descrição
    IN `p_data_inicio`   DATE,
    IN `p_data_fim`      DATE,
    IN `p_pagina`        INT,           -- 1, 2, 3...
    IN `p_por_pagina`    INT            -- ex.: 10
)
BEGIN
    DECLARE v_offset INT DEFAULT 0;
    DECLARE v_limite INT DEFAULT 10;

    IF p_por_pagina IS NULL OR p_por_pagina < 1 THEN SET v_limite = 10;
    ELSE SET v_limite = p_por_pagina; END IF;

    IF p_pagina IS NULL OR p_pagina < 1 THEN SET v_offset = 0;
    ELSE SET v_offset = (p_pagina - 1) * v_limite; END IF;

    SELECT *
    FROM `vw_manifestacoes_detalhadas`
    WHERE (p_exibir IS NULL OR p_exibir = 'todas'
           OR (p_exibir = 'arquivadas' AND `status` = 'Arquivada')
           OR (p_exibir = 'ativas'     AND `status` <> 'Arquivada'))
      AND (p_secretaria_id IS NULL OR `secretaria_id` = p_secretaria_id)
      AND (p_status        IS NULL OR `status` = p_status)
      AND (p_busca         IS NULL OR p_busca = ''
           OR `protocolo` LIKE CONCAT('%', p_busca, '%')
           OR `nome`      LIKE CONCAT('%', p_busca, '%')
           OR `descricao` LIKE CONCAT('%', p_busca, '%'))
      AND (p_data_inicio IS NULL OR DATE(`data_criacao`) >= p_data_inicio)
      AND (p_data_fim    IS NULL OR DATE(`data_criacao`) <= p_data_fim)
    ORDER BY `data_criacao` DESC
    LIMIT v_limite OFFSET v_offset;
END$$

CREATE PROCEDURE `sp_contar_manifestacoes` (
    IN `p_exibir`        VARCHAR(20),
    IN `p_secretaria_id` INT,
    IN `p_status`        VARCHAR(20),
    IN `p_busca`         VARCHAR(100),
    IN `p_data_inicio`   DATE,
    IN `p_data_fim`      DATE
)
BEGIN
    SELECT COUNT(*) AS `total_registros`
    FROM `vw_manifestacoes_detalhadas`
    WHERE (p_exibir IS NULL OR p_exibir = 'todas'
           OR (p_exibir = 'arquivadas' AND `status` = 'Arquivada')
           OR (p_exibir = 'ativas'     AND `status` <> 'Arquivada'))
      AND (p_secretaria_id IS NULL OR `secretaria_id` = p_secretaria_id)
      AND (p_status        IS NULL OR `status` = p_status)
      AND (p_busca         IS NULL OR p_busca = ''
           OR `protocolo` LIKE CONCAT('%', p_busca, '%')
           OR `nome`      LIKE CONCAT('%', p_busca, '%')
           OR `descricao` LIKE CONCAT('%', p_busca, '%'))
      AND (p_data_inicio IS NULL OR DATE(`data_criacao`) >= p_data_inicio)
      AND (p_data_fim    IS NULL OR DATE(`data_criacao`) <= p_data_fim);
END$$

CREATE PROCEDURE `sp_indicadores_dashboard` (
    IN `p_data_inicio` DATE,
    IN `p_data_fim`    DATE
)
BEGIN
    WITH `periodo` AS (
        SELECT * FROM `vw_manifestacoes_detalhadas`
        WHERE (p_data_inicio IS NULL OR DATE(`data_criacao`) >= p_data_inicio)
          AND (p_data_fim    IS NULL OR DATE(`data_criacao`) <= p_data_fim)
    )
    SELECT
        COUNT(*)                                                   AS `total`,
        SUM(CASE WHEN `status` = 'Pendente' THEN 1 ELSE 0 END)     AS `pendentes`,
        CASE WHEN COUNT(*) = 0 THEN 0
             ELSE ROUND(SUM(CASE WHEN `status` IN ('Respondida','Arquivada') THEN 1 ELSE 0 END)
                        / COUNT(*) * 100, 1)
        END                                                        AS `taxa_resolucao`
    FROM `periodo`;
END$$

DELIMITER ;

-- ============================================================
-- 8) ÍNDICES, AUTO_INCREMENT E CHAVES ESTRANGEIRAS
-- ============================================================

ALTER TABLE `manifestacoes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `protocolo` (`protocolo`),
  ADD KEY `secretaria_id` (`secretaria_id`),
  ADD KEY `tema_id` (`tema_id`);

ALTER TABLE `secretarias`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `temas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `secretaria_id` (`secretaria_id`);

ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

ALTER TABLE `manifestacoes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

ALTER TABLE `secretarias`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

ALTER TABLE `temas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

ALTER TABLE `usuarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

ALTER TABLE `manifestacoes`
  ADD CONSTRAINT `manifestacoes_ibfk_1` FOREIGN KEY (`secretaria_id`) REFERENCES `secretarias` (`id`),
  ADD CONSTRAINT `manifestacoes_ibfk_2` FOREIGN KEY (`tema_id`) REFERENCES `temas` (`id`);

ALTER TABLE `temas`
  ADD CONSTRAINT `temas_ibfk_1` FOREIGN KEY (`secretaria_id`) REFERENCES `secretarias` (`id`) ON DELETE CASCADE;

COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

-- ============================================================
-- 9) TESTES RÁPIDOS (rode na aba SQL do phpMyAdmin para mostrar na banca)
-- ============================================================
-- SELECT * FROM vw_indicadores_secretaria ORDER BY total_manifestacoes DESC;
-- CALL sp_listar_manifestacoes('ativas', NULL, NULL, NULL, NULL, NULL, 1, 10);
-- CALL sp_contar_manifestacoes('ativas', NULL, NULL, NULL, NULL, NULL);
-- CALL sp_indicadores_dashboard(NULL, NULL);
-- SELECT fn_formatar_protocolo(3, 2026);

-- OBS.: se o seu MariaDB reclamar de WITH dentro de CREATE VIEW (versões
-- antigas), troque o corpo da vw_indicadores_secretaria por subqueries
-- (derived tables); o requisito de CTE continua atendido pela
-- sp_indicadores_dashboard, que também usa WITH.
