<?php
declare(strict_types=1);

$storageDir = __DIR__ . '/storage';
$dbFile = $storageDir . '/database.json';

header('X-Content-Type-Options: nosniff');

if (!file_exists($dbFile)) {
    http_response_code(500);
    header('Content-Type: text/plain; charset=utf-8');
    echo 'Banco de dados nao encontrado.';
    exit;
}

$db = json_decode((string) file_get_contents($dbFile), true);
$payload = json_decode((string) file_get_contents('php://input'), true);

if (!is_array($db) || !is_array($payload)) {
    http_response_code(422);
    header('Content-Type: text/plain; charset=utf-8');
    echo 'Payload invalido.';
    exit;
}

$projectName = trim((string) ($payload['name'] ?? 'Projeto eletrico')) ?: 'Projeto eletrico';
$items = is_array($payload['floorPlan']['items'] ?? null) ? $payload['floorPlan']['items'] : [];
$drawingImage = parseDataUrlImage((string) ($payload['drawingImage'] ?? ''));

$utility = findById($db['utilities'] ?? [], (int) ($payload['utility_id'] ?? 0));
$user = findById($db['users'] ?? [], (int) ($payload['user_id'] ?? 0));
$laborCost = (float) ($payload['laborCost'] ?? 0);

$circuits = buildCircuitsReport($items);
$equipmentQuote = buildEquipmentQuote($items, $db['equipment_presets'] ?? [], $db['materials'] ?? []);
$materialsQuote = buildMaterialsQuote($circuits, $items, $db['materials'] ?? []);
$summary = buildProjectSummary($items, $circuits, $equipmentQuote, $materialsQuote, $laborCost);

$report = [
    'projectName' => $projectName,
    'generatedAt' => date('d/m/Y H:i'),
    'userName' => (string) ($user['name'] ?? 'Nao informado'),
    'utilityName' => (string) ($utility['name'] ?? 'Nao informada'),
    'voltage' => (string) ($utility['voltage_level'] ?? '-'),
    'laborCost' => $laborCost,
    'circuits' => $circuits,
    'equipmentQuote' => $equipmentQuote,
    'materialsQuote' => $materialsQuote,
    'summary' => $summary,
];

$pdf = buildStyledPdf($report, $drawingImage);
$safeName = preg_replace('/[^A-Za-z0-9_-]+/', '_', $projectName) ?: 'projeto_eletrico';

header('Content-Type: application/pdf');
header('Content-Disposition: attachment; filename="' . $safeName . '.pdf"');
header('Content-Length: ' . strlen($pdf));
echo $pdf;

function findById(array $items, int $id): ?array
{
    foreach ($items as $item) {
        if ((int) ($item['id'] ?? 0) === $id) {
            return $item;
        }
    }

    return null;
}

function buildProjectSummary(array $items, array $circuits, array $equipmentQuote, array $materialsQuote, float $laborCost): array
{
    $electrical = array_values(array_filter($items, static fn(array $item): bool => ($item['kind'] ?? '') === 'electrical'));
    $rooms = count(array_filter($items, static fn(array $item): bool => ($item['kind'] ?? '') === 'room'));
    $walls = count(array_filter($items, static fn(array $item): bool => ($item['kind'] ?? '') === 'wall'));
    $doors = count(array_filter($items, static fn(array $item): bool => ($item['kind'] ?? '') === 'door'));
    $windows = count(array_filter($items, static fn(array $item): bool => ($item['kind'] ?? '') === 'window'));
    $totalLoad = array_sum(array_map(static fn(array $item): int => (int) ($item['power'] ?? 0), $electrical));
    $equipmentTotal = array_sum(array_map(static fn(array $row): float => (float) ($row['subtotal'] ?? 0), $equipmentQuote));
    $materialsTotal = array_sum(array_map(static fn(array $row): float => (float) ($row['subtotal'] ?? 0), $materialsQuote));

    return [
        'rooms' => $rooms,
        'walls' => $walls,
        'doors' => $doors,
        'windows' => $windows,
        'electricalPoints' => count($electrical),
        'circuits' => count($circuits),
        'totalLoad' => $totalLoad,
        'equipmentTotal' => $equipmentTotal,
        'materialsTotal' => $materialsTotal,
        'laborTotal' => $laborCost,
        'grandTotal' => $equipmentTotal + $materialsTotal + $laborCost,
    ];
}

