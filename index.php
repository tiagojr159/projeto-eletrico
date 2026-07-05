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

        <section class="panel">
            <h2>Cadastros</h2>
            <label>Usuário
                <select id="userSelect"></select>
            </label>
            <label>Projeto
                <select id="projectSelect"></select>
            </label>
            <label>Concessionária
                <select id="utilitySelect"></select>
            </label>
            <div class="button-row">
                <button id="newProjectBtn" class="secondary">Novo projeto</button>
                <button id="saveProjectBtn">Salvar</button>
            </div>
        </section>

        <section class="panel">
            <h2>Ferramentas de desenho</h2>
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
                <button id="undoBtn" class="secondary">Desfazer</button>
                <button id="redoBtn" class="secondary">Refazer</button>
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
                <button id="autoRouteBtn" class="secondary">Gerar ligações</button>
                <button id="generateReportBtn" class="secondary">Gerar relatório</button>
            </div>
        </section>
    </aside>

    <main class="workspace">
        <header class="topbar">
            <div>
                <input id="projectNameInput" class="project-title" type="text" placeholder="Nome do projeto">
            </div>
            <div class="topbar-actions">
                <button id="zoomOutBtn" class="ghost">-</button>
                <span id="zoomLabel">100%</span>
                <button id="zoomInBtn" class="ghost">+</button>
                <button id="fitBtn" class="ghost">Centralizar</button>
            </div>
        </header>

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
                <section class="panel">
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
                        <label class="checkbox">
                            <input id="propLegend" type="checkbox">
                            Exibir na legenda
                        </label>
                        <button type="submit">Atualizar item</button>
                    </form>
                </section>

                <section class="panel">
                    <h2>Quadro de distribuição</h2>
                    <div id="distributionBoard" class="report-box"></div>
                </section>

                <section class="panel">
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

<template id="reportTemplate">
    <div class="report-sheet">
        <h1>Relatório do Projeto</h1>
        <div id="reportContent"></div>
    </div>
</template>

<script src="assets/js/app.js"></script>
</body>
</html>
