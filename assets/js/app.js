const GRID_SIZE = 20;

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
        document.querySelectorAll(".tool").forEach(tool => tool.classList.remove("active"));
        button.classList.add("active");
        state.currentTool = button.dataset.tool;
        refs.toolHint.textContent = toolHintText(state.currentTool);
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
        state.currentTool = "electrical";
        setActiveTool("electrical");
        refs.toolHint.textContent = "Clique na planta para inserir o equipamento selecionado.";
    });

    document.getElementById("undoBtn").addEventListener("click", undo);
    document.getElementById("redoBtn").addEventListener("click", redo);
    document.getElementById("zoomInBtn").addEventListener("click", () => zoomBy(0.1));
    document.getElementById("zoomOutBtn").addEventListener("click", () => zoomBy(-0.1));
    document.getElementById("fitBtn").addEventListener("click", () => {
        state.currentProject.floorPlan.offsetX = 40;
        state.currentProject.floorPlan.offsetY = 40;
        state.zoom = 1;
        updateZoom();
        render();
    });

    document.getElementById("autoRouteBtn").addEventListener("click", () => {
        autoRouteElectricalPoints();
        computeDerivedData();
        render();
    });

    document.getElementById("generateReportBtn").addEventListener("click", openPrintableReport);

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

    canvas.addEventListener("mousedown", onCanvasMouseDown);
    canvas.addEventListener("mousemove", onCanvasMouseMove);
    canvas.addEventListener("mouseup", onCanvasMouseUp);
    canvas.addEventListener("mouseleave", onCanvasMouseUp);
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
    document.querySelectorAll(".tool").forEach(tool => {
        tool.classList.toggle("active", tool.dataset.tool === toolName);
    });
    state.currentTool = toolName;
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

function onCanvasMouseDown(event) {
    const point = canvasPoint(event);
    if (state.currentTool === "pan") {
        state.draggingCanvas = true;
        state.panStart = { x: event.clientX, y: event.clientY, left: viewport.scrollLeft, top: viewport.scrollTop };
        return;
    }

    if (state.currentTool === "select") {
        state.selectedId = findItemAt(point)?.id || null;
        fillInspector(getSelectedItem());
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

function onCanvasMouseMove(event) {
    if (state.draggingCanvas && state.panStart) {
        viewport.scrollLeft = state.panStart.left - (event.clientX - state.panStart.x);
        viewport.scrollTop = state.panStart.top - (event.clientY - state.panStart.y);
    }
}

function onCanvasMouseUp(event) {
    if (state.draggingCanvas) {
        state.draggingCanvas = false;
        state.panStart = null;
        return;
    }

    if (!state.drawingStart) return;
    const end = canvasPoint(event);
    addDrawnItem(state.currentTool, state.drawingStart, end);
    state.drawingStart = null;
    computeDerivedData();
    render();
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
    const item = {
        id: Date.now(),
        kind: "electrical",
        x: point.x,
        y: point.y,
        width: GRID_SIZE,
        height: GRID_SIZE,
        name: preset?.name || "Novo ponto",
        type: preset?.category || "Tomada",
        power: preset?.power || 100,
        voltage: preset?.voltage || 127,
        height: preset?.height || "Baixa",
        circuit: "",
        showLegend: true,
        presetId: preset?.id || null,
        routeTo: null
    };
    state.currentProject.floorPlan.items.push(item);
    state.selectedId = item.id;
    fillInspector(item);
}

function findItemAt(point) {
    const items = [...state.currentProject.floorPlan.items].reverse();
    return items.find(item => {
        if (item.kind === "electrical") {
            return Math.abs(item.x - point.x) <= GRID_SIZE && Math.abs(item.y - point.y) <= GRID_SIZE;
        }
        return point.x >= item.x && point.x <= item.x + item.width && point.y >= item.y && point.y <= item.y + item.height;
    });
}

function getSelectedItem() {
    return state.currentProject.floorPlan.items.find(item => item.id === state.selectedId) || null;
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
    ctx.strokeStyle = item.kind === "door" ? "#bf5a36" : "#2d9b7c";
    ctx.lineWidth = 3;
    ctx.strokeRect(item.x, item.y, item.width, item.height);
    ctx.font = "14px Segoe UI";
    ctx.fillStyle = ctx.strokeStyle;
    ctx.fillText(item.kind === "door" ? "Porta" : "Janela", item.x + 6, item.y + 18);
}

function drawElectrical(item) {
    ctx.beginPath();
    ctx.arc(item.x, item.y, 10, 0, Math.PI * 2);
    ctx.fillStyle = item.id === state.selectedId ? "#bf5a36" : "#ffffff";
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#1e2a32";
    ctx.stroke();
    ctx.fillStyle = "#1e2a32";
    ctx.font = "13px Segoe UI";
    const label = item.showLegend ? `${item.name} (${item.power}W)` : item.name;
    ctx.fillText(label, item.x + 16, item.y - 10);
    ctx.fillText(item.circuit || "-", item.x + 16, item.y + 10);
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
        const key = point.type || "Geral";
        if (!groups[key]) groups[key] = [];
        groups[key].push(point);
    });

    return Object.entries(groups).map(([type, items], index) => {
        const totalPower = items.reduce((sum, item) => sum + (item.power || 0), 0);
        const voltage = items.some(item => Number(item.voltage) === 220) ? 220 : 127;
        const current = voltage ? totalPower / voltage : 0;
        const breaker = current <= 10 ? "10A" : current <= 20 ? "20A" : current <= 32 ? "32A" : "40A";
        const wire = current <= 10 ? "1,5 mm2" : current <= 20 ? "2,5 mm2" : "4 mm2";
        const label = `C${String(index + 1).padStart(2, "0")}`;
        items.forEach(item => {
            item.circuit = label;
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
