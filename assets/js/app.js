const GRID_SIZE = 20;
const CIRCUIT_SEQUENCE = "abcdefghijklmnopqrstuvwxyz";
const SELECTION_HANDLE_SIZE = 10;
const TOUCH_HANDLE_HIT_SIZE = 28;
const TOUCH_ITEM_HIT_PADDING = 18;
const symbolImageCache = new Map();
const OUTLET_SYMBOL_BY_HEIGHT = {
    baixa: "outlet-light-low",
    media: "outlet-light-medium",
    alta: "outlet-light-high",
    piso: "light-outlet-floor",
    teto: "light-outlet-ceiling",
};
const POWER_OUTLET_SYMBOL_BY_HEIGHT = {
    baixa: "power-outlet-wall",
    media: "power-outlet-wall",
    alta: "power-outlet-wall",
    piso: "power-outlet-floor",
    teto: "power-outlet-ceiling",
};

const BRAZILIAN_ELECTRICAL_RULES = {
    source: "ABNT NBR 5410 / NR-10 / concessionaria local",
    lowVoltageLimitVac: 1000,
    lightingMinimumVa: 100,
    generalOutletBedroomLivingVa: 100,
    wetAreaFirstOutletsVa: 600,
    exclusiveLoadThresholdW: 1200,
};

const SYMBOL_LIBRARY = [
    { key: "light-ceiling", name: "Ponto de luz incandescente no teto", category: "Iluminação", power: 100, voltage: 127, height: "Teto", circuitType: "Iluminação" },
    { key: "light-wall", name: "Ponto de luz incandescente na parede", category: "Iluminação", power: 100, voltage: 127, height: "Média", circuitType: "Iluminação" },
    { key: "light-not-embedded", name: "Ponto de luz não embutido", category: "Iluminação", power: 100, voltage: 127, height: "Teto", circuitType: "Iluminação" },
    { key: "light-embedded", name: "Ponto de luz embutido", category: "Iluminação", power: 100, voltage: 127, height: "Teto", circuitType: "Iluminação" },
    { key: "fluorescent-not-embedded", name: "Ponto de luz fluorescente não embutido", category: "Iluminação", power: 100, voltage: 127, height: "Teto", circuitType: "Iluminação" },
    { key: "fluorescent-embedded", name: "Ponto de luz fluorescente embutido", category: "Iluminação", power: 100, voltage: 127, height: "Teto", circuitType: "Iluminação" },
    { key: "circuit-up", name: "Circuito que sobe", category: "Condutor", power: 0, voltage: 127, height: "Média", circuitType: "Infraestrutura" },
    { key: "circuit-down", name: "Circuito que desce", category: "Condutor", power: 0, voltage: 127, height: "Média", circuitType: "Infraestrutura" },
    { key: "circuit-pass", name: "Circuito que passa", category: "Condutor", power: 0, voltage: 127, height: "Média", circuitType: "Infraestrutura" },
    { key: "switch-1", name: "Interruptor de 1 seção", category: "Interruptor", power: 0, voltage: 127, height: "Média", circuitType: "Comando" },
    { key: "outlet-light-low", name: "Tomada de luz baixa", category: "Tomada", power: 100, voltage: 127, height: "Baixa", circuitType: "TUG" },
    { key: "outlet-light-medium", name: "Tomada de luz média alta", category: "Tomada", power: 100, voltage: 127, height: "Média", circuitType: "TUG" },
    { key: "outlet-light-high", name: "Tomada de luz alta", category: "Tomada", power: 100, voltage: 127, height: "Alta", circuitType: "TUG" },
    { key: "light-outlet-floor", name: "Tomada de luz no piso", category: "Tomada", power: 100, voltage: 127, height: "Piso", circuitType: "TUG" },
    { key: "light-outlet-ceiling", name: "Tomada de luz no teto", category: "Tomada", power: 100, voltage: 127, height: "Teto", circuitType: "TUG" },
    { key: "power-outlet-wall", name: "Tomada de força na parede", category: "Tomada de força", power: 600, voltage: 127, height: "Média", circuitType: "TUG" },
    { key: "power-outlet-floor", name: "Tomada de força no piso", category: "Tomada de força", power: 600, voltage: 127, height: "Piso", circuitType: "TUG" },
    { key: "power-outlet-ceiling", name: "Tomada de força no teto", category: "Tomada de força", power: 600, voltage: 127, height: "Teto", circuitType: "TUG" },
    { key: "radio-tv", name: "Tomada para rádio e TV", category: "Comunicação", power: 0, voltage: 127, height: "Média", circuitType: "Comunicação" },
    { key: "passage-box", name: "Caixa de passagem", category: "Caixa", power: 0, voltage: 127, height: "Média", circuitType: "Infraestrutura" },
    { key: "partial-board", name: "Quadro parcial de luz ou força", category: "Quadro", power: 0, voltage: 220, height: "Média", circuitType: "Quadro" },
    { key: "main-board-not-embedded", name: "Quadro geral de luz ou força não embutido", category: "Quadro", power: 0, voltage: 220, height: "Média", circuitType: "Quadro" },
    { key: "main-board-embedded", name: "Quadro geral de luz ou força embutido", category: "Quadro", power: 0, voltage: 220, height: "Média", circuitType: "Quadro" },
    { key: "phone-box", name: "Caixa de telefone", category: "Comunicação", power: 0, voltage: 127, height: "Média", circuitType: "Comunicação" },
    { key: "conduit-ceiling-wall", name: "Eletroduto no teto ou na parede", category: "Eletroduto", power: 0, voltage: 127, height: "Teto", circuitType: "Infraestrutura" },
    { key: "conduit-floor", name: "Eletroduto no piso", category: "Eletroduto", power: 0, voltage: 127, height: "Piso", circuitType: "Infraestrutura" },
    { key: "phone-tube-external", name: "Tubulação para telefone externo", category: "Comunicação", power: 0, voltage: 127, height: "Média", circuitType: "Comunicação" },
    { key: "phone-tube-internal", name: "Tubulação para telefone interno", category: "Comunicação", power: 0, voltage: 127, height: "Média", circuitType: "Comunicação" },
    { key: "conductors-fnt", name: "Condutores de fase, neutro, retorno e terra em eletroduto", category: "Condutor", power: 0, voltage: 127, height: "Média", circuitType: "Infraestrutura" },
    { key: "minute-button", name: "Botão de minuteria", category: "Comando", power: 0, voltage: 127, height: "Média", circuitType: "Comando" },
    { key: "minute-timer", name: "Minuteria", category: "Comando", power: 0, voltage: 127, height: "Média", circuitType: "Comando" },
    { key: "ground", name: "Ligação à terra", category: "Aterramento", power: 0, voltage: 127, height: "Baixa", circuitType: "Aterramento" },
];

const PROJECT_TEMPLATES = {
    bathroom: {
        name: "banheiro",
        width: 300,
        height: 300,
        style: "technical-filled",
        roomLabel: { x: 124, y: 190 },
        doors: [{ x: 95, y: 280, width: 90, height: 20 }],
        windows: [{ x: 90, y: 0, width: 120, height: 18 }, { x: 280, y: 120, width: 20, height: 80 }],
        devices: [{ kind: "floor-cutout", x: 85, y: 270, width: 120, height: 40, layer: "overlay" }],
        electrical: [
            { name: "Ponto de luz banheiro", type: "Iluminacao", symbol: "light", x: 150, y: 140, power: 100, height: "Teto", labelDx: 36, labelDy: 58, routeCenter: true },
            { name: "Interruptor banheiro", type: "Interruptor", symbol: "switch", x: 110, y: 275, power: 0, height: "Media", labelDx: 18, labelDy: 34 },
            { name: "Tomada lavatorio 600VA", type: "Tomada", symbol: "power-outlet-wall", x: 25, y: 145, power: 600, height: "Media", labelDx: 32, labelDy: 26 },
            { name: "Tomada apoio 600VA", type: "Tomada", symbol: "power-outlet-wall", x: 275, y: 145, power: 600, height: "Media", rotation: 180, labelDx: 30, labelDy: 26 },
            { name: "Chuveiro eletrico", type: "TUE", symbol: "shower", x: 225, y: 55, power: 5500, voltage: 220, height: "Alta", labelDx: 28, labelDy: 8 }
        ]
    },
    bedroom: {
        name: "quarto",
        width: 420,
        height: 280,
        style: "technical-filled",
        roomLabel: { x: 190, y: 160 },
        doors: [{ x: 330, y: 260, width: 70, height: 20 }],
        windows: [{ x: 130, y: 0, width: 160, height: 18 }],
        devices: [{ kind: "floor-cutout", x: 320, y: 250, width: 90, height: 40, layer: "overlay" }],
        electrical: [
            { name: "Ponto de luz quarto", type: "Iluminacao", symbol: "light", x: 210, y: 130, power: 160, height: "Teto", labelDx: 26, labelDy: 42, routeCenter: true },
            { name: "Interruptor quarto", type: "Interruptor", symbol: "switch", x: 335, y: 252, power: 0, height: "Media", labelDx: 18, labelDy: 34 },
            { name: "Tomada cabeceira esquerda", type: "Tomada", symbol: "outlet-light-low", x: 35, y: 130, power: 100, height: "Baixa", labelDx: 30, labelDy: 18 },
            { name: "Tomada cabeceira direita", type: "Tomada", symbol: "outlet-light-low", x: 385, y: 130, power: 100, height: "Baixa", rotation: 180, labelDx: -108, labelDy: 18 },
            { name: "Tomada TV quarto 600VA", type: "Tomada", symbol: "power-outlet-wall", x: 270, y: 260, power: 600, height: "Media", rotation: -90, labelDx: 28, labelDy: 22 },
            { name: "Ar condicionado 10kBTU", type: "TUE", symbol: "ac", x: 335, y: 45, power: 1522, voltage: 220, height: "Alta", labelDx: -92, labelDy: 18 }
        ]
    },
    living: {
        name: "sala",
        width: 1040,
        height: 420,
        roomWidth: 420,
        roomHeight: 420,
        style: "reference-model",
        roomLabel: { x: 188, y: 250 },
        doors: [{ x: 70, y: 400, width: 90, height: 20 }],
        windows: [{ x: 150, y: 0, width: 120, height: 20 }, { x: 400, y: 130, width: 20, height: 90 }],
        embeds: [{ template: "qgbt", x: 600, y: 90 }],
        electrical: [
            { name: "Luminaria LED", type: "Iluminacao", symbol: "light", x: 205, y: 205, power: 20, height: "Teto", labelDx: 28, labelDy: 56, routeCenter: true },
            { name: "Interruptor sala", type: "Interruptor", symbol: "switch", x: 170, y: 395, power: 0, height: "Media", labelDx: 18, labelDy: 34 },
            { name: "Tomada de uso geral", type: "Tomada", symbol: "outlet-light-low", x: 22, y: 160, power: 100, height: "Baixa", labelDx: -42, labelDy: 12 },
            { name: "Tomada de uso geral", type: "Tomada", symbol: "outlet-light-low", x: 22, y: 210, power: 100, height: "Baixa", labelDx: -42, labelDy: 12 },
            { name: "Tomada de uso geral", type: "Tomada", symbol: "outlet-light-low", x: 398, y: 160, power: 100, height: "Baixa", rotation: 180, labelDx: 30, labelDy: 12 },
            { name: "Tomada de uso geral", type: "Tomada", symbol: "outlet-light-low", x: 398, y: 210, power: 100, height: "Baixa", rotation: 180, labelDx: 30, labelDy: 12 },
            { name: "Tomada de uso geral", type: "Tomada", symbol: "power-outlet-wall", x: 285, y: 400, power: 600, height: "Media", rotation: -90, labelDx: 28, labelDy: 22 },
            { name: "Ar condicionado 10kBTU", type: "TUE", symbol: "ac", x: 285, y: 38, power: 1522, voltage: 220, height: "Alta", labelDx: 24, labelDy: 22 }
        ]
    },
    terrace: {
        name: "terraco",
        width: 420,
        height: 240,
        style: "reference-model",
        roomLabel: { x: 190, y: 140 },
        doors: [{ x: 250, y: 220, width: 90, height: 20 }],
        windows: [{ x: 115, y: 0, width: 200, height: 18 }],
        electrical: [
            { name: "Ponto de luz terraco", type: "Iluminacao", symbol: "light", x: 210, y: 118, power: 100, height: "Teto", labelDx: 28, labelDy: 40, routeCenter: true },
            { name: "Interruptor terraco", type: "Interruptor", symbol: "switch", x: 170, y: 222, power: 0, height: "Media", labelDx: 18, labelDy: 34 },
            { name: "Arandela externa", type: "Iluminacao", symbol: "light-wall", x: 35, y: 115, power: 100, height: "Media", labelDx: 30, labelDy: 18 },
            { name: "Tomada externa 600VA", type: "Tomada", symbol: "power-outlet-wall", x: 385, y: 115, power: 600, height: "Media", rotation: 180, labelDx: -122, labelDy: 18 },
            { name: "Tomada de uso geral", type: "Tomada", symbol: "outlet-light-low", x: 35, y: 165, power: 100, height: "Baixa", labelDx: 30, labelDy: 18 },
            { name: "Tomada de uso geral", type: "Tomada", symbol: "outlet-light-low", x: 385, y: 165, power: 100, height: "Baixa", rotation: 180, labelDx: -92, labelDy: 18 }
        ]
    },
    qgbt: {
        name: "QGBT",
        skipRoom: true,
        width: 560,
        height: 220,
        lines: [
            { x: 70, y: 30, x2: 430, y2: 30 }, { x: 70, y: 30, x2: 70, y2: 190 }, { x: 430, y: 30, x2: 430, y2: 190 }, { x: 70, y: 190, x2: 430, y2: 190 },
            { x: 25, y: 100, x2: 110, y2: 100 }, { x: 150, y: 100, x2: 285, y2: 100 }, { x: 285, y: 60, x2: 285, y2: 150 },
            { x: 285, y: 60, x2: 365, y2: 60 }, { x: 285, y: 105, x2: 365, y2: 105 }, { x: 285, y: 150, x2: 365, y2: 150 },
            { x: 365, y: 60, x2: 520, y2: 60 }, { x: 365, y: 105, x2: 520, y2: 105 }, { x: 365, y: 150, x2: 520, y2: 150 },
            { x: 150, y: 100, x2: 150, y2: 155 }, { x: 150, y: 155, x2: 150, y2: 175 }
        ],
        texts: [
            { text: "QGBT", x: 70, y: 18, size: 16, baseline: "top" },
            { text: "1#10(10)", x: 12, y: 92, size: 14 },
            { text: "40 A", x: 120, y: 72, size: 14, align: "center" },
            { text: "40 A", x: 170, y: 72, size: 12, align: "center" },
            { text: "DPS", x: 160, y: 122, size: 15, baseline: "top" },
            { text: "2xII", x: 160, y: 140, size: 11, baseline: "top" },
            { text: "275V", x: 160, y: 154, size: 11, baseline: "top" },
            { text: "45KA", x: 160, y: 168, size: 11, baseline: "top" },
            { text: "A", x: 333, y: 53, size: 14, align: "center" },
            { text: "A", x: 333, y: 98, size: 14, align: "center" },
            { text: "A", x: 333, y: 143, size: 14, align: "center" },
            { text: "10A", x: 388, y: 48, size: 14, align: "center" },
            { text: "10A", x: 388, y: 93, size: 14, align: "center" },
            { text: "10A", x: 388, y: 138, size: 14, align: "center" },
            { text: "CIRC 1 - Iluminacao", x: 446, y: 50, size: 13, baseline: "top" },
            { text: "1#1.5(1.5)mm2", x: 446, y: 70, size: 12, baseline: "top" },
            { text: "CIRC 2 - TUG", x: 446, y: 95, size: 13, baseline: "top" },
            { text: "1#2.5(2.5)mm2", x: 446, y: 115, size: 12, baseline: "top" },
            { text: "CIRC 3 - Ar condicionado 10kBTU", x: 446, y: 140, size: 13, baseline: "top" },
            { text: "1#2.5(2.5)mm2", x: 446, y: 160, size: 12, baseline: "top" }
        ],
        devices: [
            { kind: "breaker", x: 120, y: 100, width: 45, height: 42 },
            { kind: "dr", x: 170, y: 100, width: 28, height: 28 },
            { kind: "dps", x: 150, y: 140, width: 14, height: 24 },
            { kind: "breaker", x: 365, y: 60, width: 45, height: 38 },
            { kind: "breaker", x: 365, y: 105, width: 45, height: 38 },
            { kind: "breaker", x: 365, y: 150, width: 45, height: 38 },
            { kind: "ground", x: 150, y: 178, width: 24, height: 18 }
        ]
    }
};

