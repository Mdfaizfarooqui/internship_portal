<?php
require_once 'config/database.php';
$db = (new Database())->getConnection();

$updates = [
    ['old' => '$8000/month',  'new' => '₹60,000/month'],
    ['old' => '$7500/month',  'new' => '₹55,000/month'],
    ['old' => '$7000/month',  'new' => '₹50,000/month'],
    ['old' => '$7800/month',  'new' => '₹52,000/month'],
    ['old' => '$5000/month',  'new' => '₹35,000/month'],
    ['old' => '$2,500/month', 'new' => '₹20,000/month'],
    ['old' => '$3,000/month', 'new' => '₹25,000/month'],
    ['old' => '$2,000/month', 'new' => '₹15,000/month'],
    ['old' => '$2,500/month', 'new' => '₹20,000/month'],
    ['old' => '$2,400/month', 'new' => '₹18,000/month'],
    ['old' => '$2,200/month', 'new' => '₹17,000/month'],
    ['old' => '$2,600/month', 'new' => '₹20,000/month'],
    ['old' => '$2,100/month', 'new' => '₹16,000/month'],
    ['old' => '$1,800/month', 'new' => '₹12,000/month'],
    ['old' => '$2,800/month', 'new' => '₹22,000/month'],
];

$total = 0;
foreach ($updates as $u) {
    $stmt = $db->prepare("UPDATE internships SET stipend = :new WHERE stipend = :old");
    $stmt->execute([':new' => $u['new'], ':old' => $u['old']]);
    $rows = $stmt->rowCount();
    if ($rows > 0) {
        echo "Updated {$rows} row(s): {$u['old']} → {$u['new']}\n";
        $total += $rows;
    }
}

echo "\n✅ Done! Updated {$total} internship stipend(s) to ₹.\n";
?>