function buildCircuitsReport(array $items): array
{
    $circuits = [];

    foreach ($items as $item) {
        if (($item['kind'] ?? '') !== 'electrical') {
            continue;
        }

        $label = trim((string) ($item['circuit'] ?? ''));
        if ($label === '') {
            continue;
        }

        if (!isset($circuits[$label])) {
            $circuits[$label] = [
                'label' => $label,
                'type' => (string) ($item['type'] ?? 'Circuito'),
                'voltage' => (int) ($item['voltage'] ?? 127),
                'points' => 0,
                'totalPower' => 0,
                'breaker' => '10A',
                'wire' => '1,5 mm2',
            ];
        }

        $circuits[$label]['points']++;
        $circuits[$label]['totalPower'] += (int) ($item['power'] ?? 0);
        $circuits[$label]['breaker'] = selectBreaker((int) $circuits[$label]['totalPower'], (int) $circuits[$label]['voltage']);
        $circuits[$label]['wire'] = selectWireGauge((string) $circuits[$label]['type'], (int) $circuits[$label]['totalPower']);
    }

    ksort($circuits, SORT_NATURAL);
    return array_values($circuits);
}

function selectBreaker(int $power, int $voltage): string
{
    $current = $power / max(127, $voltage);
    if ($current <= 10) {
        return '10A';
    }
    if ($current <= 16) {
        return '16A';
    }
    if ($current <= 20) {
        return '20A';
    }
    if ($current <= 32) {
        return '32A';
    }
    return '40A';
}

function selectWireGauge(string $type, int $power): string
{
    $normalized = mb_strtolower(removeAccents($type));
    if (containsText($normalized, 'iluminacao') || containsText($normalized, 'luminaria')) {
        return '1,5 mm2';
    }
    if ($power >= 5000) {
        return '6,0 mm2';
    }
    if ($power >= 2200) {
        return '4,0 mm2';
    }
    return '2,5 mm2';
}

function buildEquipmentQuote(array $items, array $equipmentPresets, array $materialsCatalog): array
{
    $presetById = [];
    $presetByName = [];
    foreach ($equipmentPresets as $preset) {
        $presetById[(int) ($preset['id'] ?? 0)] = $preset;
        $presetByName[mb_strtolower((string) ($preset['name'] ?? ''))] = $preset;
    }

    $grouped = [];
    foreach ($items as $item) {
        if (($item['kind'] ?? '') !== 'electrical') {
            continue;
        }

        $description = trim((string) ($item['name'] ?? 'Elemento eletrico')) ?: 'Elemento eletrico';
        $unitPrice = resolveElectricalUnitPrice($item, $presetById, $presetByName, $materialsCatalog);
        $key = mb_strtolower($description) . '|' . number_format($unitPrice, 2, '.', '');

        if (!isset($grouped[$key])) {
            $grouped[$key] = [
                'description' => $description,
                'quantity' => 0,
                'unit' => 'un',
                'unitPrice' => $unitPrice,
                'subtotal' => 0.0,
            ];
        }

        $grouped[$key]['quantity']++;
        $grouped[$key]['subtotal'] = $grouped[$key]['quantity'] * $grouped[$key]['unitPrice'];
    }

    usort($grouped, static fn(array $a, array $b): int => strcmp($a['description'], $b['description']));
    return array_values($grouped);
}

