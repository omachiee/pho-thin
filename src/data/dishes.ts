import { Dish } from '../types';

export const DISHES: Dish[] = [
  // 5 MÓN NỔI BẬT TRANG CHỦ
  {
    id: 'pho-tai-chin',
    name: {
      vi: 'Phở Tái Chín (Đặc Sản Gia Truyền)',
      en: 'Rare & Well-Done Beef Pho (Signature)',
      zh: '半生半熟牛肉粉（镇店之宝）',
      ko: '타이 친 쌀국수 (생육 & 익힌육 반반 시그니처)',
    },
    category: 'pho',
    price: 80000,
    formattedPrice: '80.000',
    image: '/src/assets/images/regenerated_image_1790911567588.png',
    isSignature: true,
    isFeatured: true,
    shortDescription: {
      vi: 'Sự kết hợp hoàn hảo giữa nạm bò chín mềm ngậy và thịt bò tái tươi rói đập dập trên thớt gỗ nghiến, ngập trong nước dùng thanh ngọt thơm nức.',
      en: 'The harmonious union of tender well-done flank and flash-blanched medium rare beef over fresh silky noodles with fragrant clear broth.',
      zh: '软烂香醇的熟牛腩与案板轻砸的极鲜半生嫩牛肉完美相融，浇入熬煮12小时的清甜秘制牛骨老汤。',
      ko: '부드러운 양지 익힌 고기와 신선한 생 쇠고기의 완벽한 조화, 12시간 우려낸 깊은 맑은 육수.',
    },
    fullDescription: {
      vi: 'Phở Tái Chín là linh hồn và biểu tượng của Phở Thìn Bờ Hồ suốt từ năm 1955 đến nay. Từng miếng thịt nạm bò được luộc chín tới, thái mỏng tang giữ trọn độ ngậy thơm; trong khi thịt thăn bò tươi đỏ hồng được đặt lên thớt gỗ nghiến dằn nhẹ cho mềm rồi chần qua nước sôi ùng ục, giữ trọn vị ngọt tự nhiên ngọt lịm. Nước dùng nấu hoàn toàn bằng xương ống bò tươi, không pha mì chính lợ, thanh trong mà ngọt sâu cuống họng, rợp màu xanh mướt của hành hoa thái nhỏ.',
      en: 'The legendary centerpiece of Pho Thin Bo Ho since 1955. Slices of tender well-done beef brisket meet vibrant fresh beef tenderloin lightly tenderized on ironwood blocks, briefly scalded to lock in juicy sweetness. The broth is simmered purely from marrow bones without artificial sweetness—crystal-clear, deeply comforting, blanketed by a lush canopy of freshly chopped scallions.',
      zh: '1955年以来本店最具代表性的灵魂之作。熟牛腩香滑不腻，鲜红嫩牛肉置于木砧板轻拍致柔，滚汤烫至粉红，锁住最天然的甘美肉汁。清亮老汤无味精涩口感，配以翠绿香葱，回味绵长。',
      ko: '1955년부터 이어온 퍼틴 보 호의 정수. 부드러운 소고기 수육과 주문 즉시 살짝 데쳐내는 신선한 생소고기의 조화. 조미료 없이 사골만으로 우려낸 맑고 깊은 국물에 싱그러운 쪽파가 가득합니다.',
    },
    ingredients: {
      vi: [
        'Bánh phở tươi tráng thủ công hàng ngày',
        'Thịt thăn bò tươi thái mỏng đập dập',
        'Nạm bò hoa luộc mềm thơm',
        'Nước hầm xương ống bò 12 giờ bí truyền',
        'Hành hoa, ngò gai tươi xanh Bờ Hồ',
        'Gừng nướng, hoa hồi, thảo quả Tây Bắc'
      ],
      en: [
        'Daily artisanal fresh rice noodles',
        'Hand-tenderized fresh beef tenderloin',
        'Slow-poached prime beef flank',
        '12-hour simmered pure beef marrow broth',
        'Freshly chopped Hanoi scallions and culantro',
        'Roasted ginger, star anise, and black cardamom'
      ],
      zh: [
        '每日清晨纯手工现制爽滑鲜米粉',
        '严选鲜嫩黄牛里脊，轻拍致柔',
        '传统慢火白切牛腩片',
        '12小时纯牛筒骨慢炖祖传清汤',
        '还剑湖特色翠绿细香葱与刺芹',
        '炭火烤老姜、八角、草果等天然草本'
      ],
      ko: [
        '매일 새벽 수제 공정으로 만드는 쫄깃한 생면',
        '주문 즉시 부드럽게 두드려 데치는 신선한 생소고기',
        '고소하고 부드러운 양지 수육',
        '12시간 우려낸 100% 한우급 사골 맑은 육수',
        '하노이 특산 신선한 쪽파와 고수',
        '구운 생강, 팔각, 정향 등 천연 향신료'
      ]
    },
    preparationNote: {
      vi: 'Phở tái chín được chần nóng hổi tại chỗ, chan nước dùng sôi sùng sục 98°C bốc khói nghi ngút.',
      en: 'Prepared on-demand and splashed with bubbling 98°C broth straight from the copper kettle.',
      zh: '现点现烫，以98°C滚沸骨汤大勺淋注，香气扑鼻。',
      ko: '주문 즉시 98도의 펄펄 끓는 육수를 부어 가장 신선하게 제공합니다.',
    }
  },
  {
    id: 'pho-sot-vang',
    name: {
      vi: 'Phở Bò Sốt Vang Cổ Điển',
      en: 'Classic Red Wine Stewed Beef Pho',
      zh: '法式红酒炖牛肉粉',
      ko: '퍼 보 솟 방 (클래식 와인 소고기 조림 쌀국수)',
    },
    category: 'pho',
    price: 85000,
    formattedPrice: '85.000',
    image: '/src/assets/images/regenerated_image_1790953552668.jpg',
    isSignature: false,
    isFeatured: true,
    shortDescription: {
      vi: 'Những dẻ sườn và gân bò mềm tan hầm cùng vang chát, thảo mộc quý và gấc đỏ tươi, tạo nên màu sắc hổ phách và vị nồng ấm quyến rũ.',
      en: 'Tender beef shank and tendon slow-simmered with wine, precious herbs, and gac fruit for a warm amber hue and deeply comforting richness.',
      zh: '精选牛腱肉与牛筋，慢火配红酒、草果与红木子焖炖至软糯化渣，汤色红润诱人，香气馥郁。',
      ko: '레드와인과 고급 허브로 부드럽게 조려낸 소고기 갈비와 스지, 감미로운 풍미가 일품인 쌀국수.',
    },
    fullDescription: {
      vi: 'Món Phở Bò Sốt Vang mang dấu ấn văn hóa giao thoa Á - Âu đặc trưng của người Hà Nội thời kỳ đầu thế kỷ 20. Thịt bò bắp và dẻ sườn có lẫn chút gân được thái quân cờ, ướp cùng rượu vang, quế, hồi, thảo quả và dầu điều gấc tự nhiên trước khi xào săn và hầm nhừ suốt nhiều tiếng đồng hồ. Khi chan nước phở, từng muỗng sốt vang đỏ óng ánh hòa tan vào nước dùng thanh trong tạo nên hương vị bùi béo mà không ngấy, ăn kèm quẩy giòn và chút tiêu đen xay mịn thì tuyệt đỉnh.',
      en: 'A classic testament to the Eurasian culinary rendezvous of 20th-century Hanoi. Chunks of beef brisket and tendon are marinated in fine wine, cinnamon, star anise, and natural annatto before slow-braising until spoon-tender. When ladled over rice noodles with rich pho broth, it delivers an amber, velvety broth that warms every chilly Hanoi morning.',
      zh: '融合20世纪初河内东西饮食文化的经典代表。方块牛腩带筋经红酒、桂皮、八角等香料浸润入味，文火煨至酥软。浓郁红亮的红酒炖汁融入清鲜高汤，醇厚温暖，搭配酥脆油条更是绝配。',
      ko: '20세기 초 하노이의 동서양 식문화가 조화된 클래식 메뉴. 와인과 시나몬으로 오랜 시간 조려낸 소고기가 입안에서 사르르 녹아내리며 깊고 진한 맛을 선사합니다.',
    },
    ingredients: {
      vi: ['Bò bắp hoa và gân giòn thái quân cờ', 'Rượu vang đỏ thơm nồng', 'Gấc tươi tạo màu hổ phách', 'Bánh phở tươi mỏng mượt', 'Nước dùng bò nguyên chất', 'Rau mùi và tiêu đen Phú Quốc'],
      en: ['Cubed beef shank & tender tendon', 'Fragrant red wine marinade', 'Fresh gac fruit for amber hue', 'Silky fresh pho noodles', 'Pure beef broth reduction', 'Fresh cilantro & cracked black pepper'],
      zh: ['带筋牛腱与精选牛腩块', '香醇陈年红酒', '天然木鳖果与红油', '细滑鲜河粉', '慢炖纯牛骨底汤', '香菜末与现磨黑胡椒'],
      ko: ['큐브형 소고기 사태와 쫀득한 스지', '숙성 레드와인', '천연 과실 착색 오일', '매일 만드는 쌀국수 생면', '진한 사골 육수', '고수와 통후추']
    }
  },
  {
    id: 'pho-suon-cay',
    name: {
      vi: 'Phở Sườn Cây Đặc Biệt',
      en: 'Prime Beef Short Rib Pho Special',
      zh: '特选整根大牛肋排粉',
      ko: '특선 왕 소갈비 쌀국수',
    },
    category: 'pho',
    price: 95000,
    formattedPrice: '95.000',
    image: '/src/assets/images/hero_pho_thin_bo_ho_1790702796317.jpg',
    isSignature: false,
    isFeatured: true,
    shortDescription: {
      vi: 'Tảng sườn bò cây cỡ lớn ninh nhừ mềm róc xương, béo ngậy ngọt thịt, kết hợp cùng nước dùng thanh tao nức tiếng 70 năm.',
      en: 'Magnificent whole beef short rib simmered until fork-tender, dripping with savory marrow essence in our 70-year secret broth.',
      zh: '整根大号黄牛肋排慢火文炖至骨肉轻易分离，肉质鲜美丰腴，搭配70年传家清洌鲜汤。',
      ko: '부드럽게 발라지는 큼직한 통 소갈비 한 대가 통째로 들어간 프리미엄 보양 쌀국수.',
    },
    fullDescription: {
      vi: 'Phở Sườn Cây Đặc Biệt là món ăn dành riêng cho những thực khách muốn trải nghiệm sự thịnh soạn trọn vẹn. Mỗi bát được phục vụ một dẻ sườn cây bò to bản ninh liên tục từ 4 đến 5 tiếng trong nồi nước hầm thảo mộc. Thịt sườn mềm đến mức có thể dùng đũa tách nhẹ là róc khỏi xương, mọng nước và ngọt lịm. Chấm cùng tương ớt xào nhà làm và chút giấm tỏi ớt gia truyền thì không gì sánh bằng.',
      en: 'An indulgent, grand feast designed for true gourmands. Each bowl features a massive prime beef rib slow-cooked for hours inside herbs-infused bone broth until it falls off the bone at the mere touch of chopsticks, paired with our house-made fermented garlic vinegar.',
      zh: '专为美食鉴赏家打造的豪华盛宴。碗中豪迈盛放一整根大牛肋排，与名贵香草骨汤同煨数小时，肉质酥嫩至极，筷子轻拨即可脱骨，搭配秘制蒜醋与手工辣椒酱，令人击节赞叹。',
      ko: '미식가를 위한 특별한 보양식. 큼직한 소갈비 통뼈를 몇 시간 동안 특제 육수에 삶아 젓가락만으로도 부드럽게 뼈에서 분리됩니다. 수제 마늘식초와 매콤한 칠리소스와 찰떡궁합입니다.',
    },
    ingredients: {
      vi: ['Dẻ sườn cây bò tơ nguyên khối', 'Bánh phở tươi truyền thống', 'Nước dùng xương hầm tinh hoa', 'Hành lá, hành củ chần tái', 'Giấm tỏi ớt ủ chum sành'],
      en: ['Whole beef short rib cut', 'Artisanal fresh pho noodles', 'Master 12-hour bone broth', 'Scallions & blanched spring onion bulbs', 'Clay-pot cured garlic chili vinegar'],
      zh: ['整根严选黄牛肋排', '现蒸爽口河粉', '精炼十二小时骨汤', '香葱与烫嫩葱头', '土坛陈酿蒜蓉辣椒醋'],
      ko: ['통 소갈비', '신선한 쌀국수 생면', '깊은 사골 육수', '살짝 데친 대파와 쪽파', '항아리 숙성 마늘고추식초']
    }
  },
  {
    id: 'pho-xao-bo',
    name: {
      vi: 'Phở Xào Bò Áp Chảo Giòn Mềm',
      en: 'Wok-Tossed Crispy & Tender Beef Pho',
      zh: '镬气爆炒牛肉河粉（焦香微脆）',
      ko: '퍼 싸오 보 (불향 가득 볶음 쌀국수)',
    },
    category: 'pho',
    price: 85000,
    formattedPrice: '85.000',
    image: '/src/assets/images/regenerated_image_1790967147601.jpg',
    isSignature: false,
    isFeatured: true,
    shortDescription: {
      vi: 'Bánh phở áp chảo gang vàng rụm cháy cạnh bên ngoài nhưng mềm mướt bên trong, xào cùng thịt bò tươi, cải ngọt xanh và nước sốt sền sệt đậm đà.',
      en: 'Cast-iron seared rice noodles crisp on the edges yet soft within, tossed over blazing fire with tender beef and crisp bok choy.',
      zh: '铸铁重镬大火快炒，河粉边缘金黄微焦酥脆而内心柔嫩，佐以鲜甜牛肉片、嫩绿青菜与浓郁原汁芡汁。',
      ko: '무쇠 웍에서 센 불로 볶아내 겉은 바삭하고 속은 부드러운 생면과 소고기, 청경채의 환상 조합.',
    },
    fullDescription: {
      vi: 'Bí quyết món phở xào Phở Thìn Bờ Hồ nằm ở kỹ thuật "áp chảo lửa thần" trên chảo gang đúc truyền đời. Bánh phở tươi được đảo liên tục dưới nhiệt độ cực lớn để tạo lớp vỏ ngoài cháy cạnh giòn thơm mà sợi phở bên trong vẫn dẻo quánh. Thịt bò thái mỏng ướp tỏi gừng phi thơm lừng xào vừa chín tới cùng rau cải ngọt và cà rốt, rưới lớp sốt sánh quyện óng ả.',
      en: 'The secret lies in intense wok hei mastery on generational cast iron pans. Rice noodles undergo searing flames creating golden crispy crusts while keeping interior noodles supple, served with flash-cooked tender beef and leafy greens coated in savory sauce.',
      zh: '秘诀在于重铁锅猛火激发的浓郁“镬气”。手工河粉经高温煎烙，表面香脆，内里依然柔韧筋道。嫩牛肉辅以姜蒜快炒，浇上浓而不腻的芡汁，让人箸不停辍。',
      ko: '무쇠 웍의 강한 화력으로 면을 지져내 바삭함과 쫄깃함을 동시에 살렸습니다. 얇게 썬 소고기와 아삭한 야채가 진한 소스와 어우러져 중독적인 풍미를 자랑합니다.',
    },
    ingredients: {
      vi: ['Bánh phở tươi cán dày áp chảo gang', 'Thịt bò thăn thái lát tẩm ướp tỏi', 'Cải ngọt non, cà rốt tỉa hoa', 'Nước sốt bò hầm sánh quyện', 'Hành tây, hạt tiêu thơm nồng'],
      en: ['Cast-iron wok seared rice noodles', 'Marinated garlic beef tenderloin', 'Crisp young choy sum & carrots', 'Savory beef glaze reduction', 'Sweet onions & black pepper'],
      zh: ['厚制鲜河粉镬边煎炒', '香蒜腌制鲜牛里脊', '爽脆小菜心与胡萝卜', '浓香牛骨原汁芡汁', '洋葱丝与现磨胡椒'],
      ko: ['무쇠 팬에 구운 생면', '마늘 양념 소고기 안심', '신선한 청경채와 당근', '진한 특제 소스', '양파와 후추']
    }
  },
  {
    id: 'pho-cuon-ha-noi',
    name: {
      vi: 'Phở Cuốn Bò Tươi Hà Nội',
      en: 'Hanoi Fresh Beef Pho Rolls (10 Rolls)',
      zh: '河内经典鲜牛肉卷粉（十卷装）',
      ko: '퍼 꾸온 (하노이 생 쌀국수 소고기 롤 10개)',
    },
    category: 'pho',
    price: 75000,
    formattedPrice: '75.000',
    image: '/src/assets/images/regenerated_image_1790964450176.png',
    isSignature: false,
    isFeatured: true,
    shortDescription: {
      vi: 'Lá bánh phở tráng mỏng mềm mướt cuốn cùng thịt bò xào tỏi thơm lừng, rau xà lách, rau mùi tươi rói, chấm nước mắm chua ngọt thanh tao.',
      en: 'Tender sheets of steamed rice noodles wrapped around fragrant garlic-seared beef, crisp lettuce and herbs, served with sweet-tangy dipping sauce.',
      zh: '晶莹剔透的轻薄鲜米粉皮，包裹着大火蒜香爆炒嫩牛肉与清脆生菜、新鲜香草，蘸取河内古法酸甜鱼露。',
      ko: '부드러운 생 쌀피에 마늘향 가득 볶아낸 소고기와 싱싱한 야채를 말아 특제 느억맘 소스에 찍어 먹는 별미.',
    },
    fullDescription: {
      vi: 'Phở cuốn là thức quà thanh nhã, sảng khoái không thể thiếu trong nét ẩm thực Hà Thành. Bánh phở được tráng riêng thành từng tảng vuông mỏng mịn như lụa. Bên trong là thịt bò thăn tươi vừa xào chín tới trên lửa lớn thơm nức mùi tỏi, cuộn chặt tay cùng rau xà lách xanh giòn, rau kinh giới và mùi tàu. Điểm nhấn là chén nước mắm pha gia truyền chua dịu từ quất tươi, ớt chỉ thiên và tỏi băm nhuyễn nổi bồng bềnh.',
      en: 'A refreshing and quintessential Hanoi street delicacy. Silky sheets of fresh rice batter roll tightly around hot garlic-seared beef, crunchy lettuce, and Vietnamese herbs. Dipped in our artisanal fish sauce blended with fresh calamansi lime, garlic, and birds-eye chili.',
      zh: '河内夏秋最具风雅的传统清爽美点。透亮粉皮如同绸缎，内裹滚热蒜炒嫩牛肉与鲜脆生菜、刺芹等香草。核心在于一碟精调酸甜鱼露，融入新鲜金桔汁与手剁蒜蓉红椒，清新开胃。',
      ko: '하노이의 우아한 식문화를 대표하는 산뜻한 메뉴. 비단결 같은 생 쌀피 안에 마늘로 볶은 소고기와 상큼한 허브가 꽉 차 있습니다. 깔라만시와 고추로 맛을 낸 새콤달콤한 소스에 찍어 드세요.',
    },
    ingredients: {
      vi: ['Lá bánh phở tráng mỏng tươi mới', 'Thịt bò tươi xào tỏi lửa lớn', 'Xà lách tươi, kinh giới, mùi tàu', 'Nước mắm pha quất tươi tỏi ớt', 'Đu đủ cà rốt ngâm giòn chua ngọt'],
      en: ['Silky thin steamed rice sheets', 'High-heat garlic seared beef', 'Crisp lettuce & Vietnamese herbs', 'Fresh calamansi garlic fish sauce', 'Pickled green papaya & carrots'],
      zh: ['轻薄如翼现蒸河粉皮', '猛火蒜香黄牛嫩肉', '脆嫩生菜、荆芥与香菜', '鲜金桔蒜蓉鱼露蘸汁', '爽口酸甜腌木瓜萝卜'],
      ko: ['갓 만든 생 쌀피', '센 불에 볶은 마늘 소고기', '신선한 상추와 베트남 허브', '깔라만시 마늘 느억맘 디핑소스', '수제 파파야 당근 피클']
    }
  },

  // CÁC MÓN PHỞ KHÁC
  {
    id: 'pho-tai-lan',
    name: {
      vi: 'Phở Bò Tái Lăn Chảo Gang',
      en: 'Flash-Seared Garlic Beef Pho',
      zh: '镬气生炒嫩牛肉粉',
      ko: '퍼 보 타이 란 (불맛 볶음 소고기 쌀국수)',
    },
    category: 'pho',
    price: 80000,
    formattedPrice: '80.000',
    image: '/src/assets/images/dish_pho_tai_chin_1790702822779.jpg',
    isSignature: false,
    shortDescription: {
      vi: 'Thịt bò tươi được xào lăn siêu tốc trên chảo gang ngập mỡ tỏi thơm phức rồi đổ ụp lên bát phở rợp hành hoa ngút ngàn.',
      en: 'Tender beef flash-tossed in screaming-hot garlic oil on cast iron, blanketed over fresh noodles and aromatic scallions.',
      zh: '极品嫩牛肉在高热铸铁锅中裹挟蒜香瞬间爆炒，铺入盖满香葱的滚烫河粉中，香浓无比。',
      ko: '달궈진 무쇠 팬에서 마늘 기름과 함께 순식간에 볶아낸 소고기를 푸짐한 대파와 함께 얹은 쌀국수.',
    },
    fullDescription: {
      vi: 'Thịt bò tái lăn là nghệ thuật kiểm soát ngọn lửa đỉnh cao. Từng lát thịt bò thái mỏng được quăng vào chảo gang rực cháy chỉ trong vài giây, ngấm trọn hương vị tỏi đập dập thơm lừng mà thịt bên trong vẫn ngọt mềm mọng nước.',
      en: 'An exhilarating display of wok control. Thin beef slices hit blazing garlic oil for mere moments, capturing incredible smoky aromas while remaining remarkably juicy inside.',
      zh: '极致镬气的展现。嫩牛肉下入滚热蒜油中翻颠数秒，锁住肉汁与蒜香，配以鲜骨清汤，香飘满堂。',
      ko: '마늘 향을 머금은 소고기가 강한 화력으로 익혀져 입안 가득 감칠맛을 폭발시킵니다.',
    },
    ingredients: {
      vi: ['Thịt thăn bò tươi thái mỏng', 'Tỏi ta đập dập phi thơm', 'Bánh phở tươi mỏng', 'Nước dùng trong ngọt thanh', 'Hành hoa băm nhuyễn'],
      en: ['Sliced beef tenderloin', 'Smashed Vietnamese garlic', 'Fresh silky noodles', 'Clear 12h broth', 'Finely sliced scallions'],
      zh: ['精切鲜牛里脊片', '手拍本地紫皮大蒜', '清爽鲜米粉', '清澈牛骨高汤', '海量细翠香葱'],
      ko: ['신선한 소고기 안심', '빻은 베트남 마늘', '신선한 생면', '12시간 맑은 사골 육수', '송송 썬 쪽파']
    }
  },
  {
    id: 'pho-nam-gau-gion',
    name: {
      vi: 'Phở Nạm Gầu Giòn Bờ Hồ',
      en: 'Crispy Beef Brisket & Flank Pho',
      zh: '黄金爽脆牛油脆腩粉',
      ko: '퍼 남 가우 (바삭 쫄깃 차돌양지 쌀국수)',
    },
    category: 'pho',
    price: 85000,
    formattedPrice: '85.000',
    image: '/src/assets/images/regenerated_image_1790912135999.jpg',
    isSignature: false,
    shortDescription: {
      vi: 'Miếng gầu bò hoa giòn sần sật, béo ngậy mà không ngán, quyện cùng nước hầm xương nguyên chất.',
      en: 'Crisp, marbled beef brisket flank delivering an addictive crunch and deep savory richness.',
      zh: '花纹绝美的牛脆油腩，口感脆爽弹牙，脂香四溢而不腻。',
      ko: '고소하고 쫄깃한 식감이 일품인 차돌박이와 양지가 듬뿍 들어간 깊은 맛의 쌀국수.',
    },
    fullDescription: {
      vi: 'Gầu giòn tại Phở Thìn Bờ Hồ là phần thịt nạc xen lẫn mỡ giòn đặc biệt, khi luộc chín thái mỏng có độ giòn sần sật đặc trưng, bùi béo tự nhiên mà không hề ngấy mỡ.',
      en: 'A connoisseur favorite. Featuring special marbled crunchy brisket cut, gently poached and thinly sliced to deliver a joyful texture contrasting with silky noodles.',
      zh: '老饕最钟爱的经典部位。精选带脆筋的花腩肉，薄切后筋道清脆，脂香醇正，与爽滑米粉形成绝妙口感。',
      ko: '바삭하면서도 쫄깃한 차돌박이의 식감과 담백한 쌀국수 면발이 어우러져 매니아층이 가장 찾는 메뉴입니다.',
    },
    ingredients: {
      vi: ['Gầu giòn bò tuyển chọn', 'Nạm bò thơm ngọt', 'Bánh phở tươi truyền thống', 'Nước dùng ninh xương bò 12h'],
      en: ['Crunchy marbled brisket', 'Poached flank slices', 'Fresh handmade noodles', '12-hour pure bone broth'],
      zh: ['特级爽脆牛花腩', '鲜嫩白切牛腩', '纯手工鲜河粉', '十二小时老火骨汤'],
      ko: ['엄선된 차돌박이', '부드러운 양지', '전통 생면', '12시간 사골 육수']
    }
  },

  // ĐỒ UỐNG (DRINKS)
  {
    id: 'tra-da-ha-noi',
    name: {
      vi: 'Trà Đá Hà Nội Truyền Thống',
      en: 'Traditional Hanoi Iced Green Tea',
      zh: '老河内街头清凉冰茶',
      ko: '하노이 전통 냉녹차 (짜다)',
    },
    category: 'drinks',
    price: 10000,
    formattedPrice: '10.000',
    image: '/src/assets/images/regenerated_image_1790912137081.jpg',
    shortDescription: {
      vi: 'Trà búp Thái Nguyên ủ thơm ngát, vị chát nhẹ hậu ngọt sâu, thức uống bất hủ cùng bát phở.',
      en: 'Fragrant Thai Nguyen highland tea, light crisp astringency with sweet lingering finish.',
      zh: '严选太原名茶冲泡，回甘悠长，吃粉必配的经典老街饮品。',
      ko: '쌉싸름하고 깔끔한 뒷맛으로 쌀국수와 가장 잘 어울리는 하노이 대표 냉녹차.',
    },
    fullDescription: {
      vi: 'Bát phở nóng hổi mà thiếu đi cốc trà đá Bờ Hồ thì coi như chưa trọn vẹn phong vị Hà Thành. Vị chát thanh của trà làm sạch vòm họng, tôn vinh vị béo thơm của nước phở.',
      en: 'No authentic Hanoi dining experience is complete without a tall cold glass of Tra Da. The brisk tea cleanses the palate after every rich spoonful of pho broth.',
      zh: '吃一碗滚烫的牛肉粉，配上一杯还剑湖畔的冰茶，才是完整的河内生活方式。茶香解腻生津，令人心旷神怡。',
      ko: '뜨거운 쌀국수 뒤에 마시는 시원한 짜다는 입안을 개운하게 정돈해 주는 하노이 식문화의 상징입니다.',
    },
    ingredients: {
      vi: ['Trà búp Thái Nguyên thượng hạng', 'Nước khoáng tinh khiết đun sôi', 'Đá viên lạnh tinh khiết'],
      en: ['Premium Thai Nguyen green tea leaves', 'Boiled pure mountain water', 'Pure ice cubes'],
      zh: ['越南太原高山嫩茶芽', '纯净水沸煮浸润', '清凉冰块'],
      ko: ['타이응우옌 프리미엄 녹차 잎', '끓인 정제수', '깨끗한 각얼음']
    }
  },
  {
    id: 'nuoc-sau-ngam',
    name: {
      vi: 'Nước Sấu Ngâm Đường Gừng Phố Cổ',
      en: 'Traditional Hanoi Pickled Dracontomelon Juice',
      zh: '老街秘制冰糖生姜人面果冷饮',
      ko: '하노이 전통 사우(Dracontomelon) 생강 음료',
    },
    category: 'drinks',
    price: 25000,
    formattedPrice: '25.000',
    image: '/src/assets/images/regenerated_image_1790966972439.png',
    shortDescription: {
      vi: 'Quả sấu Hà Nội ngâm đường phèn cùng gừng tươi cay nồng, chua dịu ngọt thanh giải nhiệt.',
      en: 'Native Hanoi dracontomelon fruits slow-cured with rock sugar and fresh ginger.',
      zh: '河内特产人面果以天然冰糖和新鲜黄姜古法陈酿，酸甜怡人，解腻生津。',
      ko: '하노이 명물 과일 사우를 생강과 설탕에 절여 만든 새콤달콤하고 시원한 전통 음료.',
    },
    fullDescription: {
      vi: 'Món nước uống mang đậm hương sắc mùa hè và mùa thu Hà Nội. Từng trái sấu già được cạo sạch vỏ, khía hoa cúc và ngâm trong hũ sành cùng nước đường phèn và gừng tươi giã nhỏ.',
      en: 'An iconic tribute to Hanoi autumns. Whole indigenous dracontomelon fruits hand-carved and preserved with pure cane sugar and bruised ginger in glazed pottery.',
      zh: '浓缩了河内四季韵味的传世饮品。老陶罐中经数月自然发酵，果肉酥脆，果汁酸甜中透出生姜的温润微辛。',
      ko: '하노이의 가을을 느낄 수 있는 대표 전통 음료. 아삭한 과육과 은은한 생강 향이 어우러져 깊은 청량감을 줍니다.',
    },
    ingredients: {
      vi: ['Quả sấu Hà Nội chọn lọc', 'Đường phèn tinh khiết', 'Gừng ta già thơm lừng', 'Nước cốt thanh mát'],
      en: ['Selected Hanoi dracontomelon', 'Cane rock sugar', 'Aromatic aged ginger', 'Chilled spring water'],
      zh: ['严选河内野生人面果', '纯正老冰糖', '农家老黄姜', '冰爽山泉水'],
      ko: ['하노이산 신선한 사우 열매', '천연 각설탕', '토종 생강', '시원한 얼음물']
    }
  },
  {
    id: 'bia-ha-noi',
    name: {
      vi: 'Bia Hà Nội Truyền Thống (Chai / Lon)',
      en: 'Hanoi Beer (Iconic Local Lager)',
      zh: '河内经典啤酒（瓶装/罐装）',
      ko: '하노이 맥주 (전통 병/캔)',
    },
    category: 'drinks',
    price: 25000,
    formattedPrice: '25.000',
    image: '/src/assets/images/regenerated_image_1790953402012.png',
    shortDescription: {
      vi: 'Vị bia êm dịu, sảng khoái, thương hiệu huyền thoại của thủ đô Hà Nội từ năm 1890.',
      en: 'Crisp, refreshing legendary Hanoi lager brewed since 1890.',
      zh: '始于1890年的河内传奇啤酒品牌，麦香清冽爽口。',
      ko: '1890년부터 양조된 하노이의 자부심, 깔끔하고 시원한 전통 라거 맥주.',
    },
    fullDescription: {
      vi: 'Thưởng thức món phở xào bò hoặc phở tái chín cùng một cốc Bia Hà Nội mát lạnh là thói quen thư thái của người dân phố cổ mỗi buổi trưa hay chiều muộn.',
      en: 'Enjoying stir-fried beef pho or a steaming bowl paired with an ice-cold Hanoi beer embodies the authentic easygoing lifestyle of the Old Quarter.',
      zh: '一口镬气十足的炒牛肉河粉，搭配一杯冰镇河内啤酒，是漫步老城最惬意的地道享受。',
      ko: '불맛 가득한 볶음 쌀국수나 따뜻한 국물에 곁들이는 시원한 하노이 맥주는 현지 미식의 정점입니다.',
    },
    ingredients: {
      vi: ['Hoa bia nhập khẩu', 'Mạch nha thượng hạng', 'Nước khoáng ngầm Hà Nội'],
      en: ['Fine hops', 'Premium barley malt', 'Pure Hanoi aquifer water'],
      zh: ['精选啤酒花', '优质大麦麦芽', '河内清甜水源'],
      ko: ['홉', '보리 맥아', '천연 지하 암반수']
    }
  },
  {
    id: 'coca-cola',
    name: {
      vi: 'Coca-Cola / Nước Khoáng Lavie',
      en: 'Coca-Cola / Lavie Mineral Water',
      zh: '可口可乐 / 纯净矿泉水',
      ko: '코카콜라 / 라비 미네랄 워터',
    },
    category: 'drinks',
    price: 15000,
    formattedPrice: '15.000',
    image: '/src/assets/images/regenerated_image_1790912140503.webp',
    shortDescription: {
      vi: 'Nước giải khát ướp lạnh sẵn sàng phục vụ quý khách.',
      en: 'Chilled soft drinks and pure natural mineral water.',
      zh: '冰镇软饮与天然矿泉水，清凉解渴。',
      ko: '시원하게 칠링된 탄산음료 및 천연 미네랄 생수.',
    },
    fullDescription: {
      vi: 'Nước ngọt có ga và nước khoáng thiên nhiên ướp lạnh, luôn sẵn sàng phục vụ thực khách.',
      en: 'Refreshing bottled beverages served chilled upon request.',
      zh: '冷藏恒温供应，随时为您解渴。',
      ko: '취향에 따라 선택하실 수 있는 시원한 음료입니다.',
    },
    ingredients: {
      vi: ['Nước có ga / Nước khoáng tự nhiên'],
      en: ['Carbonated soft drink / Mineral water'],
      zh: ['碳酸饮料 / 天然矿泉水'],
      ko: ['탄산음료 / 미네랄 워터']
    }
  },

  // MÓN ĂN KÈM (OTHERS)
  {
    id: 'quay-gion-vang',
    name: {
      vi: 'Quẩy Giòn Vàng Ươm Hà Nội (Đĩa 3 chiếc)',
      en: 'Golden Crispy Fried Crullers (3 pcs)',
      zh: '金黄香酥老油条（3根装）',
      ko: '바삭한 꿔이 (베트남식 꽈배기 도넛 3개)',
    },
    category: 'others',
    price: 15000,
    formattedPrice: '15.000',
    image: '/src/assets/images/regenerated_image_1790912141053.webp',
    shortDescription: {
      vi: 'Quẩy nở phồng giòn tan rụm, nhúng ngập trong nước dùng phở bò nóng hổi ăn béo ngậy.',
      en: 'Airy, crispy crullers dunked into boiling broth to soak up every drop of beef essence.',
      zh: '刚出锅金黄酥脆油条，浸入滚烫牛骨老汤中吸饱鲜汁，浓香四溢。',
      ko: '갓 튀겨내 바삭한 꿔이를 뜨거운 쌀국수 국물에 푹 적셔 먹는 최고의 곁들임 메뉴.',
    },
    fullDescription: {
      vi: 'Ăn phở Hà Nội mà không gọi thêm đĩa quẩy giòn thì quả là thiếu sót lớn. Quẩy của quán được chiên vàng ươm, ruột nở xốp, khi nhúng vào bát phở sẽ hút trọn từng giọt nước dùng ngọt thanh, cắn một miếng vừa giòn vừa béo ngậy.',
      en: 'An indispensable soulmate to Hanoi pho. Golden and puffy, these crullers act as delicious edible sponges, soaking in the deeply flavorful marrow broth for a blissful bite.',
      zh: '河内吃粉必不可少的绝配。现炸油条蓬松金黄，趁热浸入粉汤，饱吸清甜肉汁，外酥里嫩，满口留香。',
      ko: '하노이 쌀국수의 영혼의 단짝. 바삭하게 튀긴 꿔이를 진한 국물에 푹 적셔 먹으면 국물의 감칠맛이 입안 가득 퍼집니다.',
    },
    ingredients: {
      vi: ['Bột mì hảo hạng lên men tự nhiên', 'Dầu thực vật sạch thay mới mỗi ngày'],
      en: ['Premium naturally fermented flour', 'Pure fresh vegetable frying oil'],
      zh: ['天然发酵优质面粉', '每日更换新鲜纯植物油'],
      ko: ['천연 발효 최고급 밀가루', '매일 교체하는 깨끗한 식물성 오일']
    }
  },
  {
    id: 'trung-chan-nuoc-beo',
    name: {
      vi: 'Trứng Chần Nước Béo Hành Hoa',
      en: 'Poached Egg in Rich Marrow Broth',
      zh: '牛油葱花温泉流心蛋',
      ko: '사골 육수 수란과 파',
    },
    category: 'others',
    price: 15000,
    formattedPrice: '15.000',
    image: '/src/assets/images/trung_chan_nuoc_beo.jpg',
    shortDescription: {
      vi: 'Trứng gà ta lòng đào béo ngậy chần trong muôi nước béo sôi, rắc hành hoa thơm lừng.',
      en: 'Organic soft-yolked egg poached in rich bubbling broth with tender scallions.',
      zh: '土鸡蛋烫至流心状态，浸于鲜香滚沸的骨汤牛油中，撒入鲜葱花。',
      ko: '뜨거운 사골 육수에 살짝 익혀 노른자가 살아있는 고소한 수란.',
    },
    fullDescription: {
      vi: 'Quả trứng gà ta tươi được chần khéo léo trong muôi nước béo đang sôi trên nồi nước phở, lòng trắng vừa chín tới ôm lấy lòng đỏ dẻo quánh, thêm chút tiêu đen và hành hoa chần tái.',
      en: 'Delicately poached in the simmering broth kettle, yielding a silky egg white hugging a molten creamy yolk, crowned with scallions and crushed black pepper.',
      zh: '以大铜锅中翻滚的骨汤牛油轻轻温煨，蛋白嫩滑如凝脂，蛋黄金黄流心，趁热吸入，鲜美滑糯。',
      ko: '신선한 달걀을 펄펄 끓는 육수에 살짝 익혀 부드러운 흰자와 진한 노른자의 풍미를 그대로 즐길 수 있습니다.',
    },
    ingredients: {
      vi: ['Trứng gà tươi ta sạch', 'Nước béo ngậy ninh xương', 'Hành hoa tươi thái nhỏ'],
      en: ['Fresh organic chicken egg', 'Rich bone marrow broth broth layer', 'Fresh scallions'],
      zh: ['本地新鲜散养农家土鸡蛋', '老火骨汤上层醇香牛油', '细切鲜嫩香葱'],
      ko: ['신선한 유정란', '진한 사골 육수', '송송 썬 쪽파']
    }
  },
  {
    id: 'banh-mi-gion',
    name: {
      vi: 'Bánh Mì Chuột Giòn Hà Nội',
      en: 'Hanoi Crispy Petite Baguette',
      zh: '河内香脆小法棍',
      ko: '하노이 바삭한 미니 바게트 (반미)',
    },
    category: 'others',
    price: 10000,
    formattedPrice: '10.000',
    image: '/src/assets/images/regenerated_image_1790953403020.jpg',
    shortDescription: {
      vi: 'Chiếc bánh mì chuột nướng giòn rụm, chấm cùng phở sốt vang hay nước phở bò béo ngậy.',
      en: 'Mini Vietnamese crispy baguette, heavenly when dipped in red wine beef stew broth.',
      zh: '现烘外壳酥脆内心柔软的传统小法棍，配红酒炖牛肉粉堪称神仙搭配。',
      ko: '겉은 바삭하고 속은 부드러운 미니 바게트로 와인 소고기 쌀국수 국물에 찍어 드시기 좋습니다.',
    },
    fullDescription: {
      vi: 'Chiếc bánh mì nhỏ xinh nóng hổi giòn rụm vỏ ngoài, ruột xốp mềm, là bạn đồng hành hoàn hảo cùng món Phở Bò Sốt Vang trứ danh của Phở Thìn Bờ Hồ.',
      en: 'A golden-baked mini baguette with crackling crust and airy crumb, designed specifically to accompany our famous wine-stewed beef pho.',
      zh: '刚出炉热气腾腾的迷你小法棍，外皮薄脆碎屑纷飞，内芯吸水力极强，蘸食酱香浓郁的粉汤，别有风味。',
      ko: '따뜻하게 구워낸 미니 바게트. 쌀국수의 진한 국물이나 소스에 찍어 먹으면 색다른 매력을 느낄 수 있습니다.',
    },
    ingredients: {
      vi: ['Bột mì nướng giòn', 'Men bánh mì truyền thống'],
      en: ['Crispy baked wheat flour', 'Traditional baker yeast'],
      zh: ['传统烘焙小麦粉', '老酵母发酵'],
      ko: ['바삭하게 구운 밀가루', '전통 천연 효모']
    }
  }
];
