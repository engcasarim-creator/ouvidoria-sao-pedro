-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Tempo de geração: 18/09/2026 às 06:38
-- Versão do servidor: 10.4.32-MariaDB
-- Versão do PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Banco de dados: `ouvidoria_sao_pedro`
--

DELIMITER $$
--
-- Procedimentos
--
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_filtrar_ouvidoria` (IN `p_secretaria_id` INT, IN `p_status` VARCHAR(20), IN `p_data_inicio` DATE, IN `p_data_fim` DATE)   BEGIN
    SELECT * FROM vw_manifestacoes_detalhadas
    WHERE (p_secretaria_id IS NULL OR secretaria_id = p_secretaria_id)
      AND (p_status IS NULL OR status = p_status)
      AND (p_data_inicio IS NULL OR DATE(data_criacao) >= p_data_inicio)
      AND (p_data_fim IS NULL OR DATE(data_criacao) <= p_data_fim)
    ORDER BY data_criacao DESC;
END$$

--
-- Funções
--
CREATE DEFINER=`root`@`localhost` FUNCTION `fn_formatar_protocolo` (`id_manifestacao` INT, `ano` INT) RETURNS VARCHAR(20) CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci DETERMINISTIC BEGIN
    RETURN CONCAT('OUV-', LPAD(id_manifestacao, 5, '0'), '/', ano);
END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Estrutura para tabela `manifestacoes`
--

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

--
-- Despejando dados para a tabela `manifestacoes`
--

INSERT INTO `manifestacoes` (`id`, `protocolo`, `tipo`, `nome`, `email`, `telefone`, `secretaria_id`, `tema_id`, `descricao`, `anexo`, `anexo_url`, `status`, `resposta`, `canal_resposta`, `data_resposta`, `dias_atendimento`, `data_criacao`) VALUES
(1, 'M20260918-A992', 'identificado', 'Renan Albuquerque', 'engcasarim@gmail.com', '44999003035', 2, 1, 'Teste', NULL, NULL, 'Respondida', 'Testado', NULL, '2026-09-17 23:48:43', 0, '2026-09-17 23:47:24'),
(2, 'M20260918-0F59', 'identificado', 'Renan Albuquerque', 'engcasarim@gmail.com', '44999003035', 5, 1, 'Falta médico no postinho', NULL, NULL, 'Pendente', NULL, NULL, NULL, 0, '2026-09-17 23:51:36'),
(3, 'M20260918-567E', 'identificado', 'Renan Henrique Casarim de Albuquerque', 'engcasarim@gmail.com', '44999003035', 4, 1, 'Falta professor', NULL, NULL, 'Respondida', 'Testando', 'Telefone / WhatsApp', '2026-09-18 00:04:40', 0, '2026-09-18 00:04:12'),
(4, 'M20260918-8E19', 'identificado', 'Renan Albuquerque', 'engcasarim@gmail.com', '44999003035', 8, 2, 'Falta luz no bosque', NULL, NULL, 'Arquivada', 'Lampada comprada', 'email', '2026-09-18 00:15:48', 0, '2026-09-18 00:11:48');

--
-- Acionadores `manifestacoes`
--
DELIMITER $$
CREATE TRIGGER `trg_valida_dias_atendimento` BEFORE UPDATE ON `manifestacoes` FOR EACH ROW BEGIN
    IF NEW.dias_atendimento < 0 THEN
        SET NEW.dias_atendimento = 0;
    END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estrutura para tabela `secretarias`
--

CREATE TABLE `secretarias` (
  `id` int(11) NOT NULL,
  `nome` varchar(150) NOT NULL,
  `ativa` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `secretarias`
--

INSERT INTO `secretarias` (`id`, `nome`, `ativa`) VALUES
(1, 'Secretaria de Indústria, Comércio e Fomento Agropecuário', 1),
(2, 'Secretaria de Esportes', 1),
(3, 'Secretaria de Assistência Social', 1),
(4, 'Secretaria da Educação', 1),
(5, 'Secretaria da Saúde', 1),
(6, 'Secretaria de Administração Geral', 1),
(7, 'Secretaria de Diretoria de Viação, Obras e Urbanismo', 1),
(8, 'Secretaria do Meio Ambiente e Turismo', 1);

-- --------------------------------------------------------

--
-- Estrutura para tabela `temas`
--

CREATE TABLE `temas` (
  `id` int(11) NOT NULL,
  `secretaria_id` int(11) NOT NULL,
  `nome` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `temas`
--

INSERT INTO `temas` (`id`, `secretaria_id`, `nome`) VALUES
(1, 5, 'Atendimento no Posto de Saúde'),
(2, 5, 'Falta de Medicamentos'),
(3, 7, 'Iluminação Pública'),
(4, 7, 'Tapa-buracos / Pavimentação'),
(5, 4, 'Merenda Escolar'),
(6, 4, 'Transporte Escolar');

-- --------------------------------------------------------

--
-- Estrutura para tabela `usuarios`
--

CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL,
  `nome` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `senha` varchar(255) NOT NULL,
  `cargo` varchar(50) DEFAULT 'Atendente',
  `data_criacao` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `usuarios`
--

INSERT INTO `usuarios` (`id`, `nome`, `email`, `senha`, `cargo`, `data_criacao`) VALUES
(2, 'Administrador Ouvidoria', 'admin@saopedrodoparana.pr.gov.br', '$2y$10$XmS583cU4qTo2aI3p1rt4ecbfPDV9IGuHENZLscFhuLYbgZ2KltG2', 'Administrador', '2026-09-17 01:32:15');

-- --------------------------------------------------------

--
-- Estrutura stand-in para view `vw_manifestacoes_detalhadas`
-- (Veja abaixo para a visão atual)
--
CREATE TABLE `vw_manifestacoes_detalhadas` (
`id` int(11)
,`protocolo` varchar(20)
,`tipo` enum('anonimo','identificado')
,`nome` varchar(100)
,`email` varchar(100)
,`telefone` varchar(20)
,`secretaria_id` int(11)
,`secretaria_nome` varchar(150)
,`tema_id` int(11)
,`tema_nome` varchar(100)
,`descricao` text
,`anexo_url` varchar(255)
,`status` enum('Pendente','Respondida','Arquivada','Cancelada')
,`resposta` text
,`data_resposta` datetime
,`dias_atendimento` int(11)
,`data_criacao` datetime
);

-- --------------------------------------------------------

--
-- Estrutura para view `vw_manifestacoes_detalhadas`
--
DROP TABLE IF EXISTS `vw_manifestacoes_detalhadas`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vw_manifestacoes_detalhadas`  AS SELECT `m`.`id` AS `id`, `m`.`protocolo` AS `protocolo`, `m`.`tipo` AS `tipo`, `m`.`nome` AS `nome`, `m`.`email` AS `email`, `m`.`telefone` AS `telefone`, `m`.`secretaria_id` AS `secretaria_id`, `s`.`nome` AS `secretaria_nome`, `m`.`tema_id` AS `tema_id`, `t`.`nome` AS `tema_nome`, `m`.`descricao` AS `descricao`, `m`.`anexo_url` AS `anexo_url`, `m`.`status` AS `status`, `m`.`resposta` AS `resposta`, `m`.`data_resposta` AS `data_resposta`, `m`.`dias_atendimento` AS `dias_atendimento`, `m`.`data_criacao` AS `data_criacao` FROM ((`manifestacoes` `m` join `secretarias` `s` on(`m`.`secretaria_id` = `s`.`id`)) join `temas` `t` on(`m`.`tema_id` = `t`.`id`)) ;