function resolveElectricalUnitPrice(array $item, array $presetById, array $presetByName, array $materialsCatalog): float
{
    $presetId = (int) ($item['presetId'] ?? 0);
    if ($presetId > 0 && isset($presetById[$presetId]) && isset($presetById[$presetId]['price'])) {
        return (float) $presetById[$presetId]['price'];
    }

    $nameKey = mb_strtolower(trim((string) ($item['name'] ?? '')));
    if ($nameKey !== '' && isset($presetByName[$nameKey]) && isset($presetByName[$nameKey]['price'])) {
        return (float) $presetByName[$nameKey]['price'];
    }

    $symbol = (string) ($item['symbol'] ?? '');
    if ($symbol === 'light') {
        return catalogPrice($materialsCatalog, 'Luminária', 39.90);
    }
    if (containsText($symbol, 'outlet') || ($item['type'] ?? '') === 'Tomada') {
        return catalogPrice($materialsCatalog, 'Tomada 2P+T', 14.90);
    }
    if ($symbol === 'switch' || $symbol === 'switch-wall' || $symbol === 'switch-1') {
        return catalogPrice($materialsCatalog, 'Interruptor simples', 12.90);
    }
    if ($symbol === 'distribution-board') {
        return catalogPrice($materialsCatalog, 'Quadro de distribuição', 180.00);
    }

    return 0.0;
}

function buildMaterialsQuote(array $circuits, array $items, array $materialsCatalog): array
{
    $rows = [];

    foreach ($circuits as $circuit) {
        $breakerName = 'Disjuntor ' . $circuit['breaker'];
        $rows[] = buildBudgetRow(
            $breakerName,
            1,
            'un',
            catalogPrice($materialsCatalog, $breakerName, defaultBreakerPrice($circuit['breaker']))
        );

        $wireName = wireMaterialName($circuit['wire']);
        $wireLength = max(12, (int) $circuit['points'] * 4);
        $rows[] = buildBudgetRow(
            $wireName,
            $wireLength,
            'm',
            catalogPrice($materialsCatalog, $wireName, defaultWirePrice($circuit['wire']))
        );
    }

    if (count($circuits) > 0) {
        $rows[] = buildBudgetRow(
            'Quadro de distribuição',
            1,
            'un',
            catalogPrice($materialsCatalog, 'Quadro de distribuição', 180.00)
        );
    }

    return consolidateBudgetRows($rows);
}

function buildBudgetRow(string $description, int $quantity, string $unit, float $unitPrice): array
{
    return [
        'description' => $description,
        'quantity' => $quantity,
        'unit' => $unit,
        'unitPrice' => $unitPrice,
        'subtotal' => $quantity * $unitPrice,
    ];
}

function consolidateBudgetRows(array $rows): array
{
    $grouped = [];
    foreach ($rows as $row) {
        $key = mb_strtolower($row['description']) . '|' . $row['unit'];
        if (!isset($grouped[$key])) {
            $grouped[$key] = $row;
            continue;
        }

        $grouped[$key]['quantity'] += $row['quantity'];
        $grouped[$key]['subtotal'] = $grouped[$key]['quantity'] * $grouped[$key]['unitPrice'];
    }

    usort($grouped, static fn(array $a, array $b): int => strcmp($a['description'], $b['description']));
    return array_values($grouped);
}

function catalogPrice(array $catalog, string $name, float $fallback): float
{
    $normalizedName = mb_strtolower(removeAccents($name));
    foreach ($catalog as $item) {
        $candidate = mb_strtolower(removeAccents((string) ($item['name'] ?? '')));
        if ($candidate === $normalizedName && isset($item['price'])) {
            return (float) $item['price'];
        }
    }

    return $fallback;
}

function defaultBreakerPrice(string $breaker): float
{
    if ($breaker === '40A') {
        return 22.00;
    }
    if ($breaker === '32A') {
        return 20.00;
    }
    if ($breaker === '20A') {
        return 22.00;
    }
    if ($breaker === '16A') {
        return 19.50;
    }
    return 18.50;
}

function defaultWirePrice(string $wire): float
{
    if ($wire === '6,0 mm2') {
        return 9.80;
    }
    if ($wire === '4,0 mm2') {
        return 6.40;
    }
    if ($wire === '2,5 mm2') {
        return 4.60;
    }
    return 2.80;
}

