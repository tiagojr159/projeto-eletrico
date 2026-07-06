<?php
declare(strict_types=1);
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Projeto Elétrico Studio</title>
    <link rel="stylesheet" href="assets/css/app.css">
</head>
<body>
<div id="app">
    <aside class="sidebar">
        <div class="brand">
            <div class="brand-mark">PE</div>
            <div>
                <h1>Projeto Elétrico Studio</h1>
                <p>Editor de planta e dimensionamento</p>
            </div>
        </div>

        <section class="panel cadastros-panel" id="cadastrosPanel">
            <div class="panel-header-inline">
                <h2>Cadastros</h2>
                <button id="toggleCadastrosBtn" class="ghost panel-toggle-btn" type="button" aria-expanded="true" aria-controls="cadastrosBody" data-panel-toggle="cadastrosPanel">Minimizar</button>
            </div>
            <div id="cadastrosBody" class="panel-body">
            <label>Usuário
                <select id="userSelect"></select>
            </label>
            <label>Projeto
                <select id="projectSelect"></select>
            </label>
            <label>Concessionária
                <select id="utilitySelect"></select>
            </label>
            <label>Mao de obra (R$)
                <input id="laborCostInput" type="number" min="0" step="0.01" value="0">
            </label>
            <div class="canvas-size-bar canvas-size-bar-sidebar">
                <strong>Area da planta</strong>
                <label>Largura
                    <input id="planWidthInput" type="number" min="800" max="4000" step="20" value="1400">
                </label>
                <label>Altura
                    <input id="planHeightInput" type="number" min="600" max="4000" step="20" value="900">
                </label>
                <button id="applyCanvasSizeBtn" type="button" class="secondary">Aplicar area</button>
            </div>
            <div class="button-row">
                <button id="newProjectBtn" class="secondary">Novo projeto</button>
                <button id="saveProjectBtn">Salvar</button>
            </div>
            </div>
        </section>

        <section class="panel" id="drawingToolsPanel">
            <div class="panel-header-inline">
                <h2>Ferramentas de desenho</h2>
                <button class="ghost panel-toggle-btn" type="button" aria-expanded="true" aria-controls="drawingToolsBody" data-panel-toggle="drawingToolsPanel">Minimizar</button>
            </div>
            <div id="drawingToolsBody" class="panel-body">
            <div class="tool-grid" id="toolGrid">
                <button data-tool="select" class="tool active">Selecionar</button>
                <button data-tool="wall" class="tool">Parede</button>
                <button data-tool="door" class="tool">Porta</button>
                <button data-tool="window" class="tool">Janela</button>
                <button data-tool="room" class="tool">Ambiente</button>
                <button data-tool="electrical" class="tool">Ponto elétrico</button>
                <button data-tool="pan" class="tool">Mover tela</button>
            </div>
            <div class="button-row">
                <button data-control="undo" class="secondary">Desfazer</button>
                <button data-control="redo" class="secondary">Refazer</button>
            </div>
            </div>
        </section>

        <section class="panel">
            <h2>Biblioteca elétrica</h2>
            <label>Modelo de equipamento
                <select id="equipmentPreset"></select>
            </label>
            <button id="addEquipmentBtn">Adicionar equipamento</button>
            <p class="muted">Ao adicionar, o modelo preenche potência, tensão, altura e legenda automaticamente.</p>
        </section>

        <section class="panel">
            <h2>Resumo automático</h2>
            <div id="summaryCards" class="summary-cards"></div>
            <div class="button-row stacked">
                <button data-control="autoroute" class="secondary">Gerar ligações</button>
                <button data-control="report" class="secondary">Gerar relatório</button>
            </div>
        </section>
    </aside>

    <main class="workspace">
        <header class="topbar">
            <div class="topbar-actions">
                <button id="menuToggleBtn" class="menu-toggle" type="button" aria-expanded="false" aria-controls="appMenu" title="Menu">
                    <span></span>
                    <span></span>
                    <span></span>
                </button>
                <div id="appMenu" class="app-menu" hidden>
                    <button type="button" class="app-menu-item" data-menu-action="export-pdf">Gerar PDF do projeto</button>
                    <div class="app-menu-group">
                        <button type="button" class="app-menu-item app-menu-parent" data-menu-action="toggle-bars">Barras de ferramentas</button>
                        <div class="app-menu-submenu">
                            <button type="button" class="app-menu-subitem" data-menu-action="toggle-main-toolbar">Barra principal</button>
                            <button type="button" class="app-menu-subitem" data-menu-action="toggle-template-toolbar">Barra de modelos</button>
                            <button type="button" class="app-menu-subitem" data-menu-action="toggle-symbol-toolbar">Barra de simbolos</button>
                        </div>
                    </div>
                    <div class="app-menu-group">
                        <button type="button" class="app-menu-item app-menu-parent" data-menu-action="toggle-panels">Painéis</button>
                        <div class="app-menu-submenu">
                            <button type="button" class="app-menu-subitem" data-menu-action="toggle-sidebar">Barra lateral</button>
                            <button type="button" class="app-menu-subitem" data-menu-action="toggle-inspector">Barra de propriedades</button>
                            <button type="button" class="app-menu-subitem" data-menu-action="toggle-distribution">Quadro de distribuição</button>
                            <button type="button" class="app-menu-subitem" data-menu-action="toggle-singleline">Diagrama unifilar</button>
                            <button type="button" class="app-menu-subitem" data-menu-action="toggle-materials">Materiais e orçamento</button>
                        </div>
                    </div>
                    <div class="app-menu-group">
                        <button type="button" class="app-menu-item app-menu-parent" data-menu-action="toggle-text-size">Tamanho da letra</button>
                        <div class="app-menu-submenu">
                            <button type="button" class="app-menu-subitem" data-menu-action="text-size-minimum">Mínimo</button>
                            <button type="button" class="app-menu-subitem" data-menu-action="text-size-small">Pequeno</button>
                            <button type="button" class="app-menu-subitem" data-menu-action="text-size-medium">Medio</button>
                            <button type="button" class="app-menu-subitem" data-menu-action="text-size-large">Grande</button>
                        </div>
                    </div>
                    <button type="button" class="app-menu-item" data-menu-action="show-shortcuts">Mostrar teclas de atalho</button>
                    <button type="button" class="app-menu-item" data-menu-action="show-symbols">Mostrar simbolos da NBR</button>
                    <button type="button" class="app-menu-item" data-menu-action="edit-prices">Editar precos de equipamentos</button>
                </div>
            </div>
            <div class="topbar-brand">
                <div class="woca-badge">
                    <svg viewBox="0 0 48 48" aria-hidden="true">
                        <path d="M10 12h20l8 8v16H10z" fill="none" stroke="currentColor" stroke-width="2.4"/>
                        <path d="M14 28l6-8 6 6 6-10 4 6" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <span>WOCA</span>
                </div>
                <input id="projectNameInput" class="project-title" type="text" placeholder="Projeto sem título">
            </div>
        </header>
        <section class="drawing-toolbar">
            <div class="toolbar-row toolbar-row-main">
                <button class="icon-tool active" data-tool="select" title="Selecionar">
                    <svg viewBox="0 0 40 40"><rect x="8" y="8" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M6 20h-4M34 20h-4M20 6v-4M20 34v-4" stroke="#e24d46" stroke-width="1.8"/><path d="M8 8l-4-4M32 8l4-4M8 32l-4 4M32 32l4 4" stroke="#e24d46" stroke-width="1.8"/></svg>
                </button>
                <button class="icon-tool" data-tool="room" title="Ambiente">
                    <svg viewBox="0 0 40 40"><path d="M8 30V14h10l4-6h10v22" fill="none" stroke="currentColor" stroke-width="2"/><path d="M8 24h24" stroke="#20b8b0" stroke-width="2"/><path d="M13 10l4 6" stroke="#e24d46" stroke-width="2"/></svg>
                </button>
                <button class="icon-tool" data-tool="door" title="Porta">
                    <svg viewBox="0 0 40 40"><path d="M10 30V8h16v22" fill="none" stroke="currentColor" stroke-width="2"/><path d="M22 18v8" stroke="#e24d46" stroke-width="2"/><circle cx="19" cy="19" r="1.2" fill="#20b8b0"/></svg>
                </button>
                <button class="icon-tool" data-tool="wall" title="Parede">
                    <svg viewBox="0 0 40 40"><path d="M8 30L28 10" stroke="currentColor" stroke-width="2"/><path d="M10 32L30 12" stroke="#20b8b0" stroke-width="2"/><path d="M7 33L33 7" stroke="#e24d46" stroke-width="2"/><path d="M27 8l6-1-1 6" fill="none" stroke="#e24d46" stroke-width="1.8"/></svg>
                </button>
                <button class="icon-tool" data-tool="window" title="Janela">
                    <svg viewBox="0 0 40 40"><path d="M8 28h24M14 12v20M26 12v20" stroke="currentColor" stroke-width="2"/><path d="M8 12h24" stroke="#20b8b0" stroke-width="2"/><path d="M22 12l8 8" stroke="#e24d46" stroke-width="2"/></svg>
                </button>
                <button class="icon-tool" data-tool="electrical" title="Tomada">
                    <svg viewBox="0 0 40 40"><circle cx="16" cy="16" r="7" fill="none" stroke="currentColor" stroke-width="2"/><path d="M13 14v4M19 14v4" stroke="currentColor" stroke-width="2"/><path d="M20 24v8" stroke="#e24d46" stroke-width="2"/><path d="M26 11h6v18h-6" fill="none" stroke="#20b8b0" stroke-width="2"/><circle cx="29" cy="17" r="1.2" fill="#e24d46"/></svg>
                </button>
                <button class="icon-tool" data-action="preset-light" title="Luminária">
                    <svg viewBox="0 0 40 40"><path d="M20 10a7 7 0 0 1 7 7c0 3-1.5 4.2-3 6v3h-8v-3c-1.5-1.8-3-3-3-6a7 7 0 0 1 7-7z" fill="none" stroke="currentColor" stroke-width="2"/><path d="M17 29h6M18 32h4" stroke="#20b8b0" stroke-width="2"/><circle cx="11" cy="10" r="5.5" fill="#20b8b0"/><text x="11" y="12.5" text-anchor="middle" font-size="8" fill="#fff" font-family="Arial">A</text></svg>
                </button>
                <button class="icon-tool" data-action="preset-light" title="Ponto de luz com potencia e circuito">
                    <svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="12" fill="white" stroke="currentColor" stroke-width="2"/><path d="M9 20h22" stroke="currentColor" stroke-width="2"/><text x="20" y="16" text-anchor="middle" font-size="7" fill="currentColor" font-family="Arial">100</text><text x="20" y="26" text-anchor="middle" font-size="7" fill="currentColor" font-family="Arial">1a</text></svg>
                </button>
                <button class="icon-tool" data-action="preset-switch" title="Interruptor">
                    <svg viewBox="0 0 40 40"><path d="M12 10h10v20H12z" fill="none" stroke="currentColor" stroke-width="2"/><path d="M17 13v6" stroke="#20b8b0" stroke-width="2"/><path d="M26 12h6v18h-6" fill="none" stroke="#e24d46" stroke-width="2"/><circle cx="29" cy="17" r="1.2" fill="#20b8b0"/></svg>
                </button>
                <button class="icon-tool" data-action="preset-distribution" title="Quadro">
                    <svg viewBox="0 0 40 40"><path d="M10 8h18v24H10z" fill="none" stroke="currentColor" stroke-width="2"/><path d="M10 16h18M16 8v24M22 8v24" stroke="#20b8b0" stroke-width="1.8"/><path d="M14 28h10" stroke="#e24d46" stroke-width="2"/></svg>
                </button>
                <button class="icon-tool" data-tool="free-text" title="Legenda livre">
                    <svg viewBox="0 0 40 40"><path d="M8 12h24M8 20h16M8 28h24" stroke="currentColor" stroke-width="2"/><path d="M28 9v22" stroke="#20b8b0" stroke-width="2"/><path d="M22 30h12" stroke="#e24d46" stroke-width="2"/></svg>
                </button>
                <button class="icon-tool" data-action="rectangle-tool" title="Retangulo colorido">
                    <svg viewBox="0 0 40 40"><rect x="8" y="11" width="24" height="18" rx="2" fill="#f6c86f" stroke="currentColor" stroke-width="2"/><path d="M8 31h24" stroke="#e24d46" stroke-width="2"/></svg>
                </button>
                <button class="icon-tool compact-count" data-action="toggle-tue" title="TUE"><span>1</span><small>TUE</small></button>
                <button class="icon-tool compact-count" data-action="toggle-tug" title="TUG"><span>2</span><small>TUG</small></button>
                <button class="icon-tool" id="generateReportBtn" title="PDF">
                    <svg viewBox="0 0 40 40"><path d="M10 8h20v24H10z" fill="none" stroke="currentColor" stroke-width="2"/><path d="M15 12h10M15 18h10M15 24h10" stroke="#e24d46" stroke-width="2"/><path d="M24 8v8h8" fill="none" stroke="#20b8b0" stroke-width="2"/></svg>
                </button>
                <button class="icon-tool" id="deleteBtn" title="Apagar">
                    <svg viewBox="0 0 40 40"><path d="M13 12h14" stroke="currentColor" stroke-width="2"/><path d="M16 12V9h8v3" stroke="#20b8b0" stroke-width="2"/><path d="M14 15h12l-1 16H15z" fill="none" stroke="currentColor" stroke-width="2"/><path d="M18 19v8M22 19v8" stroke="#e24d46" stroke-width="2"/></svg>
                </button>
                <button class="icon-tool" id="undoBtn" title="Desfazer">
                    <svg viewBox="0 0 40 40"><path d="M15 14l-8 6 8 6" fill="none" stroke="#e24d46" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M17 20h7a8 8 0 0 1 0 16" fill="none" stroke="currentColor" stroke-width="2"/><path d="M28 34l2-2" stroke="#20b8b0" stroke-width="2"/></svg>
                </button>
                <button class="icon-tool" id="redoBtn" title="Refazer">
                    <svg viewBox="0 0 40 40"><path d="M25 14l8 6-8 6" fill="none" stroke="#e24d46" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M23 20h-7a8 8 0 0 0 0 16" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 34l-2-2" stroke="#20b8b0" stroke-width="2"/></svg>
                </button>
            </div>
            <div class="toolbar-row toolbar-row-secondary toolbar-row-templates">
                <button class="mini-icon-tool template-tool" data-action="template-bathroom" title="Projeto: banheiro">
                    <span>Banheiro</span>
                </button>
                <button class="mini-icon-tool template-tool" data-action="template-bedroom" title="Projeto: quarto">
                    <span>Quarto</span>
                </button>
                <button class="mini-icon-tool template-tool" data-action="template-living" title="Projeto: sala">
                    <span>Sala</span>
                </button>
                <button class="mini-icon-tool template-tool" data-action="template-terrace" title="Projeto: terraço">
                    <span>Terraco</span>
                </button>
                <button class="mini-icon-tool template-tool" data-action="template-qgbt" title="Projeto: quadro QGBT">
                    <span>QGBT</span>
                </button>
                <button class="mini-icon-tool" data-action="preset-outlet" title="Tomada de uso geral">
                    <svg viewBox="0 0 40 40"><circle cx="15" cy="17" r="7" fill="none" stroke="currentColor" stroke-width="2"/><path d="M13 15v4M17 15v4" stroke="currentColor" stroke-width="2"/><path d="M22 9h7v18h-7" fill="none" stroke="#20b8b0" stroke-width="2"/><circle cx="25.5" cy="15" r="1.2" fill="#e24d46"/></svg>
                </button>
                <button class="mini-icon-tool" data-action="preset-ac" title="Ar-condicionado">
                    <svg viewBox="0 0 40 40"><path d="M10 13h20v8H10z" fill="none" stroke="currentColor" stroke-width="2"/><path d="M16 13l4-5h7" stroke="#e24d46" stroke-width="2"/><path d="M12 24h16" stroke="#20b8b0" stroke-width="2"/></svg>
                </button>
                <button class="mini-icon-tool" data-action="preset-shower" title="Chuveiro">
                    <svg viewBox="0 0 40 40"><path d="M12 18a8 8 0 0 1 16 0" fill="none" stroke="currentColor" stroke-width="2"/><path d="M20 18v8" stroke="#20b8b0" stroke-width="2"/><path d="M16 26l-2 4M20 26l-2 4M24 26l-2 4" stroke="#e24d46" stroke-width="2"/></svg>
                </button>
                <button class="mini-icon-tool" data-action="preset-microwave" title="Micro-ondas">
                    <svg viewBox="0 0 40 40"><rect x="9" y="12" width="22" height="16" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 16h11" stroke="#20b8b0" stroke-width="2"/><path d="M26 16v8M29 16v8" stroke="#e24d46" stroke-width="2"/></svg>
                </button>
                <button class="mini-icon-tool" data-action="preset-washer" title="Máquina de lavar">
                    <svg viewBox="0 0 40 40"><rect x="11" y="8" width="18" height="24" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="20" cy="21" r="6" fill="none" stroke="#20b8b0" stroke-width="2"/><path d="M14 12h2M18 12h2" stroke="#e24d46" stroke-width="2"/></svg>
                </button>
                <button class="mini-icon-tool" data-action="preset-led" title="Luminaria de LED">
                    <svg viewBox="0 0 40 40"><path d="M20 10a7 7 0 0 1 7 7c0 3-1.5 4.2-3 6v3h-8v-3c-1.5-1.8-3-3-3-6a7 7 0 0 1 7-7z" fill="none" stroke="currentColor" stroke-width="2"/><path d="M17 29h6M18 32h4" stroke="#20b8b0" stroke-width="2"/><path d="M10 13l2-2M28 13l2-2M20 7V4" stroke="#e24d46" stroke-width="2" stroke-linecap="round"/></svg>
                </button>
                <button class="mini-icon-tool" data-action="insert-dr" title="Inserir DR">
                    <svg viewBox="0 0 40 40"><rect x="9" y="9" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"/><text x="20" y="23" text-anchor="middle" font-size="10" fill="currentColor" font-family="Arial">DR</text></svg>
                </button>
                <button class="mini-icon-tool" data-action="insert-dps" title="Inserir DPS">
                    <svg viewBox="0 0 40 40"><rect x="15" y="8" width="10" height="24" fill="none" stroke="currentColor" stroke-width="2"/><path d="M17 27l6-14" stroke="#e24d46" stroke-width="2" stroke-linecap="round"/><path d="M13 12h4M23 28h4" stroke="#20b8b0" stroke-width="2" stroke-linecap="round"/></svg>
                </button>
                <button class="mini-icon-tool" id="autoRouteBtn" title="Gerar ligações">
                    <svg viewBox="0 0 40 40"><path d="M10 20h8l5-6 7 8" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="10" cy="20" r="3" fill="#e24d46"/><circle cx="23" cy="14" r="3" fill="#20b8b0"/><circle cx="30" cy="22" r="3" fill="#20b8b0"/></svg>
                </button>
                <button class="mini-icon-tool" data-tool="pan" title="Mover tela">
                    <svg viewBox="0 0 40 40"><path d="M20 8v24M8 20h24" stroke="currentColor" stroke-width="2"/><path d="M20 8l-4 4M20 8l4 4M32 20l-4-4M32 20l-4 4M20 32l-4-4M20 32l4-4M8 20l4-4M8 20l4 4" stroke="#20b8b0" stroke-width="2"/></svg>
                </button>
                <button class="mini-icon-tool" id="zoomOutBtn" title="Zoom menos">
                    <svg viewBox="0 0 40 40"><circle cx="17" cy="17" r="8" fill="none" stroke="currentColor" stroke-width="2"/><path d="M13 17h8" stroke="#e24d46" stroke-width="2"/><path d="M23 23l7 7" stroke="#20b8b0" stroke-width="2"/></svg>
                </button>
                <button class="mini-icon-tool" id="zoomInBtn" title="Zoom mais">
                    <svg viewBox="0 0 40 40"><circle cx="17" cy="17" r="8" fill="none" stroke="currentColor" stroke-width="2"/><path d="M13 17h8M17 13v8" stroke="#e24d46" stroke-width="2"/><path d="M23 23l7 7" stroke="#20b8b0" stroke-width="2"/></svg>
                </button>
                <button class="mini-icon-tool" id="fitBtn" title="Centralizar">
                    <svg viewBox="0 0 40 40"><path d="M8 14V8h6M32 14V8h-6M8 26v6h6M32 26v6h-6" fill="none" stroke="#e24d46" stroke-width="2"/><rect x="14" y="14" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"/></svg>
                </button>
                <span class="zoom-chip" id="zoomLabel">100%</span>
            </div>
            <div class="toolbar-row toolbar-row-symbols" id="symbolToolbar"></div>
        </section>

        <section class="canvas-layout">
            <div class="canvas-panel">
                <div class="canvas-header">
                    <strong>Planta baixa</strong>
                    <span id="toolHint">Clique na ferramenta e use o grid para desenhar.</span>
                </div>
                <div id="canvasViewport" class="canvas-viewport">
                    <canvas id="planCanvas" width="1400" height="900"></canvas>
                </div>
            </div>

            <aside class="inspector">
                <section class="panel distribution-board-panel">
                    <h2>Propriedades</h2>
                    <form id="inspectorForm">
                        <label>Nome
                            <input id="propName" type="text">
                        </label>
                        <label>Tipo do equipamento
                            <input id="propType" type="text">
                        </label>
                        <label>Potência (VA/W)
                            <input id="propPower" type="number" min="0" step="1">
                        </label>
                        <label>Tensão
                            <select id="propVoltage">
                                <option value="127">127V</option>
                                <option value="220">220V</option>
                            </select>
                        </label>
                        <label>Altura de instalação
                            <select id="propHeight">
                                <option value="Baixa">Baixa</option>
                                <option value="Média">Média</option>
                                <option value="Alta">Alta</option>
                                <option value="Teto">Teto</option>
                            </select>
                        </label>
                        <label>Circuito
                            <input id="propCircuit" type="text">
                        </label>
                        <label>Conectar também a
                            <select id="propManualRoute">
                                <option value="">Nenhum</option>
                            </select>
                        </label>
                        <label class="checkbox">
                            <input id="propLegendBox" type="checkbox">
                            Exibir na caixa de legenda
                        </label>
                        <label class="checkbox">
                            <input id="propLegendLabel" type="checkbox">
                            Exibir legenda perto do objeto
                        </label>
                        <button id="editRectangleColorBtn" type="button" class="secondary" hidden>Alterar cor do retangulo</button>
                        <button id="flipHorizontalBtn" type="button" class="secondary">Girar 30°</button>
                        <button type="submit">Atualizar item</button>
                    </form>
                </section>

                <section class="panel single-line-panel">
                    <h2>Quadro de distribuição</h2>
                    <div id="distributionBoard" class="report-box"></div>
                </section>

                <section class="panel materials-panel">
                    <h2>Diagrama unifilar</h2>
                    <div id="singleLineDiagram" class="report-box"></div>
                </section>

                <section class="panel">
                    <h2>Materiais e orçamento</h2>
                    <div id="materialsBox" class="report-box"></div>
                </section>
            </aside>
        </section>
    </main>
