#!/usr/bin/env python3
"""Merge open Kangxi radical lists with bilingual stories, examples, and forms."""
from __future__ import annotations

import argparse
import json
from pathlib import Path

# Official Kangxi glyphs (traditional dictionary forms), 1–214.
KANGXI = list(
    "一丨丶丿乙亅二亠人儿入八冂冖冫几凵刀力勹匕匚匸十卜卩厂厶又"
    "口囗土士夂夊夕大女子宀寸小尢尸屮山巛工己巾干幺广廴廾弋弓彐彡彳"
    "心戈戶手支攴文斗斤方无日曰月木欠止歹殳毋比毛氏气水火爪父爻爿"
    "片牙牛犬玄玉瓜瓦甘生用田疋疒癶白皮皿目矛矢石示禸禾穴立"
    "竹米糸缶网羊羽老而耒耳聿肉臣自至臼舌舛舟艮色艸虍虫血行衣襾"
    "見角言谷豆豕豸貝赤走足身車辛辰辵邑酉釆里"
    "金長門阜隶隹雨青非面革韋韭音頁風飛食首香"
    "馬骨高髟鬥鬯鬲鬼魚鳥鹵鹿麥麻黃黍黑黹黽鼎鼓鼠鼻齊齒龍龜龠"
)

assert len(KANGXI) == 214, len(KANGXI)

# Official Kangxi stroke counts by radical number.
STROKES = (
    [1] * 6
    + [2] * 23
    + [3] * 31
    + [4] * 34
    + [5] * 23
    + [6] * 29
    + [7] * 20
    + [8] * 9
    + [9] * 11
    + [10] * 8
    + [11] * 6
    + [12] * 4
    + [13] * 4
    + [14] * 2
    + [15] * 1
    + [16] * 2
    + [17] * 1
)
assert len(STROKES) == 214

# Pinyin of the radical name (Kangxi / Wikipedia).
PINYIN = [
    "yī", "gǔn", "zhǔ", "piě", "yǐ", "jué",
    "èr", "tóu", "rén", "ér", "rù", "bā", "jiōng", "mì", "bīng", "jī", "qǔ", "dāo", "lì", "bāo",
    "bǐ", "fāng", "xì", "shí", "bǔ", "jié", "hàn", "sī", "yòu",
    "kǒu", "wéi", "tǔ", "shì", "zhǐ", "suī", "xī", "dà", "nǚ", "zǐ", "mián",
    "cùn", "xiǎo", "wāng", "shī", "chè", "shān", "chuān", "gōng", "jǐ", "jīn",
    "gān", "yāo", "yǎn", "yǐn", "gǒng", "yì", "gōng", "jì", "shān", "chì",
    "xīn", "gē", "hù", "shǒu", "zhī", "pū", "wén", "dǒu", "jīn", "fāng",
    "wú", "rì", "yuē", "yuè", "mù", "qiàn", "zhǐ", "dǎi", "shū", "wú",
    "bǐ", "máo", "shì", "qì", "shuǐ", "huǒ", "zhǎo", "fù", "yáo", "qiáng",
    "piàn", "yá", "niú", "quǎn", "xuán", "yù", "guā", "wǎ", "gān", "shēng",
    "yòng", "tián", "pǐ", "nè", "bō", "bái", "pí", "mǐn", "mù", "máo",
    "shǐ", "shí", "shì", "róu", "hé", "xué", "lì",
    "zhú", "mǐ", "mì", "fǒu", "wǎng", "yáng", "yǔ", "lǎo", "ér", "lěi",
    "ěr", "yù", "ròu", "chén", "zì", "zhì", "jiù", "shé", "chuǎn", "zhōu",
    "gèn", "sè", "cǎo", "hū", "chóng", "xuè", "xíng", "yī", "yà",
    "jiàn", "jiǎo", "yán", "gǔ", "dòu", "shǐ", "zhì", "bèi", "chì", "zǒu",
    "zú", "shēn", "chē", "xīn", "chén", "chuò", "yì", "yǒu", "biàn", "lǐ",
    "jīn", "cháng", "mén", "fù", "dài", "zhuī", "yǔ", "qīng", "fēi",
    "miàn", "gé", "wéi", "jiǔ", "yīn", "yè", "fēng", "fēi", "shí", "shǒu", "xiāng",
    "mǎ", "gǔ", "gāo", "biāo", "dòu", "chàng", "lì", "guǐ",
    "yú", "niǎo", "lǔ", "lù", "mài", "má",
    "huáng", "shǔ", "hēi", "zhǐ",
    "mǐn", "dǐng", "gǔ", "shǔ",
    "bí", "qí",
    "chǐ",
    "lóng", "guī",
    "yuè",
]
assert len(PINYIN) == 214

EN = [
    "one", "line", "dot", "slash", "second", "hook",
    "two", "lid", "person", "legs", "enter", "eight", "down box", "cover", "ice", "table", "open box", "knife", "power", "wrap",
    "spoon", "right open box", "hiding enclosure", "ten", "divination", "seal", "cliff", "private", "again",
    "mouth", "enclosure", "earth", "scholar", "go", "go slowly", "evening", "big", "woman", "child", "roof",
    "inch", "small", "lame", "corpse", "sprout", "mountain", "river", "work", "oneself", "cloth",
    "dry", "short thread", "dotted cliff", "long stride", "two hands", "shoot", "bow", "snout", "bristle", "step",
    "heart", "halberd", "door", "hand", "branch", "rap", "script", "dipper", "axe", "square",
    "not", "sun", "say", "moon", "tree", "lack", "stop", "death", "weapon", "do not",
    "compare", "fur", "clan", "steam", "water", "fire", "claw", "father", "diagram lines", "half wood",
    "slice", "fang", "ox", "dog", "profound", "jade", "melon", "tile", "sweet", "life",
    "use", "field", "bolt of cloth", "sickness", "footsteps", "white", "skin", "dish", "eye", "spear",
    "arrow", "stone", "spirit", "track", "grain", "cave", "stand",
    "bamboo", "rice", "silk", "jar", "net", "sheep", "feather", "old", "and", "plow",
    "ear", "brush", "meat", "minister", "self", "arrive", "mortar", "tongue", "oppose", "boat",
    "stopping", "color", "grass", "tiger", "insect", "blood", "walk", "clothes", "west",
    "see", "horn", "speech", "valley", "bean", "pig", "cat-like beast", "shell", "red", "run",
    "foot", "body", "cart", "bitter", "morning", "walk", "city", "wine", "distinguish", "village",
    "gold", "long", "gate", "mound", "catch", "short-tailed bird", "rain", "blue-green", "wrong",
    "face", "leather", "tanned leather", "leek", "sound", "leaf", "wind", "fly", "eat", "head", "fragrance",
    "horse", "bone", "tall", "hair", "fight", "sacrificial wine", "cauldron", "ghost",
    "fish", "bird", "salt", "deer", "wheat", "hemp",
    "yellow", "millet", "black", "embroidery",
    "frog", "tripod", "drum", "rat",
    "nose", "even",
    "tooth",
    "dragon", "turtle",
    "flute",
]
assert len(EN) == 214

