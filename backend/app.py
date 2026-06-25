import os

from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from sqlalchemy import text

from config import Config
from extensions import db
from routes.chatbot import chatbot_bp

UPLOAD_FOLDER = "uploads"


def seed_sellers():
    from werkzeug.security import generate_password_hash

    from models.user import User

    sample_sellers = [
        {
            "username": "seller_fashion",
            "email": "seller1@shop.local",
            "shop_name": "Shop Thời Trang",
            "phone": "0901000001",
            "address": "Kho 1, TP. Hồ Chí Minh",
        },
        {
            "username": "seller_tech",
            "email": "seller2@shop.local",
            "shop_name": "Shop Công Nghệ",
            "phone": "0901000002",
            "address": "Kho 2, TP. Hồ Chí Minh",
        },
        {
            "username": "seller_home",
            "email": "seller3@shop.local",
            "shop_name": "Shop Gia Dụng",
            "phone": "0901000003",
            "address": "Kho 3, TP. Hồ Chí Minh",
        },
    ]

    sellers = []

    for seller_data in sample_sellers:
        seller = User.query.filter_by(email=seller_data["email"]).first()

        if seller is None:
            seller = User(
                username=seller_data["username"],
                email=seller_data["email"],
                password=generate_password_hash("123456"),
                role="seller",
            )
            db.session.add(seller)

        seller.role = "seller"
        seller.shop_name = seller_data["shop_name"]
        seller.phone = seller_data["phone"]
        seller.address = seller_data["address"]
        sellers.append(seller)

    db.session.commit()
    return sellers