</div>

<div id="menuBackdrop" class="menu-backdrop" hidden></div>

<div id="priceModal" class="modal-shell" hidden>
    <div class="modal-backdrop" data-close-modal="prices"></div>
    <section class="modal-card price-modal-card" role="dialog" aria-modal="true" aria-labelledby="priceModalTitle">
        <div class="modal-header">
            <div>
                <h2 id="priceModalTitle">Precos de equipamentos e materiais</h2>
                <p class="muted">Atualize os valores usados no orcamento do projeto atual.</p>
            </div>
            <button id="closePriceModalBtn" class="modal-close" type="button" aria-label="Fechar">x</button>
        </div>
        <form id="priceEditorForm" class="price-editor-form">
            <div class="price-editor-grid">
                <section>
                    <h3>Equipamentos</h3>
                    <div id="equipmentPriceList" class="price-list"></div>
                </section>
                <section>
                    <h3>Materiais</h3>
                    <div id="materialPriceList" class="price-list"></div>
                </section>
            </div>
            <div class="modal-actions">
                <button type="button" id="cancelPriceModalBtn" class="secondary">Cancelar</button>
                <button type="submit">Salvar precos</button>
            </div>
        </form>
    </section>
</div>

<div id="shortcutsModal" class="modal-shell" hidden>
    <div class="modal-backdrop" data-close-modal="shortcuts"></div>
    <section class="modal-card shortcuts-modal-card" role="dialog" aria-modal="true" aria-labelledby="shortcutsModalTitle">
        <div class="modal-header">
            <div>
                <h2 id="shortcutsModalTitle">Teclas de atalho</h2>
                <p class="muted">Atalhos disponiveis no editor.</p>
            </div>
            <button id="closeShortcutsModalBtn" class="modal-close" type="button" aria-label="Fechar">x</button>
        </div>
        <div id="shortcutsList" class="shortcuts-list"></div>
    </section>