VI = [
    "một", "nét sổ", "chấm", "nét phẩy", "ất", "móc",
    "hai", "nắp", "người", "hai chân", "vào", "tám", "khung úp", "che", "băng", "kỷ", "hộp hở", "dao", "sức", "bao",
    "thìa", "tủ", "che giấu", "mười", "bói", "ấn", "vách đá", "riêng", "lại",
    "miệng", "khung vuông", "đất", "sĩ", "đi", "đi chậm", "chạng vạng", "lớn", "nữ", "con", "mái nhà",
    "tấc", "nhỏ", "què", "thây", "mầm", "núi", "sông", "thợ", "mình", "khăn",
    "khô", "sợi nhỏ", "mái che", "bước dài", "chắp tay", "bắn", "cung", "mõm", "lông", "bước",
    "tim", "mâu", "cửa", "tay", "nhánh", "gõ", "văn", "đấu", "rìu", "phương",
    "không", "mặt trời", "nói", "mặt trăng", "cây", "thiếu", "dừng", "xấu", "binh khí", "chớ",
    "so", "lông", "họ", "khí", "nước", "lửa", "móng", "cha", "hào", "mảnh gỗ",
    "mảnh", "răng nanh", "trâu", "chó", "huyền", "ngọc", "dưa", "ngói", "ngọt", "sống",
    "dùng", "ruộng", "tấm vải", "bệnh", "bước chân", "trắng", "da", "bát", "mắt", "giáo",
    "tên", "đá", "thần", "dấu chân", "lúa", "hang", "đứng",
    "tre", "gạo", "tơ", "vò", "lưới", "dê", "lông vũ", "già", "mà", "cày",
    "tai", "bút", "thịt", "bầy tôi", "mình", "đến", "cối", "lưỡi", "trái", "thuyền",
    "cấn", "màu", "cỏ", "cọp", "sâu", "máu", "đi", "áo", "che",
    "thấy", "sừng", "lời", "thung lũng", "đậu", "heo", "thú", "vỏ sò", "đỏ", "chạy",
    "chân", "thân", "xe", "cay", "thìn", "đi", "ấp", "rượu", "phân biệt", "dặm",
    "vàng kim", "dài", "cổng", "gò", "bắt", "chim ngắn đuôi", "mưa", "xanh", "không phải",
    "mặt", "da thuộc", "da mềm", "hẹ", "âm", "trang", "gió", "bay", "ăn", "đầu", "thơm",
    "ngựa", "xương", "cao", "tóc", "đấu", "rượu tế", "đỉnh", "ma",
    "cá", "chim", "muối", "hươu", "lúa mì", "gai dầu",
    "vàng", "kê", "đen", "thêu",
    "ếch", "đỉnh đồng", "trống", "chuột",
    "mũi", "đều",
    "răng",
    "rồng", "rùa",
    "sáo",
]
assert len(VI) == 214

# Combining form shown beside the Kangxi glyph when learners meet it in compounds.
VARIANT = {
    9: "亻",
    18: "刂",
    61: "忄",
    64: "扌",
    66: "攵",
    85: "氵",
    86: "灬",
    94: "犭",
    96: "王",
    113: "礻",
    118: "⺮",
    120: "纟",
    122: "罒",
    130: "月",
    140: "艹",
    145: "衤",
    147: "见",
    149: "讠",
    154: "贝",
    157: "⻊",
    159: "车",
    162: "辶",
    163: "⻏",
    167: "钅",
    169: "门",
    170: "阝",
    181: "页",
    182: "风",
    184: "饣",
    187: "马",
    195: "鱼",
    196: "鸟",
}

SIMPLIFIED = {
    63: "户",
    120: "丝",
    140: "草",
    147: "见",
    154: "贝",
    159: "车",
    168: "长",
    169: "门",
    178: "韦",
    181: "页",
    182: "风",
    183: "飞",
    187: "马",
    195: "鱼",
    196: "鸟",
    197: "卤",
    199: "麦",
    201: "黄",
    205: "黾",
    210: "齐",
    211: "齿",
    212: "龙",
    213: "龟",
}

# Character to feed hanzi-writer when the radical glyph itself has no stroke data.
WRITER = {
    2: "中",
    3: "丸",
    4: "川",
    6: "了",
    8: "京",
    13: "同",
    14: "写",
    15: "冰",
    17: "凶",
    20: "包",
    22: "匠",
    23: "匹",
    26: "卫",
    27: "厅",
    28: "去",
    34: "各",
    35: "复",
    40: "家",
    43: "尤",
    45: "出",
    47: "巡",
    52: "幻",
    53: "广",
    54: "建",
    55: "开",
    56: "式",
    58: "雪",
    59: "衫",
    60: "行",
    66: "放",
    89: "爻",
    90: "壮",
    103: "楚",
    104: "病",
    105: "登",
    114: "禹",
    140: "草",
    141: "虎",
    146: "西",
    162: "过",
    163: "都",
    165: "番",
    170: "阳",
    171: "隶",
    172: "雀",
    190: "发",
    191: "斗",
    192: "鬯",
    204: "黼",
    205: "黾",
    214: "龠",
}

# lucide-react export names — resolved at runtime with a fallback.
ICON = [
    "Minus", "GripVertical", "Dot", "Slash", "CornerDownRight", "Anchor",
    "Equal", "PanelTop", "User", "PersonStanding", "LogIn", "Spline",
    "Frame", "Cloud", "Snowflake", "Table", "BoxSelect", "Scissors", "Zap", "Gift",
    "Utensils", "PanelRightOpen", "SquareDashed", "Hash", "Eye", "Stamp",
    "Mountain", "Lock", "Redo2",
    "MessageCircle", "Square", "Mountain", "GraduationCap", "MoveDownRight", "Footprints",
    "MoonStar", "Maximize2", "UserRound", "Baby", "Home",
    "Ruler", "Minimize2", "Accessibility", "UserX", "Sprout", "Mountain", "Waves",
    "Hammer", "ScanFace", "Scroll",
    "Sun", "Baseline", "Store", "StretchHorizontal", "Hand", "Target",
    "MoveUpRight", "Bone", "Wind", "Footprints",
    "Heart", "Swords", "DoorOpen", "Hand", "GitBranch", "Pencil",
    "BookOpen", "Scale", "Axe", "Box",
    "Ban", "Sun", "Quote", "Moon", "TreeDeciduous", "Wind", "OctagonX",
    "Skull", "Swords", "Ban",
    "Columns2", "Feather", "Users", "CloudFog", "Droplets", "Flame",
    "PawPrint", "UserRound", "Hash", "Columns2",
    "RectangleVertical", "Gem", "Beef", "Dog", "Sparkles", "Gem",
    "Grape", "BrickWall", "Candy", "Sprout",
    "Wrench", "LayoutGrid", "Scroll", "Cross", "Footprints", "Circle",
    "Layers", "Bowl", "Eye", "Sword",
    "ArrowUp", "Mountain", "Sparkles", "Footprints", "Wheat", "Cave", "PersonStanding",
    "TreePine", "Wheat", "Spline", "CupSoda", "Grid3x3", "Rabbit", "Feather",
    "UserRound", "Link", "Tractor",
    "Ear", "PenLine", "Beef", "Briefcase", "ScanFace", "Flag", "Bowl", "Languages",
    "Split", "Ship",
    "MountainSnow", "Palette", "Leaf", "Cat", "Bug", "Droplet", "Footprints", "Shirt", "Sunset",
    "Eye", "Triangle", "MessageSquare", "Mountain", "Bean", "PiggyBank", "Squirrel",
    "CircleDollarSign", "Flame", "PersonStanding",
    "Footprints", "User", "CarFront", "Flame", "Sunrise", "Footprints", "Landmark",
    "Wine", "ScanSearch", "MapPin",
    "Coins", "MoveHorizontal", "DoorClosed", "Mountain", "Hand", "Bird",
    "CloudRain", "Leaf", "Ban",
    "Scan", "Shield", "Scroll", "Leaf", "Music", "BookOpen", "Wind", "Plane",
    "Utensils", "Crown", "Flower2",
    "Horse", "Bone", "ArrowUpToLine", "Scissors", "Swords", "Wine", "Flame", "Ghost",
    "Fish", "Bird", "Diamond", "Rabbit", "Wheat", "Trees",
    "SunMedium", "Wheat", "Circle", "Paintbrush",
    "Turtle", "Milestone", "Drum", "Rat",
    "Smile", "AlignJustify",
    "Smile",
    "Sparkles", "Turtle",
    "Music2",
]
assert len(ICON) == 214

