/**
 * store.js - Quản lý trạng thái và dữ liệu bằng localStorage
 * Xử lý kiểm tra số bàn trống (tối đa 20 bàn / khung giờ / cơ sở)
 */

const PhoThinStore = {
  // Khởi tạo dữ liệu vào localStorage và tự động đồng bộ khi có phiên bản dữ liệu mới
  init() {
    const currentVersion = localStorage.getItem('phothin_data_version');
    const targetVersion = (typeof DATA_VERSION !== 'undefined') ? DATA_VERSION : '2026.10.19-full';

    if (currentVersion !== targetVersion) {
      localStorage.setItem('phothin_data_version', targetVersion);
      localStorage.setItem('phothin_dishes', JSON.stringify(INITIAL_DATA.dishes));
      localStorage.setItem('phothin_branches', JSON.stringify(INITIAL_DATA.branches));
      localStorage.setItem('phothin_articles', JSON.stringify(INITIAL_DATA.articles));
      if (!localStorage.getItem('phothin_reservations')) {
        localStorage.setItem('phothin_reservations', JSON.stringify(INITIAL_DATA.sampleReservations));
      }
      if (!localStorage.getItem('phothin_orders')) {
        localStorage.setItem('phothin_orders', JSON.stringify(INITIAL_DATA.sampleOrders));
      }
      if (!localStorage.getItem('phothin_cart')) {
        localStorage.setItem('phothin_cart', JSON.stringify([]));
      }
      return;
    }

    if (!localStorage.getItem('phothin_dishes')) {
      localStorage.setItem('phothin_dishes', JSON.stringify(INITIAL_DATA.dishes));
    }
    if (!localStorage.getItem('phothin_branches')) {
      localStorage.setItem('phothin_branches', JSON.stringify(INITIAL_DATA.branches));
    }
    if (!localStorage.getItem('phothin_articles')) {
      localStorage.setItem('phothin_articles', JSON.stringify(INITIAL_DATA.articles));
    }
    if (!localStorage.getItem('phothin_reservations')) {
      localStorage.setItem('phothin_reservations', JSON.stringify(INITIAL_DATA.sampleReservations));
    }
    if (!localStorage.getItem('phothin_orders')) {
      localStorage.setItem('phothin_orders', JSON.stringify(INITIAL_DATA.sampleOrders));
    }
    if (!localStorage.getItem('phothin_cart')) {
      localStorage.setItem('phothin_cart', JSON.stringify([]));
    }
  },

  // Reset dữ liệu về ban đầu (cho giáo viên test thử)
  resetToDefault() {
    localStorage.setItem('phothin_dishes', JSON.stringify(INITIAL_DATA.dishes));
    localStorage.setItem('phothin_branches', JSON.stringify(INITIAL_DATA.branches));
    localStorage.setItem('phothin_articles', JSON.stringify(INITIAL_DATA.articles));
    localStorage.setItem('phothin_reservations', JSON.stringify(INITIAL_DATA.sampleReservations));
    localStorage.setItem('phothin_orders', JSON.stringify(INITIAL_DATA.sampleOrders));
    localStorage.setItem('phothin_cart', JSON.stringify([]));
  },

  // Lấy danh sách món ăn
  getDishes() {
    this.init();
    try {
      return JSON.parse(localStorage.getItem('phothin_dishes') || '[]');
    } catch {
      return INITIAL_DATA.dishes;
    }
  },

  getDishById(id) {
    return this.getDishes().find(d => d.id === id) || null;
  },

  // Bật/tắt trạng thái hết món
  toggleDishAvailability(id) {
    const dishes = this.getDishes().map(d => {
      if (d.id === id) return { ...d, isAvailable: !d.isAvailable };
      return d;
    });
    localStorage.setItem('phothin_dishes', JSON.stringify(dishes));
    return dishes;
  },

  // Thêm món ăn mới
  addDish(dish) {
    const dishes = this.getDishes();
    const priceNum = Number(dish.price) || 0;
    const newDish = {
      ...dish,
      id: dish.id || 'dish-' + Date.now(),
      price: priceNum,
      formattedPrice: priceNum.toLocaleString('vi-VN') + ' đ',
      isAvailable: dish.isAvailable !== false
    };
    dishes.push(newDish);
    localStorage.setItem('phothin_dishes', JSON.stringify(dishes));
    return newDish;
  },

  // Cập nhật thông tin món ăn
  updateDish(dish) {
    const priceNum = Number(dish.price) || 0;
    const dishes = this.getDishes().map(d => {
      if (d.id === dish.id) {
        return {
          ...d,
          ...dish,
          price: priceNum,
          formattedPrice: priceNum.toLocaleString('vi-VN') + ' đ'
        };
      }
      return d;
    });
    localStorage.setItem('phothin_dishes', JSON.stringify(dishes));
    return dishes;
  },

  // Xóa món ăn
  deleteDish(id) {
    const dishes = this.getDishes().filter(d => d.id !== id);
    localStorage.setItem('phothin_dishes', JSON.stringify(dishes));
    return dishes;
  },

  // Lấy danh sách cơ sở
  getBranches() {
    this.init();
    try {
      return JSON.parse(localStorage.getItem('phothin_branches') || '[]');
    } catch {
      return INITIAL_DATA.branches;
    }
  },

  getBranchById(id) {
    return this.getBranches().find(b => b.id === id) || null;
  },

  // Lấy danh sách bài viết
  getArticles() {
    this.init();
    try {
      return JSON.parse(localStorage.getItem('phothin_articles') || '[]');
    } catch {
      return INITIAL_DATA.articles;
    }
  },

  // ==========================================
  // QUẢN LÝ GIỎ HÀNG (DÀNH CHO ĐƠN MANG VỀ HOẶC CHUYỂN SANG ĐẶT BÀN)
  // ==========================================
  getCart() {
    this.init();
    try {
      return JSON.parse(localStorage.getItem('phothin_cart') || '[]');
    } catch {
      return [];
    }
  },

  saveCart(cart) {
    localStorage.setItem('phothin_cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('phothin_cart_updated'));
  },

  addToCart(dishId, quantity = 1) {
    const cart = this.getCart();
    const existing = cart.find(item => item.dishId === dishId);
    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.push({ dishId, quantity });
    }
    this.saveCart(cart);
  },

  updateCartQuantity(dishId, quantity) {
    let cart = this.getCart();
    if (quantity <= 0) {
      cart = cart.filter(item => item.dishId !== dishId);
    } else {
      const existing = cart.find(item => item.dishId === dishId);
      if (existing) existing.quantity = quantity;
    }
    this.saveCart(cart);
  },

  clearCart() {
    this.saveCart([]);
  },

  getCartTotalCount() {
    return this.getCart().reduce((sum, item) => sum + item.quantity, 0);
  },

  // ==========================================
  // QUẢN LÝ ĐẶT BÀN & KIỂM TRA SỨC CHỨA 20 BÀN
  // ==========================================
  getReservations() {
    this.init();
    try {
      return JSON.parse(localStorage.getItem('phothin_reservations') || '[]');
    } catch {
      return [];
    }
  },

  // Tính số lượng bàn đã đặt và còn lại cho từng khung giờ
  getReservationAvailability(branchId, date) {
    const reservations = this.getReservations().filter(
      r => r.branchId === branchId && r.reservationDate === date && r.status !== 'cancelled'
    );

    const counts = {};
    reservations.forEach(r => {
      const time = r.reservationTime;
      counts[time] = (counts[time] || 0) + 1;
    });

    const availability = {};
    const timeSlots = [
      '06:30', '07:00', '07:30', '08:00', '08:30', '09:00', '09:30',
      '10:00', '10:30', '11:00', '11:30', '12:00', '12:30',
      '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
      '20:00', '20:30', '21:00', '21:30'
    ];

    timeSlots.forEach(slot => {
      const booked = counts[slot] || 0;
      availability[slot] = {
        booked,
        remaining: Math.max(0, 20 - booked) // TỐI ĐA 20 BÀN
      };
    });

    return availability;
  },

  createReservation(data) {
    const availability = this.getReservationAvailability(data.branchId, data.reservationDate);
    const slotInfo = availability[data.reservationTime] || { booked: 0, remaining: 20 };

    if (slotInfo.remaining <= 0) {
      throw new Error('Khung giờ này tại cơ sở đã đạt giới hạn 20 bàn đặt trước. Vui lòng chọn khung giờ khác.');
    }

    const reservations = this.getReservations();
    const branch = this.getBranchById(data.branchId);
    
    // Tính tổng tiền món gọi trước nếu có
    const preOrderedItems = Array.isArray(data.preOrderedItems) ? data.preOrderedItems : [];
    const preOrderTotal = preOrderedItems.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);

    const newReservation = {
      id: 'RES-' + Math.floor(1000 + Math.random() * 9000),
      fullName: data.fullName.trim(),
      phone: data.phone.trim(),
      email: (data.email || '').trim(),
      reservationDate: data.reservationDate,
      reservationTime: data.reservationTime,
      partySize: Number(data.partySize) || 2,
      branchId: data.branchId,
      branchName: branch ? `${branch.code}: ${branch.name}` : data.branchId,
      notes: (data.notes || '').trim(),
      status: 'pending',
      createdAt: new Date().toISOString(),
      preOrderedItems,
      preOrderTotal
    };

    reservations.unshift(newReservation);
    localStorage.setItem('phothin_reservations', JSON.stringify(reservations));
    
    // Lưu số điện thoại vào localStorage để tiện tra cứu
    localStorage.setItem('phothin_customer_phone', data.phone.trim());

    return newReservation;
  },

  updateReservationStatus(id, status) {
    const reservations = this.getReservations().map(r => {
      if (r.id === id) return { ...r, status };
      return r;
    });
    localStorage.setItem('phothin_reservations', JSON.stringify(reservations));
    return reservations;
  },

  // ==========================================
  // QUẢN LÝ ĐƠN MANG VỀ (TAKEAWAY)
  // ==========================================
  getOrders() {
    this.init();
    try {
      return JSON.parse(localStorage.getItem('phothin_orders') || '[]');
    } catch {
      return [];
    }
  },

  createOrder(data) {
    const orders = this.getOrders();
    const branch = this.getBranchById(data.branchId);
    const items = data.items || [];
    const total = items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);

    const newOrder = {
      id: 'ORD-' + Math.floor(1000 + Math.random() * 9000),
      fullName: data.fullName.trim(),
      phone: data.phone.trim(),
      branchId: data.branchId,
      branchName: branch ? `${branch.code}: ${branch.name}` : data.branchId,
      pickupAt: data.pickupAt,
      notes: (data.notes || '').trim(),
      total,
      status: 'pending',
      createdAt: new Date().toISOString(),
      items
    };

    orders.unshift(newOrder);
    localStorage.setItem('phothin_orders', JSON.stringify(orders));
    localStorage.setItem('phothin_customer_phone', data.phone.trim());

    // Xóa giỏ hàng sau khi đặt thành công
    this.clearCart();

    return newOrder;
  },

  updateOrderStatus(id, status) {
    const orders = this.getOrders().map(o => {
      if (o.id === id) return { ...o, status };
      return o;
    });
    localStorage.setItem('phothin_orders', JSON.stringify(orders));
    return orders;
  },

  // Lấy đơn theo số điện thoại khách hàng (cho trang Tra cứu)
  getCustomerRecords(phone) {
    const cleanPhone = (phone || '').replace(/[\s().-]/g, '');
    const reservations = this.getReservations().filter(
      r => r.phone.replace(/[\s().-]/g, '') === cleanPhone
    );
    const orders = this.getOrders().filter(
      o => o.phone.replace(/[\s().-]/g, '') === cleanPhone
    );
    return { reservations, orders };
  }
};

// Tự động khởi tạo ngay khi nạp file trong môi trường trình duyệt
if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
  PhoThinStore.init();
}