def seed_products():
    from models.product import Product

    sellers = seed_sellers()
    existing_names = {name for (name,) in db.session.query(Product.name).all()}

    sample_products = [
        Product(
            name="Áo thun nam StreetFit",
            description="Cotton mềm mại, phong cách thể thao, phù hợp đi làm và du lịch.",
            price=290000,
            category="Thời trang nam",
            image="h1.webp",
        ),
        Product(
            name="Quần jeans nam Classic",
            description="Quần jeans co dãn, thiết kế cổ điển, mặc đẹp với nhiều phong cách.",
            price=520000,
            category="Thời trang nam",
            image="https://images.unsplash.com/photo-1521334884684-d80222895322?auto=format&fit=crop&w=900&q=80",
        ),
        Product(
            name="Áo khoác nam WindGuard",
            description="Chống gió, chống thấm nhẹ, phù hợp di chuyển ngoài trời.",
            price=780000,
            category="Thời trang nam",
            image="https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=900&q=80",
        ),
        Product(
            name="Dép lười nam UrbanSlide",
            description="Đế chống trượt, lót êm, hợp cho đi chơi và dạo phố.",
            price=320000,
            category="Thời trang nam",
            image="https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80",
        ),
        Product(
            name="Váy maxi nữ SummerBreeze",
            description="Chất voan nhẹ, họa tiết tươi sáng, mang lại vẻ nữ tính và thoải mái.",
            price=690000,
            category="Thời trang nữ",
            image="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=900&q=80",
        ),
        Product(
            name="Áo blouse nữ SilkEase",
            description="Vải chiffon mềm, thiết kế thanh lịch cho công sở và tiệc nhẹ.",
            price=540000,
            category="Thời trang nữ",
            image="https://images.unsplash.com/photo-1520975918733-9c6f3d370d80?auto=format&fit=crop&w=900&q=80",
        ),
        Product(
            name="Set đồ nữ Elegance",
            description="Set áo và quần tây đồng bộ, dễ phối, phù hợp họp mặt và đi chơi.",
            price=820000,
            category="Thời trang nữ",
            image="https://images.unsplash.com/photo-1520414697415-3f751b6747fc?auto=format&fit=crop&w=900&q=80",
        ),
        Product(
            name="Sandal nữ BloomWalk",
            description="Thiết kế thoáng khí, đế nhẹ, rất hợp để đi biển và dã ngoại.",
            price=360000,
            category="Thời trang nữ",
            image="https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=900&q=80",
        ),
        Product(
            name="Ốp lưng Galaxy Shield",
            description="Bảo vệ hiệu quả, chống va đập, dùng cho nhiều mẫu điện thoại thông dụng.",
            price=180000,
            category="Điện thoại & phụ kiện",
            image="https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=80",
        ),
        Product(
            name="Sạc nhanh SuperCharge",
            description="Công suất 65W, sạc đầy pin nhanh chóng cho cả điện thoại và laptop nhỏ.",
            price=420000,
            category="Điện thoại & phụ kiện",
            image="https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80",
        ),
        Product(
            name="Tai nghe không dây AirPulse",
            description="Chống ồn chủ động, pin 30 giờ, kết nối ổn định cho giải trí và học online.",
            price=790000,
            category="Điện thoại & phụ kiện",
            image="https://images.unsplash.com/photo-1519515134446-0a3c22126785?auto=format&fit=crop&w=900&q=80",
        ),
        Product(
            name="Cáp Type-C ProFlex",
            description="Dây bền, sạc nhanh, truyền dữ liệu cao cấp cho điện thoại và máy tính.",
            price=150000,
            category="Điện thoại & phụ kiện",
            image="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=900&q=80",
        ),
        Product(
            name="Bộ quần áo sơ sinh SoftBaby",
            description="Chất cotton hữu cơ, mềm mịn cho da nhạy cảm của bé.",
            price=270000,
            category="Mẹ và bé",
            image="https://images.unsplash.com/photo-1511407397940-d57f68e81203?auto=format&fit=crop&w=900&q=80",
        ),
        Product(
            name="Ghế ăn dặm TinyChef",
            description="Ghế có đệm êm, dễ lau chùi, giúp bé ăn ngon và an toàn.",
            price=620000,
            category="Mẹ và bé",
            image="https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?auto=format&fit=crop&w=900&q=80",
        ),
        Product(
            name="Tã quần siêu thấm BabyCare",
            description="Miếng lót mềm, thấm hút nhanh, bảo vệ da bé cả ngày lẫn đêm.",
            price=330000,
            category="Mẹ và bé",
            image="https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?auto=format&fit=crop&w=900&q=80",
        ),
        Product(
            name="Xe đẩy du lịch MiniCruise",
            description="Khung nhẹ, gấp gọn, thuận tiện mang theo khi đi nghỉ dưỡng.",
            price=1590000,
            category="Mẹ và bé",
            image="https://images.unsplash.com/photo-1519677100203-a0e668c92439?auto=format&fit=crop&w=900&q=80",
        ),
        Product(
            name="Loa di động BassBoom",
            description="Công suất lớn, bass sâu, thiết kế nhỏ gọn cho không gian phòng khách.",
            price=860000,
            category="Thiết bị điện tử",
            image="https://images.unsplash.com/photo-1512428559087-560fa5ceab42?auto=format&fit=crop&w=900&q=80",
        ),
        Product(
            name="Camera an ninh HomeEye",
            description="Ghi hình 1080p, đàm thoại hai chiều, giám sát cả ngày lẫn đêm.",
            price=950000,
            category="Thiết bị điện tử",
            image="https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=900&q=80",
        ),
        Product(
            name="Máy lọc không khí PureAir",
            description="Lọc bụi mịn, khử mùi, bảo vệ sức khỏe cả gia đình.",
            price=1250000,
            category="Thiết bị điện tử",
            image="https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80",
        ),
        Product(
            name="Bộ chén dĩa Minimal",
            description="Thiết kế hiện đại, chất liệu sứ dày dặn, phù hợp bàn ăn gia đình.",
            price=430000,
            category="Nhà cửa đời sống",
            image="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=80",
        ),
        Product(
            name="Chăn gối CozyHome",
            description="Chăn ấm áp, gối êm, mang lại giấc ngủ sâu và thoải mái.",
            price=750000,
            category="Nhà cửa đời sống",
            image="https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=900&q=80",
        ),
        Product(
            name="Nồi chiên không dầu AirFry",
            description="Nấu nhanh, ít dầu mỡ, giữ được hương vị tươi ngon của thực phẩm.",
            price=1690000,
            category="Nhà cửa đời sống",
            image="https://images.unsplash.com/photo-1512058564366-c9e5a47e1bb8?auto=format&fit=crop&w=900&q=80",
        ),
        Product(
            name="Đèn ngủ cảm ứng MoonGlow",
            description="Đổi màu, cảm ứng chạm, tạo không gian ấm cúng cho phòng ngủ.",
            price=280000,
            category="Nhà cửa đời sống",
            image="https://images.unsplash.com/photo-1516455590571-18256e5bb9ff?auto=format&fit=crop&w=900&q=80",
        ),
        Product(
            name="Laptop văn phòng NotePro",
            description="Màn hình 14 inch, pin 10 giờ, phù hợp học tập và công việc.",
            price=17900000,
            category="Máy tính và laptop",
            image="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=900&q=80",
        ),
        Product(
            name="Bàn phím cơ ClickMaster",
            description="Switch cao cấp, ánh sáng RGB, phản hồi nhanh cho gõ phím thoải mái.",
            price=1120000,
            category="Máy tính và laptop",
            image="https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80",
        ),
        Product(
            name="Màn hình cong UltraView",
            description="Độ phân giải cao, màu sắc sống động, mở rộng không gian làm việc.",
            price=4990000,
            category="Máy tính và laptop",
            image="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=900&q=80",
        ),
        Product(
            name="Chuột gaming PixelGrip",
            description="Độ bền cao, DPI tùy chỉnh, tối ưu cho game và thiết kế đồ họa.",
            price=690000,
            category="Máy tính và laptop",
            image="https://images.unsplash.com/photo-1521814267897-8c36d6f6c4fc?auto=format&fit=crop&w=900&q=80",
        ),
        Product(
            name="Son lì VelvetRed",
            description="Màu sắc chuẩn, giữ ẩm nhẹ, lên màu rực rỡ cả ngày.",
            price=260000,
            category="Sắc đẹp",
            image="https://images.unsplash.com/photo-1542831371-d531d36971e6?auto=format&fit=crop&w=900&q=80",
        ),
        Product(
            name="Kem dưỡng da GlowCare",
            description="Dưỡng ẩm sâu, sáng da tự nhiên, dùng hàng ngày cho mọi loại da.",
            price=480000,
            category="Sắc đẹp",
            image="https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=900&q=80",
        ),
        Product(
            name="Nước hoa MysticBloom",
            description="Hương thơm nữ tính, đậm chất sang trọng và quyến rũ.",
            price=890000,
            category="Sắc đẹp",
            image="https://images.unsplash.com/photo-1511988617509-a57c8a288659?auto=format&fit=crop&w=900&q=80",
        ),
        Product(
            name="Bộ trang điểm SatinLook",
            description="Bộ essentials cho vẻ đẹp tự nhiên và lớp nền mịn màng.",
            price=720000,
            category="Sắc đẹp",
            image="https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&w=900&q=80",
        ),
        Product(
            name="Đồng hồ nam ChronoDrive",
            description="Thiết kế mạnh mẽ, mặt kim số tinh tế, phù hợp mọi phong cách.",
            price=2290000,
            category="Đồng hồ",
            image="https://images.unsplash.com/photo-1517686469429-8bdb6000d8c8?auto=format&fit=crop&w=900&q=80",
        ),
        Product(
            name="Đồng hồ nữ PearlTime",
            description="Mặt tròn sang trọng, dây da mềm, tạo điểm nhấn thanh lịch.",
            price=1980000,
            category="Đồng hồ",
            image="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=900&q=80",
        ),
        Product(
            name="Đồng hồ thể thao SolarRun",
            description="Pin năng lượng mặt trời, định vị GPS, dành cho vận động viên.",
            price=2590000,
            category="Đồng hồ",
            image="https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=900&q=80",
        ),
        Product(
            name="Máy đo huyết áp HealthPro",
            description="Đo nhanh, màn hình lớn, lưu trữ nhiều kết quả cho gia đình.",
            price=620000,
            category="Sức khỏe",
            image="https://images.unsplash.com/photo-1514583172773-ad6f7bb8f63d?auto=format&fit=crop&w=900&q=80",
        ),
        Product(
            name="Máy massage cổ RelaxEase",
            description="Giảm đau cổ vai gáy, nhiều chế độ rung êm ái.",
            price=980000,
            category="Sức khỏe",
            image="https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=900&q=80",
        ),
        Product(
            name="Bình nước giữ nhiệt EcoHydro",
            description="Giữ lạnh và giữ ấm tốt, thân bình bằng thép không gỉ.",
            price=320000,
            category="Sức khỏe",
            image="https://images.unsplash.com/photo-1510626176961-4b57d4fbad91?auto=format&fit=crop&w=900&q=80",
        ),
        Product(
            name="Bộ đồ tập yoga FlexStretch",
            description="Co dãn cao, thoáng mát, hỗ trợ mọi động tác yoga.",
            price=520000,
            category="Sức khỏe",
            image="https://images.unsplash.com/photo-1514996937319-344454492b37?auto=format&fit=crop&w=900&q=80",
        ),
        Product(
            name="Giày da nam ClassicStep",
            description="Giày da thật, dáng ôm chân, phù hợp đi làm và dự tiệc.",
            price=920000,
            category="Giày dép nam",
            image="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=900&q=80",
        ),
        Product(
            name="Giày thể thao nam SprintMax",
            description="Thiết kế nhẹ, êm chân, tăng đàn hồi khi chạy bộ.",
            price=730000,
            category="Giày dép nam",
            image="https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?auto=format&fit=crop&w=900&q=80",
        ),
        Product(
            name="Dép xỏ ngón nam CoastSlide",
            description="Thoáng khí, dễ đi, hợp cho mùa hè và đi biển.",
            price=220000,
            category="Giày dép nam",
            image="https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?auto=format&fit=crop&w=900&q=80",
        ),
        Product(
            name="Túi xách nữ CharmBag",
            description="Thiết kế thời trang, nhiều ngăn, phù hợp đi lễ hội và dạo phố.",
            price=680000,
            category="Túi ví nữ",
            image="https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=900&q=80",
        ),
        Product(
            name="Ví cầm tay nữ SleekPurse",
            description="Nhỏ gọn, sang trọng, tiện lợi cho những buổi tối đi chơi.",
            price=320000,
            category="Túi ví nữ",
            image="https://images.unsplash.com/photo-1520975918733-9c6f3d370d80?auto=format&fit=crop&w=900&q=80",
        ),
        Product(
            name="Balo mini nữ CityPack",
            description="Nhỏ xinh, nhiều ngăn, phù hợp đi học và dạo phố.",
            price=450000,
            category="Túi ví nữ",
            image="https://images.unsplash.com/photo-1516900557548-7b53f9a82266?auto=format&fit=crop&w=900&q=80",
        ),
        Product(
            name="Balo du lịch TrailMate",
            description="Đựng được áo quần, máy ảnh và đồ dùng cá nhân khi đi du lịch.",
            price=1090000,
            category="Thể thao du lịch",
            image="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
        ),
        Product(
            name="Thảm tập yoga JourneyMat",
            description="Đế chống trượt, mềm mại, thích hợp cho tập yoga và pilates.",
            price=320000,
            category="Thể thao du lịch",
            image="https://images.unsplash.com/photo-1519861532792-92f462d6e991?auto=format&fit=crop&w=900&q=80",
        ),
        Product(
            name="Bình giữ nhiệt AdventureSip",
            description="Dung tích lớn, giữ nhiệt tốt, đồng hành khi trekking và dã ngoại.",
            price=290000,
            category="Thể thao du lịch",
            image="https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=900&q=80",
        ),
        Product(
            name="Túi đựng đồ thể thao SportCarry",
            description="Nhiều ngăn, chống nước, tiện lợi cho gym và đi du lịch.",
            price=540000,
            category="Thể thao du lịch",
            image="https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?auto=format&fit=crop&w=900&q=80",
        ),
        Product(
            name="Dây chuyền bạc StarShine",
            description="Thiết kế tinh tế, phù hợp kết hợp với trang phục dạ tiệc.",
            price=380000,
            category="Phụ kiện trang sức",
            image="https://images.unsplash.com/photo-1520962912199-00f26f4d4c4e?auto=format&fit=crop&w=900&q=80",
        ),
        Product(
            name="Nhẫn thời trang MoonRing",
            description="Không bị đen, thiết kế thanh lịch, dễ phối với mọi phong cách.",
            price=240000,
            category="Phụ kiện trang sức",
            image="https://images.unsplash.com/photo-1496449903678-68ddcb189a24?auto=format&fit=crop&w=900&q=80",
        ),
        Product(
            name="Bông tai SparkleDrop",
            description="Tạo điểm nhấn sang trọng, phù hợp cả đi làm lẫn dạ tiệc.",
            price=330000,
            category="Phụ kiện trang sức",
            image="/uploads/h1.webp",
        ),
    ]

    sample_discounts = [
        12, 0, 18, 8, 15, 0, 10, 6, 20, 14, 25, 0, 9, 0, 11, 7, 18,
        13, 16, 0, 10, 22, 12, 5, 8, 0, 15, 10, 20, 6, 14, 0, 12, 18,
        9, 10, 0, 13, 15, 7, 11, 0, 8, 19, 16, 9, 10, 0, 14, 12, 7,
    ]

    keep_sample_indexes = {0, 4, 8, 12, 16, 19, 23, 27, 31, 34}
    all_sample_names = [product.name for product in sample_products]
    removed_sample_names = [
        name for index, name in enumerate(all_sample_names)
        if index not in keep_sample_indexes
    ]

    sample_products = [
        product for index, product in enumerate(sample_products)
        if index in keep_sample_indexes
    ]
    sample_discounts = [
        discount for index, discount in enumerate(sample_discounts)
        if index in keep_sample_indexes
    ]

    if removed_sample_names:
        extra_products = Product.query.filter(Product.name.in_(removed_sample_names)).all()
        for product in extra_products:
            db.session.delete(product)

    for index, (product, discount) in enumerate(zip(sample_products, sample_discounts)):
        product.discount_percent = discount
        if sellers:
            seller = sellers[index % len(sellers)]
            product.seller_id = seller.id
            product.seller_name = seller.shop_name or seller.username

    has_sample_discounts = Product.query.filter(
        Product.name.in_([product.name for product in sample_products]),
        Product.discount_percent > 0,
    ).first()

    if not has_sample_discounts:
        for sample_product in sample_products:
            existing_product = Product.query.filter_by(
                name=sample_product.name
            ).first()

            if existing_product:
                existing_product.discount_percent = sample_product.discount_percent
                existing_product.image = sample_product.image
                existing_product.description = sample_product.description
                existing_product.price = sample_product.price
                existing_product.category = sample_product.category
                if not existing_product.seller_id:
                    existing_product.seller_id = sample_product.seller_id
                    existing_product.seller_name = sample_product.seller_name

    if sellers:
        for index, product in enumerate(Product.query.order_by(Product.id.asc()).all()):
            if not product.seller_id:
                seller = sellers[index % len(sellers)]
                product.seller_id = seller.id
                product.seller_name = seller.shop_name or seller.username
            elif not product.seller_name:
                seller = next((item for item in sellers if item.id == product.seller_id), None)
                if seller:
                    product.seller_name = seller.shop_name or seller.username
             
    new_products = [product for product in sample_products if product.name not in existing_names]
    if not new_products:
        db.session.commit()
        return

    db.session.add_all(new_products)
    db.session.commit()