CORE = {
    1, 7, 9, 12, 18, 19, 24, 30, 32, 37, 38, 39, 40, 42, 46, 50,
    61, 64, 72, 74, 75, 85, 86, 93, 94, 96, 102, 109, 112, 113, 115,
    118, 119, 120, 130, 140, 142, 145, 149, 154, 157, 159, 162, 167,
    169, 173, 184, 187, 195, 196,
}
COMMON = {
    8, 10, 11, 15, 29, 31, 36, 41, 48, 57, 62, 63, 67, 69, 70, 76, 77,
    84, 87, 100, 101, 106, 107, 108, 111, 116, 117, 123, 124, 128, 132,
    135, 137, 139, 144, 147, 148, 151, 156, 158, 160, 164, 166, 168,
    170, 174, 176, 180, 181, 182, 185, 186, 188, 189, 194, 198, 203,
    209, 212,
}

# 2–4 example words per radical: character, pinyin, english, vietnamese
EXAMPLES: dict[int, list[tuple[str, str, str, str]]] = {}

def ex(n: int, *rows: tuple[str, str, str, str]) -> None:
    EXAMPLES[n] = list(rows)

ex(1, ("一个", "yī gè", "one (item)", "một cái"), ("一起", "yī qǐ", "together", "cùng nhau"), ("一月", "yī yuè", "January", "tháng một"))
ex(2, ("中", "zhōng", "middle", "giữa"), ("丰", "fēng", "abundant", "phong phú"), ("旧", "jiù", "old", "cũ"))
ex(3, ("丸", "wán", "pill", "viên"), ("主", "zhǔ", "main", "chủ"), ("太", "tài", "too", "quá"))
ex(4, ("川", "chuān", "river", "sông"), ("久", "jiǔ", "long time", "lâu"), ("么", "me", "particle", "trợ từ"))
ex(5, ("乙", "yǐ", "second (stem)", "ất"), ("乞", "qǐ", "beg", "cầu xin"), ("乾", "qián", "dry / qian", "kiền"))
ex(6, ("了", "le", "completed", "rồi"), ("予", "yǔ", "give", "cho"), ("争", "zhēng", "compete", "tranh"))
ex(7, ("二", "èr", "two", "hai"), ("些", "xiē", "some", "vài"), ("五", "wǔ", "five", "năm"))
ex(8, ("京", "jīng", "capital", "kinh"), ("夜", "yè", "night", "đêm"), ("亮", "liàng", "bright", "sáng"))
ex(9, ("你", "nǐ", "you", "bạn"), ("他", "tā", "he", "anh ấy"), ("人", "rén", "person", "người"))
ex(10, ("儿", "ér", "child", "con"), ("兄", "xiōng", "elder brother", "anh"), ("光", "guāng", "light", "ánh sáng"))
ex(11, ("入", "rù", "enter", "vào"), ("內", "nèi", "inside", "trong"), ("全", "quán", "all", "toàn"))
ex(12, ("八", "bā", "eight", "tám"), ("六", "liù", "six", "sáu"), ("分", "fēn", "divide", "chia"))
ex(13, ("同", "tóng", "same", "cùng"), ("网", "wǎng", "net", "lưới"), ("再", "zài", "again", "lại"))
ex(14, ("写", "xiě", "write", "viết"), ("军", "jūn", "army", "quân"), ("冠", "guān", "crown", "mũ"))
ex(15, ("冰", "bīng", "ice", "băng"), ("冷", "lěng", "cold", "lạnh"), ("冬", "dōng", "winter", "mùa đông"))
ex(16, ("几", "jǐ", "how many", "mấy"), ("机", "jī", "machine", "máy"), ("风", "fēng", "wind", "gió"))
ex(17, ("凶", "xiōng", "ominous", "hung"), ("出", "chū", "exit", "ra"), ("画", "huà", "draw", "vẽ"))
ex(18, ("刀", "dāo", "knife", "dao"), ("分", "fēn", "divide", "chia"), ("别", "bié", "other", "khác"))
ex(19, ("力", "lì", "strength", "sức"), ("功", "gōng", "merit", "công"), ("男", "nán", "man", "nam"))
ex(20, ("包", "bāo", "wrap", "bao"), ("句", "jù", "sentence", "câu"), ("勿", "wù", "do not", "đừng"))
ex(21, ("匕", "bǐ", "spoon", "thìa"), ("北", "běi", "north", "bắc"), ("比", "bǐ", "compare", "so"))
ex(22, ("匠", "jiàng", "craftsman", "thợ"), ("区", "qū", "district", "khu"), ("医", "yī", "doctor", "y"))
ex(23, ("匹", "pǐ", "one (horse)", "con (ngựa)"), ("匿", "nì", "hide", "ẩn"), ("匪", "fěi", "bandit", "cướp"))
ex(24, ("十", "shí", "ten", "mười"), ("千", "qiān", "thousand", "nghìn"), ("半", "bàn", "half", "nửa"))
ex(25, ("卜", "bǔ", "divine", "bói"), ("占", "zhān", "occupy", "chiếm"), ("外", "wài", "outside", "ngoài"))
ex(26, ("卫", "wèi", "guard", "vệ"), ("印", "yìn", "seal", "ấn"), ("却", "què", "however", "nhưng"))
ex(27, ("厅", "tīng", "hall", "sảnh"), ("历", "lì", "history", "lịch"), ("厚", "hòu", "thick", "dày"))
ex(28, ("去", "qù", "go", "đi"), ("公", "gōng", "public", "công"), ("台", "tái", "platform", "đài"))
ex(29, ("又", "yòu", "again", "lại"), ("友", "yǒu", "friend", "bạn"), ("对", "duì", "correct", "đúng"))
ex(30, ("口", "kǒu", "mouth", "miệng"), ("吃", "chī", "eat", "ăn"), ("叫", "jiào", "call", "gọi"))
ex(31, ("国", "guó", "country", "nước"), ("回", "huí", "return", "về"), ("园", "yuán", "garden", "vườn"))
ex(32, ("土", "tǔ", "earth", "đất"), ("地", "dì", "ground", "đất"), ("坐", "zuò", "sit", "ngồi"))
ex(33, ("士", "shì", "scholar", "sĩ"), ("壮", "zhuàng", "strong", "tráng"), ("声", "shēng", "sound", "thanh"))
ex(34, ("各", "gè", "each", "mỗi"), ("冬", "dōng", "winter", "đông"), ("条", "tiáo", "strip", "điều"))
ex(35, ("复", "fù", "again", "phục"), ("夏", "xià", "summer", "hè"), ("麦", "mài", "wheat", "lúa mì"))
ex(36, ("夕", "xī", "evening", "chiều"), ("多", "duō", "many", "nhiều"), ("外", "wài", "outside", "ngoài"))
ex(37, ("大", "dà", "big", "lớn"), ("太", "tài", "too", "quá"), ("天", "tiān", "sky", "trời"))
ex(38, ("女", "nǚ", "woman", "nữ"), ("好", "hǎo", "good", "tốt"), ("妈", "mā", "mom", "mẹ"))
ex(39, ("子", "zǐ", "child", "con"), ("学", "xué", "study", "học"), ("字", "zì", "character", "chữ"))
ex(40, ("家", "jiā", "home", "nhà"), ("安", "ān", "peace", "an"), ("字", "zì", "character", "chữ"))
ex(41, ("寸", "cùn", "inch", "tấc"), ("对", "duì", "correct", "đúng"), ("射", "shè", "shoot", "bắn"))
ex(42, ("小", "xiǎo", "small", "nhỏ"), ("少", "shǎo", "few", "ít"), ("尖", "jiān", "sharp", "nhọn"))
ex(43, ("尤", "yóu", "especially", "đặc biệt"), ("就", "jiù", "then", "thì"), ("优", "yōu", "excellent", "ưu"))
ex(44, ("尸", "shī", "corpse", "thây"), ("尽", "jìn", "exhaust", "hết"), ("屋", "wū", "house", "nhà"))
ex(45, ("出", "chū", "go out", "ra"), ("屯", "tún", "village", "đồn"), ("屰", "nì", "rebellious", "nghịch"))
ex(46, ("山", "shān", "mountain", "núi"), ("岛", "dǎo", "island", "đảo"), ("岁", "suì", "years old", "tuổi"))
ex(47, ("川", "chuān", "river", "sông"), ("州", "zhōu", "prefecture", "châu"), ("巡", "xún", "patrol", "tuần"))
ex(48, ("工", "gōng", "work", "công"), ("左", "zuǒ", "left", "trái"), ("巧", "qiǎo", "skillful", "khéo"))
ex(49, ("己", "jǐ", "self", "mình"), ("已", "yǐ", "already", "đã"), ("记", "jì", "remember", "nhớ"))
ex(50, ("巾", "jīn", "cloth", "khăn"), ("市", "shì", "city", "chợ"), ("布", "bù", "cloth", "vải"))
ex(51, ("干", "gān", "dry", "khô"), ("平", "píng", "flat", "phẳng"), ("年", "nián", "year", "năm"))
ex(52, ("幻", "huàn", "illusion", "ảo"), ("幼", "yòu", "young", "trẻ"), ("幽", "yōu", "secluded", "u"))
ex(53, ("广", "guǎng", "wide", "rộng"), ("店", "diàn", "shop", "tiệm"), ("床", "chuáng", "bed", "giường"))
ex(54, ("建", "jiàn", "build", "xây"), ("延", "yán", "extend", "kéo dài"), ("廷", "tíng", "court", "đình"))
ex(55, ("开", "kāi", "open", "mở"), ("弄", "nòng", "alley", "ngõ"), ("弁", "biàn", "cap", "mũ"))
ex(56, ("式", "shì", "style", "thức"), ("武", "wǔ", "martial", "võ"), ("代", "dài", "era", "đại"))
ex(57, ("弓", "gōng", "bow", "cung"), ("张", "zhāng", "open / sheet", "trương"), ("弟", "dì", "younger brother", "em trai"))
ex(58, ("雪", "xuě", "snow", "tuyết"), ("寻", "xún", "seek", "tìm"), ("当", "dāng", "as", "đương"))
ex(59, ("衫", "shān", "shirt", "áo"), ("须", "xū", "must", "phải"), ("形", "xíng", "shape", "hình"))
ex(60, ("行", "xíng", "walk", "đi"), ("得", "dé", "get", "được"), ("很", "hěn", "very", "rất"))
ex(61, ("心", "xīn", "heart", "tim"), ("想", "xiǎng", "think", "nghĩ"), ("忙", "máng", "busy", "bận"))
ex(62, ("我", "wǒ", "I", "tôi"), ("成", "chéng", "become", "thành"), ("战", "zhàn", "war", "chiến"))
ex(63, ("房", "fáng", "room", "phòng"), ("所", "suǒ", "place", "nơi"), ("户", "hù", "household", "hộ"))
ex(64, ("手", "shǒu", "hand", "tay"), ("打", "dǎ", "hit", "đánh"), ("拿", "ná", "take", "cầm"))
ex(65, ("支", "zhī", "branch", "chi"), ("技", "jì", "skill", "kỹ"), ("鼓", "gǔ", "drum", "trống"))
ex(66, ("放", "fàng", "release", "thả"), ("收", "shōu", "receive", "thu"), ("教", "jiào", "teach", "dạy"))
ex(67, ("文", "wén", "writing", "văn"), ("这", "zhè", "this", "này"), ("对", "duì", "correct", "đúng"))
ex(68, ("斗", "dǒu", "dipper", "đấu"), ("料", "liào", "material", "liệu"), ("斜", "xié", "slanted", "nghiêng"))
ex(69, ("斤", "jīn", "catty / axe", "cân"), ("新", "xīn", "new", "mới"), ("听", "tīng", "listen", "nghe"))
ex(70, ("方", "fāng", "square", "phương"), ("放", "fàng", "put", "đặt"), ("旅", "lǚ", "travel", "du lịch"))
ex(71, ("无", "wú", "without", "không"), ("既", "jì", "already", "đã"), ("天", "tiān", "heaven", "trời"))
ex(72, ("日", "rì", "sun / day", "ngày"), ("明", "míng", "bright", "sáng"), ("时", "shí", "time", "thời"))
ex(73, ("曰", "yuē", "say", "nói"), ("更", "gèng", "more", "hơn"), ("曹", "cáo", "a surname", "Tào"))
ex(74, ("月", "yuè", "moon / month", "tháng"), ("明", "míng", "bright", "sáng"), ("有", "yǒu", "have", "có"))
ex(75, ("木", "mù", "tree", "cây"), ("林", "lín", "forest", "rừng"), ("树", "shù", "tree", "cây"))
ex(76, ("次", "cì", "time / next", "lần"), ("欢", "huān", "joy", "vui"), ("歌", "gē", "song", "bài hát"))
ex(77, ("止", "zhǐ", "stop", "dừng"), ("正", "zhèng", "correct", "chính"), ("步", "bù", "step", "bước"))
ex(78, ("死", "sǐ", "die", "chết"), ("残", "cán", "incomplete", "tàn"), ("殊", "shū", "special", "đặc biệt"))
ex(79, ("段", "duàn", "section", "đoạn"), ("没", "méi", "not have", "không có"), ("杀", "shā", "kill", "giết"))
ex(80, ("母", "mǔ", "mother", "mẹ"), ("每", "měi", "every", "mỗi"), ("海", "hǎi", "sea", "biển"))
ex(81, ("比", "bǐ", "compare", "so"), ("毕", "bì", "finish", "xong"), ("昆", "kūn", "elder brother", "huynh"))
ex(82, ("毛", "máo", "fur", "lông"), ("笔", "bǐ", "pen", "bút"), ("尾", "wěi", "tail", "đuôi"))
ex(83, ("氏", "shì", "clan", "thị"), ("民", "mín", "people", "dân"), ("纸", "zhǐ", "paper", "giấy"))
ex(84, ("气", "qì", "air / qi", "khí"), ("汽", "qì", "steam", "hơi"), ("氛", "fēn", "atmosphere", "không khí"))
ex(85, ("水", "shuǐ", "water", "nước"), ("河", "hé", "river", "sông"), ("海", "hǎi", "sea", "biển"))
ex(86, ("火", "huǒ", "fire", "lửa"), ("灯", "dēng", "lamp", "đèn"), ("热", "rè", "hot", "nóng"))
ex(87, ("爪", "zhǎo", "claw", "móng"), ("爬", "pá", "climb", "bò"), ("抓", "zhuā", "grab", "nắm"))
ex(88, ("父", "fù", "father", "cha"), ("爸", "bà", "dad", "bố"), ("爷", "yé", "grandpa", "ông"))
ex(89, ("爻", "yáo", "diagram line", "hào"), ("爽", "shuǎng", "refreshing", "sảng"), ("驳", "bó", "refute", "bác"))
ex(90, ("壮", "zhuàng", "strong", "tráng"), ("状", "zhuàng", "form", "trạng"), ("将", "jiāng", "will", "sẽ"))
ex(91, ("片", "piàn", "slice", "mảnh"), ("牌", "pái", "card", "bài"), ("版", "bǎn", "edition", "bản"))
ex(92, ("牙", "yá", "tooth", "răng"), ("芽", "yá", "sprout", "mầm"), ("穿", "chuān", "wear", "mặc"))
ex(93, ("牛", "niú", "ox", "trâu"), ("特", "tè", "special", "đặc biệt"), ("物", "wù", "thing", "vật"))
ex(94, ("狗", "gǒu", "dog", "chó"), ("猫", "māo", "cat", "mèo"), ("独", "dú", "alone", "một mình"))
ex(95, ("玄", "xuán", "mysterious", "huyền"), ("率", "lǜ", "rate", "suất"), ("畜", "chù", "livestock", "súc"))
ex(96, ("玉", "yù", "jade", "ngọc"), ("现", "xiàn", "appear", "hiện"), ("球", "qiú", "ball", "quả bóng"))
ex(97, ("瓜", "guā", "melon", "dưa"), ("瓣", "bàn", "petal", "cánh"), ("瓢", "piáo", "gourd ladle", "gáo"))
ex(98, ("瓦", "wǎ", "tile", "ngói"), ("瓶", "píng", "bottle", "chai"), ("瓷", "cí", "porcelain", "sứ"))
ex(99, ("甘", "gān", "sweet", "ngọt"), ("甜", "tián", "sweet", "ngọt"), ("甚", "shén", "very", "rất"))
ex(100, ("生", "shēng", "life", "sống"), ("姓", "xìng", "surname", "họ"), ("产", "chǎn", "produce", "sản"))
ex(101, ("用", "yòng", "use", "dùng"), ("甩", "shuǎi", "fling", "vung"), ("甫", "fǔ", "just / a name", "phủ"))
ex(102, ("田", "tián", "field", "ruộng"), ("男", "nán", "man", "nam"), ("电", "diàn", "electricity", "điện"))
ex(103, ("楚", "chǔ", "clear", "sở"), ("疏", "shū", "sparse", "thưa"), ("疑", "yí", "doubt", "nghi"))
ex(104, ("病", "bìng", "illness", "bệnh"), ("疼", "téng", "ache", "đau"), ("痛", "tòng", "pain", "đau"))
ex(105, ("登", "dēng", "climb", "leo"), ("发", "fā", "send / hair", "phát"), ("癸", "guǐ", "10th stem", "quý"))
ex(106, ("白", "bái", "white", "trắng"), ("的", "de", "of / 's", "của"), ("百", "bǎi", "hundred", "trăm"))
ex(107, ("皮", "pí", "skin", "da"), ("彼", "bǐ", "that", "kia"), ("波", "bō", "wave", "sóng"))
ex(108, ("盘", "pán", "plate", "đĩa"), ("盛", "shèng", "flourishing", "thịnh"), ("盒", "hé", "box", "hộp"))
ex(109, ("目", "mù", "eye", "mắt"), ("看", "kàn", "look", "nhìn"), ("眼", "yǎn", "eye", "mắt"))
ex(110, ("矛", "máo", "spear", "mâu"), ("柔", "róu", "soft", "mềm"), ("务", "wù", "affair", "vụ"))
ex(111, ("矢", "shǐ", "arrow", "tên"), ("知", "zhī", "know", "biết"), ("短", "duǎn", "short", "ngắn"))
ex(112, ("石", "shí", "stone", "đá"), ("破", "pò", "break", "vỡ"), ("砂", "shā", "sand", "cát"))
ex(113, ("示", "shì", "show", "bày"), ("社", "shè", "society", "xã"), ("神", "shén", "god", "thần"))
ex(114, ("禹", "yǔ", "Yu the Great", "Vũ"), ("离", "lí", "leave", "ly"), ("禽", "qín", "bird", "cầm"))
ex(115, ("禾", "hé", "grain", "lúa"), ("和", "hé", "and / peace", "hòa"), ("秋", "qiū", "autumn", "thu"))
ex(116, ("穴", "xué", "cave", "hang"), ("空", "kōng", "empty", "không"), ("穿", "chuān", "wear", "mặc"))
ex(117, ("立", "lì", "stand", "đứng"), ("位", "wèi", "seat", "vị"), ("音", "yīn", "sound", "âm"))
ex(118, ("竹", "zhú", "bamboo", "tre"), ("笑", "xiào", "laugh", "cười"), ("笔", "bǐ", "pen", "bút"))
ex(119, ("米", "mǐ", "rice", "gạo"), ("粉", "fěn", "powder", "bột"), ("糖", "táng", "sugar", "đường"))
ex(120, ("丝", "sī", "silk", "tơ"), ("红", "hóng", "red", "đỏ"), ("经", "jīng", "pass through", "kinh"))
ex(121, ("缺", "quē", "lack", "thiếu"), ("罐", "guàn", "can", "lon"), ("陶", "táo", "pottery", "gốm"))
ex(122, ("网", "wǎng", "net", "lưới"), ("罗", "luó", "collect", "la"), ("罚", "fá", "punish", "phạt"))
ex(123, ("羊", "yáng", "sheep", "dê"), ("美", "měi", "beautiful", "đẹp"), ("群", "qún", "group", "nhóm"))
ex(124, ("羽", "yǔ", "feather", "lông vũ"), ("习", "xí", "practice", "tập"), ("翻", "fān", "flip", "lật"))
ex(125, ("老", "lǎo", "old", "già"), ("考", "kǎo", "test", "thi"), ("者", "zhě", "one who", "giả"))
ex(126, ("而", "ér", "and / yet", "mà"), ("耐", "nài", "endure", "chịu"), ("需", "xū", "need", "cần"))
ex(127, ("耕", "gēng", "plow", "cày"), ("耗", "hào", "consume", "hao"), ("耦", "ǒu", "pair", "ngẫu"))
ex(128, ("耳", "ěr", "ear", "tai"), ("听", "tīng", "listen", "nghe"), ("取", "qǔ", "take", "lấy"))
ex(129, ("笔", "bǐ", "pen", "bút"), ("律", "lǜ", "law", "luật"), ("建", "jiàn", "build", "xây"))
ex(130, ("肉", "ròu", "meat", "thịt"), ("肚", "dù", "belly", "bụng"), ("腿", "tuǐ", "leg", "chân"))
ex(131, ("臣", "chén", "minister", "thần"), ("卧", "wò", "lie down", "nằm"), ("临", "lín", "face", "lâm"))
ex(132, ("自", "zì", "self", "tự"), ("息", "xī", "rest", "nghỉ"), ("鼻", "bí", "nose", "mũi"))
ex(133, ("至", "zhì", "arrive", "đến"), ("到", "dào", "to / arrive", "tới"), ("致", "zhì", "cause", "gây"))
ex(134, ("臼", "jiù", "mortar", "cối"), ("旧", "jiù", "old", "cũ"), ("鼠", "shǔ", "rat", "chuột"))
ex(135, ("舌", "shé", "tongue", "lưỡi"), ("话", "huà", "speech", "lời"), ("乱", "luàn", "chaos", "loạn"))
ex(136, ("舞", "wǔ", "dance", "múa"), ("舜", "shùn", "Shun", "Thuấn"), ("杰", "jié", "outstanding", "kiệt"))
ex(137, ("舟", "zhōu", "boat", "thuyền"), ("船", "chuán", "ship", "tàu"), ("航", "háng", "navigate", "hàng"))
ex(138, ("良", "liáng", "good", "lương"), ("很", "hěn", "very", "rất"), ("限", "xiàn", "limit", "hạn"))
ex(139, ("色", "sè", "color", "màu"), ("艳", "yàn", "gorgeous", "rực"), ("绝", "jué", "absolute", "tuyệt"))
ex(140, ("花", "huā", "flower", "hoa"), ("草", "cǎo", "grass", "cỏ"), ("茶", "chá", "tea", "trà"))
ex(141, ("虎", "hǔ", "tiger", "cọp"), ("虑", "lǜ", "consider", "lo"), ("虚", "xū", "empty", "hư"))
ex(142, ("虫", "chóng", "insect", "sâu"), ("虽", "suī", "although", "tuy"), ("蛇", "shé", "snake", "rắn"))
ex(143, ("血", "xuè", "blood", "máu"), ("众", "zhòng", "crowd", "chúng"), ("衅", "xìn", "quarrel", "hấn"))
ex(144, ("行", "xíng", "go", "đi"), ("街", "jiē", "street", "phố"), ("术", "shù", "art", "thuật"))
ex(145, ("衣", "yī", "clothes", "áo"), ("表", "biǎo", "surface", "bề mặt"), ("袋", "dài", "bag", "túi"))
ex(146, ("西", "xī", "west", "tây"), ("要", "yào", "want", "muốn"), ("覆", "fù", "cover", "phủ"))
ex(147, ("见", "jiàn", "see", "thấy"), ("现", "xiàn", "appear", "hiện"), ("觉", "jué", "feel", "cảm"))
ex(148, ("角", "jiǎo", "horn / corner", "góc"), ("解", "jiě", "untie", "giải"), ("触", "chù", "touch", "chạm"))
ex(149, ("言", "yán", "speech", "lời"), ("说", "shuō", "say", "nói"), ("话", "huà", "words", "lời"))
ex(150, ("谷", "gǔ", "valley", "cốc"), ("欲", "yù", "desire", "muốn"), ("容", "róng", "contain", "dung"))
ex(151, ("豆", "dòu", "bean", "đậu"), ("登", "dēng", "climb", "leo"), ("短", "duǎn", "short", "ngắn"))
ex(152, ("家", "jiā", "home", "nhà"), ("象", "xiàng", "elephant", "voi"), ("豪", "háo", "heroic", "hào"))
ex(153, ("豹", "bào", "leopard", "báo"), ("貌", "mào", "appearance", "dáng"), ("貉", "hé", "raccoon dog", "lạc"))
ex(154, ("贝", "bèi", "shell / money", "sò"), ("贵", "guì", "expensive", "đắt"), ("买", "mǎi", "buy", "mua"))
ex(155, ("赤", "chì", "red", "đỏ"), ("赫", "hè", "awe-inspiring", "hách"), ("赦", "shè", "pardon", "xá"))
ex(156, ("走", "zǒu", "walk", "đi"), ("起", "qǐ", "rise", "dậy"), ("超", "chāo", "super", "siêu"))
ex(157, ("足", "zú", "foot", "chân"), ("跑", "pǎo", "run", "chạy"), ("路", "lù", "road", "đường"))
ex(158, ("身", "shēn", "body", "thân"), ("射", "shè", "shoot", "bắn"), ("躺", "tǎng", "lie", "nằm"))
ex(159, ("车", "chē", "vehicle", "xe"), ("转", "zhuǎn", "turn", "chuyển"), ("轻", "qīng", "light", "nhẹ"))
ex(160, ("辛", "xīn", "bitter", "cay"), ("辜", "gū", "guilt", "cô"), ("辟", "pì", "open up", "tịch"))
ex(161, ("辰", "chén", "earthly branch", "thìn"), ("振", "zhèn", "shake", "chấn"), ("晨", "chén", "morning", "sáng"))
ex(162, ("过", "guò", "pass", "qua"), ("进", "jìn", "enter", "vào"), ("道", "dào", "way", "đạo"))
ex(163, ("都", "dōu", "all / capital", "đều"), ("那", "nà", "that", "kia"), ("部", "bù", "part", "bộ"))
ex(164, ("酒", "jiǔ", "alcohol", "rượu"), ("配", "pèi", "match", "phối"), ("醉", "zuì", "drunk", "say"))
ex(165, ("番", "fān", "time / foreign", "phiên"), ("释", "shì", "explain", "thích"), ("悉", "xī", "know fully", "tất"))
ex(166, ("里", "lǐ", "inside / village", "trong"), ("野", "yě", "wild", "hoang"), ("重", "zhòng", "heavy", "nặng"))
ex(167, ("金", "jīn", "gold / metal", "vàng"), ("钱", "qián", "money", "tiền"), ("银", "yín", "silver", "bạc"))
ex(168, ("长", "cháng", "long", "dài"), ("张", "zhāng", "sheet", "trương"), ("套", "tào", "set", "bộ"))
ex(169, ("门", "mén", "door", "cửa"), ("间", "jiān", "between", "gian"), ("问", "wèn", "ask", "hỏi"))
ex(170, ("阳", "yáng", "yang / sun", "dương"), ("阴", "yīn", "yin / shade", "âm"), ("队", "duì", "team", "đội"))
ex(171, ("隶", "lì", "clerical / belong", "lệ"), ("逮", "dǎi", "catch", "bắt"), ("康", "kāng", "health", "khang"))
ex(172, ("雀", "què", "sparrow", "sẻ"), ("集", "jí", "gather", "tập"), ("难", "nán", "difficult", "khó"))
ex(173, ("雨", "yǔ", "rain", "mưa"), ("雪", "xuě", "snow", "tuyết"), ("零", "líng", "zero", "không"))
ex(174, ("青", "qīng", "blue-green", "xanh"), ("静", "jìng", "quiet", "tĩnh"), ("情", "qíng", "feeling", "tình"))
ex(175, ("非", "fēi", "not", "không"), ("靠", "kào", "rely", "dựa"), ("罪", "zuì", "crime", "tội"))
ex(176, ("面", "miàn", "face", "mặt"), ("面包", "miàn bāo", "bread", "bánh mì"), ("对面", "duì miàn", "opposite", "đối diện"))
ex(177, ("革", "gé", "leather", "da"), ("鞋", "xié", "shoe", "giày"), ("鞭", "biān", "whip", "roi"))
ex(178, ("韦", "wéi", "leather", "vi"), ("韩", "hán", "Korea / Han", "Hàn"), ("违", "wéi", "violate", "vi"))
ex(179, ("韭", "jiǔ", "leek", "hẹ"), ("韭菜", "jiǔ cài", "chives", "hẹ"), ("韰", "xiè", "harmonize", "hài"))
ex(180, ("音", "yīn", "sound", "âm"), ("意", "yì", "meaning", "ý"), ("韵", "yùn", "rhyme", "vận"))
ex(181, ("页", "yè", "page / head", "trang"), ("顺", "shùn", "along", "thuận"), ("题", "tí", "topic", "đề"))
ex(182, ("风", "fēng", "wind", "gió"), ("飘", "piāo", "drift", "bay"), ("台风", "tái fēng", "typhoon", "bão"))
ex(183, ("飞", "fēi", "fly", "bay"), ("飞翔", "fēi xiáng", "soar", "bay lượn"), ("飞机", "fēi jī", "airplane", "máy bay"))
ex(184, ("食", "shí", "eat", "ăn"), ("饭", "fàn", "rice / meal", "cơm"), ("饿", "è", "hungry", "đói"))
ex(185, ("首", "shǒu", "head", "đầu"), ("道", "dào", "way", "đạo"), ("导", "dǎo", "lead", "dẫn"))
ex(186, ("香", "xiāng", "fragrant", "thơm"), ("馨", "xīn", "aromatic", "hinh"), ("香水", "xiāng shuǐ", "perfume", "nước hoa"))
ex(187, ("马", "mǎ", "horse", "ngựa"), ("骑", "qí", "ride", "cưỡi"), ("驻", "zhù", "station", "trú"))
ex(188, ("骨", "gǔ", "bone", "xương"), ("滑", "huá", "slippery", "trơn"), ("髓", "suǐ", "marrow", "tủy"))
ex(189, ("高", "gāo", "tall", "cao"), ("亮", "liàng", "bright", "sáng"), ("亭", "tíng", "pavilion", "đình"))
ex(190, ("发", "fà", "hair", "tóc"), ("鬓", "bìn", "sideburns", "mai tóc"), ("髦", "máo", "fashionable", "mao"))
ex(191, ("斗", "dòu", "fight", "đấu"), ("闹", "nào", "noisy", "ồn"), ("哄", "hōng", "uproar", "om"))
ex(192, ("鬯", "chàng", "sacrificial wine", "rượu tế"), ("郁", "yù", "lush", "uất"))
ex(193, ("融", "róng", "melt", "dung"), ("隔", "gé", "separate", "cách"), ("锅", "guō", "wok", "nồi"))
ex(194, ("鬼", "guǐ", "ghost", "ma"), ("魂", "hún", "soul", "hồn"), ("魔", "mó", "demon", "ma"))
ex(195, ("鱼", "yú", "fish", "cá"), ("鲜", "xiān", "fresh", "tươi"), ("渔", "yú", "fishing", "ngư"))
ex(196, ("鸟", "niǎo", "bird", "chim"), ("鸡", "jī", "chicken", "gà"), ("鸭", "yā", "duck", "vịt"))
ex(197, ("盐", "yán", "salt", "muối"), ("卤", "lǔ", "brine", "nước muối"), ("碱", "jiǎn", "alkali", "kiềm"))
ex(198, ("鹿", "lù", "deer", "hươu"), ("麒", "qí", "qilin", "kỳ"), ("丽", "lì", "beautiful", "lệ"))
ex(199, ("麦", "mài", "wheat", "lúa mì"), ("面", "miàn", "noodles / flour", "mì"), ("麸", "fū", "bran", "cám"))
ex(200, ("麻", "má", "hemp", "gai"), ("摩", "mó", "rub", "mài"), ("磨", "mó", "grind", "mài"))
ex(201, ("黄", "huáng", "yellow", "vàng"), ("黄金", "huáng jīn", "gold", "vàng"), ("横", "héng", "horizontal", "ngang"))
ex(202, ("黍", "shǔ", "millet", "kê"), ("黎", "lí", "black / many", "lê"), ("黏", "nián", "sticky", "dính"))
ex(203, ("黑", "hēi", "black", "đen"), ("墨", "mò", "ink", "mực"), ("默", "mò", "silent", "im"))
ex(204, ("黼", "fǔ", "embroidered axe", "phủ"), ("黻", "fú", "ceremonial stitch", "phất"))
ex(205, ("黾", "mǐn", "frog", "ếch"), ("绳", "shéng", "rope", "dây"), ("蝇", "yíng", "fly (insect)", "ruồi"))
ex(206, ("鼎", "dǐng", "tripod", "đỉnh"), ("鼎盛", "dǐng shèng", "heyday", "thịnh vượng"))
ex(207, ("鼓", "gǔ", "drum", "trống"), ("喜", "xǐ", "joy", "vui"), ("瞽", "gǔ", "blind musician", "cổ"))
ex(208, ("鼠", "shǔ", "rat", "chuột"), ("窜", "cuàn", "flee", "trốn"), ("鼹", "yǎn", "mole", "chuột chũi"))
ex(209, ("鼻", "bí", "nose", "mũi"), ("鼾", "hān", "snore", "ngáy"), ("嗅", "xiù", "smell", "ngửi"))
ex(210, ("齐", "qí", "even / neat", "đều"), ("济", "jì", "aid", "tế"), ("剂", "jì", "dose", "liều"))
ex(211, ("齿", "chǐ", "tooth", "răng"), ("龄", "líng", "age", "tuổi"), ("啮", "niè", "gnaw", "gặm"))
ex(212, ("龙", "lóng", "dragon", "rồng"), ("笼", "lóng", "cage", "lồng"), ("聋", "lóng", "deaf", "điếc"))
ex(213, ("龟", "guī", "turtle", "rùa"), ("阄", "jiū", "lot (draw)", "thăm"))
ex(214, ("龠", "yuè", "flute", "sáo"), ("钥", "yào", "key", "chìa khóa"))

