/**
 * data.js - Dữ liệu đồng bộ 100% từ bản gốc Phở Thìn Bờ Hồ
 * Đầy đủ 14 Món ăn (Phở, Đồ Uống, Món Kèm), 9 Bài Báo & Tin Tức, 4 Cơ sở chính thức
 */

const DATA_VERSION = '2026.10.19-full';

const INITIAL_DATA = {
  version: DATA_VERSION,
  dishes: [
  {
    "id": "pho-tai-chin",
    "name": "Phở Tái Chín (Đặc Sản Gia Truyền)",
    "category": "pho",
    "price": 80000,
    "formattedPrice": "80.000 đ",
    "image": "images/regenerated_image_1790911567588.png",
    "isSignature": true,
    "isFeatured": true,
    "shortDescription": "Sự kết hợp hoàn hảo giữa nạm bò chín mềm ngậy và thịt bò tái tươi rói đập dập trên thớt gỗ nghiến, ngập trong nước dùng thanh ngọt thơm nức.",
    "fullDescription": "Phở Tái Chín là linh hồn và biểu tượng của Phở Thìn Bờ Hồ suốt từ năm 1955 đến nay. Từng miếng thịt nạm bò được luộc chín tới, thái mỏng tang giữ trọn độ ngậy thơm; trong khi thịt thăn bò tươi đỏ hồng được đặt lên thớt gỗ nghiến dằn nhẹ cho mềm rồi chần qua nước sôi ùng ục, giữ trọn vị ngọt tự nhiên ngọt lịm. Nước dùng nấu hoàn toàn bằng xương ống bò tươi, không pha mì chính lợ, thanh trong mà ngọt sâu cuống họng, rợp màu xanh mướt của hành hoa thái nhỏ.",
    "ingredients": [
      "Bánh phở tươi tráng thủ công hàng ngày",
      "Thịt thăn bò tươi thái mỏng đập dập",
      "Nạm bò hoa luộc mềm thơm",
      "Nước hầm xương ống bò 12 giờ bí truyền",
      "Hành hoa, ngò gai tươi xanh Bờ Hồ",
      "Gừng nướng, hoa hồi, thảo quả Tây Bắc"
    ],
    "preparationNote": "Phở tái chín được chần nóng hổi tại chỗ, chan nước dùng sôi sùng sục 98°C bốc khói nghi ngút.",
    "isAvailable": true
  },
  {
    "id": "pho-sot-vang",
    "name": "Phở Bò Sốt Vang Cổ Điển",
    "category": "pho",
    "price": 85000,
    "formattedPrice": "85.000 đ",
    "image": "images/regenerated_image_1790953552668.jpg",
    "isSignature": false,
    "isFeatured": true,
    "shortDescription": "Những dẻ sườn và gân bò mềm tan hầm cùng vang chát, thảo mộc quý và gấc đỏ tươi, tạo nên màu sắc hổ phách và vị nồng ấm quyến rũ.",
    "fullDescription": "Món Phở Bò Sốt Vang mang dấu ấn văn hóa giao thoa Á - Âu đặc trưng của người Hà Nội thời kỳ đầu thế kỷ 20. Thịt bò bắp và dẻ sườn có lẫn chút gân được thái quân cờ, ướp cùng rượu vang, quế, hồi, thảo quả và dầu điều gấc tự nhiên trước khi xào săn và hầm nhừ suốt nhiều tiếng đồng hồ. Khi chan nước phở, từng muỗng sốt vang đỏ óng ánh hòa tan vào nước dùng thanh trong tạo nên hương vị bùi béo mà không ngấy, ăn kèm quẩy giòn và chút tiêu đen xay mịn thì tuyệt đỉnh.",
    "ingredients": [
      "Bò bắp hoa và gân giòn thái quân cờ",
      "Rượu vang đỏ thơm nồng",
      "Gấc tươi tạo màu hổ phách",
      "Bánh phở tươi mỏng mượt",
      "Nước dùng bò nguyên chất",
      "Rau mùi và tiêu đen Phú Quốc"
    ],
    "preparationNote": "",
    "isAvailable": true
  },
  {
    "id": "pho-suon-cay",
    "name": "Phở Sườn Cây Đặc Biệt",
    "category": "pho",
    "price": 95000,
    "formattedPrice": "95.000 đ",
    "image": "images/hero_pho_thin_bo_ho_1790702796317.jpg",
    "isSignature": false,
    "isFeatured": true,
    "shortDescription": "Tảng sườn bò cây cỡ lớn ninh nhừ mềm róc xương, béo ngậy ngọt thịt, kết hợp cùng nước dùng thanh tao nức tiếng 70 năm.",
    "fullDescription": "Phở Sườn Cây Đặc Biệt là món ăn dành riêng cho những thực khách muốn trải nghiệm sự thịnh soạn trọn vẹn. Mỗi bát được phục vụ một dẻ sườn cây bò to bản ninh liên tục từ 4 đến 5 tiếng trong nồi nước hầm thảo mộc. Thịt sườn mềm đến mức có thể dùng đũa tách nhẹ là róc khỏi xương, mọng nước và ngọt lịm. Chấm cùng tương ớt xào nhà làm và chút giấm tỏi ớt gia truyền thì không gì sánh bằng.",
    "ingredients": [
      "Dẻ sườn cây bò tơ nguyên khối",
      "Bánh phở tươi truyền thống",
      "Nước dùng xương hầm tinh hoa",
      "Hành lá, hành củ chần tái",
      "Giấm tỏi ớt ủ chum sành"
    ],
    "preparationNote": "",
    "isAvailable": true
  },
  {
    "id": "pho-xao-bo",
    "name": "Phở Xào Bò Áp Chảo Giòn Mềm",
    "category": "pho",
    "price": 85000,
    "formattedPrice": "85.000 đ",
    "image": "images/regenerated_image_1790967147601.jpg",
    "isSignature": false,
    "isFeatured": true,
    "shortDescription": "Bánh phở áp chảo gang vàng rụm cháy cạnh bên ngoài nhưng mềm mướt bên trong, xào cùng thịt bò tươi, cải ngọt xanh và nước sốt sền sệt đậm đà.",
    "fullDescription": "Bí quyết món phở xào Phở Thìn Bờ Hồ nằm ở kỹ thuật \"áp chảo lửa thần\" trên chảo gang đúc truyền đời. Bánh phở tươi được đảo liên tục dưới nhiệt độ cực lớn để tạo lớp vỏ ngoài cháy cạnh giòn thơm mà sợi phở bên trong vẫn dẻo quánh. Thịt bò thái mỏng ướp tỏi gừng phi thơm lừng xào vừa chín tới cùng rau cải ngọt và cà rốt, rưới lớp sốt sánh quyện óng ả.",
    "ingredients": [
      "Bánh phở tươi cán dày áp chảo gang",
      "Thịt bò thăn thái lát tẩm ướp tỏi",
      "Cải ngọt non, cà rốt tỉa hoa",
      "Nước sốt bò hầm sánh quyện",
      "Hành tây, hạt tiêu thơm nồng"
    ],
    "preparationNote": "",
    "isAvailable": true
  },
  {
    "id": "pho-cuon-ha-noi",
    "name": "Phở Cuốn Bò Tươi Hà Nội",
    "category": "pho",
    "price": 75000,
    "formattedPrice": "75.000 đ",
    "image": "images/regenerated_image_1790964450176.png",
    "isSignature": false,
    "isFeatured": true,
    "shortDescription": "Lá bánh phở tráng mỏng mềm mướt cuốn cùng thịt bò xào tỏi thơm lừng, rau xà lách, rau mùi tươi rói, chấm nước mắm chua ngọt thanh tao.",
    "fullDescription": "Phở cuốn là thức quà thanh nhã, sảng khoái không thể thiếu trong nét ẩm thực Hà Thành. Bánh phở được tráng riêng thành từng tảng vuông mỏng mịn như lụa. Bên trong là thịt bò thăn tươi vừa xào chín tới trên lửa lớn thơm nức mùi tỏi, cuộn chặt tay cùng rau xà lách xanh giòn, rau kinh giới và mùi tàu. Điểm nhấn là chén nước mắm pha gia truyền chua dịu từ quất tươi, ớt chỉ thiên và tỏi băm nhuyễn nổi bồng bềnh.",
    "ingredients": [
      "Lá bánh phở tráng mỏng tươi mới",
      "Thịt bò tươi xào tỏi lửa lớn",
      "Xà lách tươi, kinh giới, mùi tàu",
      "Nước mắm pha quất tươi tỏi ớt",
      "Đu đủ cà rốt ngâm giòn chua ngọt"
    ],
    "preparationNote": "",
    "isAvailable": true
  },
  {
    "id": "pho-tai-lan",
    "name": "Phở Bò Tái Lăn Chảo Gang",
    "category": "pho",
    "price": 80000,
    "formattedPrice": "80.000 đ",
    "image": "images/dish_pho_tai_chin_1790702822779.jpg",
    "isSignature": false,
    "isFeatured": false,
    "shortDescription": "Thịt bò tươi được xào lăn siêu tốc trên chảo gang ngập mỡ tỏi thơm phức rồi đổ ụp lên bát phở rợp hành hoa ngút ngàn.",
    "fullDescription": "Thịt bò tái lăn là nghệ thuật kiểm soát ngọn lửa đỉnh cao. Từng lát thịt bò thái mỏng được quăng vào chảo gang rực cháy chỉ trong vài giây, ngấm trọn hương vị tỏi đập dập thơm lừng mà thịt bên trong vẫn ngọt mềm mọng nước.",
    "ingredients": [
      "Thịt thăn bò tươi thái mỏng",
      "Tỏi ta đập dập phi thơm",
      "Bánh phở tươi mỏng",
      "Nước dùng trong ngọt thanh",
      "Hành hoa băm nhuyễn"
    ],
    "preparationNote": "",
    "isAvailable": true
  },
  {
    "id": "pho-nam-gau-gion",
    "name": "Phở Nạm Gầu Giòn Bờ Hồ",
    "category": "pho",
    "price": 85000,
    "formattedPrice": "85.000 đ",
    "image": "images/regenerated_image_1790912135999.jpg",
    "isSignature": false,
    "isFeatured": false,
    "shortDescription": "Miếng gầu bò hoa giòn sần sật, béo ngậy mà không ngán, quyện cùng nước hầm xương nguyên chất.",
    "fullDescription": "Gầu giòn tại Phở Thìn Bờ Hồ là phần thịt nạc xen lẫn mỡ giòn đặc biệt, khi luộc chín thái mỏng có độ giòn sần sật đặc trưng, bùi béo tự nhiên mà không hề ngấy mỡ.",
    "ingredients": [
      "Gầu giòn bò tuyển chọn",
      "Nạm bò thơm ngọt",
      "Bánh phở tươi truyền thống",
      "Nước dùng ninh xương bò 12h"
    ],
    "preparationNote": "",
    "isAvailable": true
  },
  {
    "id": "tra-da-ha-noi",
    "name": "Trà Đá Hà Nội Truyền Thống",
    "category": "drinks",
    "price": 10000,
    "formattedPrice": "10.000 đ",
    "image": "images/regenerated_image_1790912137081.jpg",
    "isSignature": false,
    "isFeatured": false,
    "shortDescription": "Trà búp Thái Nguyên ủ thơm ngát, vị chát nhẹ hậu ngọt sâu, thức uống bất hủ cùng bát phở.",
    "fullDescription": "Bát phở nóng hổi mà thiếu đi cốc trà đá Bờ Hồ thì coi như chưa trọn vẹn phong vị Hà Thành. Vị chát thanh của trà làm sạch vòm họng, tôn vinh vị béo thơm của nước phở.",
    "ingredients": [
      "Trà búp Thái Nguyên thượng hạng",
      "Nước khoáng tinh khiết đun sôi",
      "Đá viên lạnh tinh khiết"
    ],
    "preparationNote": "",
    "isAvailable": true
  },
  {
    "id": "nuoc-sau-ngam",
    "name": "Nước Sấu Ngâm Đường Gừng Phố Cổ",
    "category": "drinks",
    "price": 25000,
    "formattedPrice": "25.000 đ",
    "image": "images/regenerated_image_1790966972439.png",
    "isSignature": false,
    "isFeatured": false,
    "shortDescription": "Quả sấu Hà Nội ngâm đường phèn cùng gừng tươi cay nồng, chua dịu ngọt thanh giải nhiệt.",
    "fullDescription": "Món nước uống mang đậm hương sắc mùa hè và mùa thu Hà Nội. Từng trái sấu già được cạo sạch vỏ, khía hoa cúc và ngâm trong hũ sành cùng nước đường phèn và gừng tươi giã nhỏ.",
    "ingredients": [
      "Quả sấu Hà Nội chọn lọc",
      "Đường phèn tinh khiết",
      "Gừng ta già thơm lừng",
      "Nước cốt thanh mát"
    ],
    "preparationNote": "",
    "isAvailable": true
  },
  {
    "id": "bia-ha-noi",
    "name": "Bia Hà Nội Truyền Thống (Chai / Lon)",
    "category": "drinks",
    "price": 25000,
    "formattedPrice": "25.000 đ",
    "image": "images/regenerated_image_1790953402012.png",
    "isSignature": false,
    "isFeatured": false,
    "shortDescription": "Vị bia êm dịu, sảng khoái, thương hiệu huyền thoại của thủ đô Hà Nội từ năm 1890.",
    "fullDescription": "Thưởng thức món phở xào bò hoặc phở tái chín cùng một cốc Bia Hà Nội mát lạnh là thói quen thư thái của người dân phố cổ mỗi buổi trưa hay chiều muộn.",
    "ingredients": [
      "Hoa bia nhập khẩu",
      "Mạch nha thượng hạng",
      "Nước khoáng ngầm Hà Nội"
    ],
    "preparationNote": "",
    "isAvailable": true
  },
  {
    "id": "coca-cola",
    "name": "Coca-Cola / Nước Khoáng Lavie",
    "category": "drinks",
    "price": 15000,
    "formattedPrice": "15.000 đ",
    "image": "images/regenerated_image_1790912140503.webp",
    "isSignature": false,
    "isFeatured": false,
    "shortDescription": "Nước giải khát ướp lạnh sẵn sàng phục vụ quý khách.",
    "fullDescription": "Nước ngọt có ga và nước khoáng thiên nhiên ướp lạnh, luôn sẵn sàng phục vụ thực khách.",
    "ingredients": [
      "Nước có ga / Nước khoáng tự nhiên"
    ],
    "preparationNote": "",
    "isAvailable": true
  },
  {
    "id": "quay-gion-vang",
    "name": "Quẩy Giòn Vàng Ươm Hà Nội (Đĩa 3 chiếc)",
    "category": "others",
    "price": 15000,
    "formattedPrice": "15.000 đ",
    "image": "images/regenerated_image_1790912141053.webp",
    "isSignature": false,
    "isFeatured": false,
    "shortDescription": "Quẩy nở phồng giòn tan rụm, nhúng ngập trong nước dùng phở bò nóng hổi ăn béo ngậy.",
    "fullDescription": "Ăn phở Hà Nội mà không gọi thêm đĩa quẩy giòn thì quả là thiếu sót lớn. Quẩy của quán được chiên vàng ươm, ruột nở xốp, khi nhúng vào bát phở sẽ hút trọn từng giọt nước dùng ngọt thanh, cắn một miếng vừa giòn vừa béo ngậy.",
    "ingredients": [
      "Bột mì hảo hạng lên men tự nhiên",
      "Dầu thực vật sạch thay mới mỗi ngày"
    ],
    "preparationNote": "",
    "isAvailable": true
  },
  {
    "id": "trung-chan-nuoc-beo",
    "name": "Trứng Chần Nước Béo Hành Hoa",
    "category": "others",
    "price": 15000,
    "formattedPrice": "15.000 đ",
    "image": "images/trung_chan_nuoc_beo.jpg",
    "isSignature": false,
    "isFeatured": false,
    "shortDescription": "Trứng gà ta lòng đào béo ngậy chần trong muôi nước béo sôi, rắc hành hoa thơm lừng.",
    "fullDescription": "Quả trứng gà ta tươi được chần khéo léo trong muôi nước béo đang sôi trên nồi nước phở, lòng trắng vừa chín tới ôm lấy lòng đỏ dẻo quánh, thêm chút tiêu đen và hành hoa chần tái.",
    "ingredients": [
      "Trứng gà tươi ta sạch",
      "Nước béo ngậy ninh xương",
      "Hành hoa tươi thái nhỏ"
    ],
    "preparationNote": "",
    "isAvailable": true
  },
  {
    "id": "banh-mi-gion",
    "name": "Bánh Mì Chuột Giòn Hà Nội",
    "category": "others",
    "price": 10000,
    "formattedPrice": "10.000 đ",
    "image": "images/regenerated_image_1790953403020.jpg",
    "isSignature": false,
    "isFeatured": false,
    "shortDescription": "Chiếc bánh mì chuột nướng giòn rụm, chấm cùng phở sốt vang hay nước phở bò béo ngậy.",
    "fullDescription": "Chiếc bánh mì nhỏ xinh nóng hổi giòn rụm vỏ ngoài, ruột xốp mềm, là bạn đồng hành hoàn hảo cùng món Phở Bò Sốt Vang trứ danh của Phở Thìn Bờ Hồ.",
    "ingredients": [
      "Bột mì nướng giòn",
      "Men bánh mì truyền thống"
    ],
    "preparationNote": "",
    "isAvailable": true
  }
],
  branches: [
  {
    "id": "cs1-dinh-tien-hoang",
    "code": "CS1",
    "name": "Cơ Sở 1 - 61 Đinh Tiên Hoàng (Bờ Hồ Gốc 1955)",
    "address": "61 Đinh Tiên Hoàng, Phường Hàng Bạc, Quận Hoàn Kiếm, Hà Nội",
    "phone": "(+84) 033 9253 464",
    "openingHours": "Sáng: 06:00 – 13:00 | Chiều: 17:00 – 22:00",
    "highlight": "Cơ sở cội nguồn nơi cụ Bùi Chí Thìn đặt gánh phở đầu tiên năm 1955 ngắm trọn Tháp Rùa",
    "isOriginal": true
  },
  {
    "id": "cs2-le-van-huu",
    "code": "CS2",
    "name": "Cơ Sở 2 - 1 Lê Văn Hưu",
    "address": "1 Lê Văn Hưu, Phường Phan Chu Trinh, Quận Hai Bà Trưng, Hà Nội",
    "phone": "0335324076",
    "openingHours": "Sáng: 06:00 – 13:00 | Chiều: 17:00 – 22:00",
    "highlight": "Nằm tại ngã tư giao thoa văn hoá phố cổ Hai Bà Trưng, không gian hoài cổ rộng rãi",
    "isOriginal": false
  },
  {
    "id": "cs3-hang-tre",
    "code": "CS3",
    "name": "Cơ Sở 3 - 1 Hàng Tre",
    "address": "1 Hàng Tre, Phường Lý Thái Tổ, Quận Hoàn Kiếm, Hà Nội",
    "phone": "0981205122",
    "openingHours": "Sáng: 06:00 – 13:00 | Chiều: 17:00 – 22:00",
    "highlight": "Giữa lòng phố cổ 36 phố phường, gần Nhà hát Lớn, điểm dừng chân quen thuộc của người Hà Thành",
    "isOriginal": false
  },
  {
    "id": "cs4-kim-ma",
    "code": "CS4",
    "name": "Cơ Sở 4 - 289 Kim Mã",
    "address": "289 Kim Mã, Phường Giảng Võ, Quận Ba Đình, Hà Nội",
    "phone": "(+84) 033 9253 464",
    "openingHours": "Sáng: 06:00 – 13:00 | Chiều: 17:00 – 22:00",
    "highlight": "Khu vực Ba Đình nhộn nhịp, thuận tiện đỗ xe, điểm đến yêu thích của gia đình và du khách",
    "isOriginal": false
  }
],
  articles: [
  {
    "id": "news-1-chinsu-pho-story",
    "title": "Bắt tay cùng Phở Thìn Bờ Hồ, Chin-su ra mắt phở ăn liền \"Phở Story\" mang hương vị phở gia truyền đến mọi miền",
    "excerpt": "Chin-su chính thức hợp tác cùng Phở Thìn Bờ Hồ ra mắt sản phẩm phở ăn liền \"Phở Story\", đánh dấu một bước tiến đưa giá trị ẩm thực truyền thống Việt Nam đến gần hơn với đời sống hiện đại.",
    "content": "Chin-su chính thức hợp tác cùng Phở Thìn Bờ Hồ ra mắt sản phẩm phở ăn liền \"Phở Story\", đánh dấu một bước tiến trong hành trình đưa những giá trị của ẩm thực truyền thống Việt Nam đến gần hơn với đời sống hiện đại.\n\nPhở Thìn Bờ Hồ có lịch sử từ năm 1955 và được biết đến là một trong những hàng phở lâu đời tại Hà Nội. Trải qua hơn 70 năm, thương hiệu vẫn duy trì hương vị phở thanh tao, cùng không gian mang nét cổ kính tại số 61 Đinh Tiên Hoàng, quận Hoàn Kiếm, Hà Nội. Năm 2019, Phở Thìn Bờ Hồ cũng được lựa chọn phục vụ tại Hội nghị Thượng đỉnh Mỹ - Triều, góp phần đưa món phở truyền thống Hà Nội đến với đông đảo khách quốc tế.\n\nVới mong muốn tái hiện hương vị phở gia truyền trong một sản phẩm tiện lợi, Chin-su đã phối hợp cùng nghệ nhân Phở Thìn Bờ Hồ để phát triển công thức nước dùng. Sản phẩm ứng dụng công nghệ hiện đại, thực hiện quy trình hầm xương và trích ly trong nhiều giờ nhằm tạo ra phần nước dùng cô đặc, giữ lại những nét đặc trưng của phở truyền thống.\n\nĐại diện Chin-su cho biết, \"Phở Story\" được xây dựng như một chuỗi câu chuyện về phở Việt Nam, bắt đầu với câu chuyện của Phở Thìn Bờ Hồ và hướng tới việc tiếp nối bằng những câu chuyện về các món phở đặc trưng khác trên khắp Việt Nam. Qua đó, thương hiệu mong muốn kết hợp giữa giá trị truyền thống và sự nhanh chóng, tiện lợi của sản phẩm hiện đại.\n\nVề phía Phở Thìn Bờ Hồ, đây là lần đầu tiên thương hiệu hợp tác kinh doanh để đưa hương vị phở truyền thống đến người tiêu dùng thông qua sản phẩm đóng gói. Sự hợp tác này mở ra một cách tiếp cận mới để thực khách có thể thưởng thức hương vị Phở Thìn Bờ Hồ thuận tiện hơn, đồng thời góp phần lan tỏa câu chuyện về ẩm thực Việt Nam.\n\nPhở Story vì vậy không chỉ là một sản phẩm phở ăn liền mà còn là sự kết hợp giữa hương vị gia truyền, công nghệ hiện đại và câu chuyện văn hóa ẩm thực Việt, tiếp nối hành trình đưa những món ngon truyền thống đến gần hơn với người tiêu dùng.",
    "date": "04/10/2023",
    "readTime": "5 phút đọc",
    "category": "Hợp Tác & Phát Triển",
    "image": "images/regenerated_image_1790961081614.jpg",
    "author": "Admin",
    "isHeroArticle": true
  },
  {
    "id": "news-2-ngay-viet-nam-nuoc-ngoai",
    "title": "Ngày Việt Nam ở nước ngoài 2023: Mang Phở Thìn, tranh Đông Hồ đến quốc tế",
    "excerpt": "Hình ảnh bát Phở Thìn Bờ Hồ thơm nức cùng những bức tranh dân gian Đông Hồ đã trở thành đại sứ văn hoá chạm đến trái tim bạn bè quốc tế.",
    "content": "Trong khuôn khổ chương trình \"Ngày Việt Nam ở nước ngoài 2023\", Phở Thìn Bờ Hồ vinh dự đại diện cho ẩm thực truyền thống Thủ Đô giới thiệu nét tinh hoa văn hoá ẩm thực Việt Nam đến bạn bè năm châu.\n\nTại không gian văn hoá, thực khách quốc tế không chỉ được chiêm ngưỡng những bức tranh Đông Hồ mộc mạc mà còn được trực tiếp thưởng thức từng thìa nước dùng thanh tao trong veo đặc trưng của người Tràng An.\n\nNhiều chính khách, nghệ sĩ và du khách quốc tế đã bày tỏ sự thán phục trước chiều sâu văn hoá và sự tinh tế trong cách nấu phở truyền thống hơn 70 năm của gia tộc cụ Thìn.",
    "date": "09/11/2023",
    "readTime": "4 phút đọc",
    "category": "Giao Lưu Quốc Tế",
    "image": "images/regenerated_image_1790965639507.webp",
    "author": "Admin",
    "isHeroArticle": false
  },
  {
    "id": "news-3-pho-ong-thin-the-gioi",
    "title": "Phở ông Thìn - Phố Cổ Hà Nội: Hương vị Phở Thìn Bờ Hồ theo chân hành khách vươn ra thế giới",
    "excerpt": "Những ký ức khó quên của du khách bốn phương khi ngồi bên hiên ngõ 61 Đinh Tiên Hoàng ngắm Tháp Rùa và thưởng thức bát phở nồng ấm.",
    "content": "Đối với mỗi du khách từng đặt chân đến Hà Nội, góc phố nhỏ 61 Đinh Tiên Hoàng luôn để lại ấn tượng sâu đậm khó phai.\n\nHương thơm từ gừng nướng, thảo quả cùng làn khói nghi ngút bốc lên từ chiếc nồi đồng cổ kính đã theo chân hàng triệu du khách quốc tế trở về nước, trở thành biểu tượng ẩm thực không thể thay thế.\n\nNhiều du khách chia sẻ rằng dù đã đi qua bao kinh đô ẩm thực trên thế giới, bát phở bò thanh trong ngát vị thảo mộc bên bờ hồ Gươm vẫn là kỷ niệm ấm áp nhất trong hành trình khám phá châu Á.",
    "date": "05/12/2024",
    "readTime": "4 phút đọc",
    "category": "Ký Sự Bờ Hồ",
    "image": "images/regenerated_image_1790912138011.jpg",
    "author": "Admin",
    "isHeroArticle": false
  },
  {
    "id": "news-4-bi-quyet-70-nam",
    "title": "Phở Thìn Bờ Hồ tiết lộ bí quyết làm nên món ăn 70 năm gây thương nhớ",
    "excerpt": "Bí mật nằm ở nồi nước dùng ninh xương ống bò hơn 12 tiếng cùng sự nghiêm ngặt trong khâu chọn lựa thịt tươi ngon mỗi sáng sớm.",
    "content": "Nhiều người thường lầm tưởng nước dùng phở bò phải béo ngậy đục ngầu mới là đậm đà. Nhưng với Phở Thìn Bờ Hồ suốt hơn 7 thập kỷ, đỉnh cao của phở Hà Nội lại nằm ở chữ \"Thanh\".\n\nNước dùng được ninh hoàn toàn từ xương ống bò bánh tẻ trong suốt hơn 12 tiếng liên tục. Người nấu phở phải túc trực vớt bọt tỉ mỉ để giữ nước trong như ngọc bích, thơm lừng hương gừng nướng và hoa hồi.\n\nThịt bò được chọn lọc từ những thớ thịt tươi mới nhất trong ngày, thái mỏng tang và chần vừa chín tới để giữ trọn vị ngọt tự nhiên, mềm tan nơi đầu lưỡi.",
    "date": "24/10/2023",
    "readTime": "6 phút đọc",
    "category": "Bí Quyết Ẩm Thực",
    "image": "images/regenerated_image_1790953552668.jpg",
    "author": "Admin",
    "isHeroArticle": false
  },
  {
    "id": "news-5-70-nam-luu-giu-huong-vi",
    "title": "Phở Thìn Bờ Hồ: Hơn 70 năm lưu giữ hương vị giữa lòng phố cổ Hà Nội",
    "excerpt": "Từ gánh phở cụ Bùi Chí Thìn năm 1955 đến nay, hương vị phở thanh tao độc bản vẫn vẹn nguyên, là niềm tự hào của ẩm thực đất Tràng An.",
    "content": "Ra đời từ năm 1955 giữa lòng Thủ Đô ngàn năm văn hiến, Phở Thìn Bờ Hồ đã trở thành một phần ký ức không thể thiếu trong tâm thức của bao thế hệ người Hà Nội.\n\nTrải qua hơn 70 năm với bao thăng trầm lịch sử, quán phở nhỏ tại ngõ 61 Đinh Tiên Hoàng vẫn giữ nguyên nét bình dị, cổ kính, không phô trương nhưng luôn tấp nập thực khách tìm về.\n\nBát phở bò ở đây không đơn thuần là một món ăn sáng mà còn chứa đựng cả bề dày văn hoá, sự tỉ mỉ của người nghệ nhân và tấm lòng trân quý những giá trị truyền thống xưa.",
    "date": "26/11/2025",
    "readTime": "5 phút đọc",
    "category": "Di Sản & Văn Hoá",
    "image": "images/regenerated_image_1790961085415.jpg",
    "author": "Admin",
    "isHeroArticle": false
  },
  {
    "id": "news-6-pho-yeu-thuong",
    "title": "Phở Thìn Bờ Hồ đồng hành cùng chương trình \"Phở Yêu Thương\"",
    "excerpt": "Hàng nghìn bát phở nóng hổi chan chứa tình nghĩa đã được trao tận tay các hoàn cảnh khó khăn, lan toả tinh thần nhân ái của người Tràng An.",
    "content": "Với tâm niệm ẩm thực không chỉ là kinh doanh mà còn là sự sẻ chia và phụng sự cộng đồng, Phở Thìn Bờ Hồ thường xuyên tổ chức các hoạt động thiện nguyện thiết thực.\n\nTrong chương trình \"Phở Yêu Thương\", gia đình nghệ nhân Phở Thìn đã tự tay chuẩn bị từng nồi nước dùng ngọt thanh, chuẩn bị những phần phở nóng sốt trao tận tay các bệnh nhân nghèo và người có hoàn cảnh khó khăn.\n\nMỗi bát phở trao đi không chỉ mang giá trị dinh dưỡng ấm lòng mà còn sưởi ấm niềm tin, lan tỏa thông điệp yêu thương và gắn kết cộng đồng giữa lòng Thủ Đô.",
    "date": "13/08/2024",
    "readTime": "4 phút đọc",
    "category": "Cộng Đồng & Thiện Nguyện",
    "image": "images/regenerated_image_1790961547583.png",
    "author": "Admin",
    "isHeroArticle": false
  },
  {
    "id": "news-7-pho-thin-ban-be-quoc-te",
    "title": "Phở Thìn Bờ Hồ góp mặt mang phở Việt đến bạn bè quốc tế",
    "excerpt": "Tự hào đại diện tinh hoa ẩm thực truyền thống Việt Nam tại các diễn đàn ngoại giao văn hoá và tuần lễ ẩm thực quốc tế.",
    "content": "Trong những năm gần đây, Phở Thìn Bờ Hồ liên tục được vinh danh và mời tham gia các sự kiện văn hoá quốc tế lớn tại Đông Nam Á, châu Âu và Bắc Mỹ.\n\nSự kiện mang đến cơ hội vàng để quảng bá quy trình chế biến công phu, triết lý âm dương ngũ hành trong gia vị Việt và tinh thần hiếu khách của người Hà Nội.\n\nHình ảnh thực khách quốc tế xếp hàng dài kiên nhẫn chờ thưởng thức từng bát phở thanh tao là minh chứng rõ nét cho sức sống mãnh liệt của di sản ẩm thực nước nhà.",
    "date": "24/03/2024",
    "readTime": "4 phút đọc",
    "category": "Giao Lưu Quốc Tế",
    "image": "images/regenerated_image_1790961550910.webp",
    "author": "Admin",
    "isHeroArticle": false
  },
  {
    "id": "news-8-pho-thin-hang-voi",
    "title": "Phở Thìn Bờ Hồ thay đổi trên phố Hàng Vôi",
    "excerpt": "Bước chuyển mình mở rộng không gian đón tiếp thực khách nhưng vẫn vẹn nguyên công thức nước dùng gia truyền trăm năm.",
    "content": "Nằm gần khu phố cổ sầm uất, sự hiện diện của Phở Thìn Bờ Hồ mang đến cho thực khách một không gian ẩm thực giao thoa hoàn hảo giữa nét cổ kính và tiện nghi hiện đại.\n\nKhông gian được bài trí tinh tế với bàn gỗ trầm, tranh ký họa phố cổ Hà Nội và những vật dụng gợi nhớ ký ức thời bao cấp.\n\nDù không gian có thêm phần khang trang, sạch đẹp, gia tộc Phở Thìn vẫn kiên định với quy trình hầm xương thủ công mỗi ngày, đảm bảo bát phở đến tay khách luôn giữ đúng phong vị cội nguồn 1955.",
    "date": "18/02/2024",
    "readTime": "3 phút đọc",
    "category": "Không Gian & Cơ Sở",
    "image": "images/regenerated_image_1790912134184.jpg",
    "author": "Admin",
    "isHeroArticle": false
  },
  {
    "id": "news-9-hanh-trinh-giu-vi",
    "title": "Hành trình giữ vị: Tự hào gìn giữ tinh hoa phở truyền thống qua năm tháng",
    "excerpt": "Câu chuyện truyền thừa qua 4 thế hệ của gia tộc cụ Thìn, kiên định với giá trị cốt lõi giữa nhịp sống công nghiệp hoá.",
    "content": "Trong một thời đại mà đồ ăn nhanh và hương liệu công nghiệp xuất hiện tràn lan, việc giữ trọn vẹn hương vị phở thủ công suốt 70 năm là một kỳ tích đáng trân trọng.\n\nMỗi sớm mai, khi thành phố còn chìm trong giấc ngủ, những người con cháu cụ Thìn đã bắt đầu ngày mới bên bếp lửa rực hồng, tỉ mẩn chọn từng cân xương, củ gừng, cọng hành hoa.\n\n\"Hành trình giữ vị\" không chỉ là giữ một thương hiệu gia đình, mà là giữ lấy một mảnh linh hồn Hà Nội, để dù đi đâu về đâu, người ta vẫn tìm thấy một chốn bình yên trong bát phở ngát hương.",
    "date": "10/01/2024",
    "readTime": "5 phút đọc",
    "category": "Di Sản & Văn Hoá",
    "image": "images/dish_pho_tai_chin_1790702822779.jpg",
    "author": "Admin",
    "isHeroArticle": false
  }
],
  sampleReservations: [
  {
    "id": "RES-8921",
    "fullName": "Nguyễn Hoàng Nam",
    "phone": "0912345678",
    "email": "nam.nguyen@gmail.com",
    "reservationDate": "2026-10-19",
    "reservationTime": "11:30",
    "partySize": 4,
    "branchId": "cs1-dinh-tien-hoang",
    "branchName": "CS1: 61 Đinh Tiên Hoàng (Bờ Hồ Gốc 1955)",
    "notes": "Bàn ngồi nhìn ra hồ Hoàn Kiếm",
    "status": "confirmed",
    "createdAt": "2026-10-19T16:24:35.665Z",
    "preOrderedItems": [
      {
        "dishId": "pho-tai-chin",
        "name": "Phở Tái Chín (Đặc Sản Gia Truyền)",
        "unitPrice": 80000,
        "quantity": 4
      },
      {
        "dishId": "quay-gion-vang",
        "name": "Quẩy Giòn Vàng Ươm Hà Nội (Đĩa 3 chiếc)",
        "unitPrice": 15000,
        "quantity": 2
      }
    ],
    "preOrderTotal": 350000
  },
  {
    "id": "RES-8922",
    "fullName": "Trần Thị Thu Hà",
    "phone": "0987654321",
    "email": "thuha@yahoo.com",
    "reservationDate": "2026-10-19",
    "reservationTime": "12:00",
    "partySize": 2,
    "branchId": "cs1-dinh-tien-hoang",
    "branchName": "CS1: 61 Đinh Tiên Hoàng (Bờ Hồ Gốc 1955)",
    "notes": "Cho 2 chén ớt tươi riêng",
    "status": "pending",
    "createdAt": "2026-10-19T16:24:35.665Z",
    "preOrderedItems": [
      {
        "dishId": "pho-sot-vang",
        "name": "Phở Bò Sốt Vang Cổ Điển",
        "unitPrice": 85000,
        "quantity": 2
      }
    ],
    "preOrderTotal": 170000
  }
],
  sampleOrders: [
  {
    "id": "ORD-5501",
    "fullName": "Lê Văn Tùng",
    "phone": "0901234567",
    "branchId": "cs1-dinh-tien-hoang",
    "branchName": "CS1: 61 Đinh Tiên Hoàng (Bờ Hồ Gốc 1955)",
    "pickupTime": "12:00",
    "notes": "Đóng gói phở và nước dùng riêng để mang về",
    "totalAmount": 195000,
    "status": "confirmed",
    "createdAt": "2026-10-19T16:24:35.665Z",
    "items": [
      {
        "dishId": "pho-tai-chin",
        "name": "Phở Tái Chín (Đặc Sản Gia Truyền)",
        "unitPrice": 80000,
        "quantity": 2
      },
      {
        "dishId": "quay-gion-vang",
        "name": "Quẩy Giòn Vàng Ươm Hà Nội (Đĩa 3 chiếc)",
        "unitPrice": 15000,
        "quantity": 1
      },
      {
        "dishId": "tra-da-ha-noi",
        "name": "Trà Đá Hà Nội Truyền Thống",
        "unitPrice": 10000,
        "quantity": 2
      }
    ]
  }
]
};
