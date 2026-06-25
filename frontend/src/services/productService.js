import api from "./api";

export const sampleCategories = [
  {
    id: 1,
    name: "Thời trang nam",
    image: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 2,
    name: "Thời trang nữ",
    image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 3,
    name: "Điện thoại & phụ kiện",
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 4,
    name: "Mẹ và bé",
    image: "https://images.unsplash.com/photo-1511407397940-d57f68e81203?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 5,
    name: "Thiết bị điện tử",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 6,
    name: "Nhà cửa đời sống",
    image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 7,
    name: "Máy tính và laptop",
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 8,
    name: "Sắc đẹp",
    image: "https://images.unsplash.com/photo-1495121605193-b116b5b9c5d1?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 9,
    name: "Đồng hồ",
    image: "https://images.unsplash.com/photo-1517686469429-8bdb6000d8c8?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 10,
    name: "Sức khỏe",
    image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=900&q=80",
  },
];

export const sampleProducts = [
  {
    id: 1,
    name: "Tai nghe Bluetooth NovaBeat",
    description: "Chống ồn tốt, pin 40 giờ và hộp sạc gọn nhẹ cho đi học, đi làm.",
    price: 890000,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80",
    category: "Thiết bị điện tử",
    discount_percent: 15,
    rating: 4.8,
  },
  {
    id: 2,
    name: "Bàn phím cơ LumiKey K8",
    description: "Switch êm, đèn nền RGB, layout gọn cho góc làm việc hiện đại.",
    price: 1290000,
    image: "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=900&q=80",
    category: "Máy tính và laptop",
    discount_percent: 0,
    rating: 4.7,
  },
  {
    id: 3,
    name: "Đồng hồ thông minh FitOne",
    description: "Theo dõi sức khỏe, thông báo nhanh, chống nước và pin 7 ngày.",
    price: 1590000,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80",
    category: "Đồng hồ",
    discount_percent: 10,
    rating: 4.6,
  },
  {
    id: 4,
    name: "Balo laptop Urban 15",
    description: "Ngăn chống sốc, vải trượt nước, dung tích vừa đủ cho mỗi ngày.",
    price: 650000,
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=80",
    category: "Thời trang nam",
    discount_percent: 8,
    rating: 4.9,
  },
  {
    id: 5,
    name: "Chuột không dây Swift M2",
    description: "Cảm biến nhạy, kết nối ổn định, thiết kế cong thái học.",
    price: 390000,
    image: "https://images.unsplash.com/photo-1527814050087-3793815479db?auto=format&fit=crop&w=900&q=80",
    category: "Máy tính và laptop",
    discount_percent: 12,
    rating: 4.5,
  },
  {
    id: 6,
    name: "Đèn bàn LED Focus",
    description: "Ba mức sáng, bảo vệ mắt, thân đèn gập linh hoạt.",
    price: 520000,
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=900&q=80",
    category: "Nhà cửa đời sống",
    discount_percent: 0,
    rating: 4.7,
  },
  {
    id: 7,
    name: "Áo khoác gió WindFlex",
    description: "Vải nhẹ, chống nước nhẹ, dễ phối cho thời tiết thất thường.",
    price: 720000,
    image: "https://images.unsplash.com/photo-1520975954732-35dd22299614?auto=format&fit=crop&w=900&q=80",
    category: "Thời trang nam",
    discount_percent: 18,
    rating: 4.6,
  },  
  {
    id: 8,
    name: "Túi đeo vai Minimal",
    description: "Kiểu dáng gọn, khóa chắc, phù hợp đi chơi và đi làm.",
    price: 430000,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80",
    category: "Túi ví nữ",
    discount_percent: 5,
    rating: 4.4,
  },
  {
    id: 9,
    name: "Máy xay sinh tố FreshMix",
    description: "Cối bền, xay nhanh, dễ vệ sinh sau khi sử dụng.",
    price: 860000,
    image: "https://images.unsplash.com/photo-1570222094114-d054a817e56b?auto=format&fit=crop&w=900&q=80",
    category: "Nhà cửa đời sống",
    discount_percent: 9,
    rating: 4.5,
  },
  {
    id: 10,
    name: "Kem dưỡng da GlowCare",
    description: "Kết cấu nhẹ, cấp ẩm tốt, phù hợp dùng hằng ngày.",
    price: 310000,
    image: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=900&q=80",
    category: "Sắc đẹp",
    discount_percent: 14,
    rating: 4.8,
  },
];

export const getProducts = async (params = {}) => {
  const response = await api.get("/products", { params });
  return response.data;
};

export const getProductsByCategory = async (category) => {
  const response = await api.get("/products", {
    params: { category },
  });
  return response.data;
};

export const getCategories = async () => {
  const response = await api.get("/categories");
  return response.data;
};

export const getProductById = async (id) => {
  const response = await api.get(`/products/${id}`);
  return response.data;
};

export const createProduct = async (product) => {
  const response = await api.post("/products", product);
  return response.data;
};

export const getSellerProducts = async (sellerId) => {
  const response = await api.get("/products", {
    params: { seller_id: sellerId },
  });
  return response.data;
};

export const uploadProductImage = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post("/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return response.data;
};

export const updateProduct = async (id, product) => {
  const response = await api.put(`/products/${id}`, product);
  return response.data;
};

export const deleteProduct = async (id) => {
  const response = await api.delete(`/products/${id}`);
  return response.data;
};
