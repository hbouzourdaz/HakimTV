$inputFile = "f:\HakimTV\index.m3u"
$outputFile = "f:\HakimTV\filtered.m3u"

$content = Get-Content $inputFile -Encoding utf8
$lines = $content -split "`n"

$arabicChannels = @()
$sportsChannels = @()
$frenchChannels = @()
$englishChannels = @()

for ($i = 0; $i -lt $lines.Count; $i++) {
    $line = $lines[$i].Trim()
    if ($line -match '^#EXTINF:') {
        $url = ""
        for ($j = $i + 1; $j -lt $lines.Count; $j++) {
            $nextLine = $lines[$j].Trim()
            if ($nextLine -and !$nextLine.StartsWith('#')) {
                $url = $nextLine
                break
            }
        }
        if (!$url) { continue }

        $name = ""
        if ($line -match ',(.+)$') { $name = $Matches[1].Trim() }
        $tvgId = ""
        if ($line -match 'tvg-id="([^"]*)"') { $tvgId = $Matches[1] }
        $logo = ""
        if ($line -match 'tvg-logo="([^"]*)"') { $logo = $Matches[1] }
        $group = ""
        if ($line -match 'group-title="([^"]*)"') { $group = $Matches[1] }

        if ($name -match '\[Geo-blocked\]') { continue }

        $isArabic = $false
        $isSports = $false
        $isFrench = $false
        $isEnglish = $false

        if ($tvgId -match '\.(ae|sa|eg|iq|dz|ma|tn|jo|lb|sy|kw|qa|bh|om|ye|ly|sd|ps|mr)@') {
            $isArabic = $true
        }
        if ($name -match 'Al |Al-|Abu |Dubai|MBC|Rotana|beIN|LBC|CBC |AlJazeera|Arabia|Arab|Nile|Sharjah|Sama |Saudia|Kuwait|Qatar|Oman|Bahrain|Emarat|Ajman|Sharqa|Medi1|2M |Echorouk|Ennahar|Samira|Dzair|Algerie|Bahdja|Tamazight|Quran') {
            $isArabic = $true
        }

        if ($group -match 'Sports') {
            $isSports = $true
        }
        if ($name -match 'Sport|ESPN|beIN SPORT|Fox Sport|Sky Sport|Euro Sport|DAZN|NBA |NFL |WWE|UFC|Fight|Boxing|Racing|Football|Soccer|Tennis|Golf|Cricket|Rugby') {
            $isSports = $true
        }

        if ($tvgId -match '\.fr@') {
            $isFrench = $true
        }
        if ($name -match 'France [0-9]|France 24|TF1|Canal\+|Canal Plus|M6 |BFM|Arte|CNews|TMC |RMC |LCI|NRJ|W9 |C8 |CStar|Gulli|TV5|France Info') {
            $isFrench = $true
        }

        if ($tvgId -match '\.(uk|gb|us|ca|au|ie)@') {
            $isEnglish = $true
        }
        if ($name -match 'BBC|ITV[0-9 ]|Sky News|CNN|Fox News|MSNBC|NBC|CBS|ABC |Channel [45]|Discovery|National Geographic|History|TLC|Nickelodeon|Cartoon Network|PBS|AMC|HBO|Paramount') {
            $isEnglish = $true
        }

        $entry = @{
            Name = $name
            Url = $url
            Logo = $logo
        }

        if ($isSports) { $sportsChannels += $entry }
        elseif ($isArabic) { $arabicChannels += $entry }
        elseif ($isFrench) { $frenchChannels += $entry }
        elseif ($isEnglish) { $englishChannels += $entry }
    }
}

function Dedupe($channels) {
    $seen = @{}
    $result = @()
    foreach ($ch in $channels) {
        $key = $ch.Name.ToLower()
        if (!$seen.ContainsKey($key)) {
            $seen[$key] = $true
            $result += $ch
        }
    }
    return $result
}

$arabicChannels = Dedupe $arabicChannels
$sportsChannels = Dedupe $sportsChannels
$frenchChannels = Dedupe $frenchChannels
$englishChannels = Dedupe $englishChannels

# Build output using StringBuilder to avoid encoding issues
$sb = New-Object System.Text.StringBuilder
[void]$sb.AppendLine("#EXTM3U")

$catArabic = [char]0x0639 + [char]0x0631 + [char]0x0628 + [char]0x064A + [char]0x0629
$catSports = [char]0x0631 + [char]0x064A + [char]0x0627 + [char]0x0636 + [char]0x0629
$catFrench = [char]0x0641 + [char]0x0631 + [char]0x0646 + [char]0x0633 + [char]0x064A + [char]0x0629
$catEnglish = [char]0x0625 + [char]0x0646 + [char]0x062C + [char]0x0644 + [char]0x064A + [char]0x0632 + [char]0x064A + [char]0x0629

foreach ($ch in $arabicChannels) {
    [void]$sb.AppendLine("#EXTINF:-1 tvg-logo=`"$($ch.Logo)`" group-title=`"$catArabic`",$($ch.Name)")
    [void]$sb.AppendLine($ch.Url)
}
foreach ($ch in $sportsChannels) {
    [void]$sb.AppendLine("#EXTINF:-1 tvg-logo=`"$($ch.Logo)`" group-title=`"$catSports`",$($ch.Name)")
    [void]$sb.AppendLine($ch.Url)
}
foreach ($ch in $frenchChannels) {
    [void]$sb.AppendLine("#EXTINF:-1 tvg-logo=`"$($ch.Logo)`" group-title=`"$catFrench`",$($ch.Name)")
    [void]$sb.AppendLine($ch.Url)
}
foreach ($ch in $englishChannels) {
    [void]$sb.AppendLine("#EXTINF:-1 tvg-logo=`"$($ch.Logo)`" group-title=`"$catEnglish`",$($ch.Name)")
    [void]$sb.AppendLine($ch.Url)
}

[System.IO.File]::WriteAllText($outputFile, $sb.ToString(), [System.Text.Encoding]::UTF8)

Write-Host "=== Done ==="
Write-Host "Arabic: $($arabicChannels.Count)"
Write-Host "Sports: $($sportsChannels.Count)"
Write-Host "French: $($frenchChannels.Count)"
Write-Host "English: $($englishChannels.Count)"
Write-Host "Total: $($arabicChannels.Count + $sportsChannels.Count + $frenchChannels.Count + $englishChannels.Count)"