function wireMaterialName(string $wire): string
{
    if ($wire === '6,0 mm2') {
        return 'Cabo 6,0 mm2';
    }
    if ($wire === '4,0 mm2') {
        return 'Cabo 4,0 mm2';
    }
    if ($wire === '2,5 mm2') {
        return 'Cabo 2,5 mm2';
    }
    return 'Cabo 1,5 mm2';
}

function buildStyledPdf(array $report, ?array $drawingImage): string
{
    $pages = [];
    $pages[] = [
        'title' => 'Relatorio tecnico',
        'subtitle' => 'Visao geral do projeto',
        'body' => renderCoverBody($report),
        'image' => false,
    ];

    if ($drawingImage !== null) {
        $pages[] = [
            'title' => 'Planta eletrica',
            'subtitle' => 'Area de desenho exportada',
            'body' => renderDrawingBody($drawingImage),
            'image' => true,
        ];
    }

    foreach (renderCircuitPages($report['circuits']) as $page) {
        $pages[] = $page;
    }

    foreach (renderBudgetPages('Elementos utilizados', 'Itens eletricos aplicados na planta', $report['equipmentQuote']) as $page) {
        $pages[] = $page;
    }

    foreach (renderBudgetPages('Materiais e orcamento', 'Cotacao preliminar de insumos e componentes', $report['materialsQuote'], true, $report['summary']['grandTotal'], $report['summary']['laborTotal'] ?? 0) as $page) {
        $pages[] = $page;
    }

    return buildPdfDocument($pages, $drawingImage, $report['generatedAt']);
}

function renderCoverBody(array $report): string
{
    $ops = [];
    $ops[] = pdfRect(38, 620, 519, 150, '#f6efe7', '#e5d4c6', 1);
    $ops[] = pdfText(54, 734, 'Projeto', 11, 'F1', '#8a6d57');
    $ops[] = pdfText(54, 706, $report['projectName'], 22, 'F2', '#173042');
    $ops[] = pdfText(54, 674, 'Responsavel: ' . $report['userName'], 11, 'F1', '#1f2b33');
    $ops[] = pdfText(54, 654, 'Concessionaria: ' . $report['utilityName'], 11, 'F1', '#1f2b33');
    $ops[] = pdfText(54, 634, 'Tensao padrao: ' . $report['voltage'], 11, 'F1', '#1f2b33');
    $ops[] = pdfText(54, 614, 'Mao de obra: ' . moneyBr((float) ($report['summary']['laborTotal'] ?? 0)), 11, 'F1', '#1f2b33');
    $ops[] = pdfText(54, 594, 'Gerado em: ' . $report['generatedAt'], 11, 'F1', '#1f2b33');

    $cards = [
        ['Ambientes', (string) $report['summary']['rooms']],
        ['Pontos eletricos', (string) $report['summary']['electricalPoints']],
        ['Circuitos', (string) $report['summary']['circuits']],
        ['Carga total', $report['summary']['totalLoad'] . ' W'],
    ];

    $x = 38;
    foreach ($cards as [$label, $value]) {
        $ops[] = pdfRect($x, 520, 120, 76, '#ffffff', '#d8c7b9', 1);
        $ops[] = pdfText($x + 14, 570, $label, 10, 'F1', '#7f6a5c');
        $ops[] = pdfText($x + 14, 544, $value, 18, 'F2', '#173042');
        $x += 132;
    }

    $ops[] = pdfRect(38, 418, 519, 76, '#173042', '#173042', 1);
    $ops[] = pdfText(54, 464, 'Orcamento preliminar consolidado', 12, 'F1', '#ffffff');
    $ops[] = pdfText(54, 448, 'Equipamentos: ' . moneyBr((float) ($report['summary']['equipmentTotal'] ?? 0)), 10, 'F1', '#d9e5ef');
    $ops[] = pdfText(220, 448, 'Materiais: ' . moneyBr((float) ($report['summary']['materialsTotal'] ?? 0)), 10, 'F1', '#d9e5ef');
    $ops[] = pdfText(390, 448, 'Mao de obra: ' . moneyBr((float) ($report['summary']['laborTotal'] ?? 0)), 10, 'F1', '#d9e5ef');
    $ops[] = pdfText(54, 434, moneyBr($report['summary']['grandTotal']), 24, 'F2', '#f7c873');

    $ops[] = pdfText(38, 376, 'Escopo do relatorio', 14, 'F2', '#173042');
    foreach (wrapText(
        'Este documento consolida a planta eletrica exportada, o quadro de circuitos, os elementos aplicados no desenho e uma cotacao preliminar baseada nos precos cadastrados no sistema.',
        92
    ) as $index => $line) {
        $ops[] = pdfText(38, 348 - ($index * 18), $line, 11, 'F1', '#32434f');
    }

    return implode("\n", $ops);
}