const state = {
    db: null,
    currentProject: null,
    currentTool: "select",
    selectedId: null,
    selectedIds: [],
    drawingStart: null,
    zoom: 1,
    history: [],
    future: [],
    tempPreset: null,
    draggingCanvas: false,
    panStart: null,
    selectionAction: null,
    selectionHandle: null,
    selectionStart: null,
    selectionBoxStart: null,
    selectionBoxCurrent: null,
    activePointerId: null,
    menuOpen: false,
    textSize: "medium",
    sidebarHidden: false,
    mainToolbarHidden: false,
    templateToolbarHidden: false,
    symbolToolbarHidden: false,
    inspectorHidden: false,
    distributionHidden: false,
    singleLineHidden: false,
    materialsHidden: false,
};


const canvas = document.getElementById("planCanvas");
const ctx = canvas.getContext("2d");
const viewport = document.getElementById("canvasViewport");

const refs = {
    appRoot: document.getElementById("app"),
    sidebar: document.querySelector(".sidebar"),
    inspector: document.querySelector(".inspector"),
    drawingToolbar: document.querySelector(".drawing-toolbar"),
    toolbarMain: document.querySelector(".toolbar-row-main"),
    toolbarTemplates: document.querySelector(".toolbar-row-templates"),
    toolbarSymbols: document.querySelector(".toolbar-row-symbols"),
    userSelect: document.getElementById("userSelect"),
    projectSelect: document.getElementById("projectSelect"),
    utilitySelect: document.getElementById("utilitySelect"),
    projectNameInput: document.getElementById("projectNameInput"),
    equipmentPreset: document.getElementById("equipmentPreset"),
    summaryCards: document.getElementById("summaryCards"),
    distributionBoard: document.getElementById("distributionBoard"),
    singleLineDiagram: document.getElementById("singleLineDiagram"),
    materialsBox: document.getElementById("materialsBox"),
    zoomLabel: document.getElementById("zoomLabel"),
    toolHint: document.getElementById("toolHint"),
    menuToggleBtn: document.getElementById("menuToggleBtn"),
    appMenu: document.getElementById("appMenu"),
    menuBackdrop: document.getElementById("menuBackdrop"),
    priceModal: document.getElementById("priceModal"),
    priceEditorForm: document.getElementById("priceEditorForm"),
    equipmentPriceList: document.getElementById("equipmentPriceList"),
    materialPriceList: document.getElementById("materialPriceList"),
    closePriceModalBtn: document.getElementById("closePriceModalBtn"),
    cancelPriceModalBtn: document.getElementById("cancelPriceModalBtn"),
    shortcutsModal: document.getElementById("shortcutsModal"),
    shortcutsList: document.getElementById("shortcutsList"),
    closeShortcutsModalBtn: document.getElementById("closeShortcutsModalBtn"),
    symbolsModal: document.getElementById("symbolsModal"),
    symbolsGallery: document.getElementById("symbolsGallery"),
    closeSymbolsModalBtn: document.getElementById("closeSymbolsModalBtn"),
    flipHorizontalBtn: document.getElementById("flipHorizontalBtn"),
    distributionBoardPanel: document.getElementById("distributionBoard")?.closest(".panel"),
    singleLinePanel: document.getElementById("singleLineDiagram")?.closest(".panel"),
    materialsPanel: document.getElementById("materialsBox")?.closest(".panel"),
};

const inspectorFields = {
    name: document.getElementById("propName"),
    type: document.getElementById("propType"),
    power: document.getElementById("propPower"),
    voltage: document.getElementById("propVoltage"),
    height: document.getElementById("propHeight"),
    circuit: document.getElementById("propCircuit"),
    manualRoute: document.getElementById("propManualRoute"),
    legend: document.getElementById("propLegend"),
};

async function bootstrap() {
    const response = await fetch("api.php?action=bootstrap");
    state.db = await response.json();
    populateSelects();
    renderSymbolToolbar();
    loadProject(state.db.projects[0]);
    updateWorkspaceLayout();
    bindEvents();
    render();
}

function populateSelects() {
    fillSelect(refs.userSelect, state.db.users, "name");
    fillSelect(refs.projectSelect, state.db.projects, "name");
    fillSelect(refs.utilitySelect, state.db.utilities, "name");
    fillSelect(refs.equipmentPreset, state.db.equipment_presets, "name");
}

function fillSelect(element, items, labelField) {
    element.innerHTML = items.map(item => `<option value="${item.id}">${item[labelField]}</option>`).join("");
}

function renderSymbolToolbar() {
    const toolbar = document.getElementById("symbolToolbar");
    if (!toolbar) return;

    toolbar.innerHTML = SYMBOL_LIBRARY.map(symbol => `
        <button class="mini-icon-tool symbol-icon-tool" data-action="symbol-${symbol.key}" title="${symbol.name}">
            ${technicalSymbolSvg(symbol.key)}
        </button>
    `).join("");
}

function loadProject(project) {
    state.currentProject = structuredClone(project);
    state.selectedId = null;
    state.selectedIds = [];
    state.zoom = state.currentProject.floorPlan.zoom || 1;
    state.textSize = state.currentProject.floorPlan.textSize || "medium";
    refs.projectSelect.value = project.id;
    refs.userSelect.value = project.user_id;
    refs.utilitySelect.value = project.utility_id;
    refs.projectNameInput.value = project.name;
    updateZoom();
    computeDerivedData();
    fillInspector(null);
}

function bindEvents() {
    refs.menuToggleBtn.addEventListener("click", toggleAppMenu);
    refs.menuBackdrop.addEventListener("click", closeAppMenu);
    refs.appMenu.addEventListener("click", onAppMenuClick);
    refs.closePriceModalBtn.addEventListener("click", closePriceModal);
    refs.cancelPriceModalBtn.addEventListener("click", closePriceModal);
    refs.closeShortcutsModalBtn.addEventListener("click", closeShortcutsModal);
    refs.closeSymbolsModalBtn.addEventListener("click", closeSymbolsModal);
    refs.symbolsGallery.addEventListener("click", event => {
        const button = event.target.closest("[data-action]");
        if (!button) return;
        const action = button.dataset.action;
        if (!action.startsWith("symbol-")) return;
        const symbol = SYMBOL_LIBRARY.find(item => item.key === action.replace("symbol-", ""));
        if (!symbol) return;
        state.tempPreset = createTechnicalSymbolPreset(symbol);
        state.currentTool = "electrical";
        activateTool("electrical");
        closeSymbolsModal();
        updateToolHint();
    });
    refs.priceModal.addEventListener("click", event => {
        if (event.target.dataset.closeModal === "prices") {
            closePriceModal();
        }
    });
    refs.shortcutsModal.addEventListener("click", event => {
        if (event.target.dataset.closeModal === "shortcuts") {
            closeShortcutsModal();
        }
    });
    refs.symbolsModal.addEventListener("click", event => {
        if (event.target.dataset.closeModal === "symbols") {
            closeSymbolsModal();
        }
    });
    refs.priceEditorForm.addEventListener("submit", saveCatalogPrices);

    document.getElementById("toolGrid").addEventListener("click", event => {
        const button = event.target.closest("[data-tool]");
        if (!button) return;
        activateTool(button.dataset.tool);
    });

    document.querySelector(".drawing-toolbar").addEventListener("click", event => {
        const button = event.target.closest("[data-tool], [data-action]");
        if (!button) return;

        const { tool, action } = button.dataset;
        if (tool) {
            activateTool(tool);
            return;
        }

        if (action) {
            handleToolbarAction(action);
        }
    });

    refs.projectSelect.addEventListener("change", () => {
        const project = state.db.projects.find(item => item.id === Number(refs.projectSelect.value));
        if (project) loadProject(project);
        render();
    });

    refs.utilitySelect.addEventListener("change", () => {
        state.currentProject.utility_id = Number(refs.utilitySelect.value);
        computeDerivedData();
    });

    refs.projectNameInput.addEventListener("input", () => {
        state.currentProject.name = refs.projectNameInput.value;
    });

    document.getElementById("newProjectBtn").addEventListener("click", createNewProject);
    document.getElementById("saveProjectBtn").addEventListener("click", saveProject);
    document.getElementById("addEquipmentBtn").addEventListener("click", () => {
        const preset = state.db.equipment_presets.find(item => item.id === Number(refs.equipmentPreset.value));
        state.tempPreset = preset || null;
        activateTool("electrical");
    });

    document.querySelectorAll('#undoBtn, [data-control="undo"]').forEach(button => {
        button.addEventListener("click", undo);
    });
    document.querySelectorAll('#redoBtn, [data-control="redo"]').forEach(button => {
        button.addEventListener("click", redo);
    });
    document.querySelectorAll('#zoomInBtn').forEach(button => {
        button.addEventListener("click", () => zoomBy(0.1));
    });
    document.querySelectorAll('#zoomOutBtn').forEach(button => {
        button.addEventListener("click", () => zoomBy(-0.1));
    });
    document.querySelectorAll('#fitBtn').forEach(button => {
        button.addEventListener("click", () => {
            state.currentProject.floorPlan.offsetX = 40;
            state.currentProject.floorPlan.offsetY = 40;
            state.zoom = 1;
            updateZoom();
            render();
        });
    });

    document.querySelectorAll('#autoRouteBtn, [data-control="autoroute"]').forEach(button => {
        button.addEventListener("click", () => {
            autoRouteElectricalPoints();
            computeDerivedData();
            render();
        });
    });

    document.querySelectorAll('#generateReportBtn, [data-control="report"]').forEach(button => {
        button.addEventListener("click", openPrintableReport);
    });

    document.querySelectorAll('#deleteBtn, [data-control="delete"]').forEach(button => {
        button.addEventListener("click", deleteSelectedItem);
    });

    document.getElementById("inspectorForm").addEventListener("submit", event => {
        event.preventDefault();
        const item = getSelectedItem();
        if (!item) return;
        item.name = inspectorFields.name.value;
        item.type = inspectorFields.type.value;
        item.power = Number(inspectorFields.power.value) || 0;
        item.voltage = Number(inspectorFields.voltage.value);
        item.height = inspectorFields.height.value;
        applyHeightBasedOutletSymbol(item);
        item.circuit = inspectorFields.circuit.value;
        item.manualRouteTo = Number(inspectorFields.manualRoute.value) || null;
        item.showLegend = inspectorFields.legend.checked;
        computeDerivedData();
        render();
    });
    inspectorFields.height.addEventListener("change", () => {
        const item = getSelectedItem();
        if (!item || item.kind !== "electrical") return;
        pushHistory();
        item.height = inspectorFields.height.value;
        applyHeightBasedOutletSymbol(item);
        computeDerivedData();
        render();
        fillInspector(item);
    });
    inspectorFields.manualRoute.addEventListener("change", () => {
        const item = getSelectedItem();
        if (!item || item.kind !== "electrical") return;
        pushHistory();
        item.manualRouteTo = Number(inspectorFields.manualRoute.value) || null;
        computeDerivedData();
        render();
        fillInspector(item);
    });
    inspectorFields.legend.addEventListener("change", () => {
        const item = getSelectedItem();
        if (!item) return;
        pushHistory();
        item.showLegend = inspectorFields.legend.checked;
        render();
    });
    refs.flipHorizontalBtn.addEventListener("click", flipSelectedItemHorizontally);

    canvas.addEventListener("pointerdown", onCanvasPointerDown);
    canvas.addEventListener("pointermove", onCanvasPointerMove);
    canvas.addEventListener("pointerup", onCanvasPointerUp);
    canvas.addEventListener("pointercancel", onCanvasPointerUp);
    canvas.addEventListener("lostpointercapture", onCanvasPointerUp);
    window.addEventListener("keydown", event => {
        if (event.key === "Escape") {
            closeAppMenu();
            closePriceModal();
            closeShortcutsModal();
            closeSymbolsModal();
        }
        if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z") {
            event.preventDefault();
            undo();
            return;
        }
        if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "a") {
            const active = document.activeElement;
            const isInput = active && ["INPUT", "TEXTAREA", "SELECT"].includes(active.tagName);
            if (isInput) return;
            event.preventDefault();
            selectAllItems();
            return;
        }
        if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) {
            const active = document.activeElement;
            const isInput = active && ["INPUT", "TEXTAREA", "SELECT"].includes(active.tagName);
            if (isInput) return;
            const delta = event.shiftKey ? GRID_SIZE : 1;
            const dx = event.key === "ArrowLeft" ? -delta : event.key === "ArrowRight" ? delta : 0;
            const dy = event.key === "ArrowUp" ? -delta : event.key === "ArrowDown" ? delta : 0;
            if (!dx && !dy) return;
            event.preventDefault();
            nudgeSelectedItems(dx, dy);
            return;
        }
        if (event.key === "Delete" || event.key === "Backspace") {
            const active = document.activeElement;
            const isInput = active && ["INPUT", "TEXTAREA", "SELECT"].includes(active.tagName);
            if (isInput) return;
            deleteSelectedItem();
        }
    });
}

function toggleAppMenu() {
    if (state.menuOpen) {
        closeAppMenu();
        return;
    }
    openAppMenu();
}

function openAppMenu() {
    state.menuOpen = true;
    refs.appMenu.hidden = false;
    refs.menuBackdrop.hidden = false;
    refs.menuToggleBtn.setAttribute("aria-expanded", "true");
    updateAppMenuState();
}

function closeAppMenu() {
    state.menuOpen = false;
    refs.appMenu.hidden = true;
    refs.menuBackdrop.hidden = true;
    refs.menuToggleBtn.setAttribute("aria-expanded", "false");
}

