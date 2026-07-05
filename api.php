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
            ['id' => 1, 'name' => 'Tomada de uso geral', 'category' => 'Tomada', 'power' => 100, 'voltage' => 127, 'height' => 'Baixa', 'circuitType' => 'TUG'],
            ['id' => 2, 'name' => 'Chuveiro 4400W', 'category' => 'Chuveiro', 'power' => 4400, 'voltage' => 220, 'height' => 'Alta', 'circuitType' => 'Chuveiro'],
            ['id' => 3, 'name' => 'Micro-ondas 1200W', 'category' => 'Uso específico', 'power' => 1200, 'voltage' => 220, 'height' => 'Média', 'circuitType' => 'TUE'],
            ['id' => 4, 'name' => 'Máquina de lavar 1000W', 'category' => 'Uso específico', 'power' => 1000, 'voltage' => 127, 'height' => 'Baixa', 'circuitType' => 'TUE'],
            ['id' => 5, 'name' => 'Ar-condicionado 9000 BTU', 'category' => 'Climatização', 'power' => 1200, 'voltage' => 220, 'height' => 'Alta', 'circuitType' => 'Climatização'],
            ['id' => 6, 'name' => 'Ar-condicionado 12000 BTU', 'category' => 'Climatização', 'power' => 1450, 'voltage' => 220, 'height' => 'Alta', 'circuitType' => 'Climatização'],
            ['id' => 7, 'name' => 'Forno elétrico 3000W', 'category' => 'Uso específico', 'power' => 3000, 'voltage' => 220, 'height' => 'Média', 'circuitType' => 'TUE'],
            ['id' => 8, 'name' => 'Luminária LED', 'category' => 'Iluminação', 'power' => 18, 'voltage' => 127, 'height' => 'Teto', 'circuitType' => 'Iluminação'],
            ['id' => 9, 'name' => 'Geladeira 700W', 'category' => 'Uso específico', 'power' => 700, 'voltage' => 127, 'height' => 'Baixa', 'circuitType' => 'TUE'],
            ['id' => 10, 'name' => 'Torneira elétrica 5500W', 'category' => 'Uso específico', 'power' => 5500, 'voltage' => 220, 'height' => 'Média', 'circuitType' => 'TUE']
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
$action = $_GET['action'] ?? 'bootstrap';

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

http_response_code(404);
echo json_encode(['error' => 'Ação não encontrada'], JSON_UNESCAPED_UNICODE);
