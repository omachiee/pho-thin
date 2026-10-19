/**
 * data.js - Dữ liệu mẫu chuẩn cho Phở Thìn Bờ Hồ
 * Tự động đồng bộ vào localStorage nếu chưa có dữ liệu.
 */

const INITIAL_DATA = {
  dishes: [
    {
      id: 'pho-tai-chin',
      name: 'Phở Tái Chín (Đặc Sản Gia Truyền)',
      category: 'pho',
      price: 80000,
      formattedPrice: '80.000 đ',
      image: 'images/regenerated_image_1790911567588.png',
      isSignature: true,
      isFeatured: true,
      shortDescription: 'Sự kết hợp hoàn hảo giữa nạm bò chín mềm ngậy và thịt bò tái tươi rói đập dập trên thớt gỗ nghiến, ngập trong nước dùng thanh ngọt thơm nức.',
      fullDescription: 'Phở Tái Chín là linh hồn và biểu tượng của Phở Thìn Bờ Hồ suốt từ năm 1955 đến nay. Từng miếng thịt nạm bò được luộc chín tới, thái mỏng tang giữ trọn độ ngậy thơm; trong khi thịt thăn bò tươi đỏ hồng được đặt lên thớt gỗ nghiến dằn nhẹ cho mềm rồi chần qua nước sôi ùng ục, giữ trọn vị ngọt tự nhiên ngọt lịm. Nước dùng nấu hoàn toàn bằng xương ống bò tươi, không pha mì chính lợ, thanh trong mà ngọt sâu cuống họng, rợp màu xanh mướt của hành hoa thái nhỏ.',
      ingredients: [
        'Bánh phở tươi tráng thủ công hàng ngày',
        'Thịt thăn bò tươi thái mỏng đập dập',
        'Nạm bò hoa luộc mềm thơm',
        'Nước hầm xương ống bò 12 giờ bí truyền',
        'Hành hoa, ngò gai tươi xanh Bờ Hồ',
        'Gừng nướng, hoa hồi, thảo quả Tây Bắc'
      ],
      isAvailable: true
    },
    {
      id: 'pho-sot-vang',
      name: 'Phở Bò Sốt Vang Cổ Điển',
      category: 'pho',
      price: 85000,
      formattedPrice: '85.000 đ',
      image: 'images/regenerated_image_1790953552668.jpg',
      isSignature: false,
      isFeatured: true,
      shortDescription: 'Những dẻ sườn và gân bò mềm tan hầm cùng vang chát, thảo mộc quý và gấc đỏ tươi, tạo nên màu sắc hổ phách và vị nồng ấm quyến rũ.',
      fullDescription: 'Món Phở Bò Sốt Vang mang dấu ấn văn hóa giao thoa Á - Âu đặc trưng của người Hà Nội thời kỳ đầu thế kỷ 20. Thịt bò bắp và dẻ sườn có lẫn chút gân được thái quân cờ, ướp cùng rượu vang, quế, hồi, thảo quả và dầu điều gấc tự nhiên trước khi xào săn và hầm nhừ suốt nhiều tiếng đồng hồ. Khi chan nước phở, từng muỗng sốt vang đỏ óng ánh hòa tan vào nước dùng thanh trong tạo nên hương vị bùi béo mà không ngấy, ăn kèm quẩy giòn và chút tiêu đen xay mịn thì tuyệt đỉnh.',
      ingredients: [
        'Bò bắp hoa và gân giòn thái quân cờ',
        'Rượu vang đỏ thơm nồng',
        'Gấc tươi tạo màu hổ phách',
        'Bánh phở tươi mỏng mượt',
        'Nước dùng bò nguyên chất',
        'Rau mùi và tiêu đen Phú Quốc'
      ],
      isAvailable: true
    },
    {
      id: 'pho-tai-lan',
      name: 'Phở Bò Tái Lăn Chảo Lửa',
      category: 'pho',
      price: 85000,
      formattedPrice: '85.000 đ',
      image: 'images/regenerated_image_1790964215309.webp',
      isSignature: false,
      isFeatured: true,
      shortDescription: 'Thịt bò tươi xào lăn nhanh tay trên chảo gang rực lửa cùng tỏi đập dập và gừng bánh tẻ, giữ trọn vị ngọt mọng đậm đà.',
      fullDescription: 'Thịt bò tươi được thái mỏng, ướp chút gia vị rồi đảo thật nhanh tay trên ngọn lửa lớn với mỡ nước và tỏi phi thơm lừng. Tiếng xèo xèo reo vang trên chảo gang đỏ lửa chỉ diễn ra trong vòng mười mấy giây để thịt vừa chín tới bên ngoài mà bên trong vẫn mềm ngọt nước.',
      ingredients: [
        'Thăn bò tươi ngon chọn lọc',
        'Tỏi ta thơm nồng đập dập',
        'Gừng dé cay nồng thái chỉ',
        'Hành hoa chần tái ngập bát',
        'Nước dùng bò ngọt thanh'
      ],
      isAvailable: true
    },
    {
      id: 'quay-gion-ha-noi',
      name: 'Quẩy Giòn Hà Nội Thượng Hạng',
      category: 'others',
      price: 15000,
      formattedPrice: '15.000 đ',
      image: 'images/banh_mi_chuot_gion.jpg',
      isSignature: false,
      isFeatured: true,
      shortDescription: 'Quẩy vàng ruộm, vỏ ngoài giòn rụm không ngấm dầu, ruột xốp rỗng hút trọn nước phở nóng hổi đậm đà.',
      fullDescription: 'Chiếc quẩy phở Hà Nội chuẩn vị phải nở đều, ruột xốp rỗng và thơm dịu mùi bột mì lên men tự nhiên. Nhúng chiếc quẩy ngập vào bát nước dùng nóng hổi 98°C, để quẩy hút trọn tinh hoa nước dùng rồi cắn một miếng vừa mềm vừa giòn bùi ngầy ngậy.',
      ingredients: [
        'Bột mì hảo hạng ủ men truyền thống',
        'Chiên ngập dầu tươi mới mỗi ngày',
        'Không dùng chất bảo quản hay phụ gia'
      ],
      isAvailable: true
    },
    {
      id: 'trung-chan-tiet',
      name: 'Trứng Chần Nước Béo & Tiết Canh Phở',
      category: 'others',
      price: 15000,
      formattedPrice: '15.000 đ',
      image: 'images/trung_chan_nuoc_beo.jpg',
      isSignature: false,
      isFeatured: true,
      shortDescription: 'Trứng gà ta lòng đào chần khéo léo trong muôi nước dùng sôi sùng sục, béo ngậy tan chảy kích thích vị giác.',
      fullDescription: 'Quả trứng gà ta tươi rói đập nhẹ vào muôi thủng, nhúng sâu vào nồi nước phở đang sôi ùng ục trong chừng 45 giây. Lòng trắng vừa se lại bao bọc lấy lòng đỏ sánh mịn vàng ươm như mật ong rừng.',
      ingredients: [
        'Trứng gà ta tươi mới trong ngày',
        'Nước béo ngậy váng vàng óng tự nhiên',
        'Hành hoa thái mịn và tiêu đen'
      ],
      isAvailable: true
    },
    {
      id: 'tra-da-ha-noi',
      name: 'Trà Đá Hà Nội Phố Cổ',
      category: 'drinks',
      price: 10000,
      formattedPrice: '10.000 đ',
      image: 'images/tra_da_ha_noi.jpg',
      isSignature: false,
      isFeatured: false,
      shortDescription: 'Trà sen hoặc chè búp Thái Nguyên hảo hạng pha đậm đà cùng đá viên mát lạnh, thanh lọc vị giác sau bát phở thơm.',
      fullDescription: 'Cốc trà đá màu vàng óng hổ phách, thoang thoảng hương sen Tây Hồ mát lịm. Vị chát nhẹ đầu lưỡi rồi ngọt hậu nơi cuống họng, đúng phong vị đời sống thường nhật của người Tràng An.',
      ingredients: [
        'Trà búp móc câu Thái Nguyên',
        'Ướp hoa lài/hoa sen tự nhiên',
        'Đá bi sạch tinh khiết'
      ],
      isAvailable: true
    }
  ],

  branches: [
    {
      id: 'cs1-dinh-tien-hoang',
      code: 'CS1',
      name: 'Cơ Sở 1 - 61 Đinh Tiên Hoàng (Bờ Hồ Gốc 1955)',
      address: '61 Đinh Tiên Hoàng, Phường Hàng Bạc, Quận Hoàn Kiếm, Hà Nội',
      phone: '(+84) 033 9253 464',
      openingHours: 'Sáng: 06:00 – 13:00 | Chiều: 17:00 – 22:00',
      highlight: 'Cơ sở cội nguồn nơi cụ Bùi Chí Thìn đặt gánh phở đầu tiên năm 1955 ngắm trọn Tháp Rùa',
      isOriginal: true
    },
    {
      id: 'cs2-le-van-huu',
      code: 'CS2',
      name: 'Cơ Sở 2 - 1 Lê Văn Hưu',
      address: '1 Lê Văn Hưu, Phường Phan Chu Trinh, Quận Hai Bà Trưng, Hà Nội',
      phone: '0335 324 076',
      openingHours: 'Sáng: 06:00 – 13:00 | Chiều: 17:00 – 22:00',
      highlight: 'Nằm tại ngã tư giao thoa văn hoá phố cổ Hai Bà Trưng, không gian hoài cổ rộng rãi',
      isOriginal: false
    },
    {
      id: 'cs3-hang-tre',
      code: 'CS3',
      name: 'Cơ Sở 3 - 1 Hàng Tre',
      address: '1 Hàng Tre, Phường Lý Thái Tổ, Quận Hoàn Kiếm, Hà Nội',
      phone: '0981 205 122',
      openingHours: 'Sáng: 06:00 – 13:00 | Chiều: 17:00 – 22:00',
      highlight: 'Giữa lòng phố cổ 36 phố phường, gần Nhà hát Lớn, điểm dừng chân quen thuộc của người Hà Thành',
      isOriginal: false
    },
    {
      id: 'cs4-kim-ma',
      code: 'CS4',
      name: 'Cơ Sở 4 - 289 Kim Mã',
      address: '289 Kim Mã, Phường Giảng Võ, Quận Ba Đình, Hà Nội',
      phone: '(+84) 033 9253 464',
      openingHours: 'Sáng: 06:00 – 13:00 | Chiều: 17:00 – 22:00',
      highlight: 'Khu vực Ba Đình nhộn nhịp, thuận tiện đỗ xe, điểm đến yêu thích của gia đình và du khách',
      isOriginal: false
    }
  ],

  articles: [
    {
      id: 'news-1',
      title: 'Bắt tay cùng Phở Thìn Bờ Hồ, Chin-su ra mắt phở ăn liền "Phở Story" mang hương vị phở gia truyền đến mọi miền',
      excerpt: 'Chin-su chính thức hợp tác cùng Phở Thìn Bờ Hồ ra mắt sản phẩm phở ăn liền "Phở Story", đánh dấu một bước tiến đưa giá trị ẩm thực truyền thống Việt Nam đến gần hơn với đời sống hiện đại.',
      date: '04/10/2023',
      readTime: '5 phút đọc',
      category: 'Hợp Tác & Phát Triển',
      image: 'images/regenerated_image_1790961081614.jpg',
      author: 'Admin'
    },
    {
      id: 'news-2',
      title: 'Hơn 70 năm gìn giữ nồi nước dùng gia truyền của cụ Bùi Chí Thìn bên bờ hồ Hoàn Kiếm',
      excerpt: 'Từ gánh phở rong buổi đầu giải phóng Thủ đô 1954 đến thương hiệu nức tiếng được phục vụ tại Hội nghị Thượng đỉnh Mỹ - Triều 2019.',
      date: '15/11/2023',
      readTime: '7 phút đọc',
      category: 'Lịch Sử & Văn Hóa',
      image: 'images/vintage_hanoi_pho_stall_1790702834461.jpg',
      author: 'Ban Văn Hóa'
    },
    {
      id: 'news-3',
      title: 'Ngày Việt Nam ở nước ngoài 2023: Mang Phở Thìn, tranh Đông Hồ đến bạn bè quốc tế',
      excerpt: 'Hình ảnh bát Phở Thìn Bờ Hồ thơm nức cùng những bức tranh dân gian Đông Hồ đã trở thành đại sứ văn hoá chạm đến trái tim bạn bè quốc tế.',
      date: '09/11/2023',
      readTime: '4 phút đọc',
      category: 'Giao Lưu Quốc Tế',
      image: 'images/regenerated_image_1790965639507.webp',
      author: 'Admin'
    }
  ],

  // Dữ liệu mẫu ban đầu để cô giáo mở lên là thấy ngay danh sách đặt bàn
  sampleReservations: [
    {
      id: 'RES-8921',
      fullName: 'Nguyễn Hoàng Nam',
      phone: '0912345678',
      email: 'nam.nguyen@gmail.com',
      reservationDate: new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date()),
      reservationTime: '11:30',
      partySize: 4,
      branchId: 'cs1-dinh-tien-hoang',
      branchName: 'CS1: 61 Đinh Tiên Hoàng (Bờ Hồ Gốc 1955)',
      notes: 'Bàn ngồi nhìn ra hồ Hoàn Kiếm',
      status: 'confirmed',
      createdAt: new Date().toISOString(),
      preOrderedItems: [
        { dishId: 'pho-tai-chin', name: 'Phở Tái Chín (Đặc Sản Gia Truyền)', unitPrice: 80000, quantity: 4 },
        { dishId: 'quay-gion-ha-noi', name: 'Quẩy Giòn Hà Nội Thượng Hạng', unitPrice: 15000, quantity: 2 }
      ],
      preOrderTotal: 350000
    },
    {
      id: 'RES-8922',
      fullName: 'Trần Thị Thu Hà',
      phone: '0987654321',
      email: 'thuha@yahoo.com',
      reservationDate: new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date()),
      reservationTime: '12:00',
      partySize: 2,
      branchId: 'cs1-dinh-tien-hoang',
      branchName: 'CS1: 61 Đinh Tiên Hoàng (Bờ Hồ Gốc 1955)',
      notes: 'Cho 2 chén ớt tươi riêng',
      status: 'pending',
      createdAt: new Date().toISOString(),
      preOrderedItems: [
        { dishId: 'pho-sot-vang', name: 'Phở Bò Sốt Vang Cổ Điển', unitPrice: 85000, quantity: 2 }
      ],
      preOrderTotal: 170000
    }
  ],

  sampleOrders: [
    {
      id: 'ORD-5501',
      fullName: 'Lê Văn Tùng',
      phone: '0901234567',
      branchId: 'cs1-dinh-tien-hoang',
      branchName: 'CS1: 61 Đinh Tiên Hoàng (Bờ Hồ Gốc 1955)',
      pickupAt: new Date(Date.now() + 3600000).toISOString(),
      notes: 'Đóng gói phở và nước dùng riêng để mang về',
      total: 195000,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
      items: [
        { dishId: 'pho-tai-chin', name: 'Phở Tái Chín', unitPrice: 80000, quantity: 2 },
        { dishId: 'quay-gion-ha-noi', name: 'Quẩy Giòn Hà Nội', unitPrice: 15000, quantity: 1 },
        { dishId: 'tra-da-ha-noi', name: 'Trà Đá Hà Nội', unitPrice: 10000, quantity: 2 }
      ]
    }
  ]
};