function onAppMenuClick(event) {
    const trigger = event.target.closest("[data-menu-action]");
    const action = trigger?.dataset.menuAction;
    if (!action) return;

    if (action === "export-pdf") {
        closeAppMenu();
        openPrintableReport();
        return;
    }

    if (action === "edit-prices") {
        closeAppMenu();
        openPriceModal();
        return;
    }

    if (action === "show-shortcuts") {
        closeAppMenu();
        openShortcutsModal();
        return;
    }

    if (action === "show-symbols") {
        closeAppMenu();
        openSymbolsModal();
        return;
    }

    if (action === "text-size-minimum" || action === "text-size-small" || action === "text-size-medium" || action === "text-size-large") {
        const sizeMap = {
            "text-size-minimum": "minimum",
            "text-size-small": "small",
            "text-size-medium": "medium",
            "text-size-large": "large",
        };
        state.textSize = sizeMap[action];
        updateWorkspaceLayout();
        render();
        return;
    }

    const visibilityMap = {
        "toggle-sidebar": ["sidebarHidden", refs.sidebar],
        "toggle-inspector": ["inspectorHidden", refs.inspector],
        "toggle-distribution": ["distributionHidden", refs.distributionBoardPanel],
        "toggle-singleline": ["singleLineHidden", refs.singleLinePanel],
        "toggle-materials": ["materialsHidden", refs.materialsPanel],
        "toggle-main-toolbar": ["mainToolbarHidden", refs.toolbarMain],
        "toggle-template-toolbar": ["templateToolbarHidden", refs.toolbarTemplates],
        "toggle-symbol-toolbar": ["symbolToolbarHidden", refs.toolbarSymbols],
    };

    const pair = visibilityMap[action];
    if (pair) {
        const [stateKey, element] = pair;
        state[stateKey] = !state[stateKey];
        setVisibility(element, !state[stateKey]);
        updateWorkspaceLayout();
        return;
    }
}

function openPriceModal() {
    renderPriceEditor();
    refs.priceModal.hidden = false;
}

function closePriceModal() {
    refs.priceModal.hidden = true;
}

function openShortcutsModal() {
    renderShortcutsList();
    refs.shortcutsModal.hidden = false;
}

function closeShortcutsModal() {
    refs.shortcutsModal.hidden = true;
}

function openSymbolsModal() {
    renderSymbolsGallery();
    refs.symbolsModal.hidden = false;
}

function closeSymbolsModal() {
    refs.symbolsModal.hidden = true;
}

function setVisibility(element, visible) {
    if (!element) return;
    element.classList.toggle("is-hidden", !visible);
}

function updateWorkspaceLayout() {
    refs.appRoot.classList.toggle("sidebar-collapsed", state.sidebarHidden);
    refs.appRoot.classList.toggle("toolbar-main-collapsed", state.mainToolbarHidden);
    refs.appRoot.classList.toggle("toolbar-template-collapsed", state.templateToolbarHidden);
    refs.appRoot.classList.toggle("toolbar-symbol-collapsed", state.symbolToolbarHidden);
    refs.appRoot.classList.toggle("inspector-collapsed", state.inspectorHidden);
    refs.appRoot.classList.toggle("distribution-collapsed", state.distributionHidden);
    refs.appRoot.classList.toggle("singleline-collapsed", state.singleLineHidden);
    refs.appRoot.classList.toggle("materials-collapsed", state.materialsHidden);
    updateAppMenuState();
}

function updateAppMenuState() {
    if (!refs.appMenu) return;

    const activeMap = {
        "toggle-sidebar": !state.sidebarHidden,
        "toggle-inspector": !state.inspectorHidden,
        "toggle-distribution": !state.distributionHidden,
        "toggle-singleline": !state.singleLineHidden,
        "toggle-materials": !state.materialsHidden,
        "toggle-main-toolbar": !state.mainToolbarHidden,
        "toggle-template-toolbar": !state.templateToolbarHidden,
        "toggle-symbol-toolbar": !state.symbolToolbarHidden,
        "text-size-small": state.textSize === "small",
        "text-size-medium": state.textSize === "medium",
        "text-size-large": state.textSize === "large",
    };

    refs.appMenu.querySelectorAll("[data-menu-action]").forEach(item => {
        const action = item.dataset.menuAction;
        item.classList.toggle("is-active", Boolean(activeMap[action]));
    });
}

function drawingTextScale() {
    if (state.textSize === "minimum") return 0.72;
    if (state.textSize === "small") return 0.85;
    if (state.textSize === "large") return 1.2;
    return 1;
}

function canvasFont(size, family = "Arial", weight = "") {
    const scaledSize = Math.max(10, Math.round(size * drawingTextScale()));
    return `${weight ? `${weight} ` : ""}${scaledSize}px ${family}`;
}

function renderPriceEditor() {
    refs.equipmentPriceList.innerHTML = state.db.equipment_presets.map(item => `
        <label class="price-row">
            <span>${item.name}</span>
            <input type="number" step="0.01" min="0" name="equipment-${item.id}" value="${Number(item.price || 0).toFixed(2)}">
        </label>
    `).join("");

    refs.materialPriceList.innerHTML = state.db.materials.map(item => `
        <label class="price-row">
            <span>${item.name}</span>
            <input type="number" step="0.01" min="0" name="material-${item.id}" value="${Number(item.price || 0).toFixed(2)}">
        </label>
    `).join("");
}

function renderShortcutsList() {
    const shortcuts = [
        { key: "Ctrl + Z", action: "Desfazer" },
        { key: "Ctrl + A", action: "Selecionar todos os objetos" },
        { key: "Setas", action: "Mover o objeto selecionado 1 px" },
        { key: "Shift + Setas", action: "Mover o objeto selecionado no grid" },
        { key: "Delete / Backspace", action: "Apagar objeto selecionado" },
        { key: "Esc", action: "Fechar menus e janelas" },
        { key: "Mouse + arrastar", action: "Mover um objeto ou grupo selecionado" },
    ];

    refs.shortcutsList.innerHTML = shortcuts.map(item => `
        <div class="shortcut-row">
            <span class="shortcut-key">${item.key}</span>
            <span class="shortcut-action">${item.action}</span>
        </div>
    `).join("");
}

function renderSymbolsGallery() {
    refs.symbolsGallery.innerHTML = SYMBOL_LIBRARY.map(symbol => `
        <button type="button" class="symbol-card" data-action="symbol-${symbol.key}" title="${symbol.name}">
            <span class="symbol-card-preview">${technicalSymbolSvg(symbol.key)}</span>
            <span class="symbol-card-name">${symbol.name}</span>
            <span class="symbol-card-meta">${symbol.category}</span>
        </button>
    `).join("");
}

async function saveCatalogPrices(event) {
    event.preventDefault();

    state.db.equipment_presets = state.db.equipment_presets.map(item => ({
        ...item,
        price: Number(event.target.elements[`equipment-${item.id}`]?.value || 0)
    }));

    state.db.materials = state.db.materials.map(item => ({
        ...item,
        price: Number(event.target.elements[`material-${item.id}`]?.value || 0)
    }));

    const response = await fetch("api.php?action=saveCatalog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            materials: state.db.materials,
            equipment_presets: state.db.equipment_presets
        })
    });
    const result = await response.json();
    if (result.success) {
        state.db.materials = result.materials;
        state.db.equipment_presets = result.equipment_presets;
        computeDerivedData();
        closePriceModal();
        alert("Precos atualizados com sucesso.");
    }
}

function activateTool(toolName) {
    document.querySelectorAll(".tool, .icon-tool, .mini-icon-tool").forEach(tool => {
        tool.classList.toggle("active", tool.dataset.tool === toolName);
    });
    state.currentTool = toolName;
    refs.toolHint.textContent = toolHintText(state.currentTool);
}

function toolHintText(tool) {
    const map = {
        select: "Selecione itens e edite no painel lateral.",
        wall: "Clique e arraste para desenhar paredes.",
        door: "Clique e arraste para desenhar portas.",
        window: "Clique e arraste para desenhar janelas.",
        room: "Clique e arraste para criar ambientes.",
        electrical: "Clique na planta para posicionar equipamentos elétricos.",
        pan: "Arraste para mover a visualização."
    };
    return map[tool];
}

function setActiveTool(toolName) {
    activateTool(toolName);
}

function deleteSelectedItem() {
    const selectedItems = getSelectedItems();
    if (!selectedItems.length) return;

    pushHistory();
    const selectedIds = new Set(selectedItems.map(item => item.id));
    state.currentProject.floorPlan.items = state.currentProject.floorPlan.items.filter(current => !selectedIds.has(current.id));
    state.selectedId = null;
    state.selectedIds = [];
    state.selectionAction = null;
    state.selectionHandle = null;
    state.selectionStart = null;
    fillInspector(null);
    computeDerivedData();
    render();
}

function handleToolbarAction(action) {
    if (action.startsWith("template-")) {
        insertProjectTemplate(action.replace("template-", ""));
        return;
    }

    if (action.startsWith("symbol-")) {
        const symbol = SYMBOL_LIBRARY.find(item => item.key === action.replace("symbol-", ""));
        if (symbol) {
            state.tempPreset = createTechnicalSymbolPreset(symbol);
            activateTool("electrical");
            refs.toolHint.textContent = "Clique na planta para inserir o símbolo selecionado.";
        }
        return;
    }

    const presetMap = {
        "preset-outlet": 1,
        "preset-shower": 2,
        "preset-microwave": 3,
        "preset-washer": 4,
        "preset-ac": 5,
        "preset-light": 8,
        "preset-distribution": "distribution-board",
        "preset-switch": "switch"
    };

    if (action in presetMap) {
        const presetId = presetMap[action];
        if (typeof presetId === "number") {
            refs.equipmentPreset.value = String(presetId);
            const preset = state.db.equipment_presets.find(item => item.id === presetId);
            state.tempPreset = withSymbol(preset || null);
        } else {
            state.tempPreset = createVirtualPreset(presetId);
        }
        activateTool("electrical");
        refs.toolHint.textContent = "Clique na planta para inserir o equipamento selecionado.";
        return;
    }

    if (action === "legend") {
        const item = getSelectedItem();
        if (!item) return;
        pushHistory();
        item.showLegend = !item.showLegend;
        fillInspector(item);
        render();
        return;
    }

    if (action === "toggle-tue" || action === "toggle-tug") {
        return;
    }
}

function insertProjectTemplate(templateKey) {
    const template = PROJECT_TEMPLATES[templateKey];
    if (!template) return;

    pushHistory();
    const origin = nextTemplateOrigin(template);
    const items = buildProjectTemplateItems(template, origin);
    state.currentProject.floorPlan.items.push(...items);
    state.selectedId = items[0]?.id || null;
    state.selectedIds = state.selectedId ? [state.selectedId] : [];
    fillInspector(getSelectedItem());
    activateTool("select");
    refs.toolHint.textContent = `${template.name} inserido com componentes eletricos.`;
    computeDerivedData();
    render();
}

function nextTemplateOrigin(template) {
    const offsetX = state.currentProject.floorPlan.offsetX || 0;
    const offsetY = state.currentProject.floorPlan.offsetY || 0;
    const visibleLeft = viewport.scrollLeft / state.zoom - offsetX;
    const visibleTop = viewport.scrollTop / state.zoom - offsetY;
    const existing = state.currentProject.floorPlan.items;
    const fallbackX = existing.length ? Math.max(...existing.map(item => getItemBounds(item).x + getItemBounds(item).width)) + 60 : 40;
    const x = existing.length ? Math.max(40, snap({ x: fallbackX, y: 0 }).x) : Math.max(40, snap({ x: visibleLeft + 40, y: 0 }).x);
    const y = Math.max(40, snap({ x: 0, y: visibleTop + 40 }).y);

    return {
        x: Math.max(40, Math.min(x, canvas.width / state.zoom - template.width - 80)),
        y: Math.max(40, Math.min(y, canvas.height / state.zoom - template.height - 80))
    };
}

function buildProjectTemplateItems(template, origin) {
    const items = [];
    const baseId = Date.now() + Math.floor(Math.random() * 1000);
    let nextId = 0;
    const makeId = () => baseId + nextId++;

    if (!template.skipRoom) {
        const roomId = makeId();
        items.push({
            id: roomId,
            kind: "room",
            x: origin.x,
            y: origin.y,
            width: template.roomWidth || template.width,
            height: template.roomHeight || template.height,
            name: template.name,
            type: "room",
            style: template.style || null,
            labelX: template.roomLabel?.x || 10,
            labelY: template.roomLabel?.y || 24,
            showLegend: false
        });

        items.push(...buildTemplateWalls(template, origin, makeId));
    }

    (template.lines || []).forEach(line => items.push(templateLine(line, origin, makeId)));
    (template.texts || []).forEach(text => items.push(templateText(text, origin, makeId)));
    (template.devices || []).forEach(device => items.push(templateDevice(device, origin, makeId)));
    (template.doors || []).forEach(door => items.push(templateOpening("door", { ...door, style: template.style }, origin, makeId)));
    (template.windows || []).forEach(windowItem => items.push(templateOpening("window", { ...windowItem, style: template.style }, origin, makeId)));
    (template.embeds || []).forEach(embed => {
        const embeddedTemplate = PROJECT_TEMPLATES[embed.template];
        if (!embeddedTemplate) return;
        items.push(...buildProjectTemplateItems(embeddedTemplate, {
            x: origin.x + (embed.x || 0),
            y: origin.y + (embed.y || 0)
        }));
    });

    const electrical = (template.electrical || []).map(point => templateElectricalPoint(point, origin, makeId));
    const routeCenter = electrical.find(item => item.routeCenter) || electrical.find(item => item.symbol === "light") || electrical[0] || null;
    electrical.forEach(item => {
        item.routeTo = routeCenter && item.id !== routeCenter.id ? routeCenter.id : null;
        item.routeTos = [];
    });
    connectSwitchPairs(electrical);
    items.push(...electrical);

    return items;
}

function buildTemplateWalls(template, origin, makeId) {
    const x = origin.x;
    const y = origin.y;
    const w = template.roomWidth || template.width;
    const h = template.roomHeight || template.height;
    return [
        { id: makeId(), kind: "wall", x, y, width: w, height: 20, name: "Parede", type: "wall", style: template.style || null, showLegend: false },
        { id: makeId(), kind: "wall", x, y: y + h - 20, width: w, height: 20, name: "Parede", type: "wall", style: template.style || null, showLegend: false },
        { id: makeId(), kind: "wall", x, y, width: 20, height: h, name: "Parede", type: "wall", style: template.style || null, showLegend: false },
        { id: makeId(), kind: "wall", x: x + w - 20, y, width: 20, height: h, name: "Parede", type: "wall", style: template.style || null, showLegend: false }
    ];
}

function templateOpening(kind, item, origin, makeId) {
    return {
        id: makeId(),
        kind,
        x: origin.x + item.x,
        y: origin.y + item.y,
        width: item.width,
        height: item.height,
        name: kind === "door" ? "Porta" : "Janela",
        type: kind,
        style: item.style || null,
        showLegend: false
    };
}

function templateLine(item, origin, makeId) {
    return {
        id: makeId(),
        kind: "template-line",
        x: origin.x + item.x,
        y: origin.y + item.y,
        x2: item.x2 - item.x,
        y2: item.y2 - item.y,
        width: Math.abs(item.x2 - item.x),
        height: Math.abs(item.y2 - item.y),
        name: "Linha tecnica",
        type: "template-line",
        showLegend: false
    };
}