--
-- Índices para tabelas despejadas
--

--
-- Índices de tabela `manifestacoes`
--
ALTER TABLE `manifestacoes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `protocolo` (`protocolo`),
  ADD KEY `secretaria_id` (`secretaria_id`),
  ADD KEY `tema_id` (`tema_id`);

--
-- Índices de tabela `secretarias`
--
ALTER TABLE `secretarias`
  ADD PRIMARY KEY (`id`);

--
-- Índices de tabela `temas`
--
ALTER TABLE `temas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `secretaria_id` (`secretaria_id`);

--
-- Índices de tabela `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT para tabelas despejadas
--

--
-- AUTO_INCREMENT de tabela `manifestacoes`
--
ALTER TABLE `manifestacoes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de tabela `secretarias`
--
ALTER TABLE `secretarias`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de tabela `temas`
--
ALTER TABLE `temas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de tabela `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Restrições para tabelas despejadas
--

--
-- Restrições para tabelas `manifestacoes`
--
ALTER TABLE `manifestacoes`
  ADD CONSTRAINT `manifestacoes_ibfk_1` FOREIGN KEY (`secretaria_id`) REFERENCES `secretarias` (`id`),
  ADD CONSTRAINT `manifestacoes_ibfk_2` FOREIGN KEY (`tema_id`) REFERENCES `temas` (`id`);

--
-- Restrições para tabelas `temas`
--
ALTER TABLE `temas`
  ADD CONSTRAINT `temas_ibfk_1` FOREIGN KEY (`secretaria_id`) REFERENCES `secretarias` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
