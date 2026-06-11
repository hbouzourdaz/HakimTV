import re

input_file = r"f:\HakimTV\index.m3u"
output_file = r"f:\HakimTV\filtered_countries.m3u"

countries_map = {
    'ae': 'الإمارات',
    'sa': 'السعودية',
    'eg': 'مصر',
    'iq': 'العراق',
    'dz': 'الجزائر',
    'ma': 'المغرب',
    'tn': 'تونس',
    'jo': 'الأردن',
    'lb': 'لبنان',
    'sy': 'سوريا',
    'kw': 'الكويت',
    'qa': 'قطر',
    'bh': 'البحرين',
    'om': 'عمان',
    'ye': 'اليمن',
    'ly': 'ليبيا',
    'sd': 'السودان',
    'ps': 'فلسطين',
    'mr': 'موريتانيا',
    'fr': 'فرنسا',
    'uk': 'بريطانيا',
    'gb': 'بريطانيا',
    'us': 'أمريكا',
    'ca': 'كندا',
    'au': 'أستراليا',
    'ie': 'أيرلندا',
    'es': 'إسبانيا',
    'it': 'إيطاليا',
    'de': 'ألمانيا',
    'nl': 'هولندا',
    'pt': 'البرتغال',
    'tr': 'تركيا',
    'in': 'الهند',
    'pk': 'باكستان',
    'ru': 'روسيا',
    'cn': 'الصين',
    'jp': 'اليابان',
    'kr': 'كوريا الجنوبية',
    'br': 'البرازيل',
    'ar': 'الأرجنتين',
    'mx': 'المكسيك'
}

channels_grouped = {}

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

        category = ""
        
        # Determine country from tvg-id
        country_code = ""
        cc_match = re.search(r'\.([a-z]{2})(@|$)', tvg_id, re.IGNORECASE)
        if cc_match:
            country_code = cc_match.group(1).lower()

        is_sports = False
        if 'Sports' in group or re.search(r'Sport|ESPN|beIN SPORT|Fox Sport|Sky Sport|Euro Sport|DAZN|NBA |NFL |WWE|UFC|Fight|Boxing|Racing|Football|Soccer|Tennis|Golf|Cricket|Rugby', name, re.IGNORECASE):
            is_sports = True
            
        if is_sports:
            category = "رياضة"
        elif country_code in countries_map:
            category = countries_map[country_code]
        elif re.search(r'Al |Al-|Abu |Dubai|MBC|Rotana|beIN|LBC|CBC |AlJazeera|Arabia|Arab|Nile|Sharjah|Sama |Saudia|Kuwait|Qatar|Oman|Bahrain|Emarat|Ajman|Sharqa|Medi1|2M |Echorouk|Ennahar|Samira|Dzair|Algerie|Bahdja|Tamazight|Quran', name, re.IGNORECASE):
            category = "عربية أخرى"
        elif re.search(r'France [0-9]|France 24|TF1|Canal\+|Canal Plus|M6 |BFM|Arte|CNews|TMC |RMC |LCI|NRJ|W9 |C8 |CStar|Gulli|TV5|France Info', name, re.IGNORECASE):
            category = "فرنسا"
        elif re.search(r'BBC|ITV[0-9 ]|Sky News|CNN|Fox News|MSNBC|NBC|CBS|ABC |Channel [45]|Discovery|National Geographic|History|TLC|Nickelodeon|Cartoon Network|PBS|AMC|HBO|Paramount', name, re.IGNORECASE):
            category = "إنجليزية أخرى"
        else:
            category = "أخرى"

        entry = {'name': name, 'url': url, 'logo': logo, 'category': category}
        
        # Only keep channels we are interested in (Arabic countries, French, English, Sports)
        wanted_categories = list(countries_map.values()) + ["رياضة", "عربية أخرى", "إنجليزية أخرى"]
        
        if category in wanted_categories:
            if category not in channels_grouped:
                channels_grouped[category] = []
            channels_grouped[category].append(entry)
            
    i += 1

total = 0
with open(output_file, 'w', encoding='utf-8') as f:
    f.write("#EXTM3U\n")
    for cat, channels in channels_grouped.items():
        unique_channels = dedupe(channels)
        total += len(unique_channels)
        for ch in unique_channels:
            f.write(f'#EXTINF:-1 tvg-logo="{ch["logo"]}" group-title="{cat}",{ch["name"]}\n{ch["url"]}\n')

print("=== Done ===")
for cat, channels in channels_grouped.items():
    print(f"{cat}: {len(dedupe(channels))}")
print(f"Total: {total}")