</div>

<div id="symbolsModal" class="modal-shell" hidden>
    <div class="modal-backdrop" data-close-modal="symbols"></div>
    <section class="modal-card symbols-modal-card" role="dialog" aria-modal="true" aria-labelledby="symbolsModalTitle">
        <div class="modal-header">
            <div>
                <h2 id="symbolsModalTitle">Simbolos da NBR</h2>
                <p class="muted">Todos os simbolos cadastrados no sistema.</p>
                <p class="muted"><a href="NBR_5444-1989_Simbolos_Graficos_para_Instalacoes_Prediais.pdf" target="_blank" rel="noopener">Abrir manual NBR 5444-1989 em PDF</a></p>
            </div>
            <button id="closeSymbolsModalBtn" class="modal-close" type="button" aria-label="Fechar">x</button>
        </div>
        <div id="symbolsGallery" class="symbols-gallery"></div>
    </section>
</div>

<div id="rectangleColorModal" class="modal-shell" hidden>
    <div class="modal-backdrop" data-close-modal="rectangle-color"></div>
    <section class="modal-card rectangle-color-modal-card" role="dialog" aria-modal="true" aria-labelledby="rectangleColorModalTitle">
        <div class="modal-header">
            <div>
                <h2 id="rectangleColorModalTitle">Cor do retangulo</h2>
                <p class="muted">Escolha uma cor para criar ou atualizar o retangulo.</p>
            </div>
            <button id="closeRectangleColorModalBtn" class="modal-close" type="button" aria-label="Fechar">x</button>
        </div>
        <div id="rectangleColorPalette" class="color-palette"></div>
    </section>
</div>

<template id="reportTemplate">
    <div class="report-sheet">
        <h1>Relatório do Projeto</h1>
        <div id="reportContent"></div>
    </div>
</template>

<script src="assets/js/app.js"></script>
</body>
</html>
