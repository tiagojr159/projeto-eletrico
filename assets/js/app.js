const GRID_SIZE = 20;
const CIRCUIT_SEQUENCE = "abcdefghijklmnopqrstuvwxyz";
const SELECTION_HANDLE_SIZE = 10;
const TOUCH_HANDLE_HIT_SIZE = 28;
const TOUCH_ITEM_HIT_PADDING = 18;
const symbolImageCache = new Map();

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

const state = {
    db: null,
    currentProject: null,
    currentTool: "select",
    selectedId: null,
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
    activePointerId: null,
};


const canvas = document.getElementById("planCanvas");
const ctx = canvas.getContext("2d");
const viewport = document.getElementById("canvasViewport");

const refs = {
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
};

const inspectorFields = {
    name: document.getElementById("propName"),
    type: document.getElementById("propType"),
    power: document.getElementById("propPower"),
    voltage: document.getElementById("propVoltage"),
    height: document.getElementById("propHeight"),
    circuit: document.getElementById("propCircuit"),
    legend: document.getElementById("propLegend"),
};

async function bootstrap() {
    const response = await fetch("api.php?action=bootstrap");
    state.db = await response.json();
    populateSelects();
    renderSymbolToolbar();
    loadProject(state.db.projects[0]);
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
    state.zoom = state.currentProject.floorPlan.zoom || 1;
    refs.projectSelect.value = project.id;
    refs.userSelect.value = project.user_id;
    refs.utilitySelect.value = project.utility_id;
    refs.projectNameInput.value = project.name;
    updateZoom();
    computeDerivedData();
    fillInspector(null);
}

function bindEvents() {
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
        item.circuit = inspectorFields.circuit.value;
        item.showLegend = inspectorFields.legend.checked;
        computeDerivedData();
        render();
    });

    canvas.addEventListener("pointerdown", onCanvasPointerDown);
    canvas.addEventListener("pointermove", onCanvasPointerMove);
    canvas.addEventListener("pointerup", onCanvasPointerUp);
    canvas.addEventListener("pointercancel", onCanvasPointerUp);
    canvas.addEventListener("lostpointercapture", onCanvasPointerUp);
    window.addEventListener("keydown", event => {
        if (event.key === "Delete" || event.key === "Backspace") {
            const active = document.activeElement;
            const isInput = active && ["INPUT", "TEXTAREA", "SELECT"].includes(active.tagName);
            if (isInput) return;
            deleteSelectedItem();
        }
    });
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
    const item = getSelectedItem();
    if (!item) return;

    pushHistory();
    state.currentProject.floorPlan.items = state.currentProject.floorPlan.items.filter(current => current.id !== item.id);
    state.selectedId = null;
    state.selectionAction = null;
    state.selectionHandle = null;
    state.selectionStart = null;
    fillInspector(null);
    computeDerivedData();
    render();
}

