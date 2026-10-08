-- ==============================================================================
-- PHỞ THÌN BỜ HỒ (EST. 1955) - SEED DATA FOR SUPABASE
-- ==============================================================================

-- 1. SEED BRANCHES
INSERT INTO public.branches (
  id, code, name, address, district, phone, opening_hours, morning_slot, afternoon_slot, map_embed_url, google_maps_link, highlight, is_original
) VALUES
(
  'cs1-dinh-tien-hoang',
  'CS1',
  '{"vi": "61 Đinh Tiên Hoàng (Cơ Sở Gốc Từ 1955)", "en": "61 Dinh Tien Hoang (Original St. Since 1955)", "zh": "丁先皇街61号（1955年始祖店）", "ko": "딘 띠엔 황 61번지 (1955년 원조 본점)"}',
  '61 Đinh Tiên Hoàng, Phường Hoàn Kiếm, Hà Nội (đối diện đền Ngọc Sơn)',
  'Quận Hoàn Kiếm, Hà Nội',
  '0912 345 678',
  '06:00 - 13:00 & 17:30 - 22:30',
  '06:00 - 13:00',
  '17:30 - 22:30',
  'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3724.0963773193237!2d105.8507200758784!3d21.02882968777717!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ab9598ff78ef%3A0x6b77241315da8b37!2zNjEgxJBpbmggVGnDqm4gSG_DoG5nLCBIw6BuZyBC4bqhYywgSG_DoG4gS2nhur9tLCBIw6AgTuG7mWksIFZp4buHdCBOYW0!5e0!3m2!1svi!2s!4v1700000000000!5m2!1svi!2s',
  'https://maps.app.goo.gl/gQf2Bw8K3Q8Hq9y28',
  '{"vi": "Cái nôi ẩm thực 70 năm, nơi cụ Bùi Chí Thìn mở quán đầu tiên và phục vụ Tổng thống & Hội nghị Thượng đỉnh 2019.", "en": "The 70-year cradle of heritage, where founder Bui Chi Thin opened the very first shop and served the 2019 Summit.", "zh": "70年发源地，创始人裴志辰开设的第一家店铺，曾服务2019年首脑峰会。", "ko": "창업주 부이 찌 틴의 70년 원조 발상지, 2019 정상회담 공식 만찬 제공처."}',
  true
),
(
  'cs2-hang-tre',
  'CS2',
  '{"vi": "01 Hàng Tre (Tầng 1 - Không Gian Phố Cổ)", "en": "01 Hang Tre (1st Floor - Old Quarter Heritage)", "zh": "竹行街01号（1楼老街雅致区）", "ko": "항 트레 01번지 (1층 올드쿼터 헤리티지)"}',
  '01 Hàng Tre, Phường Lý Thái Tổ, Hoàn Kiếm, Hà Nội',
  'Quận Hoàn Kiếm, Hà Nội',
  '0912 345 679',
  '06:00 - 14:00 & 17:00 - 22:30',
  '06:00 - 14:00',
  '17:00 - 22:30',
  'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3724.0847240723467!2d105.8532454758784!3d21.02929578776092!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ab947547a8bb%3A0x6b4453147f87a89b!2zMDEgSMOgbmcgVHJlLCBMw70gVGjDoWkgVOG7lSwgSG_DoG4gS2nhur9tLCBIw6AgTuG7mWksIFZp4buHdCBOYW0!5e0!3m2!1svi!2s!4v1700000000001!5m2!1svi!2s',
  'https://maps.app.goo.gl/gQf2Bw8K3Q8Hq9y28',
  '{"vi": "Không gian tầng 1 ấm cúng, thiết kế tường gạch mộc và gỗ trầm, điểm hẹn quen thuộc của thực khách quốc tế.", "en": "Warm ground-floor ambience with exposed brick and teakwood, beloved by international guests.", "zh": "一层雅致空间，裸砖配原木，海内外食客钟爱的打卡胜地。", "ko": "1층 고풍스러운 벽돌과 원목 인테리어, 여행객들이 가장 선호하는 지점."}',
  false
),
(
  'cs3-hang-tre-t2',
  'CS3',
  '{"vi": "01 Hàng Tre (Tầng 2 - Máy Lạnh & Gia Đình)", "en": "01 Hang Tre (2nd Floor - AC & Family Lounge)", "zh": "竹行街01号（2楼冷气家庭包厢）", "ko": "항 트레 01번지 (2층 에어컨 완비 패밀리 라운지)"}',
  '01 Hàng Tre (Tầng 2), Phường Lý Thái Tổ, Hoàn Kiếm, Hà Nội',
  'Quận Hoàn Kiếm, Hà Nội',
  '0912 345 680',
  '06:30 - 14:00 & 17:30 - 22:00',
  '06:30 - 14:00',
  '17:30 - 22:00',
  'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3724.0847240723467!2d105.8532454758784!3d21.02929578776092!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ab947547a8bb%3A0x6b4453147f87a89b!2zMDEgSMOgbmcgVHJlLCBMw70gVGjDoWkgVOG7lSwgSG_DoG4gS2nhur9tLCBIw6AgTuG7mWksIFZp4buHdCBOYW0!5e0!3m2!1svi!2s!4v1700000000002!5m2!1svi!2s',
  'https://maps.app.goo.gl/gQf2Bw8K3Q8Hq9y28',
  '{"vi": "Không gian tầng 2 có điều hòa mát rượi, bàn ghế rộng rãi, tối ưu cho đoàn đông người, họp mặt gia đình.", "en": "Full air-conditioned 2nd floor with spacious seating, ideal for families and tour groups.", "zh": "全冷气覆盖，座位舒适宽敞，适合家庭聚餐与团体用餐。", "ko": "시원한 냉방과 넉넉한 단체석 완비, 가족 모임 및 여행 단체 추천."}',
  false
),
(
  'cs4-tran-phu-ha-dong',
  'CS4',
  '{"vi": "150 Trần Phú (Hà Đông - Không Gian Hiện Đại)", "en": "150 Tran Phu (Ha Dong - Modern Experience)", "zh": "河东陈富街150号（现代体验店）", "ko": "하동 쩐푸 150번지 (모던 익스피리언스 점)"}',
  '150 Trần Phú, Phường Mộ Lao, Quận Hà Đông, Hà Nội',
  'Quận Hà Đông, Hà Nội',
  '0912 345 681',
  '06:00 - 22:00 (Cả ngày)',
  '06:00 - 14:00',
  '17:00 - 22:00',
  'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3725.326264560731!2d105.78659117587713!3d20.979555189472314!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135accf49c017d9%3A0x1d3a4e4fc06f71d5!2zMTUwIFRy4bqnbiBQaMO6LCBN4buZIExhbywgSMOgIMSQw7RuZywgSMOgIE7hu5lpLCBWaeG7h3QgTmFt!5e0!3m2!1svi!2s!4v1700000000003!5m2!1svi!2s',
  'https://maps.app.goo.gl/gQf2Bw8K3Q8Hq9y28',
  '{"vi": "Cơ sở mới hiện đại phía Tây Nam Hà Nội, có bãi đỗ xe ô tô thuận tiện, phục vụ liên tục cả ngày.", "en": "Modern outlet serving southwest Hanoi with dedicated car parking and all-day dining.", "zh": "河内西南部全新体验店，配大型专属停车场，全天不间断营业。", "ko": "하노이 서남부 모던 플래그십 매장, 편리한 주차 시설 및 종일 영업."}',
  false
)
ON CONFLICT (id) DO NOTHING;