function renderDrawingBody(array $drawingImage): string
{
    $frameX = 38;
    $frameY = 92;
    $frameWidth = 519;
    $frameHeight = 648;
    $placement = fitImageIntoFrame($drawingImage['width'], $drawingImage['height'], $frameWidth - 28, $frameHeight - 42, $frameX + 14, $frameY + 14);

    $ops = [];
    $ops[] = pdfRect($frameX, $frameY, $frameWidth, $frameHeight, '#ffffff', '#d3dbe3', 1);
    $ops[] = pdfText($frameX + 16, $frameY + $frameHeight - 22, 'Prancha da planta eletrica', 12, 'F2', '#173042');
    $ops[] = "q\n" . sprintf('%.2F 0 0 %.2F %.2F %.2F cm', $placement['width'], $placement['height'], $placement['x'], $placement['y']) . "\n/Im1 Do\nQ";
    return implode("\n", $ops);
}

function renderCircuitPages(array $circuits): array
{
    $rows = [];
    foreach ($circuits as $circuit) {
        $rows[] = [
            'circuit' => 'Circuito ' . $circuit['label'],
            'type' => (string) $circuit['type'],
            'load' => $circuit['totalPower'] . ' W',
            'breaker' => $circuit['breaker'],
            'wire' => $circuit['wire'],
        ];
    }

    return renderTablePages(
        'Quadro de circuitos',
        'Distribuicao eletrica calculada a partir dos pontos da planta',
        [
            ['label' => 'Circuito', 'key' => 'circuit', 'width' => 110, 'align' => 'left'],
            ['label' => 'Tipo', 'key' => 'type', 'width' => 150, 'align' => 'left'],
            ['label' => 'Carga', 'key' => 'load', 'width' => 90, 'align' => 'right'],
            ['label' => 'Disjuntor', 'key' => 'breaker', 'width' => 78, 'align' => 'center'],
            ['label' => 'Condutor', 'key' => 'wire', 'width' => 75, 'align' => 'center'],
        ],
        $rows
    );
}

function renderBudgetPages(string $title, string $subtitle, array $rows, bool $includeGrandTotal = false, float $grandTotal = 0.0, float $laborCost = 0.0): array
{
    $preparedRows = [];
    foreach ($rows as $row) {
        $preparedRows[] = [
            'description' => (string) ($row['description'] ?? '-'),
            'quantity' => (string) ($row['quantity'] ?? 0),
            'unit' => (string) ($row['unit'] ?? 'un'),
            'unitPrice' => moneyBr((float) ($row['unitPrice'] ?? 0)),
            'subtotal' => moneyBr((float) ($row['subtotal'] ?? 0)),
        ];
    }

    $pages = renderTablePages(
        $title,
        $subtitle,
        [
            ['label' => 'Descricao', 'key' => 'description', 'width' => 225, 'align' => 'left'],
            ['label' => 'Qtd.', 'key' => 'quantity', 'width' => 46, 'align' => 'right'],
            ['label' => 'Un.', 'key' => 'unit', 'width' => 46, 'align' => 'center'],
            ['label' => 'Unitario', 'key' => 'unitPrice', 'width' => 92, 'align' => 'right'],
            ['label' => 'Subtotal', 'key' => 'subtotal', 'width' => 92, 'align' => 'right'],
        ],
        $preparedRows
    );

    if ($includeGrandTotal && $pages) {
        $last = array_key_last($pages);
        if ($laborCost > 0) {
            $pages[$last]['body'] .= "\n" . pdfRect(355, 136, 190, 28, '#f3f6f9', '#d5dde5', 1);
            $pages[$last]['body'] .= "\n" . pdfText(368, 153, 'Mao de obra: ' . moneyBr($laborCost), 10, 'F1', '#173042');
        }
        $pages[$last]['body'] .= "\n" . pdfRect(355, 96, 190, 36, '#173042', '#173042', 1);
        $pages[$last]['body'] .= "\n" . pdfText(368, 118, 'Total geral: ' . moneyBr($grandTotal), 13, 'F2', '#ffffff');
    }

    return $pages;
}

