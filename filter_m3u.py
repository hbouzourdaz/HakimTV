import re

input_file = r"f:\HakimTV\index.m3u"
output_file = r"f:\HakimTV\filtered.m3u"

arabic_channels = []
sports_channels = []
french_channels = []
english_channels = []

def dedupe(channels):
    seen = set()
    result = []
    for ch in channels:
        key = ch['name'].lower()
        if key not in seen:
            seen.add(key)
            result.append(ch)
    return result

with open(input_file, 'r', encoding='utf-8') as f:
    lines = f.read().splitlines()

i = 0
while i < len(lines):
    line = lines[i].strip()
    if line.startswith('#EXTINF:'):
        url = ""
        for j in range(i + 1, len(lines)):
            next_line = lines[j].strip()
            if next_line and not next_line.startswith('#'):
                url = next_line
                break
        
        if not url:
            i += 1
            continue

        name_match = re.search(r',(.+)$', line)
        name = name_match.group(1).strip() if name_match else ""
        
        id_match = re.search(r'tvg-id="([^"]*)"', line)
        tvg_id = id_match.group(1) if id_match else ""
        
        logo_match = re.search(r'tvg-logo="([^"]*)"', line)
        logo = logo_match.group(1) if logo_match else ""
        
        group_match = re.search(r'group-title="([^"]*)"', line)
        group = group_match.group(1) if group_match else ""

        if '[Geo-blocked]' in name:
            i += 1
            continue

        is_arabic = False
        is_sports = False
        is_french = False
        is_english = False

        # Arabic detection
        if re.search(r'\.(ae|sa|eg|iq|dz|ma|tn|jo|lb|sy|kw|qa|bh|om|ye|ly|sd|ps|mr)@', tvg_id):
            is_arabic = True
        if re.search(r'Al |Al-|Abu |Dubai|MBC|Rotana|beIN|LBC|CBC |AlJazeera|Arabia|Arab|Nile|Sharjah|Sama |Saudia|Kuwait|Qatar|Oman|Bahrain|Emarat|Ajman|Sharqa|Medi1|2M |Echorouk|Ennahar|Samira|Dzair|Algerie|Bahdja|Tamazight|Quran', name, re.IGNORECASE):
            is_arabic = True

        # Sports detection
        if 'Sports' in group:
            is_sports = True
        if re.search(r'Sport|ESPN|beIN SPORT|Fox Sport|Sky Sport|Euro Sport|DAZN|NBA |NFL |WWE|UFC|Fight|Boxing|Racing|Football|Soccer|Tennis|Golf|Cricket|Rugby', name, re.IGNORECASE):
            is_sports = True

        # French detection
        if re.search(r'\.fr@', tvg_id):
            is_french = True
        if re.search(r'France [0-9]|France 24|TF1|Canal\+|Canal Plus|M6 |BFM|Arte|CNews|TMC |RMC |LCI|NRJ|W9 |C8 |CStar|Gulli|TV5|France Info', name, re.IGNORECASE):
            is_french = True

        # English detection
        if re.search(r'\.(uk|gb|us|ca|au|ie)@', tvg_id):
            is_english = True
        if re.search(r'BBC|ITV[0-9 ]|Sky News|CNN|Fox News|MSNBC|NBC|CBS|ABC |Channel [45]|Discovery|National Geographic|History|TLC|Nickelodeon|Cartoon Network|PBS|AMC|HBO|Paramount', name, re.IGNORECASE):
            is_english = True

        entry = {'name': name, 'url': url, 'logo': logo}

        if is_sports:
            sports_channels.append(entry)
        elif is_arabic:
            arabic_channels.append(entry)
        elif is_french:
            french_channels.append(entry)
        elif is_english:
            english_channels.append(entry)
            
    i += 1

arabic_channels = dedupe(arabic_channels)
sports_channels = dedupe(sports_channels)
french_channels = dedupe(french_channels)
english_channels = dedupe(english_channels)

with open(output_file, 'w', encoding='utf-8') as f:
    f.write("#EXTM3U\n")
    
    for ch in arabic_channels:
        f.write(f'#EXTINF:-1 tvg-logo="{ch["logo"]}" group-title="\u0639\u0631\u0628\u064a\u0629",{ch["name"]}\n{ch["url"]}\n')
    for ch in sports_channels:
        f.write(f'#EXTINF:-1 tvg-logo="{ch["logo"]}" group-title="\u0631\u064a\u0627\u0636\u0629",{ch["name"]}\n{ch["url"]}\n')
    for ch in french_channels:
        f.write(f'#EXTINF:-1 tvg-logo="{ch["logo"]}" group-title="\u0641\u0631\u0646\u0633\u064a\u0629",{ch["name"]}\n{ch["url"]}\n')
    for ch in english_channels:
        f.write(f'#EXTINF:-1 tvg-logo="{ch["logo"]}" group-title="\u0625\u0646\u062c\u0644\u064a\u0632\u064a\u0629",{ch["name"]}\n{ch["url"]}\n')

print("=== Done ===")
print(f"Arabic: {len(arabic_channels)}")
print(f"Sports: {len(sports_channels)}")
print(f"French: {len(french_channels)}")
print(f"English: {len(english_channels)}")
print(f"Total: {len(arabic_channels) + len(sports_channels) + len(french_channels) + len(english_channels)}")
