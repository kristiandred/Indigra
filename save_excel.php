<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405); // Method Not Allowed
    echo json_encode(['success' => false, 'message' => 'Метод не разрешен. Используйте POST']);
    exit;
}

try {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($input['filename']) || !isset($input['data'])) {
        throw new Exception('Отсутствуют обязательные параметры');
    }
    
    $filename = $input['filename'];
    $data = $input['data'];
    
    // Проверка безопасности имени файла
    if (!preg_match('/^[a-zA-Z0-9_-а-яА-ЯёЁ\.xlsx$/', $filename)) {
        throw new Exception('Недопустимое имя файла');
    }
    
    // Подключаем библиотеку для работы с Excel
    require_once 'vendor/autoload.php';
    use PhpOffice\PhpSpreadsheet\Spreadsheet;
    use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
    
    // Создаем новый Excel файл
    $spreadsheet = new Spreadsheet();
    $sheet = $spreadsheet->getActiveSheet();
    
    // Записываем данные
    foreach ($data as $rowIndex => $row) {
        foreach ($row as $colIndex => $cell) {
            $sheet->setCellValueByColumnAndRow($colIndex + 1, $rowIndex + 1, $cell);
        }
    }
    
    // Сохраняем файл
    $filePath = __DIR__ . '/data/' . $filename;
    $writer = new Xlsx($spreadsheet);
    $writer->save($filePath);
    
    echo json_encode([
        'success' => true,
        'message' => 'Файл успешно сохранен',
        'file' => $filename
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>