-- 2. SEED DISHES
INSERT INTO public.dishes (
  id, category, name, price, formatted_price, image, is_signature, is_featured, is_available, short_description, full_description, ingredients, preparation_note
) VALUES
(
  'pho-tai-chin',
  'pho',
  '{"vi": "Phở Tái Chín (Đặc Sản Gia Truyền)", "en": "Rare & Well-Done Beef Pho (Signature)", "zh": "半生半熟牛肉粉（镇店之宝）", "ko": "타이 친 쌀국수 (생육 & 익힌육 반반 시그니처)"}',
  80000,
  '80.000',
  '/src/assets/images/regenerated_image_1790911567588.png',
  true,
  true,
  true,
  '{"vi": "Sự kết hợp hoàn hảo giữa nạm bò chín mềm ngậy và thịt bò tái tươi rói đập dập trên thớt gỗ nghiến, ngập trong nước dùng thanh ngọt thơm nức.", "en": "The harmonious union of tender well-done flank and flash-blanched medium rare beef over fresh silky noodles with fragrant clear broth.", "zh": "软烂香醇的熟牛腩与案板轻砸的极鲜半生嫩牛肉完美相融，浇入熬煮12小时的清甜秘制牛骨老汤。", "ko": "부드러운 양지 익힌 고기와 신선한 생 쇠고기의 완벽한 조화, 12시간 우려낸 깊은 맑은 육수."}',
  '{"vi": "Phở Tái Chín là linh hồn và biểu tượng của Phở Thìn Bờ Hồ suốt từ năm 1955 đến nay. Từng miếng thịt nạm bò được luộc chín tới, thái mỏng tang giữ trọn độ ngậy thơm; trong khi thịt thăn bò tươi đỏ hồng được đặt lên thớt gỗ nghiến dằn nhẹ cho mềm rồi chần qua nước sôi ùng ục, giữ trọn vị ngọt tự nhiên ngọt lịm. Nước dùng nấu hoàn toàn bằng xương ống bò tươi, không pha mì chính lợ, thanh trong mà ngọt sâu cuống họng, rợp màu xanh mướt của hành hoa thái nhỏ.", "en": "The legendary centerpiece of Pho Thin Bo Ho since 1955. Slices of tender well-done beef brisket meet vibrant fresh beef tenderloin lightly tenderized on ironwood blocks, briefly scalded to lock in juicy sweetness. The broth is simmered purely from marrow bones without artificial sweetness—crystal-clear, deeply comforting, blanketed by a lush canopy of freshly chopped scallions.", "zh": "1955年以来本店最具代表性的灵魂之作。熟牛腩香滑不腻，鲜红嫩牛肉置于木砧板轻拍致柔，滚汤烫至粉红，锁住最天然的甘美肉汁。清亮老汤无味精涩口感，配以翠绿香葱，回味绵长。", "ko": "1955년부터 이어온 퍼틴 보 호의 정수. 부드러운 소고기 수육과 주문 즉시 살짝 데쳐내는 신선한 생소고기의 조화. 조미료 없이 사골만으로 우려낸 맑고 깊은 국물에 싱그러운 쪽파가 가득합니다."}',
  '{"vi": ["Bánh phở tươi tráng thủ công hàng ngày", "Thịt thăn bò tươi thái mỏng đập dập", "Nạm bò hoa luộc mềm thơm", "Nước hầm xương ống bò 12 giờ bí truyền", "Hành hoa, ngò gai tươi xanh Bờ Hồ", "Gừng nướng, hoa hồi, thảo quả Tây Bắc"], "en": ["Daily artisanal fresh rice noodles", "Hand-tenderized fresh beef tenderloin", "Slow-poached prime beef flank", "12-hour simmered pure beef marrow broth", "Freshly chopped Hanoi scallions and culantro", "Roasted ginger, star anise, and black cardamom"], "zh": ["每日清晨纯手工现制爽滑鲜米粉", "严选鲜嫩黄牛里脊，轻拍致柔", "传统慢火白切牛腩片", "12小时纯牛筒骨慢炖祖传清汤", "还剑湖特色翠绿细香葱与刺芹", "炭火烤老姜、八角、草果等天然草本"], "ko": ["매일 새벽 수제 공정으로 만드는 쫄깃한 생면", "주문 즉시 부드럽게 두드려 데치는 신선한 생소고기", "고소하고 부드러운 양지 수육", "12시간 우려낸 100% 한우급 사골 맑은 육수", "하노이 특산 신선한 쪽파와 고수", "구운 생강, 팔각, 정향 등 천연 향신료"]}',
  '{"vi": "Phở tái chín được chần nóng hổi tại chỗ, chan nước dùng sôi sùng sục 98°C bốc khói nghi ngút.", "en": "Prepared on-demand and splashed with bubbling 98°C broth straight from the copper kettle.", "zh": "现点现烫，以98°C滚沸骨汤大勺淋注，香气扑鼻。", "ko": "주문 즉시 98도의 펄펄 끓는 육수를 부어 가장 신선하게 제공합니다."}'
),
(
  'pho-tai-lan',
  'pho',
  '{"vi": "Phở Tái Lăn Chảo Gang Cổ Truyền", "en": "Wok-Seared Garlic Rare Beef Pho", "zh": "铁镬爆炒生牛肉粉", "ko": "퍼 타이 란 (무쇠팬 직화 마늘 소고기 쌀국수)"}',
  85000,
  '85.000',
  '/src/assets/images/regenerated_image_1790953552668.jpg',
  true,
  true,
  true,
  '{"vi": "Thịt bò tươi xào lăn lửa lớn với gừng già, tỏi băm thơm nức mũi, quyện cùng nước hầm xương đậm đà béo ngậy.", "en": "Flash wok-seared beef tenderloin with crushed garlic and ginger over roaring flame, bathed in savoury broth.", "zh": "精选鲜牛肉大火旺镬，配老姜与蒜蓉爆炒出浓烈锅气，注入香醇骨汤。", "ko": "강한 무쇠팬 불맛에 신선한 소고기와 마늘, 생강을 볶아낸 고소하고 진한 육수의 쌀국수."}',
  '{"vi": "Phở Tái Lăn là bản hòa tấu mạnh mẽ của lửa và hương vị. Từng thớ thịt bò mềm được đầu bếp đảo chớp nhoáng trên chảo gang rực lửa cùng tỏi phi vàng óng và gừng già đập dập, bung tỏa mùi thơm ngây ngất lan khắp phố cổ.", "en": "A dramatic symphony of flame and fragrance. Tender beef is flashed in a smoking wok with golden fried garlic and smashed old ginger.", "zh": "大火与香气的火热交融。新鲜牛肉在滚烫铁锅中与金黄蒜末和老姜急速翻炒，锅气四溢。", "ko": "불과 향의 화려한 변주곡. 뜨겁게 달궈진 무쇠팬에 신선한 소고기와 마늘을 센 불로 순식간에 볶아냅니다."}',
  '{"vi": ["Bò thăn thái mỏng xào lăn", "Tỏi ta giã nhuyễn phi xém cạnh", "Gừng già nướng đập dập", "Hành lá xắt dài và hành hoa nhuyễn"], "en": ["Flash-seared beef", "Aromatic Vietnamese garlic", "Crushed charred ginger", "Hanoi spring scallions"], "zh": ["猛火快炒鲜牛肉", "越南本地红皮小蒜", "炭烤老姜", "细葱与长葱段"], "ko": ["직화 볶음 소고기", "마늘 볶음", "구운 생강", "하노이 쪽파"]}',
  '{"vi": "Được xào lăn trực tiếp theo từng bát, phục vụ nóng rãy bốc khói.", "en": "Seared individually per order to preserve peak aromatics.", "zh": "每碗单独现炒，热气蒸腾上桌。", "ko": "주문 즉시 한 그릇씩 볶아내어 불맛을 유지합니다."}'
),
(
  'pho-sot-vang',
  'pho',
  '{"vi": "Phở Bò Sốt Vang Cổ Điển", "en": "Classic Red Wine Stewed Beef Pho", "zh": "法式红酒炖牛肉粉", "ko": "퍼 보 솟 방 (클래식 와인 소고기 조림 쌀국수)"}',
  85000,
  '85.000',
  '/src/assets/images/regenerated_image_1790953552668.jpg',
  false,
  true,
  true,
  '{"vi": "Những dẻ sườn và gân bò mềm tan hầm cùng vang chát, thảo mộc quý và gấc đỏ tươi, tạo nên màu sắc hổ phách và vị nồng ấm quyến rũ.", "en": "Tender beef shank and tendon slow-simmered with wine, precious herbs, and gac fruit for a warm amber hue.", "zh": "精选牛腱肉与牛筋，慢火配红酒、草果与红木子焖炖至软糯化渣。", "ko": "레드와인과 고급 허브로 부드럽게 조려낸 소고기 갈비와 스지."}',
  '{"vi": "Món Phở Bò Sốt Vang mang dấu ấn văn hóa giao thoa Á - Âu đặc trưng của người Hà Nội thời kỳ đầu thế kỷ 20. Thịt bò bắp và dẻ sườn có lẫn chút gân được thái quân cờ, ướp cùng rượu vang, quế, hồi, thảo quả và dầu điều gấc tự nhiên.", "en": "A classic testament to the Eurasian culinary rendezvous of 20th-century Hanoi.", "zh": "融合20世纪初河内东西饮食文化的经典代表。", "ko": "20세기 초 하노이의 동서양 식문화가 조화된 클래식 메뉴."}',
  '{"vi": ["Bò bắp hoa và gân giòn thái quân cờ", "Rượu vang đỏ thơm nồng", "Gấc tươi tạo màu hổ phách"], "en": ["Cubed beef shank & tendon", "Red wine marinade", "Fresh gac fruit"], "zh": ["牛腱肉与牛蹄筋", "醇正红酒", "天然木鳖子"], "ko": ["소고기 아롱사태와 스지", "레드와인 양념", "천연 과일 색소"]}',
  '{"vi": "Hầm lửa nhỏ suốt 6 tiếng liên tục.", "en": "Simmered low and slow for 6 continuous hours.", "zh": "文火慢炖6小时。", "ko": "6시간 동안 푹 끓여냅니다."}'
)
ON CONFLICT (id) DO NOTHING;

