<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

$storageDir = __DIR__ . '/storage';
$dbFile = $storageDir . '/database.json';

if (!is_dir($storageDir)) {
    mkdir($storageDir, 0777, true);
}

if (!file_exists($dbFile)) {
    $seed = [
        'users' => [
            ['id' => 1, 'name' => 'Administrador', 'email' => 'admin@projetoeletrico.local']
        ],
        'utilities' => [
            ['id' => 1, 'name' => 'Neoenergia', 'voltage_level' => '127/220V'],
            ['id' => 2, 'name' => 'Enel', 'voltage_level' => '127/220V'],
            ['id' => 3, 'name' => 'Equatorial', 'voltage_level' => '220/380V']
        ],
        'environments' => [
            ['id' => 1, 'name' => 'Sala'],
            ['id' => 2, 'name' => 'Quarto'],
            ['id' => 3, 'name' => 'Cozinha'],
            ['id' => 4, 'name' => 'Banheiro']
        ],
        'materials' => [
            ['id' => 1, 'name' => 'Cabo 1,5 mm2', 'unit' => 'm', 'price' => 2.80],
            ['id' => 2, 'name' => 'Cabo 2,5 mm2', 'unit' => 'm', 'price' => 4.60],
            ['id' => 3, 'name' => 'Disjuntor 10A', 'unit' => 'un', 'price' => 18.50],
            ['id' => 4, 'name' => 'Disjuntor 20A', 'unit' => 'un', 'price' => 22.00],
            ['id' => 5, 'name' => 'Tomada 2P+T', 'unit' => 'un', 'price' => 14.90],
            ['id' => 6, 'name' => 'Interruptor simples', 'unit' => 'un', 'price' => 12.90],
            ['id' => 7, 'name' => 'Luminária', 'unit' => 'un', 'price' => 39.90],
            ['id' => 8, 'name' => 'Quadro de distribuição', 'unit' => 'un', 'price' => 180.00]
        ],
        'equipment_presets' => [
            ['id' => 1, 'name' => 'Tomada de uso geral', 'category' => 'Tomada', 'power' => 100, 'voltage' => 127, 'height' => 'Baixa', 'circuitType' => 'TUG', 'symbol' => 'outlet'],
            ['id' => 2, 'name' => 'Chuveiro 4400W', 'category' => 'Chuveiro', 'power' => 4400, 'voltage' => 220, 'height' => 'Alta', 'circuitType' => 'TUE', 'symbol' => 'shower'],
            ['id' => 3, 'name' => 'Micro-ondas 1200W', 'category' => 'Uso específico', 'power' => 1200, 'voltage' => 220, 'height' => 'Média', 'circuitType' => 'TUE', 'symbol' => 'specific-outlet'],
            ['id' => 4, 'name' => 'Máquina de lavar 1000W', 'category' => 'Uso específico', 'power' => 1000, 'voltage' => 127, 'height' => 'Baixa', 'circuitType' => 'TUE', 'symbol' => 'specific-outlet'],
            ['id' => 5, 'name' => 'Ar-condicionado 9000 BTU', 'category' => 'Climatização', 'power' => 1200, 'voltage' => 220, 'height' => 'Alta', 'circuitType' => 'TUE', 'symbol' => 'ac'],
            ['id' => 6, 'name' => 'Ar-condicionado 12000 BTU', 'category' => 'Climatização', 'power' => 1450, 'voltage' => 220, 'height' => 'Alta', 'circuitType' => 'TUE', 'symbol' => 'ac'],
            ['id' => 7, 'name' => 'Forno elétrico 3000W', 'category' => 'Uso específico', 'power' => 3000, 'voltage' => 220, 'height' => 'Média', 'circuitType' => 'TUE', 'symbol' => 'specific-outlet'],
            ['id' => 8, 'name' => 'Ponto de luz', 'category' => 'Iluminação', 'power' => 100, 'voltage' => 127, 'height' => 'Teto', 'circuitType' => 'Iluminação', 'symbol' => 'light'],
            ['id' => 9, 'name' => 'Geladeira 700W', 'category' => 'Uso específico', 'power' => 700, 'voltage' => 127, 'height' => 'Baixa', 'circuitType' => 'TUE', 'symbol' => 'specific-outlet'],
            ['id' => 10, 'name' => 'Torneira elétrica 5500W', 'category' => 'Uso específico', 'power' => 5500, 'voltage' => 220, 'height' => 'Média', 'circuitType' => 'TUE', 'symbol' => 'shower']
        ],
        'projects' => [
            [
                'id' => 1,
                'user_id' => 1,
                'utility_id' => 1,
                'name' => 'Projeto modelo',
                'floorPlan' => [
                    'zoom' => 1,
                    'offsetX' => 40,
                    'offsetY' => 40,
                    'items' => []
                ]
            ]
        ]
    ];

    file_put_contents($dbFile, json_encode($seed, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
}

$db = json_decode((string) file_get_contents($dbFile), true);
$technicalPresets = [
    ['name' => 'Ponto de luz incandescente no teto', 'category' => 'Iluminação', 'power' => 100, 'voltage' => 127, 'height' => 'Teto', 'circuitType' => 'Iluminação', 'symbol' => 'light-ceiling'],
    ['name' => 'Ponto de luz incandescente na parede', 'category' => 'Iluminação', 'power' => 100, 'voltage' => 127, 'height' => 'Média', 'circuitType' => 'Iluminação', 'symbol' => 'light-wall'],
    ['name' => 'Ponto de luz não embutido', 'category' => 'Iluminação', 'power' => 100, 'voltage' => 127, 'height' => 'Teto', 'circuitType' => 'Iluminação', 'symbol' => 'light-not-embedded'],
    ['name' => 'Ponto de luz embutido', 'category' => 'Iluminação', 'power' => 100, 'voltage' => 127, 'height' => 'Teto', 'circuitType' => 'Iluminação', 'symbol' => 'light-embedded'],
    ['name' => 'Ponto de luz fluorescente não embutido', 'category' => 'Iluminação', 'power' => 100, 'voltage' => 127, 'height' => 'Teto', 'circuitType' => 'Iluminação', 'symbol' => 'fluorescent-not-embedded'],
    ['name' => 'Ponto de luz fluorescente embutido', 'category' => 'Iluminação', 'power' => 100, 'voltage' => 127, 'height' => 'Teto', 'circuitType' => 'Iluminação', 'symbol' => 'fluorescent-embedded'],
    ['name' => 'Circuito que sobe', 'category' => 'Condutor', 'power' => 0, 'voltage' => 127, 'height' => 'Média', 'circuitType' => 'Infraestrutura', 'symbol' => 'circuit-up'],
    ['name' => 'Circuito que desce', 'category' => 'Condutor', 'power' => 0, 'voltage' => 127, 'height' => 'Média', 'circuitType' => 'Infraestrutura', 'symbol' => 'circuit-down'],
    ['name' => 'Circuito que passa', 'category' => 'Condutor', 'power' => 0, 'voltage' => 127, 'height' => 'Média', 'circuitType' => 'Infraestrutura', 'symbol' => 'circuit-pass'],
    ['name' => 'Interruptor de 1 seção', 'category' => 'Interruptor', 'power' => 0, 'voltage' => 127, 'height' => 'Média', 'circuitType' => 'Comando', 'symbol' => 'switch-1'],
    ['name' => 'Tomada de luz baixa', 'category' => 'Tomada', 'power' => 100, 'voltage' => 127, 'height' => 'Baixa', 'circuitType' => 'TUG', 'symbol' => 'outlet-light-low'],
    ['name' => 'Tomada de luz média alta', 'category' => 'Tomada', 'power' => 100, 'voltage' => 127, 'height' => 'Média', 'circuitType' => 'TUG', 'symbol' => 'outlet-light-medium'],
    ['name' => 'Tomada de luz alta', 'category' => 'Tomada', 'power' => 100, 'voltage' => 127, 'height' => 'Alta', 'circuitType' => 'TUG', 'symbol' => 'outlet-light-high'],
    ['name' => 'Tomada de luz no piso', 'category' => 'Tomada', 'power' => 100, 'voltage' => 127, 'height' => 'Piso', 'circuitType' => 'TUG', 'symbol' => 'light-outlet-floor'],
    ['name' => 'Tomada de luz no teto', 'category' => 'Tomada', 'power' => 100, 'voltage' => 127, 'height' => 'Teto', 'circuitType' => 'TUG', 'symbol' => 'light-outlet-ceiling'],
    ['name' => 'Tomada de força na parede', 'category' => 'Tomada de força', 'power' => 600, 'voltage' => 127, 'height' => 'Média', 'circuitType' => 'TUG', 'symbol' => 'power-outlet-wall'],
    ['name' => 'Tomada de força no piso', 'category' => 'Tomada de força', 'power' => 600, 'voltage' => 127, 'height' => 'Piso', 'circuitType' => 'TUG', 'symbol' => 'power-outlet-floor'],
    ['name' => 'Tomada de força no teto', 'category' => 'Tomada de força', 'power' => 600, 'voltage' => 127, 'height' => 'Teto', 'circuitType' => 'TUG', 'symbol' => 'power-outlet-ceiling'],
    ['name' => 'Tomada para rádio e TV', 'category' => 'Comunicação', 'power' => 0, 'voltage' => 127, 'height' => 'Média', 'circuitType' => 'Comunicação', 'symbol' => 'radio-tv'],
    ['name' => 'Caixa de passagem', 'category' => 'Caixa', 'power' => 0, 'voltage' => 127, 'height' => 'Média', 'circuitType' => 'Infraestrutura', 'symbol' => 'passage-box'],
    ['name' => 'Quadro parcial de luz ou força', 'category' => 'Quadro', 'power' => 0, 'voltage' => 220, 'height' => 'Média', 'circuitType' => 'Quadro', 'symbol' => 'partial-board'],
    ['name' => 'Quadro geral de luz ou força não embutido', 'category' => 'Quadro', 'power' => 0, 'voltage' => 220, 'height' => 'Média', 'circuitType' => 'Quadro', 'symbol' => 'main-board-not-embedded'],
    ['name' => 'Quadro geral de luz ou força embutido', 'category' => 'Quadro', 'power' => 0, 'voltage' => 220, 'height' => 'Média', 'circuitType' => 'Quadro', 'symbol' => 'main-board-embedded'],
    ['name' => 'Caixa de telefone', 'category' => 'Comunicação', 'power' => 0, 'voltage' => 127, 'height' => 'Média', 'circuitType' => 'Comunicação', 'symbol' => 'phone-box'],
    ['name' => 'Eletroduto no teto ou na parede', 'category' => 'Eletroduto', 'power' => 0, 'voltage' => 127, 'height' => 'Teto', 'circuitType' => 'Infraestrutura', 'symbol' => 'conduit-ceiling-wall'],
    ['name' => 'Eletroduto no piso', 'category' => 'Eletroduto', 'power' => 0, 'voltage' => 127, 'height' => 'Piso', 'circuitType' => 'Infraestrutura', 'symbol' => 'conduit-floor'],
    ['name' => 'Tubulação para telefone externo', 'category' => 'Comunicação', 'power' => 0, 'voltage' => 127, 'height' => 'Média', 'circuitType' => 'Comunicação', 'symbol' => 'phone-tube-external'],
    ['name' => 'Tubulação para telefone interno', 'category' => 'Comunicação', 'power' => 0, 'voltage' => 127, 'height' => 'Média', 'circuitType' => 'Comunicação', 'symbol' => 'phone-tube-internal'],
    ['name' => 'Condutores de fase, neutro, retorno e terra em eletroduto', 'category' => 'Condutor', 'power' => 0, 'voltage' => 127, 'height' => 'Média', 'circuitType' => 'Infraestrutura', 'symbol' => 'conductors-fnt'],
    ['name' => 'Botão de minuteria', 'category' => 'Comando', 'power' => 0, 'voltage' => 127, 'height' => 'Média', 'circuitType' => 'Comando', 'symbol' => 'minute-button'],
    ['name' => 'Minuteria', 'category' => 'Comando', 'power' => 0, 'voltage' => 127, 'height' => 'Média', 'circuitType' => 'Comando', 'symbol' => 'minute-timer'],
    ['name' => 'Ligação à terra', 'category' => 'Aterramento', 'power' => 0, 'voltage' => 127, 'height' => 'Baixa', 'circuitType' => 'Aterramento', 'symbol' => 'ground'],
];

$existingSymbols = array_column($db['equipment_presets'] ?? [], 'symbol');
$nextEquipmentId = count($db['equipment_presets'] ?? []) ? (max(array_column($db['equipment_presets'], 'id')) + 1) : 1;
foreach ($technicalPresets as $preset) {
    if (in_array($preset['symbol'], $existingSymbols, true)) {
        continue;
    }
    $preset['id'] = $nextEquipmentId++;
    $db['equipment_presets'][] = $preset;
    $existingSymbols[] = $preset['symbol'];
}
file_put_contents($dbFile, json_encode($db, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
$action = $_GET['action'] ?? 'bootstrap';

if ($action === 'downloadReportPdf' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $payload = json_decode((string) file_get_contents('php://input'), true);
    if (!is_array($payload)) {
        http_response_code(422);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['error' => 'Payload inválido'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $utility = null;
    $utilityId = (int) ($payload['utility_id'] ?? 0);
    foreach ($db['utilities'] as $candidate) {
        if ((int) $candidate['id'] === $utilityId) {
            $utility = $candidate;
            break;
        }
    }

    $projectName = (string) ($payload['name'] ?? 'Projeto');
    $items = $payload['floorPlan']['items'] ?? [];
    $circuits = buildCircuitsPdf($items);
    $materials = buildMaterialsPdf($circuits, $items);

    $lines = [];
    $lines[] = 'Concessionaria: ' . ($utility['name'] ?? '-');
    $lines[] = 'Tensao: ' . ($utility['voltage_level'] ?? '-');
    $lines[] = '';
    $lines[] = 'Quadro de distribuicao';
    foreach ($circuits as $circuit) {
        $lines[] = sprintf('%s | %s | %sW | %s', $circuit['label'], $circuit['type'], $circuit['totalPower'], $circuit['breaker']);
    }
    $lines[] = '';
    $lines[] = 'Lista de materiais';
    foreach ($materials as $material) {
        $lines[] = sprintf('%s | %s %s | R$ %.2f', $material['description'], $material['quantity'], $material['unit'], $material['subtotal']);
    }

    $pdf = buildSimplePdf($projectName, $lines);
    $safeName = preg_replace('/[^A-Za-z0-9_-]+/', '_', $projectName) ?: 'projeto';
    header('Content-Type: application/pdf');
    header('Content-Disposition: attachment; filename="' . $safeName . '.pdf"');
    header('Content-Length: ' . strlen($pdf));
    echo $pdf;
    exit;
}

if ($action === 'bootstrap') {
    echo json_encode($db, JSON_UNESCAPED_UNICODE);
    exit;
}

if ($action === 'saveProject' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $payload = json_decode((string) file_get_contents('php://input'), true);
    if (!is_array($payload)) {
        http_response_code(422);
        echo json_encode(['error' => 'Payload inválido']);
        exit;
    }

    $projectId = (int) ($payload['id'] ?? 0);
    $found = false;
    foreach ($db['projects'] as &$project) {
        if ((int) $project['id'] === $projectId) {
            $project = $payload;
            $found = true;
            break;
        }
    }
    unset($project);

    if (!$found) {
        $payload['id'] = count($db['projects']) ? (max(array_column($db['projects'], 'id')) + 1) : 1;
        $db['projects'][] = $payload;
    }

    file_put_contents($dbFile, json_encode($db, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    echo json_encode(['success' => true, 'project' => $payload], JSON_UNESCAPED_UNICODE);
    exit;
}

if ($action === 'saveCatalog' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $payload = json_decode((string) file_get_contents('php://input'), true);
    if (!is_array($payload)) {
        http_response_code(422);
        echo json_encode(['error' => 'Payload invÃ¡lido']);
        exit;
    }

    if (isset($payload['materials']) && is_array($payload['materials'])) {
        $db['materials'] = array_values($payload['materials']);
    }

    if (isset($payload['equipment_presets']) && is_array($payload['equipment_presets'])) {
        $db['equipment_presets'] = array_values($payload['equipment_presets']);
    }

    file_put_contents($dbFile, json_encode($db, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    echo json_encode([
        'success' => true,
        'materials' => $db['materials'],
        'equipment_presets' => $db['equipment_presets']
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

http_response_code(404);
echo json_encode(['error' => 'Ação não encontrada'], JSON_UNESCAPED_UNICODE);