function renderTablePages(string $title, string $subtitle, array $columns, array $rows): array
{
    $pages = [];
    $page = ['title' => $title, 'subtitle' => $subtitle, 'body' => '', 'image' => false];
    $y = 730;
    $rowIndex = 0;

    $drawHeader = static function(array $columns, float $y): string {
        $ops = [];
        $ops[] = pdfRect(38, $y - 8, 519, 24, '#e9eef3', '#d7dfe7', 1);
        $x = 48;
        foreach ($columns as $column) {
            $ops[] = pdfText($x, $y + 6, (string) $column['label'], 10, 'F2', '#173042');
            $x += (float) $column['width'];
        }
        return implode("\n", $ops);
    };

    $page['body'] .= $drawHeader($columns, $y);
    $y -= 28;

    foreach ($rows as $row) {
        $wrapped = [];
        $lineCount = 1;
        foreach ($columns as $column) {
            $maxChars = max(8, (int) floor(((float) $column['width']) / 5.8));
            $wrapped[$column['key']] = wrapText((string) ($row[$column['key']] ?? ''), $maxChars);
            $lineCount = max($lineCount, count($wrapped[$column['key']]));
        }

        $rowHeight = max(22, $lineCount * 15 + 8);
        if ($y - $rowHeight < 86) {
            $pages[] = $page;
            $page = ['title' => $title, 'subtitle' => $subtitle . ' (continua)', 'body' => '', 'image' => false];
            $y = 730;
            $page['body'] .= $drawHeader($columns, $y);
            $y -= 28;
        }

        $background = $rowIndex % 2 === 0 ? '#ffffff' : '#f8fbfd';
        $page['body'] .= "\n" . pdfRect(38, $y - $rowHeight + 6, 519, $rowHeight, $background, '#edf1f4', 0.6);

        $x = 48;
        foreach ($columns as $column) {
            $lines = $wrapped[$column['key']];
            foreach ($lines as $lineIndex => $line) {
                $textY = $y - ($lineIndex * 15);
                $textX = $x;
                if ($column['align'] === 'right') {
                    $textX = $x + (float) $column['width'] - 8;
                } elseif ($column['align'] === 'center') {
                    $textX = $x + (((float) $column['width']) / 2) - (strlen($line) * 1.1);
                }
                $font = $column['align'] === 'right' ? 'F2' : 'F1';
                $page['body'] .= "\n" . pdfText($textX, $textY, $line, 10, $font, '#1f2b33');
            }
            $x += (float) $column['width'];
        }

        $y -= $rowHeight;
        $rowIndex++;
    }

    $pages[] = $page;
    return $pages;
}