function templateText(item, origin, makeId) {
    return {
        id: makeId(),
        kind: "template-text",
        x: origin.x + item.x,
        y: origin.y + item.y,
        text: item.text,
        size: item.size || 13,
        align: item.align || "left",
        baseline: item.baseline || "middle",
        width: Math.max(40, String(item.text || "").length * (item.size || 13) * 0.58),
        height: (item.size || 13) + 4,
        name: item.text,
        type: "template-text",
        showLegend: false
    };
}

function templateDevice(item, origin, makeId) {
    return {
        id: makeId(),
        kind: "template-device",
        x: origin.x + item.x,
        y: origin.y + item.y,
        width: item.width || 24,
        height: item.height || 24,
        device: item.kind,
        layer: item.layer || null,
        name: item.kind,
        type: "template-device",
        showLegend: false
    };
}

function templateElectricalPoint(point, origin, makeId) {
    const item = {
        id: makeId(),
        kind: "electrical",
        x: origin.x + point.x,
        y: origin.y + point.y,
        width: GRID_SIZE,
        height: GRID_SIZE,
        size: point.size || 40,
        name: point.name,
        type: point.type,
        symbol: point.symbol,
        power: point.power || 0,
        voltage: point.voltage || 127,
        height: point.height || "Baixa",
        rotation: point.rotation || 0,
        circuit: "",
        showLegend: point.symbol !== "switch",
        presetId: null,
        labelDx: point.labelDx,
        labelDy: point.labelDy,
        routeCenter: Boolean(point.routeCenter),
        routeTos: [],
        manualRouteTo: null,
        routeTo: null
    };
    applyHeightBasedOutletSymbol(item);
    return item;
}

function createTechnicalSymbolPreset(symbol) {
    return {
        id: null,
        name: symbol.name,
        category: symbol.category,
        power: symbol.power,
        voltage: symbol.voltage,
        height: symbol.height,
        circuitType: symbol.circuitType,
        symbol: symbol.key
    };
}

function technicalSymbolSvg(key) {
    const common = 'viewBox="0 0 40 40" aria-hidden="true"';
    const stroke = 'stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"';
    const fine = 'stroke="currentColor" stroke-width="1.35" fill="none" stroke-linecap="round" stroke-linejoin="round"';
    const filled = 'fill="currentColor"';
    const wall = '<path d="M6 8v24M9 8v24M6 12h3M6 17h3M6 22h3M6 27h3" stroke="currentColor" stroke-width="1.2" fill="none"/>';
    const outletTriangle = '<path d="M16 14l14 6-14 6z" stroke="currentColor" stroke-width="2" fill="none" stroke-linejoin="round"/>';
    const filledOutletTriangle = '<path d="M16 14l14 6-14 6z" fill="currentColor"/>';
    const boardTeeth = '<path d="M9 27l2-4 2 4 2-4 2 4 2-4 2 4 2-4 2 4 2-4 2 4" stroke="currentColor" stroke-width="1.35" fill="none"/>';
    const hatch = '<path d="M11 25l18-10M16 27l16-9M9 22l13-7" stroke="currentColor" stroke-width="1.1"/>';

    const templates = {
        "light-ceiling": `<svg ${common}><circle cx="19" cy="20" r="8.5" ${stroke}/><text x="29" y="14" font-size="7" fill="currentColor">a</text></svg>`,
        "light-wall": `<svg ${common}>${wall}<path d="M9 20h7" ${stroke}/><circle cx="24" cy="20" r="8" ${stroke}/><text x="32" y="14" font-size="7" fill="currentColor">a</text></svg>`,
        "light-not-embedded": `<svg ${common}><rect x="7" y="15" width="26" height="10" rx="1" ${stroke}/><circle cx="20" cy="20" r="3" ${fine}/></svg>`,
        "light-embedded": `<svg ${common}><rect x="7" y="15" width="26" height="10" rx="1" ${stroke}/><rect x="9" y="16.5" width="9" height="7" ${filled}/><circle cx="24" cy="20" r="3" ${fine}/></svg>`,
        "fluorescent-not-embedded": `<svg ${common}><rect x="6" y="14" width="28" height="12" rx="5" ${stroke}/><ellipse cx="20" cy="20" rx="6.5" ry="3" ${fine}/></svg>`,
        "fluorescent-embedded": `<svg ${common}><rect x="6" y="14" width="28" height="12" rx="5" ${stroke}/><rect x="8" y="16" width="10" height="8" ${filled}/><ellipse cx="25" cy="20" rx="5" ry="2.6" ${fine}/></svg>`,
        "circuit-up": `<svg ${common}><path d="M10 29l18-18" ${stroke}/><circle cx="10" cy="29" r="2.3" fill="currentColor"/><path d="M27.5 11.5l.5 6.5-6.5-.5" ${stroke}/></svg>`,
        "circuit-down": `<svg ${common}><path d="M10 11l18 18" ${stroke}/><circle cx="10" cy="11" r="2.3" fill="currentColor"/><path d="M27.5 28.5l.5-6.5-6.5.5" ${stroke}/></svg>`,
        "circuit-pass": `<svg ${common}><path d="M7 30l11-9 8 0 7-10" ${stroke}/><circle cx="7" cy="30" r="2.3" fill="currentColor"/><circle cx="26" cy="21" r="2.2" fill="currentColor"/><path d="M32.5 11.5l.5 5.8-5.8-.4" ${stroke}/></svg>`,
        "switch-1": `<svg ${common}><circle cx="23" cy="20" r="8" ${stroke}/><text x="32" y="14" font-size="7" fill="currentColor">a</text></svg>`,
        "outlet-light-low": `<svg ${common}>${wall}<path d="M9 20h9" ${stroke}/>${outletTriangle}</svg>`,
        "outlet-light-medium": `<svg ${common}>${wall}<path d="M9 20h9" ${stroke}/>${outletTriangle}<path d="M16 27h14" stroke="currentColor" stroke-width="1.5"/></svg>`,
        "outlet-light-high": `<svg ${common}>${wall}<path d="M9 20h9" ${stroke}/>${filledOutletTriangle}</svg>`,
        "light-outlet-floor": `<svg ${common}><path d="M8 20h9" ${stroke}/>${outletTriangle}<path d="M14 12v16" ${fine}/></svg>`,
        "light-outlet-ceiling": `<svg ${common}><path d="M8 20h9" ${stroke}/>${filledOutletTriangle}<path d="M14 12v16" ${fine}/></svg>`,
        "power-outlet-wall": `<svg ${common}>${wall}<path d="M9 20h8" ${stroke}/><circle cx="24" cy="20" r="8" ${stroke}/><text x="32" y="16" font-size="6.5" fill="currentColor">W</text></svg>`,
        "power-outlet-floor": `<svg ${common}>${wall}<path d="M9 20h9" ${stroke}/>${outletTriangle}<text x="32" y="16" font-size="6.5" fill="currentColor">kW</text></svg>`,
        "power-outlet-ceiling": `<svg ${common}>${wall}<path d="M9 20h9" ${stroke}/>${filledOutletTriangle}<text x="32" y="16" font-size="6.5" fill="currentColor">a</text></svg>`,
        "radio-tv": `<svg ${common}>${wall}<path d="M9 20h8" ${stroke}/><circle cx="24" cy="20" r="8" fill="currentColor"/><path d="M13 12h18M13 28h18" ${fine}/></svg>`,
        "passage-box": `<svg ${common}><rect x="12" y="12" width="16" height="16" fill="currentColor"/></svg>`,
        "partial-board": `<svg ${common}><rect x="8" y="15" width="24" height="10" fill="currentColor"/>${boardTeeth}</svg>`,
        "main-board-not-embedded": `<svg ${common}><path d="M8 14h24v12H8z" ${stroke}/><path d="M10 24l20-8" ${stroke}/>${boardTeeth}</svg>`,
        "main-board-embedded": `<svg ${common}><path d="M7 16h3v-4h20v4h3v8h-3v4H10v-4H7z" ${stroke}/><path d="M12 25l16-10" ${stroke}/><path d="M7 18v6M33 18v6" ${stroke}/></svg>`,
        "phone-box": `<svg ${common}><rect x="8" y="13" width="24" height="14" ${stroke}/>${hatch}</svg>`,
        "conduit-ceiling-wall": `<svg ${common}><path d="M7 16h26" ${stroke}/><circle cx="10" cy="25" r="2.3" ${fine}/><path d="M12 25h8" ${fine}/><text x="26" y="28" font-size="7" fill="currentColor">&Oslash;25</text></svg>`,
        "conduit-floor": `<svg ${common}><path d="M7 16h26" stroke="currentColor" stroke-width="2" stroke-dasharray="5 4"/><circle cx="10" cy="25" r="2.3" ${fine}/><path d="M12 25h8" ${fine}/><text x="26" y="28" font-size="7" fill="currentColor">&Oslash;25</text></svg>`,
        "phone-tube-external": `<svg ${common}><path d="M7 17h26" stroke="currentColor" stroke-width="2" stroke-dasharray="9 4 2 4"/><text x="22" y="29" font-size="7" fill="currentColor">Teto</text></svg>`,
        "phone-tube-internal": `<svg ${common}><path d="M7 17h26" stroke="currentColor" stroke-width="2" stroke-dasharray="10 3 1 3 1 3"/><text x="22" y="29" font-size="7" fill="currentColor">Piso</text></svg>`,
        "conductors-fnt": `<svg ${common}><path d="M9 12v16M16 12v16M24 12v16M32 12v16M9 20h24" ${stroke}/><path d="M13 15h4M20 15h4M28 15h4" ${fine}/></svg>`,
        "minute-button": `<svg ${common}><circle cx="20" cy="20" r="8" ${stroke}/><text x="20" y="23" text-anchor="middle" font-size="9" fill="currentColor">M</text></svg>`,
        "minute-timer": `<svg ${common}><rect x="13" y="13" width="14" height="14" ${stroke}/><text x="20" y="23" text-anchor="middle" font-size="9" fill="currentColor">M</text></svg>`,
        ground: `<svg ${common}><path d="M20 8v12M11 20h18M14 25h12M17 30h6" ${stroke}/></svg>`,
    };

    return templates[key] || `<svg ${common}><circle cx="20" cy="20" r="8" ${stroke}/></svg>`;
}

function symbolSvgForCanvas(key) {
    return technicalSymbolSvg(key)
        .replaceAll("currentColor", "#000000")
        .replaceAll('aria-hidden="true"', 'xmlns="http://www.w3.org/2000/svg"');
}