# Ensure every radical has ≥2 examples.
missing = [i for i in range(1, 215) if len(EXAMPLES.get(i, [])) < 2]
assert not missing, f"missing examples: {missing}"

STORIES: dict[int, tuple[str, str]] = {}

def st(n: int, en: str, vi: str) -> None:
    STORIES[n] = (en, vi)

st(1, "A single horizontal stroke — the horizon, the number one, the start of writing.", "Một nét ngang — đường chân trời, số một, khởi đầu của chữ viết.")
st(9, "A person in profile: head, body, two legs. Standing beside another character it often becomes 亻.", "Người nhìn nghiêng: đầu, thân, hai chân. Khi đứng bên trái thường viết 亻.")
st(30, "An open mouth. Characters with 口 talk, eat, shout, or name things you say.", "Một cái miệng mở. Chữ có 口 thường nói, ăn, gọi, hoặc đặt tên.")
st(32, "A lump of earth, the ground underfoot. Plants, places, and buildings grow from 土.", "Một nắm đất. Cây, chỗ, nhà cửa đều mọc lên từ 土.")
st(38, "Kneeling figure of a woman. Many family and feeling words keep her on the left.", "Dáng người nữ quỳ. Nhiều chữ về gia đình và cảm xúc giữ 女 bên trái.")
st(61, "The heart, sometimes written 忄 on the left. Feelings, thoughts, and will live here.", "Trái tim, khi đứng bên trái viết 忄. Cảm xúc, suy nghĩ, ý chí ở đây.")
st(64, "A hand with fingers. As 扌 on the left it turns a character into an action you do.", "Một bàn tay. Dạng 扌 bên trái biến chữ thành hành động.")
st(72, "A circle with a mark — the sun, and also 'day'. Time-words glow with 日.", "Hình tròn có điểm — mặt trời, cũng là 'ngày'. Chữ về thời gian mang 日.")
st(75, "A tree: roots, trunk, branches. Forests are 木 beside 木.", "Một cái cây: rễ, thân, cành. Rừng là 木 đứng cạnh 木.")
st(85, "Water flowing. As 氵 on the left it marks rivers, seas, washing, and anything wet.", "Nước chảy. Dạng 氵 bên trái đánh dấu sông, biển, rửa, mọi thứ ướt.")
st(86, "Flames leaping. Four dots 灬 under a character often mean heat or cooking.", "Ngọn lửa. Bốn chấm 灬 dưới chữ thường nghĩa nóng hoặc nấu.")
st(94, "A dog. On the left it shrinks to 犭 and keeps company with animals and wildness.", "Con chó. Bên trái thu thành 犭, đi cùng thú vật và sự hoang dã.")
st(140, "Grass sprouting. The 'grass head' 艹 sits on plants, teas, and flowers.", "Cỏ nảy mầm. 'Đầu cỏ' 艹 ngồi trên cây, trà, hoa.")
st(149, "Words coming out of a mouth. Simplified, speech hides as 讠 on the left.", "Lời từ miệng. Giản thể, lời nói ẩn thành 讠 bên trái.")
st(167, "Nuggets of metal. Gold, money, and tools take 钅 on the left in simplified script.", "Thỏi kim loại. Vàng, tiền, dụng cụ mang 钅 bên trái ở chữ giản.")
st(212, "The dragon: rain-bringer, emperor's emblem, the most auspicious of beasts.", "Rồng: mang mưa, biểu tượng đế vương, linh thú cát tường nhất.")