function buildPdfDocument(array $pages, ?array $drawingImage, string $generatedAt): string
{
    $objects = [];
    $kids = [];
    $objects[1] = '1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj';

    $pageCount = count($pages);
    $pageObjectStartId = 3;
    $fontRegularObjectId = $pageObjectStartId + ($pageCount * 2);
    $fontBoldObjectId = $fontRegularObjectId + 1;
    $imageObjectId = $drawingImage !== null ? $fontBoldObjectId + 1 : null;

    foreach ($pages as $index => $page) {
        $pageId = $pageObjectStartId + ($index * 2);
        $contentId = $pageId + 1;
        $kids[] = $pageId . ' 0 R';

        $content = finalizePageContent($page['title'], $page['subtitle'], (string) $page['body'], $index + 1, $pageCount, $generatedAt);
        $resources = '<< /Font << /F1 ' . $fontRegularObjectId . ' 0 R /F2 ' . $fontBoldObjectId . ' 0 R >>';
        if (!empty($page['image']) && $imageObjectId !== null) {
            $resources .= ' /XObject << /Im1 ' . $imageObjectId . ' 0 R >>';
        }
        $resources .= ' >>';

        $objects[$pageId] = $pageId . ' 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources ' . $resources . ' /Contents ' . $contentId . ' 0 R >> endobj';
        $objects[$contentId] = $contentId . ' 0 obj << /Length ' . strlen($content) . ' >> stream' . "\n" . $content . "\n" . 'endstream endobj';
    }

    $objects[2] = '2 0 obj << /Type /Pages /Kids [' . implode(' ', $kids) . '] /Count ' . count($kids) . ' >> endobj';
    $objects[$fontRegularObjectId] = $fontRegularObjectId . ' 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj';
    $objects[$fontBoldObjectId] = $fontBoldObjectId . ' 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >> endobj';

    if ($drawingImage !== null && $imageObjectId !== null) {
        $objects[$imageObjectId] = $imageObjectId . ' 0 obj << /Type /XObject /Subtype /Image /Width ' . $drawingImage['width'] . ' /Height ' . $drawingImage['height'] . ' /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ' . strlen($drawingImage['data']) . ' >> stream' . "\n" . $drawingImage['data'] . "\n" . 'endstream endobj';
    }

    ksort($objects);
    $pdf = "%PDF-1.4\n";
    $offsets = [0];
    foreach ($objects as $id => $object) {
        $offsets[$id] = strlen($pdf);
        $pdf .= $object . "\n";
    }

    $objectCount = max(array_keys($objects));
    $xrefOffset = strlen($pdf);
    $pdf .= "xref\n0 " . ($objectCount + 1) . "\n";
    $pdf .= "0000000000 65535 f \n";
    for ($i = 1; $i <= $objectCount; $i++) {
        $pdf .= isset($offsets[$i]) ? sprintf("%010d 00000 n \n", $offsets[$i]) : "0000000000 65535 f \n";
    }
    $pdf .= "trailer << /Size " . ($objectCount + 1) . " /Root 1 0 R >>\n";
    $pdf .= "startxref\n" . $xrefOffset . "\n%%EOF";
    return $pdf;
}

function finalizePageContent(string $title, string $subtitle, string $body, int $pageNumber, int $pageCount, string $generatedAt): string
{
    $header = [];
    $header[] = pdfRect(0, 780, 595, 62, '#173042', '#173042', 1);
    $header[] = pdfRect(0, 780, 595, 8, '#f2b766', '#f2b766', 1);
    $header[] = pdfText(38, 816, mb_strtoupper($title), 18, 'F2', '#ffffff');
    $header[] = pdfText(38, 794, $subtitle, 10, 'F1', '#d8e4ee');
    $header[] = pdfText(38, 28, 'Relatorio gerado em ' . $generatedAt, 9, 'F1', '#6f7f8c');
    $header[] = pdfText(515, 28, 'Pagina ' . $pageNumber . '/' . $pageCount, 9, 'F1', '#6f7f8c');
    $header[] = pdfLine(38, 42, 557, 42, '#dfe5ea', 1);

    return implode("\n", $header) . "\n" . $body;
}

function fitImageIntoFrame(int $imageWidth, int $imageHeight, float $frameWidth, float $frameHeight, float $originX, float $originY): array
{
    $scale = min($frameWidth / max(1, $imageWidth), $frameHeight / max(1, $imageHeight));
    $width = $imageWidth * $scale;
    $height = $imageHeight * $scale;

    return [
        'x' => $originX + (($frameWidth - $width) / 2),
        'y' => $originY + (($frameHeight - $height) / 2),
        'width' => $width,
        'height' => $height,
    ];
}

