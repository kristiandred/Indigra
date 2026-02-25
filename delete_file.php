<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Метод не разрешен']);
    exit;
}

try {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($input['filename'])) {
        throw new Exception('Отсутствует имя файла');
    }
    
    $filename = $input['filename'];
    
    // Проверка безопасности имени файла
    if (!preg_match('/^[a-zA-Z0-9_-]+\.xlsx$/', $filename)) {
        throw new Exception('Недопустимое имя файла');
    }
    
    // Удаляем файл
    $filePath = __DIR__ . '/data/' . $filename;
    
    if (file_exists($filePath)) {
        if (unlink($filePath)) {
            echo json_encode([
                'success' => true,
                'message' => 'Файл успешно удален',
                'file' => $filename
            ]);
        } else {
            throw new Exception('Не удалось удалить файл');
        }
    } else {
        throw new Exception('Файл не найден');
    }
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>