def default_story(en: str, vi: str) -> tuple[str, str]:
    return (
        f"This radical pictures “{en}”. Once you see it, related characters start to cluster in meaning.",
        f"Bộ thủ này vẽ “{vi}”. Nhìn ra nó, các chữ cùng họ nghĩa sẽ hiện ra thành nhóm.",
    )


def frequency(i: int) -> str:
    if i in CORE:
        return "core"
    if i in COMMON:
        return "common"
    return "rare"


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__ or "Generate radicals.json")
    ap.add_argument("--gist", default=None, help="Path to optional gist provenance JSON")
    ap.add_argument("--nicolas", default=None, help="Path to optional Nicolas provenance JSON")
    args = ap.parse_args()

    gist_path = Path(args.gist) if args.gist else None
    nicolas_path = Path(args.nicolas) if args.nicolas else None
    gist = json.loads(gist_path.read_text()) if gist_path and gist_path.exists() else []
    nicolas = json.loads(nicolas_path.read_text()) if nicolas_path and nicolas_path.exists() else {}
    gist_by_id = {int(r["id"]): r for r in gist}

    out = []
    for i in range(1, 215):
        ch = KANGXI[i - 1]
        en = EN[i - 1]
        vi = VI[i - 1]
        story = STORIES.get(i) or default_story(en, vi)
        nicolas_entry = nicolas.get(ch) or nicolas.get(SIMPLIFIED.get(i, ""), {})
        pinyin = PINYIN[i - 1]
        if nicolas_entry.get("pinyin"):
            # Keep official Kangxi reading; nicolas is a cross-check only.
            pass
        examples = [
            {
                "character": a,
                "pinyin": b,
                "english": c,
                "vietnamese": d,
            }
            for a, b, c, d in EXAMPLES[i]
        ]
        item = {
            "id": i,
            "character": ch,
            "simplified": SIMPLIFIED.get(i),
            "variant": VARIANT.get(i),
            "pinyin": pinyin,
            "english": en,
            "vietnamese": vi,
            "strokes": STROKES[i - 1],
            "frequency": frequency(i),
            "icon": ICON[i - 1],
            "writerChar": WRITER.get(i, ch),
            "story": {"en": story[0], "vi": story[1]},
            "examples": examples,
            "illustration": None,
        }
        # Drop null simplified to keep JSON tight
        if item["simplified"] is None:
            del item["simplified"]
        if item["variant"] is None:
            del item["variant"]
        out.append(item)

    dest = Path(__file__).resolve().parent.parent / "src" / "data" / "radicals.json"
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_text(json.dumps(out, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    # Validate
    assert len(out) == 214
    ids = [r["id"] for r in out]
    assert ids == list(range(1, 215))
    chars = [r["character"] for r in out]
    assert len(set(chars)) == 214
    for r in out:
        assert len(r["examples"]) >= 2
        assert r["pinyin"]
        assert r["english"]
        assert r["vietnamese"]
        assert 1 <= r["strokes"] <= 17
    print(f"wrote {len(out)} radicals -> {dest} ({dest.stat().st_size} bytes)")
    print("strokes histogram:", {s: sum(1 for r in out if r["strokes"] == s) for s in range(1, 18)})
    print("freq:", {k: sum(1 for r in out if r["frequency"] == k) for k in ("core", "common", "rare")})
    _ = gist_by_id  # used as provenance, not required for output


if __name__ == "__main__":
    main()