function parseDataUrlImage(string $dataUrl): ?array
{
    if (!preg_match('/^data:image\/jpeg;base64,(.+)$/', $dataUrl, $matches)) {
        return null;
    }

    $data = base64_decode($matches[1], true);
    if ($data === false) {
        return null;
    }

    $size = @getimagesizefromstring($data);
    if (!$size) {
        return null;
    }

    return [
        'data' => $data,
        'width' => (int) $size[0],
        'height' => (int) $size[1],
    ];
}

function wrapText(string $text, int $maxChars): array
{
    $words = preg_split('/\s+/', trim($text)) ?: [];
    if ($words === []) {
        return [''];
    }

    $lines = [];
    $current = '';
    foreach ($words as $word) {
        $candidate = $current === '' ? $word : $current . ' ' . $word;
        if (mb_strlen($candidate) <= $maxChars) {
            $current = $candidate;
            continue;
        }

        if ($current !== '') {
            $lines[] = $current;
        }
        $current = $word;
    }

    if ($current !== '') {
        $lines[] = $current;
    }

    return $lines ?: [''];
}

function moneyBr(float $value): string
{
    return 'R$ ' . number_format($value, 2, ',', '.');
}

function removeAccents(string $text): string
{
    $converted = iconv('UTF-8', 'ASCII//TRANSLIT', $text);
    return $converted !== false ? $converted : $text;
}

function containsText(string $text, string $needle): bool
{
    return $needle !== '' && strpos($text, $needle) !== false;
}

function pdfText(float $x, float $y, string $text, int $fontSize = 11, string $font = 'F1', string $hexColor = '#000000'): string
{
    [$r, $g, $b] = pdfRgb($hexColor);
    return sprintf(
        "q %.3F %.3F %.3F rg BT /%s %d Tf 1 0 0 1 %.2F %.2F Tm (%s) Tj ET Q",
        $r,
        $g,
        $b,
        $font,
        $fontSize,
        $x,
        $y,
        pdfEscape($text)
    );
}

function pdfRect(float $x, float $y, float $width, float $height, string $fillHex, string $strokeHex, float $lineWidth = 1): string
{
    [$fr, $fg, $fb] = pdfRgb($fillHex);
    [$sr, $sg, $sb] = pdfRgb($strokeHex);
    return sprintf(
        "q %.3F %.3F %.3F rg %.3F %.3F %.3F RG %.2F w %.2F %.2F %.2F %.2F re B Q",
        $fr,
        $fg,
        $fb,
        $sr,
        $sg,
        $sb,
        $lineWidth,
        $x,
        $y,
        $width,
        $height
    );
}

function pdfLine(float $x1, float $y1, float $x2, float $y2, string $strokeHex, float $lineWidth = 1): string
{
    [$r, $g, $b] = pdfRgb($strokeHex);
    return sprintf(
        "q %.3F %.3F %.3F RG %.2F w %.2F %.2F m %.2F %.2F l S Q",
        $r,
        $g,
        $b,
        $lineWidth,
        $x1,
        $y1,
        $x2,
        $y2
    );
}

function pdfRgb(string $hex): array
{
    $hex = ltrim($hex, '#');
    if (strlen($hex) !== 6) {
        return [0, 0, 0];
    }

    return [
        hexdec(substr($hex, 0, 2)) / 255,
        hexdec(substr($hex, 2, 2)) / 255,
        hexdec(substr($hex, 4, 2)) / 255,
    ];
}

function pdfEscape(string $text): string
{
    $converted = @iconv('UTF-8', 'Windows-1252//TRANSLIT', $text);
    $safe = $converted !== false ? $converted : $text;
    return str_replace(['\\', '(', ')'], ['\\\\', '\\(', '\\)'], $safe);
}
