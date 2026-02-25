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
    
    // Настройки GitHub
    $githubToken = 'YOUR_GITHUB_TOKEN'; // Замените на реальный токен
    $repoOwner = 'kristiandred';
    $repoName = 'Indigra';
    $branch = 'main';
    $dataPath = 'data/';
    
    // Проверяем существование файла
    $filePath = __DIR__ . '/data/' . $filename;
    if (!file_exists($filePath)) {
        throw new Exception('Файл не найден');
    }
    
    // Читаем содержимое файла
    $fileContent = file_get_contents($filePath);
    $fileBase64 = base64_encode($fileContent);
    
    // Получаем информацию о текущем файле в репозитории
    $apiUrl = "https://api.github.com/repos/{$repoOwner}/{$repoName}/contents/{$dataPath}{$filename}";
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $apiUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Authorization: token ' . $githubToken,
        'User-Agent: Indigra-Admin-Panel'
    ]);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    $fileData = json_decode($response, true);
    $sha = null;
    
    if ($httpCode === 200 && isset($fileData['sha'])) {
        $sha = $fileData['sha'];
    }
    
    // Создаем/обновляем файл в репозитории
    $updateData = [
        'message' => "Update {$filename} via admin panel",
        'content' => $fileBase64,
        'branch' => $branch
    ];
    
    if ($sha) {
        $updateData['sha'] = $sha;
    }
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $apiUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'PUT');
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($updateData));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Authorization: token ' . $githubToken,
        'Content-Type: application/json',
        'User-Agent: Indigra-Admin-Panel'
    ]);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($httpCode >= 200 && $httpCode < 300) {
        echo json_encode([
            'success' => true,
            'message' => 'Файл успешно синхронизирован с GitHub',
            'file' => $filename
        ]);
    } else {
        $errorData = json_decode($response, true);
        throw new Exception($errorData['message'] ?? 'Ошибка синхронизации с GitHub');
    }
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>