function getSymbolImage(key) {
    if (symbolImageCache.has(key)) {
        return symbolImageCache.get(key);
    }

    const image = new Image();
    const record = { image, loaded: false, failed: false };

    image.onload = () => {
        record.loaded = image.naturalWidth > 0;
        if (record.loaded && state.currentProject) {
            requestAnimationFrame(render);
        }
    };
    image.onerror = () => {
        record.failed = true;
    };
    image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(symbolSvgForCanvas(key))}`;

    symbolImageCache.set(key, record);
    return record;
}

function withSymbol(preset) {
    if (!preset) return null;
    return {
        ...preset,
        symbol: preset.symbol || inferSymbol(preset)
    };
}

function createVirtualPreset(symbol) {
    const presets = {
        "distribution-board": {
            id: null,
            name: "Quadro de distribuição",
            category: "Quadro de distribuição",
            power: 0,
            voltage: 220,
            height: "Média",
            symbol: "distribution-board"
        },
        switch: {
            id: null,
            name: "Interruptor simples",
            category: "Interruptor",
            power: 0,
            voltage: 127,
            height: "Média",
            symbol: "switch"
        }
    };

    return presets[symbol] || null;
}

function inferSymbol(item) {
    const text = removeAccents(`${item?.name || ""} ${item?.category || ""} ${item?.type || ""}`).toLowerCase();

    if (SYMBOL_LIBRARY.some(symbol => symbol.key === item?.symbol)) return item.symbol;
    if (text.includes("quadro")) return "distribution-board";
    if (text.includes("interruptor")) return "switch";
    if (text.includes("luminaria") || text.includes("iluminacao")) return "light";
    if (text.includes("chuveiro") || text.includes("torneira")) return "shower";
    if (text.includes("ar-condicionado") || text.includes("climatizacao") || text.includes("split")) return "ac";
    if (text.includes("micro") || text.includes("forno") || text.includes("geladeira") || text.includes("maquina")) return "specific-outlet";
    return "outlet";
}

function applyHeightBasedOutletSymbol(item) {
    if (!shouldUseHeightBasedOutletSymbol(item)) return;
    const heightKey = removeAccents(item.height).toLowerCase();
    const map = String(item.symbol || "").startsWith("power-outlet")
        ? POWER_OUTLET_SYMBOL_BY_HEIGHT
        : OUTLET_SYMBOL_BY_HEIGHT;
    item.symbol = map[heightKey] || item.symbol || "outlet";
}

function shouldUseHeightBasedOutletSymbol(item) {
    if (!item || item.kind !== "electrical") return false;
    const symbol = item.symbol || inferSymbol(item);
    if (["switch", "light", "distribution-board", "shower", "ac", "specific-outlet"].includes(symbol)) return false;
    if (symbol.includes("outlet")) return true;
    const text = removeAccents(`${item.name || ""} ${item.type || ""}`).toLowerCase();
    return text.includes("tomada") || text.includes("tug");
}

function isSwitchPoint(item) {
    return (item?.symbol || inferSymbol(item)) === "switch";
}

function connectSwitchPairs(points) {
    points.forEach(item => {
        item.routeTos = (item.routeTos || []).filter(routeId => {
            const target = points.find(candidate => candidate.id === routeId);
            return target && !isSwitchPoint(target);
        });
    });

    const switches = points.filter(isSwitchPoint);
    switches.forEach(item => {
        const room = findRoomContainingPoint(item);
        const candidates = switches.filter(candidate => {
            if (candidate.id === item.id) return false;
            if (!room) return true;
            return pointInsideRect(candidate, room);
        });
        const pairedSwitch = closestItemToPoint(candidates, item);
        if (pairedSwitch && item.id < pairedSwitch.id && !item.routeTos.includes(pairedSwitch.id)) {
            item.routeTos.push(pairedSwitch.id);
        }
    });
}

function findRouteCenterForPoint(point, ignoredId = null) {
    const electrical = state.currentProject.floorPlan.items.filter(item => item.kind === "electrical" && item.id !== ignoredId);
    const room = findRoomContainingPoint(point);
    const roomLights = room
        ? electrical.filter(item => isRouteCenterCandidate(item) && pointInsideRect(item, room))
        : [];
    const candidates = roomLights.length ? roomLights : electrical.filter(isRouteCenterCandidate);
    return closestItemToPoint(candidates, point);
}

function isRouteCenterCandidate(item) {
    return item.routeCenter || (item.symbol || inferSymbol(item)) === "light";
}

function findRoomContainingPoint(point) {
    const rooms = state.currentProject.floorPlan.items.filter(item => item.kind === "room" && pointInsideRect(point, item));
    return rooms.sort((a, b) => (a.width * a.height) - (b.width * b.height))[0] || null;
}

function pointInsideRect(point, rect) {
    return point.x >= rect.x
        && point.x <= rect.x + rect.width
        && point.y >= rect.y
        && point.y <= rect.y + rect.height;
}

function closestItemToPoint(items, point) {
    return items.reduce((closest, item) => {
        const distance = Math.hypot(item.x - point.x, item.y - point.y);
        if (!closest || distance < closest.distance) return { item, distance };
        return closest;
    }, null)?.item || null;
}

function circuitGroupForPoint(point) {
    const catalogGroup = symbolCatalogGroup(point);
    if (catalogGroup) return catalogGroup;
    if (point.symbol === "light") return "Iluminação";
    if (point.symbol === "distribution-board") return "Quadro";
    if (isSpecificUse(point)) return point.name || "TUE";
    return "TUG";
}

function symbolCatalogGroup(point) {
    const entry = SYMBOL_LIBRARY.find(symbol => symbol.key === point.symbol);
    if (!entry) return "";
    return point.circuitType || entry.circuitType || entry.category || "Simbolos";
}

function isSpecificUse(point) {
    const symbol = point.symbol || inferSymbol(point);
    return symbol === "specific-outlet" || symbol === "shower" || symbol === "ac" || Number(point.power || 0) >= BRAZILIAN_ELECTRICAL_RULES.exclusiveLoadThresholdW;
}

function circuitNumberFromLabel(label) {
    const digits = String(label || "1").match(/\d+/);
    return digits ? digits[0] : "1";
}

function circuitLetterForItem(item) {
    return item.command || CIRCUIT_SEQUENCE[Math.abs(Number(item.id || 0)) % CIRCUIT_SEQUENCE.length] || "a";
}

function symbolAbbreviation(item) {
    const symbol = item.symbol || inferSymbol(item);
    const librarySymbol = SYMBOL_LIBRARY.find(entry => entry.key === symbol);
    if (librarySymbol) return librarySymbol.category;
    const map = {
        light: "Ponto de luz",
        switch: "Interruptor",
        outlet: "TUG",
        "specific-outlet": "TUE",
        shower: "TUE",
        ac: "TUE",
        "distribution-board": "QDG"
    };
    return map[symbol] || "Ponto";
}

function removeAccents(value) {
    return String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function createNewProject() {
    const nextId = Math.max(...state.db.projects.map(item => item.id)) + 1;
    const project = {
        id: nextId,
        user_id: Number(refs.userSelect.value),
        utility_id: Number(refs.utilitySelect.value),
        name: `Projeto ${nextId}`,
        floorPlan: {
            zoom: 1,
            offsetX: 40,
            offsetY: 40,
            items: []
        }
    };
    state.db.projects.push(project);
    fillSelect(refs.projectSelect, state.db.projects, "name");
    loadProject(project);
    render();
}

function pushHistory() {
    state.history.push(JSON.stringify(state.currentProject.floorPlan.items));
    if (state.history.length > 50) state.history.shift();
    state.future = [];
}

function undo() {
    if (!state.history.length) return;
    state.future.push(JSON.stringify(state.currentProject.floorPlan.items));
    state.currentProject.floorPlan.items = JSON.parse(state.history.pop());
    computeDerivedData();
    render();
}

function redo() {
    if (!state.future.length) return;
    state.history.push(JSON.stringify(state.currentProject.floorPlan.items));
    state.currentProject.floorPlan.items = JSON.parse(state.future.pop());
    computeDerivedData();
    render();
}

function onCanvasPointerDown(event) {
    if (state.activePointerId !== null && state.activePointerId !== event.pointerId) return;
    state.activePointerId = event.pointerId;
    if (canvas.setPointerCapture) {
        canvas.setPointerCapture(event.pointerId);
    }
    event.preventDefault();

    const point = canvasPoint(event);
    if (state.currentTool === "pan") {
        state.draggingCanvas = true;
        state.panStart = { x: event.clientX, y: event.clientY, left: viewport.scrollLeft, top: viewport.scrollTop };
        return;
    }

    if (state.currentTool === "select") {
        const isToggleSelection = event.ctrlKey || event.metaKey;
        const selectedItem = getSelectedItem();
        const isMultiSelection = state.selectedIds.length > 1;
        const handle = !isToggleSelection && !isMultiSelection && selectedItem ? findSelectionHandleAt(point, selectedItem) : null;
        if (handle) {
            pushHistory();
            state.selectionAction = "resize";
            state.selectionHandle = handle;
            state.selectionStart = selectionSnapshot(point, selectedItem);
            return;
        }

        const item = findItemAt(point);
        if (item) {
            const wasAlreadySelected = state.selectedIds.includes(item.id);

            if (isToggleSelection && !wasAlreadySelected) {
                toggleItemSelection(item.id);
                fillInspector(state.selectedIds.length === 1 ? getSelectedItem() : null);
                render();
                return;
            }

            if (!wasAlreadySelected) {
                state.selectedId = item.id;
                state.selectedIds = [item.id];
            } else if (state.selectedIds.length && state.selectedId === null) {
                state.selectedId = state.selectedIds[0];
            }
            fillInspector(state.selectedIds.length === 1 ? getSelectedItem() : null);
            pushHistory();
            state.selectionAction = "move";
            state.selectionStart = selectionSnapshot(point, getSelectedItems());
        } else {
            if (isToggleSelection) {
                state.selectionBoxStart = point;
                state.selectionBoxCurrent = point;
                render();
                return;
            }
            state.selectedId = null;
            state.selectedIds = [];
            fillInspector(null);
        }
        render();
        return;
    }

    pushHistory();

    if (state.currentTool === "electrical") {
        createElectricalItem(point);
        computeDerivedData();
        render();
        return;
    }

    state.drawingStart = point;
}

function onCanvasPointerMove(event) {
    if (state.activePointerId !== null && state.activePointerId !== event.pointerId) return;
    event.preventDefault();

    const point = canvasPoint(event);
    if (state.draggingCanvas && state.panStart) {
        viewport.scrollLeft = state.panStart.left - (event.clientX - state.panStart.x);
        viewport.scrollTop = state.panStart.top - (event.clientY - state.panStart.y);
        return;
    }

    if (state.currentTool === "select" && state.selectionBoxStart) {
        state.selectionBoxCurrent = point;
        render();
        return;
    }

    if (state.currentTool === "select" && state.selectionAction && state.selectionStart) {
        updateSelectionInteraction(point);
        computeDerivedData();
        fillInspector(state.selectedIds.length === 1 ? getSelectedItem() : null);
        render();
        return;
    }

    if (state.currentTool === "select") {
        updateSelectionCursor(point);
    }
}

function onCanvasPointerUp(event) {
    if (state.activePointerId !== null && event.pointerId !== undefined && state.activePointerId !== event.pointerId) return;
    event.preventDefault();

    if (state.draggingCanvas) {
        state.draggingCanvas = false;
        state.panStart = null;
        releaseCanvasPointer(event);
        return;
    }

    if (state.selectionAction) {
        state.selectionAction = null;
        state.selectionHandle = null;
        state.selectionStart = null;
        releaseCanvasPointer(event);
        return;
    }

    if (state.selectionBoxStart) {
        finalizeSelectionBox();
        releaseCanvasPointer(event);
        return;
    }

    if (!state.drawingStart) {
        releaseCanvasPointer(event);
        return;
    }
    const end = canvasPoint(event);
    addDrawnItem(state.currentTool, state.drawingStart, end);
    state.drawingStart = null;
    computeDerivedData();
    render();
    releaseCanvasPointer(event);
}

function releaseCanvasPointer(event) {
    if (state.activePointerId === null) return;
    if (event?.pointerId !== undefined && canvas.hasPointerCapture?.(event.pointerId)) {
        canvas.releasePointerCapture(event.pointerId);
    }
    state.activePointerId = null;
}

function canvasPoint(event) {
    const rect = canvas.getBoundingClientRect();
    const scale = state.zoom;
    const offsetX = state.currentProject.floorPlan.offsetX || 0;
    const offsetY = state.currentProject.floorPlan.offsetY || 0;
    return snap({
        x: (event.clientX - rect.left) / scale - offsetX,
        y: (event.clientY - rect.top) / scale - offsetY,
    });
}

function snap(point) {
    return {
        x: Math.round(point.x / GRID_SIZE) * GRID_SIZE,
        y: Math.round(point.y / GRID_SIZE) * GRID_SIZE,
    };
}

function addDrawnItem(tool, start, end) {
    const item = {
        id: Date.now(),
        kind: tool,
        x: Math.min(start.x, end.x),
        y: Math.min(start.y, end.y),
        width: Math.max(GRID_SIZE, Math.abs(end.x - start.x)),
        height: Math.max(GRID_SIZE, Math.abs(end.y - start.y)),
        name: tool === "room" ? "Ambiente" : tool === "wall" ? "Parede" : tool === "door" ? "Porta" : "Janela",
        type: tool,
        showLegend: false
    };
    state.currentProject.floorPlan.items.push(item);
    state.selectedId = item.id;
    state.selectedIds = [item.id];
    fillInspector(item);
}

function createElectricalItem(point) {
    const preset = state.tempPreset || state.db.equipment_presets.find(item => item.id === Number(refs.equipmentPreset.value));
    const normalizedPreset = withSymbol(preset);
    const item = {
        id: Date.now(),
        kind: "electrical",
        x: point.x,
        y: point.y,
        width: GRID_SIZE,
        height: GRID_SIZE,
        size: 40,
        name: normalizedPreset?.name || "Novo ponto",
        type: normalizedPreset?.category || "Tomada",
        symbol: normalizedPreset?.symbol || "outlet",
        power: normalizedPreset?.power || 100,
        voltage: normalizedPreset?.voltage || 127,
        height: normalizedPreset?.height || "Baixa",
        circuit: "",
        showLegend: true,
        presetId: normalizedPreset?.id || null,
        routeCenter: (normalizedPreset?.symbol || "") === "light",
        routeTos: [],
        manualRouteTo: null,
        routeTo: null
    };
    applyHeightBasedOutletSymbol(item);
    const routeCenter = findRouteCenterForPoint(item, item.id);
    if (routeCenter && item.id !== routeCenter.id && !item.routeCenter) {
        item.routeTo = routeCenter.id;
    }
    state.currentProject.floorPlan.items.push(item);
    connectSwitchPairs(state.currentProject.floorPlan.items.filter(current => current.kind === "electrical"));
    state.selectedId = item.id;
    state.selectedIds = [item.id];
    fillInspector(item);
}

function findItemAt(point) {
    const items = [...state.currentProject.floorPlan.items].reverse();
    return items.find(item => {
        const bounds = getItemBounds(item);
        const padding = item.kind === "electrical" ? TOUCH_ITEM_HIT_PADDING : item.kind.startsWith("template-") ? 14 : 10;
        return point.x >= bounds.x - padding
            && point.x <= bounds.x + bounds.width + padding
            && point.y >= bounds.y - padding
            && point.y <= bounds.y + bounds.height + padding;
    });
}

function getSelectedItem() {
    return state.currentProject.floorPlan.items.find(item => item.id === state.selectedId) || null;
}

function getSelectedItems() {
    if (!state.selectedIds.length && state.selectedId !== null) {
        state.selectedIds = [state.selectedId];
    }
    const selectedSet = new Set(state.selectedIds);
    return state.currentProject.floorPlan.items.filter(item => selectedSet.has(item.id));
}

function toggleItemSelection(itemId) {
    if (state.selectedIds.includes(itemId)) {
        state.selectedIds = state.selectedIds.filter(currentId => currentId !== itemId);
    } else {
        state.selectedIds = [...state.selectedIds, itemId];
    }

    state.selectedId = state.selectedIds[0] || null;
}

function nudgeSelectedItems(dx, dy) {
    const selectedItems = getSelectedItems();
    if (!selectedItems.length) return;

    pushHistory();
    selectedItems.forEach(item => {
        item.x = Number(item.x || 0) + dx;
        item.y = Number(item.y || 0) + dy;
    });
    render();
}

function getItemBounds(item) {
    if (!item) return { x: 0, y: 0, width: 0, height: 0 };

    if (item.kind === "electrical") {
        const size = Number(item.size || 40);
        return {
            x: Number(item.x || 0) - size / 2,
            y: Number(item.y || 0) - size / 2,
            width: size,
            height: size,
        };
    }

    if (item.kind === "template-line") {
        const x1 = Number(item.x || 0);
        const y1 = Number(item.y || 0);
        const x2 = x1 + Number(item.x2 || 0);
        const y2 = y1 + Number(item.y2 || 0);
        return {
            x: Math.min(x1, x2),
            y: Math.min(y1, y2),
            width: Math.max(6, Math.abs(x2 - x1)),
            height: Math.max(6, Math.abs(y2 - y1)),
        };
    }

    if (item.kind === "door") {
        const width = Math.max(GRID_SIZE, Number(item.width || GRID_SIZE));
        const height = Math.max(GRID_SIZE, Number(item.height || GRID_SIZE));
        const horizontal = width >= height;
        const swing = Math.max(horizontal ? width : height, GRID_SIZE * 1.5);
        return horizontal
            ? {
                x: Number(item.x || 0),
                y: Number(item.y || 0) - swing,
                width: Math.max(width, swing),
                height: height + swing,
            }
            : {
                x: Number(item.x || 0),
                y: Number(item.y || 0),
                width: width + swing,
                height: Math.max(height, swing),
            };
    }

    return {
        x: Number(item.x || 0),
        y: Number(item.y || 0),
        width: Math.max(GRID_SIZE, Number(item.width || GRID_SIZE)),
        height: Math.max(GRID_SIZE, Number(item.height || GRID_SIZE)),
    };
}

function selectionSnapshot(point, itemOrItems) {
    const items = Array.isArray(itemOrItems) ? itemOrItems : [itemOrItems];
    const bounds = selectionBounds(items);
    return {
        point,
        item: Array.isArray(itemOrItems) ? null : structuredClone(itemOrItems),
        items: items.map(item => structuredClone(item)),
        bounds,
    };
}

function selectionBounds(items) {
    if (!items.length) return { x: 0, y: 0, width: 0, height: 0 };
    const boundsList = items.map(getItemBounds);
    const minX = Math.min(...boundsList.map(bounds => bounds.x));
    const minY = Math.min(...boundsList.map(bounds => bounds.y));
    const maxX = Math.max(...boundsList.map(bounds => bounds.x + bounds.width));
    const maxY = Math.max(...boundsList.map(bounds => bounds.y + bounds.height));
    return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

function getSelectionHandles(item) {
    const bounds = getItemBounds(item);
    const x = bounds.x;
    const y = bounds.y;
    const w = bounds.width;
    const h = bounds.height;

    return [
        { name: "nw", x, y },
        { name: "n", x: x + w / 2, y },
        { name: "ne", x: x + w, y },
        { name: "e", x: x + w, y: y + h / 2 },
        { name: "se", x: x + w, y: y + h },
        { name: "s", x: x + w / 2, y: y + h },
        { name: "sw", x, y: y + h },
        { name: "w", x, y: y + h / 2 },
    ];
}

function findSelectionHandleAt(point, item) {
    const hitSize = Math.max(SELECTION_HANDLE_SIZE / 2 + 4, TOUCH_HANDLE_HIT_SIZE / 2);
    return getSelectionHandles(item).find(handle =>
        Math.abs(point.x - handle.x) <= hitSize && Math.abs(point.y - handle.y) <= hitSize
    )?.name || null;
}

function updateSelectionInteraction(point) {
    const item = getSelectedItem();
    const selectedItems = getSelectedItems();
    if (!selectedItems.length || !state.selectionStart) return;

    const dx = point.x - state.selectionStart.point.x;
    const dy = point.y - state.selectionStart.point.y;

    if (state.selectionAction === "move") {
        selectedItems.forEach(currentItem => {
            const startItem = state.selectionStart.items.find(snapshotItem => snapshotItem.id === currentItem.id);
            if (!startItem) return;
            currentItem.x = startItem.x + dx;
            currentItem.y = startItem.y + dy;
        });
        return;
    }

    if (state.selectionAction === "resize" && item) {
        resizeSelectedItem(item, dx, dy);
    }
}

function updateSelectionCursor(point) {
    const selected = state.selectedIds.length > 1 ? null : getSelectedItem();
    const handle = selected ? findSelectionHandleAt(point, selected) : null;
    if (handle) {
        canvas.style.cursor = cursorForHandle(handle);
        return;
    }

    canvas.style.cursor = findItemAt(point) ? "move" : "default";
}

function cursorForHandle(handle) {
    const map = {
        n: "ns-resize",
        s: "ns-resize",
        e: "ew-resize",
        w: "ew-resize",
        nw: "nwse-resize",
        se: "nwse-resize",
        ne: "nesw-resize",
        sw: "nesw-resize",
    };
    return map[handle] || "default";
}

function resizeSelectedItem(item, dx, dy) {
    const handle = state.selectionHandle;
    const start = state.selectionStart.item;

    if (item.kind === "electrical") {
        const startSize = Number(start.size || 40);
        const delta = Math.max(
            handle?.includes("w") ? -dx : dx,
            handle?.includes("n") ? -dy : dy
        );
        item.size = Math.max(18, startSize + delta);
        item.width = item.size;
        return;
    }

    let x = Number(start.x || 0);
    let y = Number(start.y || 0);
    let width = Math.max(GRID_SIZE, Number(start.width || GRID_SIZE));
    let height = Math.max(GRID_SIZE, Number(start.height || GRID_SIZE));

    if (handle.includes("e")) width += dx;
    if (handle.includes("s")) height += dy;
    if (handle.includes("w")) {
        x += dx;
        width -= dx;
    }
    if (handle.includes("n")) {
        y += dy;
        height -= dy;
    }

    if (width < GRID_SIZE) {
        x = item.x;
        width = GRID_SIZE;
    }
    if (height < GRID_SIZE) {
        y = item.y;
        height = GRID_SIZE;
    }

    item.x = x;
    item.y = y;
    item.width = width;
    item.height = height;
}

function fillInspector(item) {
    inspectorFields.name.value = item?.name || "";
    inspectorFields.type.value = item?.type || "";
    inspectorFields.power.value = item?.power || "";
    inspectorFields.voltage.value = String(item?.voltage || 127);
    inspectorFields.height.value = item?.height || "Baixa";
    inspectorFields.circuit.value = item?.circuit || "";
    fillManualRouteOptions(item);
    inspectorFields.legend.checked = Boolean(item?.showLegend);
    refs.flipHorizontalBtn.disabled = !getSelectedItems().length;
}

function fillManualRouteOptions(item) {
    if (!inspectorFields.manualRoute) return;
    const electrical = state.currentProject?.floorPlan?.items
        ?.filter(candidate => candidate.kind === "electrical" && candidate.id !== item?.id) || [];
    inspectorFields.manualRoute.innerHTML = [
        `<option value="">Nenhum</option>`,
        ...electrical.map(candidate => `<option value="${candidate.id}">${escapeHtml(routeTargetLabel(candidate))}</option>`)
    ].join("");
    inspectorFields.manualRoute.value = item?.manualRouteTo ? String(item.manualRouteTo) : "";
    inspectorFields.manualRoute.disabled = !item || item.kind !== "electrical";
}

function routeTargetLabel(item) {
    const symbol = symbolAbbreviation(item);
    const circuit = item.circuit ? ` - circ. ${circuitNumberFromLabel(item.circuit)}` : "";
    return `${item.name || symbol}${circuit}`;
}

function escapeHtml(value) {
    return String(value || "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;");
}

function flipSelectedItemHorizontally() {
    const selectedItems = getSelectedItems();
    if (!selectedItems.length) return;
    pushHistory();

    const bounds = selectionBounds(selectedItems);
    const centerX = bounds.x + bounds.width / 2;
    const centerY = bounds.y + bounds.height / 2;
    const radians = 30 * Math.PI / 180;
    const cos = Math.cos(radians);
    const sin = Math.sin(radians);

    selectedItems.forEach(item => {
        const itemCenter = itemRotationCenter(item);
        const x = itemCenter.x - centerX;
        const y = itemCenter.y - centerY;
        setItemRotationCenter(item, {
            x: centerX + (x * cos - y * sin),
            y: centerY + (x * sin + y * cos),
        });
        item.rotation = ((Number(item.rotation) || 0) + 30) % 360;

        if (item.kind === "electrical") {
            const labelX = Number(item.labelDx ?? 30);
            const labelY = Number(item.labelDy ?? 0);
            item.labelDx = labelX * cos - labelY * sin;
            item.labelDy = labelX * sin + labelY * cos;
        }
    });
    render();
}

function itemRotationCenter(item) {
    if (item.kind === "electrical" || item.kind === "template-device" || item.kind === "template-text") {
        return { x: Number(item.x || 0), y: Number(item.y || 0) };
    }

    if (item.kind === "template-line") {
        return {
            x: Number(item.x || 0) + Number(item.x2 || 0) / 2,
            y: Number(item.y || 0) + Number(item.y2 || 0) / 2,
        };
    }

    return {
        x: Number(item.x || 0) + Math.max(GRID_SIZE, Number(item.width || GRID_SIZE)) / 2,
        y: Number(item.y || 0) + Math.max(GRID_SIZE, Number(item.height || GRID_SIZE)) / 2,
    };
}

function setItemRotationCenter(item, center) {
    if (item.kind === "electrical" || item.kind === "template-device" || item.kind === "template-text") {
        item.x = center.x;
        item.y = center.y;
        return;
    }

    if (item.kind === "template-line") {
        item.x = center.x - Number(item.x2 || 0) / 2;
        item.y = center.y - Number(item.y2 || 0) / 2;
        return;
    }

    item.x = center.x - Math.max(GRID_SIZE, Number(item.width || GRID_SIZE)) / 2;
    item.y = center.y - Math.max(GRID_SIZE, Number(item.height || GRID_SIZE)) / 2;
}

function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.scale(state.zoom, state.zoom);
    ctx.translate(state.currentProject.floorPlan.offsetX || 0, state.currentProject.floorPlan.offsetY || 0);

    const items = state.currentProject.floorPlan.items;
    const rooms = items.filter(item => item.kind === "room");
    const openings = items.filter(item => item.kind === "door" || item.kind === "window");
    const walls = items.filter(item => item.kind === "wall");
    const templateLines = items.filter(item => item.kind === "template-line");
    const templateDevices = items.filter(item => item.kind === "template-device" && item.layer !== "overlay");
    const templateOverlayDevices = items.filter(item => item.kind === "template-device" && item.layer === "overlay");
    const templateTexts = items.filter(item => item.kind === "template-text");
    const electrical = items.filter(item => item.kind === "electrical");

    rooms.forEach(drawRoom);
    walls.forEach(drawWall);
    templateOverlayDevices.forEach(drawTemplateDevice);
    openings.forEach(drawOpening);
    templateLines.forEach(drawTemplateLine);
    templateDevices.forEach(drawTemplateDevice);
    templateTexts.forEach(drawTemplateText);
    drawRoutes(electrical);
    electrical.forEach(drawElectrical);
    drawElectricalLegend(electrical);
    drawSelectionBox();
    drawSelectionOverlay();

    ctx.restore();
}

function drawRoom(item) {
    const rotation = Number(item.rotation || 0);
    const cx = item.x + item.width / 2;
    const cy = item.y + item.height / 2;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rotation * Math.PI / 180);

    if (item.style === "reference-model") {
        ctx.strokeStyle = "#686868";
        ctx.lineWidth = 1.8;
        ctx.strokeRect(-item.width / 2, -item.height / 2, item.width, item.height);
    } else if (item.style === "technical-filled") {
        ctx.strokeStyle = "#686868";
        ctx.lineWidth = 1.8;
        ctx.strokeRect(-item.width / 2, -item.height / 2, item.width, item.height);
    } else {
        ctx.fillStyle = "rgba(245, 216, 203, 0.35)";
        ctx.strokeStyle = "#a99c8c";
        ctx.lineWidth = 1;
        ctx.fillRect(-item.width / 2, -item.height / 2, item.width, item.height);
        ctx.strokeRect(-item.width / 2, -item.height / 2, item.width, item.height);
    }

    ctx.fillStyle = "#5b544b";
    ctx.font = canvasFont(16, "Segoe UI");
    ctx.fillText(item.name, -item.width / 2 + (item.labelX || 10), -item.height / 2 + (item.labelY || 24));
    ctx.restore();
}

function drawSelectionOverlay() {
    const items = getSelectedItems();
    if (!items.length) return;

    const isMultiSelection = items.length > 1;
    const item = !isMultiSelection ? items[0] : null;
    const bounds = isMultiSelection ? selectionBounds(items) : getItemBounds(item);
    ctx.save();
    ctx.strokeStyle = "#1f6feb";
    ctx.fillStyle = "#ffffff";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 4]);
    ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
    ctx.setLineDash([]);

    if (!item) {
        ctx.restore();
        return;
    }

    getSelectionHandles(item).forEach(handle => {
        ctx.fillRect(
            handle.x - SELECTION_HANDLE_SIZE / 2,
            handle.y - SELECTION_HANDLE_SIZE / 2,
            SELECTION_HANDLE_SIZE,
            SELECTION_HANDLE_SIZE
        );
        ctx.strokeRect(
            handle.x - SELECTION_HANDLE_SIZE / 2,
            handle.y - SELECTION_HANDLE_SIZE / 2,
            SELECTION_HANDLE_SIZE,
            SELECTION_HANDLE_SIZE
        );
    });
    ctx.restore();
}

function drawSelectionBox() {
    if (!state.selectionBoxStart || !state.selectionBoxCurrent) return;

    const start = state.selectionBoxStart;
    const end = state.selectionBoxCurrent;
    const x = Math.min(start.x, end.x);
    const y = Math.min(start.y, end.y);
    const width = Math.abs(end.x - start.x);
    const height = Math.abs(end.y - start.y);

    ctx.save();
    ctx.strokeStyle = "#1f6feb";
    ctx.fillStyle = "rgba(31, 111, 235, 0.08)";
    ctx.setLineDash([6, 4]);
    ctx.fillRect(x, y, width, height);
    ctx.strokeRect(x, y, width, height);
    ctx.restore();
}

function selectAllItems() {
    const items = state.currentProject.floorPlan.items;
    if (!items.length) return;
    state.selectedIds = items.map(item => item.id);
    state.selectedId = state.selectedIds[0] || null;
    fillInspector(null);
    render();
}

function finalizeSelectionBox() {
    const start = state.selectionBoxStart;
    const end = state.selectionBoxCurrent || start;
    if (!start || !end) return;

    const bounds = {
        x: Math.min(start.x, end.x),
        y: Math.min(start.y, end.y),
        width: Math.abs(end.x - start.x),
        height: Math.abs(end.y - start.y),
    };

    const items = state.currentProject.floorPlan.items.filter(item => rectIntersects(bounds, getItemBounds(item)));
    state.selectedIds = items.map(item => item.id);
    state.selectedId = state.selectedIds[0] || null;
    state.selectionBoxStart = null;
    state.selectionBoxCurrent = null;
    fillInspector(state.selectedIds.length === 1 ? getSelectedItem() : null);
    render();
}

function rectIntersects(a, b) {
    return a.x < b.x + b.width
        && a.x + a.width > b.x
        && a.y < b.y + b.height
        && a.y + a.height > b.y;
}

function isTechnicalRoomStyle(style) {
    return style === "reference-model" || style === "technical-filled";
}

function drawWall(item) {
    const horizontal = item.width >= item.height;
    const rotation = Number(item.rotation || 0) * Math.PI / 180;
    const cx = item.x + item.width / 2;
    const cy = item.y + item.height / 2;
    const length = horizontal ? item.width : item.height;
    const thickness = Math.min(10, Math.max(8, horizontal ? item.height : item.width));
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rotation);

    if (isTechnicalRoomStyle(item.style)) {
        ctx.strokeStyle = "#686868";
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.moveTo(horizontal ? -length / 2 : 0, horizontal ? 0 : -length / 2);
        ctx.lineTo(horizontal ? length / 2 : 0, horizontal ? 0 : length / 2);
        ctx.stroke();
        ctx.restore();
        return;
    }

    ctx.fillStyle = "#3b3b3b";
    if (horizontal) {
        ctx.fillRect(-length / 2, -thickness / 2, length, thickness);
    } else {
        ctx.fillRect(-thickness / 2, -length / 2, thickness, length);
    }
    ctx.restore();
}

function drawOpening(item) {
    if (item.kind === "door") {
        drawDoorSymbol(item);
        return;
    }

    const rotation = Number(item.rotation || 0) * Math.PI / 180;
    const cx = item.x + item.width / 2;
    const cy = item.y + item.height / 2;
    const horizontal = item.width >= item.height;
    const length = horizontal ? item.width : item.height;
    const thickness = horizontal ? item.height : item.width;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rotation);
    ctx.fillStyle = "#f4f1ea";
    ctx.strokeStyle = "#2d9b7c";
    ctx.lineWidth = 2.2;
    if (horizontal) {
        const openingThickness = Math.max(12, Math.min(16, thickness + 8));
        ctx.fillRect(-length / 2, -openingThickness / 2, length, openingThickness);
        ctx.strokeRect(-length / 2, -openingThickness / 2, length, openingThickness);
        ctx.strokeStyle = "#3b3b3b";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(-length / 2 + 6, -3);
        ctx.lineTo(length / 2 - 6, -3);
        ctx.moveTo(-length / 2 + 6, 3);
        ctx.lineTo(length / 2 - 6, 3);
        ctx.stroke();
    } else {
        const openingThickness = Math.max(12, Math.min(16, thickness + 8));
        ctx.fillRect(-openingThickness / 2, -length / 2, openingThickness, length);
        ctx.strokeRect(-openingThickness / 2, -length / 2, openingThickness, length);
        ctx.strokeStyle = "#3b3b3b";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(-3, -length / 2 + 6);
        ctx.lineTo(-3, length / 2 - 6);
        ctx.moveTo(3, -length / 2 + 6);
        ctx.lineTo(3, length / 2 - 6);
        ctx.stroke();
    }
    ctx.restore();
}

function drawTemplateLine(item) {
    ctx.save();
    const rotation = Number(item.rotation || 0) * Math.PI / 180;
    const cx = item.x + item.x2 / 2;
    const cy = item.y + item.y2 / 2;
    ctx.translate(cx, cy);
    ctx.rotate(rotation);
    ctx.strokeStyle = "#111111";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-item.x2 / 2, -item.y2 / 2);
    ctx.lineTo(item.x2 / 2, item.y2 / 2);
    ctx.stroke();
    ctx.restore();
}

function drawTemplateText(item) {
    ctx.save();
    const rotation = Number(item.rotation || 0) * Math.PI / 180;
    ctx.fillStyle = "#000000";
    ctx.font = canvasFont(item.size || 13);
    ctx.textAlign = item.align || "left";
    ctx.textBaseline = item.baseline || "middle";
    ctx.translate(item.x, item.y);
    ctx.rotate(rotation);
    ctx.translate(-item.x, -item.y);
    ctx.fillText(item.text || "", item.x, item.y);
    ctx.restore();
}

function drawTemplateDevice(item) {
    ctx.save();
    ctx.translate(item.x, item.y);
    ctx.rotate((Number(item.rotation) || 0) * Math.PI / 180);
    ctx.translate(-item.x, -item.y);
    ctx.strokeStyle = "#000000";
    ctx.fillStyle = "#ffffff";
    ctx.lineWidth = 2;

    if (item.device === "breaker") {
        const cx = item.x;
        const cy = item.y;
        ctx.beginPath();
        ctx.arc(cx - 8, cy, 4, 0, Math.PI * 2);
        ctx.arc(cx + 22, cy, 4, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(cx + 7, cy, 15, Math.PI, 0, false);
        ctx.stroke();
    } else if (item.device === "dr") {
        ctx.strokeRect(item.x - 12, item.y - 12, 24, 24);
        ctx.font = canvasFont(12);
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "#000000";
        ctx.fillText("DR", item.x, item.y + 1);
    } else if (item.device === "dps") {
        ctx.strokeRect(item.x - 6, item.y - 10, 12, 20);
        ctx.beginPath();
        ctx.moveTo(item.x - 4, item.y + 6);
        ctx.lineTo(item.x + 4, item.y - 6);
        ctx.stroke();
    } else if (item.device === "ground") {
        ctx.beginPath();
        ctx.moveTo(item.x, item.y - 12);
        ctx.lineTo(item.x, item.y);
        ctx.moveTo(item.x - 12, item.y);
        ctx.lineTo(item.x + 12, item.y);
        ctx.moveTo(item.x - 8, item.y + 5);
        ctx.lineTo(item.x + 8, item.y + 5);
        ctx.moveTo(item.x - 4, item.y + 10);
        ctx.lineTo(item.x + 4, item.y + 10);
        ctx.stroke();
    } else if (item.device === "floor-cutout") {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(item.x, item.y, item.width, item.height);
    }

    ctx.restore();
}

function drawDoorSymbol(item) {
    if (isTechnicalRoomStyle(item.style)) {
        drawReferenceDoorSymbol(item);
        return;
    }

    const horizontal = item.width >= item.height;
    const w = item.width;
    const h = item.height;
    const rotation = Number(item.rotation || 0) * Math.PI / 180;
    const cx = item.x + w / 2;
    const cy = item.y + h / 2;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rotation);
    ctx.translate(-cx, -cy);
    const doorColor = item.style === "reference-model" ? "#686868" : "#bf5a36";
    ctx.strokeStyle = doorColor;
    ctx.fillStyle = doorColor;
    ctx.lineWidth = 2;

    if (horizontal) {
        const doorWidth = Math.max(54, w);
        const swingRadius = doorWidth;
        const y = item.y + h / 2;
        const x0 = item.x;
        const x1 = item.x + doorWidth;

        ctx.strokeStyle = "#f4f1ea";
        ctx.lineWidth = Math.max(14, h + 8);
        ctx.beginPath();
        ctx.moveTo(x0, y);
        ctx.lineTo(x1, y);
        ctx.stroke();

        ctx.strokeStyle = "#686868";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x0, y - h / 2);
        ctx.lineTo(x0, y + h / 2);
        ctx.stroke();

        ctx.strokeStyle = "#686868";
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(x0, y);
        ctx.lineTo(x1, y);
        ctx.stroke();

        ctx.strokeStyle = doorColor;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x0, y, swingRadius, 0, Math.PI / 2, false);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(x0, y);
        ctx.lineTo(x0, y - swingRadius);
        ctx.stroke();
    } else {
        const doorHeight = Math.max(54, h);
        const swingRadius = doorHeight;
        const x = item.x + w / 2;
        const y0 = item.y;
        const y1 = item.y + doorHeight;

        ctx.strokeStyle = "#f4f1ea";
        ctx.lineWidth = Math.max(14, w + 8);
        ctx.beginPath();
        ctx.moveTo(x, y0);
        ctx.lineTo(x, y1);
        ctx.stroke();

        ctx.strokeStyle = "#686868";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x - w / 2, y0);
        ctx.lineTo(x + w / 2, y0);
        ctx.stroke();

        ctx.strokeStyle = "#686868";
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(x, y0);
        ctx.lineTo(x, y1);
        ctx.stroke();

        ctx.strokeStyle = doorColor;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y0, swingRadius, Math.PI / 2, Math.PI, false);
        ctx.stroke();
    }

    ctx.restore();
}

function drawReferenceDoorSymbol(item) {
    const horizontal = item.width >= item.height;
    const rotation = Number(item.rotation || 0) * Math.PI / 180;
    const cx = item.x + item.width / 2;
    const cy = item.y + item.height / 2;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rotation);
    ctx.translate(-cx, -cy);
    ctx.strokeStyle = "#686868";
    ctx.lineWidth = 2;

    if (horizontal) {
        const y = item.y + item.height / 2;
        const x0 = item.x;
        const x1 = item.x + item.width;
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(x0, y - 10, item.width, 20);
        ctx.beginPath();
        ctx.moveTo(x0, y - 18);
        ctx.lineTo(x0, y + 18);
        ctx.moveTo(x0, y);
        ctx.lineTo(x1, y);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(x0, y, item.width, 0, Math.PI / 2, false);
        ctx.stroke();
    } else {
        const x = item.x + item.width / 2;
        const y0 = item.y;
        const y1 = item.y + item.height;
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(x - 10, y0, 20, item.height);
        ctx.beginPath();
        ctx.moveTo(x - 18, y0);
        ctx.lineTo(x + 18, y0);
        ctx.moveTo(x, y0);
        ctx.lineTo(x, y1);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(x, y0, item.height, Math.PI / 2, Math.PI, false);
        ctx.stroke();
    }

    ctx.restore();
}

function drawElectrical(item) {
    const symbol = item.symbol || inferSymbol(item);
    const selected = item.id === state.selectedId;
    const symbolScale = Math.max(0.45, Number(item.size || 40) / 40);

    ctx.save();
    ctx.translate(item.x, item.y);
    ctx.rotate((Number(item.rotation) || 0) * Math.PI / 180);
    ctx.scale(symbolScale, symbolScale);
    ctx.strokeStyle = "#000000";
    ctx.fillStyle = "#ffffff";
    ctx.lineWidth = selected ? 3 : 2;

    if (symbol === "light") {
        drawLightPoint(item);
    } else if (symbol === "switch") {
        drawSwitchPoint(item);
    } else if (symbol === "distribution-board") {
        drawDistributionBoardSymbol(item);
    } else if (SYMBOL_LIBRARY.some(entry => entry.key === symbol)) {
        drawTechnicalSymbolPoint(item, symbol);
    } else {
        drawOutletOrEquipmentSymbol(item, symbol);
    }

    if (selected) {
        ctx.strokeStyle = "#e21b1b";
        ctx.lineWidth = 2;
        ctx.strokeRect(-20, -20, 40, 40);
    }

    ctx.restore();
    drawElectricalCallout(item, symbol);
}

function drawRoutes(electrical) {
    ctx.strokeStyle = "#1e2a32";
    ctx.lineWidth = 1.5;
    electrical.forEach(item => {
        const primaryRouteIds = item.manualRouteTo ? [item.manualRouteTo] : [item.routeTo];
        const routeIds = [...primaryRouteIds, ...(item.routeTos || [])].filter(Boolean);
        routeIds.forEach(routeId => {
            const target = electrical.find(candidate => candidate.id === routeId);
            if (!target) return;
            ctx.beginPath();
            ctx.moveTo(item.x, item.y);
            ctx.lineTo(target.x, target.y);
            ctx.stroke();
        });
    });
}

function drawLightPoint(item) {
    const circuitNumber = circuitNumberFromLabel(item.circuit);
    const commandLetter = circuitLetterForItem(item);

    ctx.beginPath();
    ctx.arc(0, 0, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-15, 0);
    ctx.lineTo(15, 0);
    ctx.stroke();

    ctx.fillStyle = "#000000";
    ctx.font = canvasFont(16);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(String(item.power || BRAZILIAN_ELECTRICAL_RULES.lightingMinimumVa), 0, -5);
    ctx.font = canvasFont(15);
    ctx.fillText(`${circuitNumber}${commandLetter}`, 0, 9);
}

function drawSwitchPoint(item) {
    ctx.beginPath();
    ctx.arc(0, 0, 8, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, 8);
    ctx.lineTo(0, 30);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(-9, 30);
    ctx.lineTo(9, 30);
    ctx.lineTo(0, 14);
    ctx.closePath();
    ctx.stroke();

    ctx.fillStyle = "#000000";
    ctx.font = canvasFont(15);
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(circuitLetterForItem(item), -4, 43);
}

function drawDistributionBoardSymbol(item) {
    ctx.fillStyle = "#111111";
    ctx.fillRect(-14, -10, 28, 20);
    ctx.strokeRect(-14, -10, 28, 20);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(-10, -6, 20, 12);
    ctx.fillStyle = "#111111";
    ctx.fillRect(-7, -3, 14, 6);
}

function drawTechnicalSymbolPoint(item, symbol) {
    const symbolImage = getSymbolImage(symbol);
    if (symbolImage.loaded) {
        ctx.drawImage(symbolImage.image, -20, -20, 40, 40);
        return;
    }

    if (symbol.startsWith("light-") || symbol.startsWith("fluorescent-")) {
        drawTechnicalLight(symbol);
        return;
    }

    if (symbol.startsWith("circuit-")) {
        drawTechnicalCircuit(symbol);
        return;
    }

    if (symbol.startsWith("outlet-light") || symbol.startsWith("light-outlet") || symbol.startsWith("power-outlet")) {
        drawTechnicalOutlet(symbol);
        return;
    }

    if (symbol === "switch-1") {
        drawSwitchPoint(item);
        return;
    }

    if (symbol === "radio-tv") {
        drawRadioTvSymbol();
        return;
    }

    if (symbol === "passage-box") {
        ctx.fillStyle = "#111111";
        ctx.fillRect(-9, -9, 18, 18);
        return;
    }

    if (["partial-board", "main-board-not-embedded", "main-board-embedded", "phone-box"].includes(symbol)) {
        drawTechnicalBox(symbol);
        return;
    }

    if (symbol.includes("conduit") || symbol.includes("tube") || symbol === "conductors-fnt") {
        drawTechnicalLineSymbol(symbol);
        return;
    }

    if (symbol === "minute-button") {
        ctx.beginPath();
        ctx.arc(0, 0, 9, 0, Math.PI * 2);
        ctx.stroke();
        drawCenteredText("M", 0, 3, "10px Arial");
        return;
    }

    if (symbol === "minute-timer") {
        ctx.strokeRect(-8, -8, 16, 16);
        drawCenteredText("M", 0, 3, "10px Arial");
        return;
    }

    if (symbol === "ground") {
        drawGroundSymbol();
        return;
    }

    ctx.beginPath();
    ctx.arc(0, 0, 8, 0, Math.PI * 2);
    ctx.stroke();
}

function drawTechnicalLight(symbol) {
    if (symbol === "light-ceiling") {
        ctx.beginPath();
        ctx.arc(0, 0, 9, 0, Math.PI * 2);
        ctx.stroke();
        return;
    }

    if (symbol === "light-wall") {
        ctx.beginPath();
        ctx.moveTo(-20, 0);
        ctx.lineTo(-8, 0);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(0, 0, 8, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, -8);
        ctx.lineTo(0, 8);
        ctx.moveTo(-8, 0);
        ctx.lineTo(8, 0);
        ctx.stroke();
        return;
    }

    if (symbol === "light-not-embedded" || symbol === "fluorescent-not-embedded") {
        ctx.strokeRect(-16, -7, 32, 14);
        if (symbol.startsWith("fluorescent")) {
            ctx.beginPath();
            ctx.ellipse(0, 0, 9, 4, 0, 0, Math.PI * 2);
            ctx.stroke();
        }
        return;
    }

    ctx.strokeRect(-16, -7, 32, 14);
    ctx.fillStyle = "#111111";
    ctx.fillRect(-14, -5, 12, 10);
    if (symbol.startsWith("fluorescent")) {
        ctx.beginPath();
        ctx.ellipse(7, 0, 7, 3, 0, 0, Math.PI * 2);
        ctx.stroke();
    }
}

function drawTechnicalCircuit(symbol) {
    ctx.beginPath();
    if (symbol === "circuit-up") {
        ctx.moveTo(-13, 13);
        ctx.lineTo(12, -12);
        ctx.stroke();
        drawArrowHead(12, -12, -Math.PI / 4);
    } else if (symbol === "circuit-down") {
        ctx.moveTo(-13, -13);
        ctx.lineTo(12, 12);
        ctx.stroke();
        drawArrowHead(12, 12, Math.PI / 4);
    } else {
        ctx.moveTo(-16, 10);
        ctx.lineTo(-2, -2);
        ctx.lineTo(9, -2);
        ctx.lineTo(16, -10);
        ctx.stroke();
        drawArrowHead(16, -10, -Math.PI / 4);
    }
    ctx.beginPath();
    ctx.arc(-13, symbol === "circuit-down" ? -13 : 13, 2.5, 0, Math.PI * 2);
    ctx.fill();
}

function drawTechnicalOutlet(symbol) {
    const isFloor = symbol === "light-outlet-floor";
    const isCeiling = symbol === "light-outlet-ceiling";
    const isPower = symbol.startsWith("power-outlet");
    const shouldFill = isCeiling || symbol === "outlet-light-high" || isPower;

    ctx.beginPath();
    ctx.moveTo(-22, 0);
    ctx.lineTo(-8, 0);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(-8, -9);
    ctx.lineTo(12, 0);
    ctx.lineTo(-8, 9);
    ctx.closePath();
    shouldFill ? ctx.fill() : ctx.stroke();

    if (isFloor) {
        ctx.beginPath();
        ctx.arc(-14, 0, 2.6, 0, Math.PI * 2);
        ctx.fill();
    }

    if (isCeiling) {
        ctx.beginPath();
        ctx.moveTo(-2, -14);
        ctx.lineTo(6, -14);
        ctx.stroke();
    }
}

function drawRadioTvSymbol() {
    ctx.beginPath();
    ctx.moveTo(-20, 0);
    ctx.lineTo(-8, 0);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, 8, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, -8);
    ctx.lineTo(0, 8);
    ctx.stroke();
}

function drawTechnicalBox(symbol) {
    if (symbol === "partial-board") {
        ctx.fillStyle = "#111111";
        ctx.fillRect(-17, -6, 34, 12);
        return;
    }

    if (symbol === "main-board-not-embedded" || symbol === "main-board-embedded") {
        ctx.beginPath();
        ctx.moveTo(-17, -8);
        ctx.lineTo(17, 7);
        ctx.lineTo(-17, 7);
        ctx.closePath();
        if (symbol === "main-board-not-embedded") {
            ctx.fillStyle = "#111111";
            ctx.fill();
        } else {
            ctx.stroke();
            drawHatch(-14, 10, 28);
        }
        return;
    }

    ctx.strokeRect(-16, -9, 32, 18);
    ctx.beginPath();
    ctx.moveTo(-16, -9);
    ctx.lineTo(16, 9);
    ctx.moveTo(-16, 9);
    ctx.lineTo(16, -9);
    ctx.stroke();
}

function drawTechnicalLineSymbol(symbol) {
    ctx.beginPath();
    ctx.setLineDash(lineDashForSymbol(symbol));
    ctx.moveTo(-20, 0);
    ctx.lineTo(20, 0);
    ctx.stroke();
    ctx.setLineDash([]);

    if (symbol === "conductors-fnt") {
        [-15, -5, 5, 15].forEach(x => {
            ctx.beginPath();
            ctx.moveTo(x, -10);
            ctx.lineTo(x, 10);
            ctx.stroke();
        });
    }
}

function drawGroundSymbol() {
    ctx.beginPath();
    ctx.moveTo(0, -16);
    ctx.lineTo(0, 0);
    ctx.moveTo(-14, 0);
    ctx.lineTo(14, 0);
    ctx.moveTo(-10, 6);
    ctx.lineTo(10, 6);
    ctx.moveTo(-5, 12);
    ctx.lineTo(5, 12);
    ctx.stroke();
}

function drawCenteredText(text, x, y, font) {
    ctx.save();
    ctx.fillStyle = "#000000";
    ctx.font = typeof font === "number" ? canvasFont(font) : font;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, x, y);
    ctx.restore();
}

function drawArrowHead(x, y, angle) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-8, -4);
    ctx.lineTo(-8, 4);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
}

function drawHatch(x, y, width) {
    for (let i = 0; i < width; i += 5) {
        ctx.beginPath();
        ctx.moveTo(x + i, y);
        ctx.lineTo(x + i - 4, y + 5);
        ctx.stroke();
    }
}

function lineDashForSymbol(symbol) {
    if (symbol === "conduit-floor") return [8, 5];
    if (symbol === "phone-tube-external") return [10, 4, 2, 4];
    if (symbol === "phone-tube-internal") return [11, 3, 1, 3, 1, 3];
    return [];
}

function drawOutletOrEquipmentSymbol(item, symbol) {
    if (symbol === "ac") {
        drawAirConditionerSymbol();
        return;
    }

    const highPower = isSpecificUse(item) || symbol === "shower" || symbol === "ac";

    if (highPower) {
        ctx.beginPath();
        ctx.moveTo(-12, -9);
        ctx.lineTo(12, 0);
        ctx.lineTo(-12, 9);
        ctx.closePath();
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(12, 0);
        ctx.lineTo(22, 0);
        ctx.stroke();
    } else {
        ctx.beginPath();
        ctx.arc(0, 0, 8, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(-22, 0);
        ctx.lineTo(-8, 0);
        ctx.stroke();
    }

    if (symbol === "shower") {
        ctx.beginPath();
        ctx.moveTo(-4, -17);
        ctx.lineTo(4, -17);
        ctx.lineTo(0, -9);
        ctx.closePath();
        ctx.stroke();
    }

}

function drawAirConditionerSymbol() {
    ctx.save();
    ctx.strokeStyle = "#000000";
    ctx.fillStyle = "#000000";
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(0, 16);
    ctx.lineTo(0, -22);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(-9, 4);
    ctx.lineTo(3, -6);
    ctx.lineTo(-2, -6);
    ctx.lineTo(8, -22);
    ctx.lineTo(4, -2);
    ctx.lineTo(10, -2);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
}

function drawElectricalCallout(item, symbol) {
    if (!item.showLegend) return;

    ctx.save();
    ctx.fillStyle = "#000000";
    ctx.font = canvasFont(16);
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    const labelX = item.x + Number(item.labelDx ?? 30);
    const labelY = item.y + Number(item.labelDy ?? 0);

    if (symbol !== "light" && item.power >= BRAZILIAN_ELECTRICAL_RULES.generalOutletBedroomLivingVa) {
        const powerLabel = item.power >= 1000 ? `${item.power}W` : `${item.power}VA`;
        ctx.fillText(powerLabel, labelX, labelY - 16);
    }

    if (item.circuit) {
        ctx.fillText(`-${circuitNumberFromLabel(item.circuit)}-`, labelX - 2, labelY + 12);
    }

    if (item.showLegend && item.name && !["Tomada de uso geral", "Luminaria LED"].includes(removeAccents(item.name))) {
        ctx.font = canvasFont(14);
        ctx.fillText(item.name.replace(/\s*\d+W$/i, ""), labelX, labelY + 28);
    }

    ctx.restore();
}

function drawElectricalLegend(electrical) {
    const visible = electrical.filter(item => item.showLegend);
    if (!visible.length) return;

    const x = 920;
    let y = 40;
    ctx.save();
    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = "#777777";
    ctx.lineWidth = 1;
    ctx.fillRect(x - 12, y - 24, 300, 28 + visible.length * 22);
    ctx.strokeRect(x - 12, y - 24, 300, 28 + visible.length * 22);
    ctx.fillStyle = "#000000";
    ctx.font = canvasFont(13, "Arial", "bold");
    ctx.fillText("LEGENDA", x, y - 6);
    ctx.font = canvasFont(12);
    visible.slice(0, 10).forEach((item, index) => {
        y += 22;
        ctx.fillText(`${symbolAbbreviation(item)} - ${item.name} (${item.power || 0}${item.power >= 1000 ? "W" : "VA"})`, x, y);
    });
    ctx.restore();
}

function autoRouteElectricalPoints() {
    const points = state.currentProject.floorPlan.items.filter(item => item.kind === "electrical");
    if (!points.length) return;
    points.forEach(item => {
        if (isRouteCenterCandidate(item)) {
            item.routeTo = null;
            return;
        }
        const center = findRouteCenterForPoint(item, item.id);
        item.routeTo = center ? center.id : null;
    });
    connectSwitchPairs(points);
}

function computeDerivedData() {
    const electrical = state.currentProject.floorPlan.items.filter(item => item.kind === "electrical");
    const circuits = buildCircuits(electrical);
    const materials = appendEquipmentMaterials(buildMaterials(circuits, electrical), electrical);
    renderSummary(electrical, circuits);
    renderDistributionBoard(circuits);
    renderSingleLine(circuits);
    renderMaterials(materials);
}

function buildCircuits(points) {
    const groups = {};
    points.forEach(point => {
        point.symbol = point.symbol || inferSymbol(point);
        const key = circuitGroupForPoint(point);
        if (!groups[key]) groups[key] = [];
        groups[key].push(point);
    });

    return Object.entries(groups).map(([type, items], index) => {
        const totalPower = items.reduce((sum, item) => sum + (item.power || 0), 0);
        const voltage = items.some(item => Number(item.voltage) === 220) ? 220 : 127;
        const current = voltage ? totalPower / voltage : 0;
        const breaker = current <= 10 ? "10A" : current <= 20 ? "20A" : current <= 32 ? "32A" : "40A";
        const wire = current <= 10 ? "1,5 mm2" : current <= 20 ? "2,5 mm2" : "4 mm2";
        const label = String(index + 1);
        items.forEach((item, itemIndex) => {
            item.circuit = label;
            item.command = CIRCUIT_SEQUENCE[itemIndex] || "z";
        });
        return { label, type, totalPower, voltage, current, breaker, wire, items };
    });
}

function buildMaterials(circuits, points) {
    const table = [];
    circuits.forEach(circuit => {
        table.push({
            description: `Disjuntor ${circuit.breaker}`,
            quantity: 1,
            unit: "un",
            price: findMaterialPrice(`Disjuntor ${circuit.breaker}`) || 20
        });
        table.push({
            description: `Cabo ${circuit.wire}`,
            quantity: Math.max(10, circuit.items.length * 6),
            unit: "m",
            price: findMaterialPrice(`Cabo ${circuit.wire}`) || 4
        });
    });

    if (points.length) {
        table.push({
            description: "Quadro de distribuição",
            quantity: 1,
            unit: "un",
            price: findMaterialPrice("Quadro de distribuição") || 180
        });
    }

    points.forEach(point => {
        const baseName = point.type.includes("Iluminação") ? "Luminária" : point.type.includes("Tomada") ? "Tomada 2P+T" : null;
        if (!baseName) return;
        table.push({
            description: baseName,
            quantity: 1,
            unit: "un",
            price: findMaterialPrice(baseName) || 15
        });
    });

    return table.map(item => ({
        ...item,
        subtotal: item.quantity * item.price
    }));
}

function findMaterialPrice(name) {
    return state.db.materials.find(item => item.name === name)?.price || null;
}

function findEquipmentPrice(point) {
    const presetById = state.db.equipment_presets.find(item => item.id === point.presetId);
    if (presetById && presetById.price !== undefined) {
        return Number(presetById.price);
    }

    const presetByName = state.db.equipment_presets.find(item => item.name === point.name);
    if (presetByName && presetByName.price !== undefined) {
        return Number(presetByName.price);
    }

    const presetBySymbol = state.db.equipment_presets.find(item => item.symbol === point.symbol && item.price !== undefined);
    if (presetBySymbol) {
        return Number(presetBySymbol.price);
    }

    return null;
}

function appendEquipmentMaterials(materials, points) {
    const extras = points
        .filter(point => isSpecificUse(point))
        .map(point => {
            const price = findEquipmentPrice(point);
            if (price === null) return null;
            return {
                description: point.name,
                quantity: 1,
                unit: "un",
                price,
                subtotal: price
            };
        })
        .filter(Boolean);

    return [...materials, ...extras];
}

function renderSummary(points, circuits) {
    const totalPower = points.reduce((sum, item) => sum + (item.power || 0), 0);
    refs.summaryCards.innerHTML = [
        { title: "Ambientes", value: state.currentProject.floorPlan.items.filter(item => item.kind === "room").length },
        { title: "Pontos", value: points.length },
        { title: "Circuitos", value: circuits.length },
        { title: "Carga total", value: `${totalPower}W` },
    ].map(card => `<div class="summary-card"><span>${card.title}</span><strong>${card.value}</strong></div>`).join("");
}

function renderDistributionBoard(circuits) {
    if (!circuits.length) {
        refs.distributionBoard.innerHTML = "Nenhum circuito calculado.";
        return;
    }
    refs.distributionBoard.innerHTML = `
        <table>
            <thead><tr><th>Circuito</th><th>Tipo</th><th>Disjuntor</th><th>Condutor</th></tr></thead>
            <tbody>${circuits.map(c => `<tr><td>${c.label}</td><td>${c.type}</td><td>${c.breaker}</td><td>${c.wire}</td></tr>`).join("")}</tbody>
        </table>
    `;
}

function renderSingleLine(circuits) {
    refs.singleLineDiagram.innerHTML = circuits.length
        ? circuits.map(circuit => `${circuit.label} -> ${circuit.breaker} -> ${circuit.wire} -> ${circuit.type} (${circuit.totalPower}W)`).join("<br>")
        : "Nenhum diagrama disponível.";
}

function renderMaterials(materials) {
    if (!materials.length) {
        refs.materialsBox.innerHTML = "Sem materiais calculados.";
        return;
    }
    const total = materials.reduce((sum, item) => sum + item.subtotal, 0);
    refs.materialsBox.innerHTML = `
        <table>
            <thead><tr><th>Material</th><th>Qtd.</th><th>Subtotal</th></tr></thead>
            <tbody>${materials.map(item => `<tr><td>${item.description}</td><td>${item.quantity} ${item.unit}</td><td>R$ ${item.subtotal.toFixed(2)}</td></tr>`).join("")}</tbody>
        </table>
        <p><strong>Total estimado: R$ ${total.toFixed(2)}</strong></p>
    `;
}

function openPrintableReport() {
    const payload = {
        ...state.currentProject,
        drawingImage: capturePlanImage()
    };

    fetch("download_report.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    })
        .then(response => {
            if (!response.ok) throw new Error("Falha ao gerar PDF.");
            return response.blob();
        })
        .then(blob => {
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `${(state.currentProject.name || "projeto").replace(/[^\w-]+/g, "_")}.pdf`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            setTimeout(() => URL.revokeObjectURL(url), 1000);
        })
        .catch(() => {
            alert("Nao foi possivel gerar o PDF agora.");
        });
}

function capturePlanImage() {
    const items = state.currentProject.floorPlan.items || [];
    const bounds = items.length
        ? selectionBounds(items)
        : { x: 0, y: 0, width: canvas.width, height: canvas.height };
    const padding = 80;
    const original = {
        width: canvas.width,
        height: canvas.height,
        offsetX: state.currentProject.floorPlan.offsetX || 0,
        offsetY: state.currentProject.floorPlan.offsetY || 0,
        selectedId: state.selectedId,
        selectedIds: [...state.selectedIds],
    };
    const exportWidth = Math.max(300, Math.ceil(bounds.width + padding * 2));
    const exportHeight = Math.max(300, Math.ceil(bounds.height + padding * 2));

    canvas.width = exportWidth;
    canvas.height = exportHeight;
    state.currentProject.floorPlan.offsetX = padding - bounds.x;
    state.currentProject.floorPlan.offsetY = padding - bounds.y;
    state.selectedId = null;
    state.selectedIds = [];
    render();

    const exportCanvas = document.createElement("canvas");
    exportCanvas.width = canvas.width;
    exportCanvas.height = canvas.height;
    const exportCtx = exportCanvas.getContext("2d");
    exportCtx.fillStyle = "#ffffff";
    exportCtx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
    exportCtx.drawImage(canvas, 0, 0);
    const image = exportCanvas.toDataURL("image/jpeg", 0.92);

    canvas.width = original.width;
    canvas.height = original.height;
    state.currentProject.floorPlan.offsetX = original.offsetX;
    state.currentProject.floorPlan.offsetY = original.offsetY;
    state.selectedId = original.selectedId;
    state.selectedIds = original.selectedIds;
    render();

    return image;
}

async function saveProject() {
    state.currentProject.user_id = Number(refs.userSelect.value);
    state.currentProject.utility_id = Number(refs.utilitySelect.value);
    state.currentProject.floorPlan.zoom = state.zoom;
    state.currentProject.floorPlan.textSize = state.textSize;
    const response = await fetch("api.php?action=saveProject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(state.currentProject)
    });
    const result = await response.json();
    if (result.project) {
        const index = state.db.projects.findIndex(item => item.id === result.project.id);
        if (index >= 0) {
            state.db.projects[index] = structuredClone(result.project);
        } else {
            state.db.projects.push(structuredClone(result.project));
        }
        fillSelect(refs.projectSelect, state.db.projects, "name");
        refs.projectSelect.value = result.project.id;
        alert("Projeto salvo em JSON com sucesso.");
    }
}

function zoomBy(delta) {
    state.zoom = Math.min(2.5, Math.max(0.4, +(state.zoom + delta).toFixed(2)));
    updateZoom();
    render();
}

function updateZoom() {
    canvas.style.transform = `scale(${state.zoom})`;
    refs.zoomLabel.textContent = `${Math.round(state.zoom * 100)}%`;
}

bootstrap();

