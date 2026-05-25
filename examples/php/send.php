<?php
$apiUrl = getenv('NEXTMSG_URL') ?: 'http://localhost:4000';
$token = getenv('NEXTMSG_TOKEN');
$instanceId = getenv('NEXTMSG_INSTANCE_ID');

$payload = json_encode([
    'instanceId' => $instanceId,
    'to' => '+15551234567',
    'body' => 'Hello from PHP',
]);

$ch = curl_init("$apiUrl/messages/send");
curl_setopt_array($ch, [
    CURLOPT_POST => true,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER => [
        "Authorization: Bearer $token",
        "Content-Type: application/json",
    ],
    CURLOPT_POSTFIELDS => $payload,
]);

$body = curl_exec($ch);
if ($body === false) {
    throw new RuntimeException(curl_error($ch));
}
curl_close($ch);
echo $body . PHP_EOL;