-- 3. SEED INITIAL RESERVATIONS
INSERT INTO public.reservations (
  id, full_name, phone, email, reservation_date, reservation_time, party_size, branch_id, branch_name, notes, status, is_walk_in
) VALUES
(
  'PTBH-2026-8812',
  'Nguyễn Hoàng Long',
  '0912345678',
  'hoanglong.ng@gmail.com',
  CURRENT_DATE,
  '11:30',
  4,
  'cs1-dinh-tien-hoang',
  'CS1: 61 Đinh Tiên Hoàng (Cơ Sở Gốc Từ 1955)',
  'Bàn ngồi nhìn ra Hồ Gươm, gọi trước 4 bát phở Tái Chín đặc sản.',
  'pending',
  false
),
(
  'PTBH-2026-7521',
  'Trần Thuỳ Dung',
  '0988776655',
  'thuydung.tran@outlook.com',
  CURRENT_DATE,
  '12:00',
  6,
  'cs2-hang-tre',
  'CS2: 01 Hàng Tre (Tầng 1 - Không Gian Phố Cổ)',
  'Gia đình có người cao tuổi, cần chỗ ngồi thoáng tầng 1.',
  'confirmed',
  false
),
(
  'PTBH-2026-6430',
  'David Sterling (USA)',
  '0934112233',
  'david.traveler@gmail.com',
  CURRENT_DATE,
  '18:30',
  2,
  'cs1-dinh-tien-hoang',
  'CS1: 61 Đinh Tiên Hoàng (Cơ Sở Gốc Từ 1955)',
  'Tourists wanting to try authentic US-DPRK summit pho recipe.',
  'confirmed',
  false
)
ON CONFLICT (id) DO NOTHING;

-- 4. SEED INITIAL INQUIRIES
INSERT INTO public.inquiries (
  id, type, full_name, phone, email, position, message, status
) VALUES
(
  'INQ-1001',
  'recruitment',
  'Nguyễn Văn Nam',
  '0908123456',
  'nam.nv@gmail.com',
  'Nhân viên bếp & chần phở',
  'Kinh nghiệm 3 năm làm phụ bếp tại Hà Nội, mong muốn gắn bó lâu dài tại cơ sở Hàng Tre.',
  'new'
),
(
  'INQ-1002',
  'inquiry',
  'Công ty Du Lịch VietTravel',
  '0912999888',
  'booking@viettravel.example.com',
  NULL,
  'Cần đặt bàn ăn sáng cho đoàn 25 khách Hàn Quốc vào sáng thứ 7 tuần tới.',
  'contacted'
)
ON CONFLICT (id) DO NOTHING;