function handleToolbarAction(action) {
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

    if (action === "legend" || action === "toggle-tue" || action === "toggle-tug") {
        return;
    }
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
    const filled = 'fill="currentColor"';
    const zigzag = '<path d="M7 26l3-4 3 4 3-4 3 4 3-4 3 4" stroke="currentColor" stroke-width="1.5" fill="none"/>';

    const templates = {
        "light-ceiling": `<svg ${common}><circle cx="20" cy="20" r="8" ${stroke}/><path d="M20 12v16M12 20h16" ${stroke}/><text x="28" y="14" font-size="8">a</text></svg>`,
        "light-wall": `<svg ${common}><path d="M8 20h8" ${stroke}/><circle cx="23" cy="20" r="7" ${stroke}/><path d="M23 13v14M16 20h14" ${stroke}/><text x="31" y="14" font-size="8">a</text></svg>`,
        "light-not-embedded": `<svg ${common}><rect x="9" y="15" width="22" height="10" rx="1" ${stroke}/><circle cx="20" cy="20" r="3" ${stroke}/></svg>`,
        "light-embedded": `<svg ${common}><rect x="9" y="15" width="22" height="10" rx="1" ${stroke}/><rect x="12" y="16" width="8" height="8" ${filled}/></svg>`,
        "fluorescent-not-embedded": `<svg ${common}><rect x="8" y="14" width="24" height="12" rx="2" ${stroke}/><ellipse cx="20" cy="20" rx="7" ry="3" ${stroke}/></svg>`,
        "fluorescent-embedded": `<svg ${common}><rect x="8" y="14" width="24" height="12" rx="2" ${stroke}/><rect x="10" y="16" width="9" height="8" ${filled}/><ellipse cx="24" cy="20" rx="5" ry="3" ${stroke}/></svg>`,
        "circuit-up": `<svg ${common}><path d="M10 27l15-14" ${stroke}/><circle cx="10" cy="27" r="2" fill="currentColor"/><path d="M25 13l4 0 0 4" ${stroke}/></svg>`,
        "circuit-down": `<svg ${common}><path d="M10 13l15 14" ${stroke}/><circle cx="10" cy="13" r="2" fill="currentColor"/><path d="M25 27l4 0 0-4" ${stroke}/></svg>`,
        "circuit-pass": `<svg ${common}><path d="M7 27l12-9 8 0 6-6" ${stroke}/><circle cx="7" cy="27" r="2" fill="currentColor"/><circle cx="27" cy="18" r="2" fill="currentColor"/></svg>`,
        "switch-1": `<svg ${common}><circle cx="20" cy="15" r="7" ${stroke}/><path d="M20 22v10" ${stroke}/><text x="14" y="36" font-size="9">S</text></svg>`,
        "outlet-light-low": `<svg ${common}><path d="M8 20h10" ${stroke}/><path d="M18 15l12 5-12 5z" ${stroke}/></svg>`,
        "outlet-light-medium": `<svg ${common}><path d="M8 20h10" ${stroke}/><path d="M18 14l12 6-12 6z" ${stroke}/><path d="M10 27h18" stroke="currentColor" stroke-width="1.5"/></svg>`,
        "outlet-light-high": `<svg ${common}><path d="M8 20h10" ${stroke}/><path d="M18 13l12 7-12 7z" fill="currentColor"/></svg>`,
        "light-outlet-floor": `<svg ${common}><path d="M8 20h10" ${stroke}/><path d="M18 14l12 6-12 6z" ${stroke}/><circle cx="10" cy="20" r="2.4" fill="currentColor"/></svg>`,
        "light-outlet-ceiling": `<svg ${common}><path d="M8 20h10" ${stroke}/><path d="M18 13l12 7-12 7z" fill="currentColor"/><path d="M18 8h8" ${stroke}/></svg>`,
        "power-outlet-wall": `<svg ${common}><path d="M8 20h8" ${stroke}/><circle cx="22" cy="20" r="7" ${stroke}/><path d="M22 13v14" ${stroke}/><text x="31" y="18" font-size="7">W</text></svg>`,
        "power-outlet-floor": `<svg ${common}><path d="M8 20h8" ${stroke}/><path d="M16 14l14 6-14 6z" ${stroke}/><text x="31" y="18" font-size="7">P</text></svg>`,
        "power-outlet-ceiling": `<svg ${common}><path d="M8 20h8" ${stroke}/><circle cx="22" cy="20" r="7" fill="currentColor"/><text x="31" y="18" font-size="7">T</text></svg>`,
        "radio-tv": `<svg ${common}><path d="M7 20h13" ${stroke}/><circle cx="24" cy="20" r="6" ${stroke}/><path d="M24 14v12" ${stroke}/></svg>`,
        "passage-box": `<svg ${common}><rect x="12" y="12" width="16" height="16" fill="currentColor"/></svg>`,
        "partial-board": `<svg ${common}><rect x="8" y="15" width="24" height="10" fill="currentColor"/></svg>`,
        "main-board-not-embedded": `<svg ${common}><path d="M8 14l24 8H8z" fill="currentColor"/></svg>`,
        "main-board-embedded": `<svg ${common}><path d="M8 14l24 8H8z" ${stroke}/>${zigzag}</svg>`,
        "phone-box": `<svg ${common}><rect x="8" y="13" width="24" height="14" ${stroke}/><path d="M10 25l20-10M10 15l20 10" ${stroke}/></svg>`,
        "conduit-ceiling-wall": `<svg ${common}><path d="M8 20h24" ${stroke}/></svg>`,
        "conduit-floor": `<svg ${common}><path d="M8 20h24" stroke="currentColor" stroke-width="2" stroke-dasharray="5 4"/></svg>`,
        "phone-tube-external": `<svg ${common}><path d="M8 20h24" stroke="currentColor" stroke-width="2" stroke-dasharray="9 4 2 4"/></svg>`,
        "phone-tube-internal": `<svg ${common}><path d="M8 20h24" stroke="currentColor" stroke-width="2" stroke-dasharray="10 3 1 3 1 3"/></svg>`,
        "conductors-fnt": `<svg ${common}><path d="M8 12v16M16 12v16M24 12v16M32 12v16M8 20h24" ${stroke}/></svg>`,
        "minute-button": `<svg ${common}><circle cx="20" cy="20" r="7" ${stroke}/><text x="20" y="23" text-anchor="middle" font-size="8">M</text></svg>`,
        "minute-timer": `<svg ${common}><rect x="14" y="14" width="12" height="12" ${stroke}/><text x="20" y="23" text-anchor="middle" font-size="8">M</text></svg>`,
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
        const selectedItem = getSelectedItem();
        const handle = selectedItem ? findSelectionHandleAt(point, selectedItem) : null;
        if (handle) {
            pushHistory();
            state.selectionAction = "resize";
            state.selectionHandle = handle;
            state.selectionStart = selectionSnapshot(point, selectedItem);
            return;
        }

        const item = findItemAt(point);
        state.selectedId = item?.id || null;
        fillInspector(getSelectedItem());
        if (item) {
            pushHistory();
            state.selectionAction = "move";
            state.selectionStart = selectionSnapshot(point, item);
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

    if (state.currentTool === "select" && state.selectionAction && state.selectionStart) {
        updateSelectionInteraction(point);
        computeDerivedData();
        fillInspector(getSelectedItem());
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
        routeTo: null
    };
    state.currentProject.floorPlan.items.push(item);
    state.selectedId = item.id;
    fillInspector(item);
}

function findItemAt(point) {
    const items = [...state.currentProject.floorPlan.items].reverse();
    return items.find(item => {
        const bounds = getItemBounds(item);
        const padding = item.kind === "electrical" ? TOUCH_ITEM_HIT_PADDING : 10;
        return point.x >= bounds.x - padding
            && point.x <= bounds.x + bounds.width + padding
            && point.y >= bounds.y - padding
            && point.y <= bounds.y + bounds.height + padding;
    });
}

function getSelectedItem() {
    return state.currentProject.floorPlan.items.find(item => item.id === state.selectedId) || null;
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

    return {
        x: Number(item.x || 0),
        y: Number(item.y || 0),
        width: Math.max(GRID_SIZE, Number(item.width || GRID_SIZE)),
        height: Math.max(GRID_SIZE, Number(item.height || GRID_SIZE)),
    };
}

function selectionSnapshot(point, item) {
    const bounds = getItemBounds(item);
    return {
        point,
        item: structuredClone(item),
        bounds,
    };
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
    if (!item || !state.selectionStart) return;

    const dx = point.x - state.selectionStart.point.x;
    const dy = point.y - state.selectionStart.point.y;

    if (state.selectionAction === "move") {
        item.x = state.selectionStart.item.x + dx;
        item.y = state.selectionStart.item.y + dy;
        return;
    }

    if (state.selectionAction === "resize") {
        resizeSelectedItem(item, dx, dy);
    }
}

function updateSelectionCursor(point) {
    const selected = getSelectedItem();
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
    inspectorFields.legend.checked = Boolean(item?.showLegend);
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
    const electrical = items.filter(item => item.kind === "electrical");

    rooms.forEach(drawRoom);
    walls.forEach(drawWall);
    openings.forEach(drawOpening);
    drawRoutes(electrical);
    electrical.forEach(drawElectrical);
    drawElectricalLegend(electrical);
    drawSelectionOverlay();

    ctx.restore();
}

function drawRoom(item) {
    ctx.fillStyle = "rgba(245, 216, 203, 0.35)";
    ctx.strokeStyle = "#a99c8c";
    ctx.lineWidth = 1;
    ctx.fillRect(item.x, item.y, item.width, item.height);
    ctx.strokeRect(item.x, item.y, item.width, item.height);
    ctx.fillStyle = "#5b544b";
    ctx.font = "16px Segoe UI";
    ctx.fillText(item.name, item.x + 10, item.y + 24);
}

function drawSelectionOverlay() {
    const item = getSelectedItem();
    if (!item) return;

    const bounds = getItemBounds(item);
    ctx.save();
    ctx.strokeStyle = "#1f6feb";
    ctx.fillStyle = "#ffffff";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 4]);
    ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
    ctx.setLineDash([]);

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

function drawWall(item) {
    ctx.fillStyle = "#3b3b3b";
    const horizontal = item.width >= item.height;
    if (horizontal) {
        ctx.fillRect(item.x, item.y + item.height / 2 - 4, item.width, 8);
    } else {
        ctx.fillRect(item.x + item.width / 2 - 4, item.y, 8, item.height);
    }
}

function drawOpening(item) {
    if (item.kind === "door") {
        drawDoorSymbol(item);
        return;
    }

    ctx.strokeStyle = "#2d9b7c";
    ctx.lineWidth = 3;
    ctx.strokeRect(item.x, item.y, item.width, item.height);
    ctx.font = "14px Segoe UI";
    ctx.fillStyle = ctx.strokeStyle;
    ctx.fillText("Janela", item.x + 6, item.y + 18);
}

function drawDoorSymbol(item) {
    const horizontal = item.width >= item.height;
    const w = item.width;
    const h = item.height;

    ctx.save();
    ctx.strokeStyle = "#bf5a36";
    ctx.fillStyle = "#bf5a36";
    ctx.lineWidth = 2.5;

    if (horizontal) {
        const doorWidth = Math.max(24, w);
        const swingRadius = doorWidth;
        const y = item.y + h / 2;
        const x0 = item.x;
        const x1 = item.x + doorWidth;

        ctx.beginPath();
        ctx.moveTo(x0, y);
        ctx.lineTo(x1, y);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(x0, y, swingRadius, 0, Math.PI / 2, false);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(x0, y);
        ctx.lineTo(x0, y - swingRadius);
        ctx.stroke();
    } else {
        const doorHeight = Math.max(24, h);
        const swingRadius = doorHeight;
        const x = item.x + w / 2;
        const y0 = item.y;
        const y1 = item.y + doorHeight;

        ctx.beginPath();
        ctx.moveTo(x, y0);
        ctx.lineTo(x, y1);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(x, y0, swingRadius, Math.PI / 2, Math.PI, false);
        ctx.stroke();
    }

    ctx.font = "14px Segoe UI";
    ctx.fillText("Porta", item.x + 4, item.y + 16);
    ctx.restore();
}

function drawElectrical(item) {
    const symbol = item.symbol || inferSymbol(item);
    const selected = item.id === state.selectedId;
    const symbolScale = Math.max(0.45, Number(item.size || 40) / 40);

    ctx.save();
    ctx.translate(item.x, item.y);
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
        if (!item.routeTo) return;
        const target = electrical.find(candidate => candidate.id === item.routeTo);
        if (!target) return;
        ctx.beginPath();
        ctx.moveTo(item.x, item.y);
        ctx.lineTo(target.x, target.y);
        ctx.stroke();
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
    ctx.moveTo(-16, 0);
    ctx.lineTo(16, 0);
    ctx.moveTo(0, -16);
    ctx.lineTo(0, 16);
    ctx.stroke();

    ctx.fillStyle = "#000000";
    ctx.font = "16px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(String(item.power || BRAZILIAN_ELECTRICAL_RULES.lightingMinimumVa), 0, -5);
    ctx.font = "15px Arial";
    ctx.fillText(`${circuitNumber}${commandLetter}`, 0, 9);
}

function drawSwitchPoint(item) {
    ctx.beginPath();
    ctx.arc(0, 0, 8, 0, Math.PI * 2);
    ctx.fill();
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
    ctx.font = "15px Arial";
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
        ctx.beginPath();
        ctx.moveTo(0, -9);
        ctx.lineTo(0, 9);
        ctx.moveTo(-9, 0);
        ctx.lineTo(9, 0);
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
    ctx.font = font;
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
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(8, 0);
        ctx.lineTo(25, 0);
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

    if (symbol === "ac") {
        ctx.beginPath();
        ctx.rect(-13, -17, 26, 8);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(-7, -5);
        ctx.lineTo(7, -5);
        ctx.stroke();
    }
}

function drawElectricalCallout(item, symbol) {
    ctx.save();
    ctx.fillStyle = "#000000";
    ctx.font = "16px Arial";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";

    if (symbol !== "light" && item.power >= BRAZILIAN_ELECTRICAL_RULES.generalOutletBedroomLivingVa) {
        const powerLabel = item.power >= 1000 ? `${item.power}W` : `${item.power}VA`;
        ctx.fillText(powerLabel, item.x + 30, item.y - 16);
    }

    if (item.circuit) {
        ctx.fillText(`-${circuitNumberFromLabel(item.circuit)}-`, item.x + 28, item.y + 12);
    }

    if (item.showLegend && item.name && !["Tomada de uso geral", "Luminaria LED"].includes(removeAccents(item.name))) {
        ctx.font = "14px Arial";
        ctx.fillText(item.name.replace(/\s*\d+W$/i, ""), item.x + 30, item.y + 28);
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
    ctx.font = "bold 13px Arial";
    ctx.fillText("LEGENDA", x, y - 6);
    ctx.font = "12px Arial";
    visible.slice(0, 10).forEach((item, index) => {
        y += 22;
        ctx.fillText(`${symbolAbbreviation(item)} - ${item.name} (${item.power || 0}${item.power >= 1000 ? "W" : "VA"})`, x, y);
    });
    ctx.restore();
}

function autoRouteElectricalPoints() {
    const points = state.currentProject.floorPlan.items.filter(item => item.kind === "electrical");
    if (!points.length) return;
    const center = points[0];
    points.forEach((item, index) => {
        item.routeTo = index === 0 ? null : center.id;
    });
}

function computeDerivedData() {
    const electrical = state.currentProject.floorPlan.items.filter(item => item.kind === "electrical");
    const circuits = buildCircuits(electrical);
    const materials = buildMaterials(circuits, electrical);
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
    const reportWindow = window.open("", "_blank", "width=900,height=700");
    const circuits = buildCircuits(state.currentProject.floorPlan.items.filter(item => item.kind === "electrical"));
    const materials = buildMaterials(circuits, state.currentProject.floorPlan.items.filter(item => item.kind === "electrical"));
    const utility = state.db.utilities.find(item => item.id === Number(state.currentProject.utility_id));
    reportWindow.document.write(`
        <html lang="pt-BR">
        <head>
            <title>Relatório - ${state.currentProject.name}</title>
            <style>body{font-family:Segoe UI,sans-serif;padding:32px}table{width:100%;border-collapse:collapse;margin:16px 0}td,th{border-bottom:1px solid #ddd;padding:8px;text-align:left}</style>
        </head>
        <body>
            <h1>${state.currentProject.name}</h1>
            <p>Concessionária: ${utility?.name || "-"} | Nível: ${utility?.voltage_level || "-"}</p>
            <h2>Quadro de distribuição</h2>
            <table><thead><tr><th>Circuito</th><th>Tipo</th><th>Potência</th><th>Disjuntor</th></tr></thead><tbody>${circuits.map(c => `<tr><td>${c.label}</td><td>${c.type}</td><td>${c.totalPower}W</td><td>${c.breaker}</td></tr>`).join("")}</tbody></table>
            <h2>Lista de materiais</h2>
            <table><thead><tr><th>Material</th><th>Qtd.</th><th>Subtotal</th></tr></thead><tbody>${materials.map(item => `<tr><td>${item.description}</td><td>${item.quantity} ${item.unit}</td><td>R$ ${item.subtotal.toFixed(2)}</td></tr>`).join("")}</tbody></table>
            <p><strong>Observação:</strong> use a função de imprimir do navegador para salvar em PDF.</p>
        </body></html>
    `);
    reportWindow.document.close();
}

async function saveProject() {
    state.currentProject.user_id = Number(refs.userSelect.value);
    state.currentProject.utility_id = Number(refs.utilitySelect.value);
    state.currentProject.floorPlan.zoom = state.zoom;
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
