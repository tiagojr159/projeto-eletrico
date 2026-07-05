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

if (!is_array($payload)) {
    http_response_code(422);
    header('Content-Type: text/plain; charset=utf-8');
    echo 'Payload invalido.';
    exit;
}

$utility = null;
foreach ($db['utilities'] ?? [] as $candidate) {
    if ((int) ($candidate['id'] ?? 0) === (int) ($payload['utility_id'] ?? 0)) {
        $utility = $candidate;
        break;
    }
}

$projectName = (string) ($payload['name'] ?? 'Projeto');
$items = $payload['floorPlan']['items'] ?? [];
$circuits = buildCircuitsPdf($items);
$materials = buildMaterialsPdf($circuits, $items);
$drawingImage = parseDataUrlImage((string) ($payload['drawingImage'] ?? ''));

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

$pdf = buildSimplePdf($projectName, $lines, $drawingImage);
$safeName = preg_replace('/[^A-Za-z0-9_-]+/', '_', $projectName) ?: 'projeto';

header('Content-Type: application/pdf');
header('Content-Disposition: attachment; filename="' . $safeName . '.pdf"');
header('Content-Length: ' . strlen($pdf));
echo $pdf;

function buildCircuitsPdf(array $items): array
{
    $circuits = [];
    foreach ($items as $item) {
        if (($item['kind'] ?? '') !== 'electrical') {
            continue;
        }
        $label = (string) ($item['circuit'] ?? '');
        if ($label === '') {
            continue;
        }
        if (!isset($circuits[$label])) {
            $circuits[$label] = [
                'label' => $label,
                'type' => (string) ($item['type'] ?? '-'),
                'totalPower' => 0,
                'breaker' => '10A',
            ];
        }
        $circuits[$label]['totalPower'] += (int) ($item['power'] ?? 0);
        $current = $circuits[$label]['totalPower'];
        $circuits[$label]['breaker'] = $current <= 10 ? '10A' : ($current <= 20 ? '20A' : ($current <= 32 ? '32A' : '40A'));
    }
    return array_values($circuits);
}

function buildMaterialsPdf(array $circuits, array $items): array
{
    $materials = [];
    foreach ($circuits as $circuit) {
        $breaker = $circuit['breaker'];
        $price = $breaker === '40A' ? 22.00 : ($breaker === '32A' ? 20.00 : ($breaker === '20A' ? 22.00 : 18.50));
        $materials[] = [
            'description' => 'Disjuntor ' . $breaker,
            'quantity' => 1,
            'unit' => 'un',
            'subtotal' => $price,
        ];
    }

    $electrical = array_values(array_filter($items, static fn ($item) => ($item['kind'] ?? '') === 'electrical'));
    $qty = max(1, count($electrical) * 4);
    if ($qty > 0) {
        $materials[] = [
            'description' => 'Cabo 1,5 mm2',
            'quantity' => $qty,
            'unit' => 'm',
            'subtotal' => $qty * 2.80,
        ];
    }

    return $materials;
}

function buildSimplePdf(string $title, array $lines, ?array $drawingImage = null): string
{
    $pages = array_chunk($lines, 40);
    $objects = [];
    $kids = [];
    $hasDrawing = $drawingImage !== null;
    $textPageStartId = $hasDrawing ? 5 : 3;
    $fontObjectId = $textPageStartId + count($pages) * 2;
    $imageObjectId = $hasDrawing ? $fontObjectId + 1 : null;

    $objects[1] = '1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj';
    if ($hasDrawing) {
        $kids[] = '3 0 R';
        $placement = fitImageIntoPage($drawingImage['width'], $drawingImage['height']);
        $content = "q\n" . sprintf('%.2F 0 0 %.2F %.2F %.2F cm', $placement['width'], $placement['height'], $placement['x'], $placement['y']) . "\n/Im1 Do\nQ";
        $objects[3] = '3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /XObject << /Im1 ' . $imageObjectId . ' 0 R >> >> /Contents 4 0 R >> endobj';
        $objects[4] = '4 0 obj << /Length ' . strlen($content) . ' >> stream' . "\n" . $content . "\n" . 'endstream endobj';
    }

    for ($i = 0; $i < count($pages); $i++) {
        $pageId = $textPageStartId + ($i * 2);
        $contentId = $pageId + 1;
        $kids[] = $pageId . ' 0 R';
        $content = pdfPageStream($title, $pages[$i]);
        $objects[$pageId] = $pageId . ' 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 ' . $fontObjectId . ' 0 R >> >> /Contents ' . $contentId . ' 0 R >> endobj';
        $objects[$contentId] = $contentId . ' 0 obj << /Length ' . strlen($content) . ' >> stream' . "\n" . $content . "\n" . 'endstream endobj';
    }
    $objects[2] = '2 0 obj << /Type /Pages /Kids [' . implode(' ', $kids) . '] /Count ' . count($kids) . ' >> endobj';
    $objects[$fontObjectId] = $fontObjectId . ' 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj';
    if ($hasDrawing) {
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
    $xref = strlen($pdf);
    $pdf .= "xref\n0 " . ($objectCount + 1) . "\n";
    $pdf .= "0000000000 65535 f \n";
    for ($i = 1; $i <= $objectCount; $i++) {
        $pdf .= isset($offsets[$i])
            ? sprintf("%010d 00000 n \n", $offsets[$i])
            : "0000000000 65535 f \n";
    }
    $pdf .= "trailer << /Size " . ($objectCount + 1) . " /Root 1 0 R >>\n";
    $pdf .= "startxref\n" . $xref . "\n%%EOF";
    return $pdf;
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

function fitImageIntoPage(int $imageWidth, int $imageHeight): array
{
    $pageWidth = 595;
    $pageHeight = 842;
    $margin = 28;
    $maxWidth = $pageWidth - ($margin * 2);
    $maxHeight = $pageHeight - ($margin * 2);
    $scale = min($maxWidth / max(1, $imageWidth), $maxHeight / max(1, $imageHeight));
    $width = $imageWidth * $scale;
    $height = $imageHeight * $scale;

    return [
        'x' => ($pageWidth - $width) / 2,
        'y' => ($pageHeight - $height) / 2,
        'width' => $width,
        'height' => $height,
    ];
}

function pdfPageStream(string $title, array $lines): string
{
    $y = 800;
    $out = [];
    $out[] = 'BT /F1 18 Tf 40 ' . $y . ' Td (' . pdfEscape($title) . ') Tj ET';
    $y -= 28;
    foreach ($lines as $line) {
        if ($line === '') {
            $y -= 10;
            continue;
        }
        $fontSize = ($line === 'Quadro de distribuicao' || $line === 'Lista de materiais') ? 14 : 11;
        $out[] = 'BT /F1 ' . $fontSize . ' Tf 40 ' . $y . ' Td (' . pdfEscape($line) . ') Tj ET';
        $y -= $fontSize + 6;
    }
    return implode("\n", $out);
}

function pdfEscape(string $text): string
{
    $converted = @iconv('UTF-8', 'Windows-1252//TRANSLIT', $text);
    $text = $converted !== false ? $converted : $text;
    return str_replace(['\\', '(', ')'], ['\\\\', '\\(', '\\)'], $text);
}