def ensure_database_schema():
    try:
        user_columns = db.session.execute(text("PRAGMA table_info(users)")).fetchall()
        user_column_names = {column[1] for column in user_columns}

        if user_columns and "shop_name" not in user_column_names:
            db.session.execute(text("ALTER TABLE users ADD COLUMN shop_name VARCHAR(150)"))
            db.session.commit()

        if user_columns and "phone" not in user_column_names:
            db.session.execute(text("ALTER TABLE users ADD COLUMN phone VARCHAR(30)"))
            db.session.commit()

        if user_columns and "address" not in user_column_names:
            db.session.execute(text("ALTER TABLE users ADD COLUMN address VARCHAR(255)"))
            db.session.commit()
    except Exception:
        db.session.rollback()

    try:
        order_columns = db.session.execute(text("PRAGMA table_info(orders)")).fetchall()
        order_column_names = {column[1] for column in order_columns}

        if order_columns and "payment_method" not in order_column_names:
            db.session.execute(text("ALTER TABLE orders ADD COLUMN payment_method VARCHAR(50) DEFAULT 'cash'"))
            db.session.commit()

        if order_columns and "items" not in order_column_names:
            db.session.execute(text("ALTER TABLE orders ADD COLUMN items TEXT"))
            db.session.commit()

        if order_columns and "customer_name" not in order_column_names:
            db.session.execute(text("ALTER TABLE orders ADD COLUMN customer_name VARCHAR(150)"))
            db.session.commit()

        if order_columns and "phone" not in order_column_names:
            db.session.execute(text("ALTER TABLE orders ADD COLUMN phone VARCHAR(30)"))
            db.session.commit()

        if order_columns and "address" not in order_column_names:
            db.session.execute(text("ALTER TABLE orders ADD COLUMN address VARCHAR(255)"))
            db.session.commit()

        if order_columns and "seller_id" not in order_column_names:
            db.session.execute(text("ALTER TABLE orders ADD COLUMN seller_id INTEGER"))
            db.session.commit()

        if order_columns and "seller_name" not in order_column_names:
            db.session.execute(text("ALTER TABLE orders ADD COLUMN seller_name VARCHAR(150)"))
            db.session.commit()
    except Exception:
        db.session.rollback()

    try:
        product_columns = db.session.execute(text("PRAGMA table_info(Products)")).fetchall()
        product_column_names = {column[1] for column in product_columns}

        if product_columns and "category" not in product_column_names:
            db.session.execute(text("ALTER TABLE Products ADD COLUMN category VARCHAR(100) DEFAULT 'Sản phẩm'"))
            db.session.commit()

        if product_columns and "discount_percent" not in product_column_names:
            db.session.execute(text("ALTER TABLE Products ADD COLUMN discount_percent FLOAT DEFAULT 0"))
            db.session.commit()

        if product_columns and "seller_id" not in product_column_names:
            db.session.execute(text("ALTER TABLE Products ADD COLUMN seller_id INTEGER"))
            db.session.commit()

        if product_columns and "seller_name" not in product_column_names:
            db.session.execute(text("ALTER TABLE Products ADD COLUMN seller_name VARCHAR(150)"))
            db.session.commit()
    except Exception:
        db.session.rollback()


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

    CORS(app)
    db.init_app(app)
    JWTManager(app)

    from routes.auth import auth_bp
    from routes.cart import cart_bp
    from routes.categories import category_bp
    from routes.orders import order_bp
    from routes.products import product_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(product_bp)
    app.register_blueprint(order_bp)
    app.register_blueprint(cart_bp)
    app.register_blueprint(category_bp)
    app.register_blueprint(chatbot_bp)

    @app.route("/")
    def home():
        return jsonify({"message": "Backend dang hoat dong"})

    @app.route("/api/upload", methods=["POST"])
    def upload():
        file = request.files["file"]
        filename = file.filename
        path = os.path.join(app.config["UPLOAD_FOLDER"], filename)

        os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)
        file.save(path)

        return jsonify({"image": f"/uploads/{filename}"})

    @app.route("/uploads/<path:filename>")
    def uploaded_file(filename):
        return send_from_directory(app.config["UPLOAD_FOLDER"], filename)

    with app.app_context():
        db.create_all()
        ensure_database_schema()
        seed_products()

    return app


app = create_app()

if __name__ == "__main__":
    app.run(debug=True)
