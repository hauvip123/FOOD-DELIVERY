import "reflect-metadata";
import "dotenv/config";
import { DataSource, Repository } from "typeorm";
import { Categories } from "src/entity/categories.entity";
import { Dish } from "src/entity/dish.entiry";
import { Restaurant } from "src/entity/restaurant.entity";
import { User } from "src/entity/user.entity";
import { Carts } from "src/entity/carts.entity";
import { CartItems } from "src/entity/cart-items.entity";
import { DeliveryAddress } from "src/entity/delivery-address.entity";
import { Order } from "src/entity/order.entity";
import { OrderItem } from "src/entity/order-item.entiry";
import { Review } from "src/entity/review.entiry";

type SeedCategory = {
    name: string;
    dishes: Array<{
        name: string;
        price: number;
        image: string;
        description: string;
        isAvailable?: boolean;
    }>;
};

type SeedRestaurant = {
    name: string;
    address: string;
    city: string;
    cuisine: string;
    imgage: string;
    description: string;
    phoneNumber: string;
    openTime: string;
    closeTime: string;
    isOpen: boolean;
    ratingAverage: number;
    categories: SeedCategory[];
};

const restaurants: SeedRestaurant[] = [
    {
        name: "Bếp Nắng Sài Gòn",
        address: "42 Nguyễn Trãi, Quận 1",
        city: "TP. Hồ Chí Minh",
        cuisine: "Cơm nhà, món kho, canh nóng",
        imgage: "https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&q=80&w=1000",
        description: "Quán cơm gia đình với món kho đậm vị, canh nóng và phần ăn đầy đặn cho bữa trưa văn phòng.",
        phoneNumber: "0901002003",
        openTime: "09:00",
        closeTime: "21:30",
        isOpen: true,
        ratingAverage: 4.8,
        categories: [
            {
                name: "Cơm nhà",
                dishes: [
                    {
                        name: "Cơm gà sốt tiêu đen",
                        price: 68000,
                        image: "https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&q=80&w=700",
                        description: "Đùi gà chiên giòn rưới sốt tiêu đen đậm đà, ăn kèm cơm dẻo và rau chua.",
                    },
                    {
                        name: "Cơm thịt kho trứng",
                        price: 62000,
                        image: "https://images.unsplash.com/photo-1512058560366-cd2427ff064f?auto=format&fit=crop&q=80&w=700",
                        description: "Thịt ba chỉ kho mềm, trứng thấm vị, kèm canh rau theo ngày.",
                    },
                ],
            },
            {
                name: "Canh nóng",
                dishes: [
                    {
                        name: "Canh chua cá lóc",
                        price: 55000,
                        image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&q=80&w=700",
                        description: "Nước canh chua thanh, cá lóc tươi, bạc hà, cà chua và rau thơm.",
                    },
                ],
            },
        ],
    },
    {
        name: "Mì Lửa Chợ Lớn",
        address: "18 Hải Thượng Lãn Ông, Quận 5",
        city: "TP. Hồ Chí Minh",
        cuisine: "Mì bò, hoành thánh, xá xíu",
        imgage: "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&q=80&w=1000",
        description: "Tiệm mì vị Hoa với nước dùng nóng, topping nhiều và các món cay hợp ngày mưa.",
        phoneNumber: "0904005006",
        openTime: "07:00",
        closeTime: "22:00",
        isOpen: true,
        ratingAverage: 4.7,
        categories: [
            {
                name: "Mì & Bún",
                dishes: [
                    {
                        name: "Mì bò sa tế trứng",
                        price: 82000,
                        image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&q=80&w=700",
                        description: "Mì tươi, bò bắp mềm, trứng lòng đào và sa tế thơm cay.",
                    },
                    {
                        name: "Hoành thánh xá xíu",
                        price: 76000,
                        image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&q=80&w=700",
                        description: "Hoành thánh nhân tôm thịt, xá xíu nướng mật ong và cải xanh.",
                    },
                ],
            },
            {
                name: "Món cay",
                dishes: [
                    {
                        name: "Bún bò Huế topping đầy đủ",
                        price: 72000,
                        image: "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&q=80&w=700",
                        description: "Nước dùng đậm, bò, chả cua, huyết và rau sống ăn kèm.",
                    },
                ],
            },
        ],
    },
    {
        name: "Green Bowl Lab",
        address: "7 Lê Văn Sỹ, Quận 3",
        city: "TP. Hồ Chí Minh",
        cuisine: "Salad, poke, nước ép",
        imgage: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=1000",
        description: "Bếp healthy cân bằng dinh dưỡng với rau tươi, sốt nhà làm và protein áp chảo.",
        phoneNumber: "0911223344",
        openTime: "08:00",
        closeTime: "20:30",
        isOpen: true,
        ratingAverage: 4.9,
        categories: [
            {
                name: "Healthy",
                dishes: [
                    {
                        name: "Bowl cá hồi áp chảo",
                        price: 118000,
                        image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&q=80&w=700",
                        description: "Cá hồi áp chảo, quinoa, bơ sáp, rau mầm và sốt mè rang.",
                    },
                    {
                        name: "Salad gà bơ sáp",
                        price: 89000,
                        image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=700",
                        description: "Ức gà nướng, bơ, xà lách romaine, cà chua bi và sốt chanh dây.",
                    },
                ],
            },
            {
                name: "Nước ép",
                dishes: [
                    {
                        name: "Nước ép cam cà rốt gừng",
                        price: 42000,
                        image: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&q=80&w=700",
                        description: "Cam tươi, cà rốt và gừng nhẹ, ép mới mỗi ngày.",
                    },
                ],
            },
        ],
    },
    {
        name: "Tiệm Nước Mơ",
        address: "25 Trần Quang Diệu, Quận 3",
        city: "TP. Hồ Chí Minh",
        cuisine: "Trà sữa, nước ép, tráng miệng",
        imgage: "https://images.unsplash.com/photo-1544145945-f904253d0c71?auto=format&fit=crop&q=80&w=1000",
        description: "Tiệm nước và đồ ngọt cho buổi chiều, có trà trái cây, chè lạnh và bánh mềm.",
        phoneNumber: "0933555777",
        openTime: "10:00",
        closeTime: "23:00",
        isOpen: true,
        ratingAverage: 4.6,
        categories: [
            {
                name: "Cà phê & Trà",
                dishes: [
                    {
                        name: "Trà đào cam sả lạnh",
                        price: 42000,
                        image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&q=80&w=700",
                        description: "Trà đen ủ lạnh, đào miếng giòn, cam vàng và sả thơm.",
                    },
                    {
                        name: "Cà phê sữa đá",
                        price: 35000,
                        image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&q=80&w=700",
                        description: "Cà phê rang đậm, sữa đặc béo và đá viên lớn.",
                    },
                ],
            },
            {
                name: "Tráng miệng",
                dishes: [
                    {
                        name: "Chè khúc bạch trái cây",
                        price: 39000,
                        image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&q=80&w=700",
                        description: "Khúc bạch mềm, hạnh nhân, nhãn và trái cây theo mùa.",
                    },
                ],
            },
        ],
    },
    {
        name: "K-Chicken Station",
        address: "91 Nguyễn Thị Minh Khai, Quận 1",
        city: "TP. Hồ Chí Minh",
        cuisine: "Gà rán, món Hàn, ăn vặt",
        imgage: "https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?auto=format&fit=crop&q=80&w=1000",
        description: "Gà rán kiểu Hàn với sốt cay ngọt, phô mai và các món ăn vặt hợp nhóm bạn.",
        phoneNumber: "0922112233",
        openTime: "10:00",
        closeTime: "23:30",
        isOpen: true,
        ratingAverage: 4.7,
        categories: [
            {
                name: "Gà rán",
                dishes: [
                    {
                        name: "Gà rán sốt cay Hàn Quốc",
                        price: 89000,
                        image: "https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?auto=format&fit=crop&q=80&w=700",
                        description: "Gà không xương chiên giòn phủ sốt gochujang cay ngọt và mè rang.",
                    },
                    {
                        name: "Gà phô mai kéo sợi",
                        price: 99000,
                        image: "https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?auto=format&fit=crop&q=80&w=700",
                        description: "Gà viên sốt cay ăn cùng phô mai mozzarella nóng chảy.",
                    },
                    {
                        name: "Cánh gà mật ong tỏi",
                        price: 79000,
                        image: "https://images.unsplash.com/photo-1527477396000-e27163b481c2?auto=format&fit=crop&q=80&w=700",
                        description: "Cánh gà chiên giòn áo sốt mật ong tỏi thơm nhẹ.",
                    },
                ],
            },
            {
                name: "Ăn vặt Hàn",
                dishes: [
                    {
                        name: "Tokbokki chả cá",
                        price: 65000,
                        image: "https://images.unsplash.com/photo-1604909052743-94e838986d24?auto=format&fit=crop&q=80&w=700",
                        description: "Bánh gạo dẻo, chả cá, trứng luộc và sốt cay ngọt.",
                    },
                    {
                        name: "Kimbap bò bulgogi",
                        price: 58000,
                        image: "https://images.unsplash.com/photo-1582450871972-ab5ca641643d?auto=format&fit=crop&q=80&w=700",
                        description: "Cuộn rong biển nhân bò bulgogi, trứng, rau củ và mè rang.",
                    },
                ],
            },
        ],
    },
    {
        name: "The Pizza Hub",
        address: "12 Phan Xích Long, Phú Nhuận",
        city: "TP. Hồ Chí Minh",
        cuisine: "Pizza, pasta, đồ nướng",
        imgage: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=1000",
        description: "Pizza đế mỏng nướng lò nóng, nhiều topping và pasta sốt kem cho bữa tối tiện lợi.",
        phoneNumber: "0908222444",
        openTime: "10:30",
        closeTime: "22:30",
        isOpen: true,
        ratingAverage: 4.5,
        categories: [
            {
                name: "Pizza",
                dishes: [
                    {
                        name: "Pizza hải sản phô mai",
                        price: 159000,
                        image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=700",
                        description: "Tôm, mực, thanh cua, mozzarella và sốt cà chua nhà làm.",
                    },
                    {
                        name: "Pizza pepperoni cay",
                        price: 145000,
                        image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&q=80&w=700",
                        description: "Pepperoni, ớt chuông, phô mai kéo sợi và lá oregano.",
                    },
                    {
                        name: "Pizza bò BBQ",
                        price: 152000,
                        image: "https://images.unsplash.com/photo-1601924582970-9238bcb495d9?auto=format&fit=crop&q=80&w=700",
                        description: "Bò băm, hành tây, bắp Mỹ, sốt BBQ khói và cheddar.",
                    },
                ],
            },
            {
                name: "Pasta",
                dishes: [
                    {
                        name: "Mì Ý carbonara",
                        price: 98000,
                        image: "https://images.unsplash.com/photo-1612874742237-6526221588e3?auto=format&fit=crop&q=80&w=700",
                        description: "Sốt kem trứng béo nhẹ, bacon áp chảo và parmesan.",
                    },
                    {
                        name: "Pasta bò bằm sốt cà",
                        price: 92000,
                        image: "https://images.unsplash.com/photo-1551892374-ecf8754cf8b0?auto=format&fit=crop&q=80&w=700",
                        description: "Sốt cà chua hầm bò bằm, cà rốt, cần tây và tiêu đen.",
                    },
                ],
            },
        ],
    },
    {
        name: "Bún Đậu Phố Cổ",
        address: "36 Hoa Sứ, Phú Nhuận",
        city: "TP. Hồ Chí Minh",
        cuisine: "Bún đậu, mẹt Bắc, trà tắc",
        imgage: "https://images.unsplash.com/photo-1541529086526-db283c563270?auto=format&fit=crop&q=80&w=1000",
        description: "Mẹt bún đậu nóng giòn, mắm tôm pha vừa miệng và topping đầy đặn.",
        phoneNumber: "0938001122",
        openTime: "09:30",
        closeTime: "21:00",
        isOpen: true,
        ratingAverage: 4.4,
        categories: [
            {
                name: "Bún đậu",
                dishes: [
                    {
                        name: "Bún đậu mắm tôm đầy đủ",
                        price: 65000,
                        image: "https://images.unsplash.com/photo-1541529086526-db283c563270?auto=format&fit=crop&q=80&w=700",
                        description: "Đậu chiên, chả cốm, thịt chân giò, nem rán, rau thơm và mắm tôm.",
                    },
                    {
                        name: "Mẹt bún đậu đặc biệt",
                        price: 119000,
                        image: "https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?auto=format&fit=crop&q=80&w=700",
                        description: "Phần lớn cho hai người với dồi sụn, nem cua và chả cốm thêm.",
                    },
                ],
            },
            {
                name: "Đồ uống",
                dishes: [
                    {
                        name: "Trà tắc mật ong",
                        price: 25000,
                        image: "https://images.unsplash.com/photo-1497534446932-c925b458314e?auto=format&fit=crop&q=80&w=700",
                        description: "Trà tắc chua ngọt, mật ong nhẹ và đá viên mát lạnh.",
                    },
                    {
                        name: "Nước sấu Hà Nội",
                        price: 30000,
                        image: "https://images.unsplash.com/photo-1523371054106-bbf80586c38c?auto=format&fit=crop&q=80&w=700",
                        description: "Sấu ngâm đường, gừng lát và vị chua thanh dễ uống.",
                    },
                ],
            },
        ],
    },
    {
        name: "Taco Town",
        address: "55 Xuân Thủy, Thảo Điền",
        city: "TP. Hồ Chí Minh",
        cuisine: "Taco, burrito, món Mexico",
        imgage: "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?auto=format&fit=crop&q=80&w=1000",
        description: "Món Mexico nhiều sốt, topping tươi và phần ăn nhanh gọn cho bữa trưa đổi vị.",
        phoneNumber: "0977008899",
        openTime: "11:00",
        closeTime: "22:00",
        isOpen: true,
        ratingAverage: 4.6,
        categories: [
            {
                name: "Taco",
                dishes: [
                    {
                        name: "Taco bò phô mai kéo sợi",
                        price: 88000,
                        image: "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?auto=format&fit=crop&q=80&w=700",
                        description: "Vỏ taco giòn, bò xào gia vị, phô mai, salsa và kem chua.",
                    },
                    {
                        name: "Taco gà sốt chipotle",
                        price: 82000,
                        image: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&q=80&w=700",
                        description: "Gà nướng xé, sốt chipotle, bắp ngọt và hành tím ngâm.",
                    },
                ],
            },
            {
                name: "Burrito",
                dishes: [
                    {
                        name: "Burrito bò đậu đen",
                        price: 105000,
                        image: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&q=80&w=700",
                        description: "Tortilla cuộn cơm Mexico, bò, đậu đen, phô mai và sốt cay.",
                    },
                    {
                        name: "Nachos phô mai jalapeno",
                        price: 79000,
                        image: "https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?auto=format&fit=crop&q=80&w=700",
                        description: "Bắp chip giòn phủ phô mai, salsa cà chua và ớt jalapeno.",
                    },
                ],
            },
        ],
    },
    {
        name: "Sushi Mori Express",
        address: "102 Pasteur, Quận 1",
        city: "TP. Hồ Chí Minh",
        cuisine: "Sushi, sashimi, cơm Nhật",
        imgage: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&q=80&w=1000",
        description: "Sushi làm mới theo đơn, cơm Nhật dẻo và sashimi bảo quản lạnh đúng chuẩn.",
        phoneNumber: "0919006677",
        openTime: "10:00",
        closeTime: "22:00",
        isOpen: true,
        ratingAverage: 4.8,
        categories: [
            {
                name: "Sushi",
                dishes: [
                    {
                        name: "Set sushi cá hồi",
                        price: 139000,
                        image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&q=80&w=700",
                        description: "Sushi cá hồi, trứng cá, maki cuộn và gừng hồng ăn kèm.",
                    },
                    {
                        name: "California roll",
                        price: 89000,
                        image: "https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?auto=format&fit=crop&q=80&w=700",
                        description: "Cuộn thanh cua, bơ, dưa leo, trứng cá và mè rang.",
                    },
                    {
                        name: "Sashimi cá hồi 6 miếng",
                        price: 168000,
                        image: "https://images.unsplash.com/photo-1534482421-64566f976cfa?auto=format&fit=crop&q=80&w=700",
                        description: "Cá hồi cắt dày, ăn cùng wasabi, gừng hồng và nước tương Nhật.",
                    },
                ],
            },
            {
                name: "Cơm Nhật",
                dishes: [
                    {
                        name: "Cơm gà teriyaki",
                        price: 96000,
                        image: "https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?auto=format&fit=crop&q=80&w=700",
                        description: "Gà áp chảo sốt teriyaki, cơm Nhật, salad bắp cải và mè.",
                    },
                    {
                        name: "Cơm lươn Nhật",
                        price: 175000,
                        image: "https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&q=80&w=700",
                        description: "Lươn nướng sốt kabayaki đặt trên cơm Nhật nóng.",
                    },
                ],
            },
        ],
    },
    {
        name: "Bếp Cô Ba",
        address: "14 Cách Mạng Tháng 8, Quận 10",
        city: "TP. Hồ Chí Minh",
        cuisine: "Bánh mì, xôi, món sáng",
        imgage: "https://images.unsplash.com/photo-1509722747041-619f383b8326?auto=format&fit=crop&q=80&w=1000",
        description: "Bữa sáng kiểu Việt với bánh mì chảo, xôi nóng và cà phê sữa đá.",
        phoneNumber: "0966881122",
        openTime: "06:00",
        closeTime: "14:00",
        isOpen: true,
        ratingAverage: 4.5,
        categories: [
            {
                name: "Bánh mì",
                dishes: [
                    {
                        name: "Bánh mì chảo đặc biệt",
                        price: 55000,
                        image: "https://images.unsplash.com/photo-1509722747041-619f383b8326?auto=format&fit=crop&q=80&w=700",
                        description: "Pate, xúc xích, trứng ốp la, xíu mại và bánh mì nóng giòn.",
                    },
                    {
                        name: "Bánh mì bò nướng sả",
                        price: 42000,
                        image: "https://images.unsplash.com/photo-1606755962773-d324e9a13086?auto=format&fit=crop&q=80&w=700",
                        description: "Bò nướng sả thơm, đồ chua, rau mùi và sốt pate.",
                    },
                ],
            },
            {
                name: "Xôi sáng",
                dishes: [
                    {
                        name: "Xôi gà xé pate",
                        price: 48000,
                        image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&q=80&w=700",
                        description: "Xôi nếp dẻo, gà xé, pate, hành phi và nước sốt mặn ngọt.",
                    },
                    {
                        name: "Xôi mặn thập cẩm",
                        price: 45000,
                        image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&q=80&w=700",
                        description: "Xôi nóng với lạp xưởng, chà bông, trứng cút và hành phi.",
                    },
                ],
            },
        ],
    },
    {
        name: "Ngọt Ơi Dessert",
        address: "8 Nguyễn Văn Nguyễn, Quận 1",
        city: "TP. Hồ Chí Minh",
        cuisine: "Bánh ngọt, chè, kem",
        imgage: "https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&q=80&w=1000",
        description: "Tiệm tráng miệng nhỏ với bánh mềm, chè lạnh và kem trái cây cho buổi chiều.",
        phoneNumber: "0909094455",
        openTime: "11:00",
        closeTime: "22:30",
        isOpen: true,
        ratingAverage: 4.7,
        categories: [
            {
                name: "Bánh ngọt",
                dishes: [
                    {
                        name: "Tiramisu cacao lạnh",
                        price: 62000,
                        image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&q=80&w=700",
                        description: "Kem mascarpone mịn, bánh ladyfinger thấm cà phê và cacao phủ mặt.",
                    },
                    {
                        name: "Donut dâu kem sữa",
                        price: 36000,
                        image: "https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&q=80&w=700",
                        description: "Donut mềm phủ glaze dâu, kem sữa và cốm màu.",
                    },
                ],
            },
            {
                name: "Chè & Kem",
                dishes: [
                    {
                        name: "Kem xoài dừa non",
                        price: 49000,
                        image: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&q=80&w=700",
                        description: "Kem xoài, dừa non, thạch trái cây và sốt xoài chua ngọt.",
                    },
                    {
                        name: "Chè sương sa hạt lựu",
                        price: 33000,
                        image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&q=80&w=700",
                        description: "Sương sa, hạt lựu, đậu xanh, nước cốt dừa và đá bào.",
                    },
                ],
            },
        ],
    },
    {
        name: "Lẩu Nhà Mình",
        address: "77 Tô Hiến Thành, Quận 10",
        city: "TP. Hồ Chí Minh",
        cuisine: "Lẩu, nướng, món nhóm",
        imgage: "https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?auto=format&fit=crop&q=80&w=1000",
        description: "Các set lẩu và món nướng giao tận nơi cho nhóm bạn hoặc bữa tối gia đình.",
        phoneNumber: "0944556677",
        openTime: "15:00",
        closeTime: "23:30",
        isOpen: true,
        ratingAverage: 4.6,
        categories: [
            {
                name: "Lẩu",
                dishes: [
                    {
                        name: "Lẩu Thái hải sản",
                        price: 219000,
                        image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&q=80&w=700",
                        description: "Nước lẩu chua cay, tôm, mực, cá viên, nấm và rau theo mùa.",
                    },
                    {
                        name: "Lẩu bò nhúng giấm",
                        price: 239000,
                        image: "https://images.unsplash.com/photo-1564834724105-918b73d1b9e0?auto=format&fit=crop&q=80&w=700",
                        description: "Bò thái mỏng, nước giấm dừa, bánh tráng, rau sống và mắm nêm.",
                    },
                ],
            },
            {
                name: "Món nướng",
                dishes: [
                    {
                        name: "Ba chỉ bò cuộn nấm",
                        price: 129000,
                        image: "https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?auto=format&fit=crop&q=80&w=700",
                        description: "Ba chỉ bò Mỹ cuộn nấm kim châm, sốt nướng đậm vị.",
                    },
                    {
                        name: "Xiên que thập cẩm",
                        price: 99000,
                        image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=700",
                        description: "Xiên gà, bò viên, xúc xích, rau củ và sốt cay ngọt.",
                    },
                ],
            },
        ],
    },
    {
        name: "Phở Gánh 24h",
        address: "2 Lý Tự Trọng, Quận 1",
        city: "TP. Hồ Chí Minh",
        cuisine: "Phở, bún, món nước",
        imgage: "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&q=80&w=1000",
        description: "Quán món nước mở gần như cả ngày, nước dùng trong và topping bò phong phú.",
        phoneNumber: "0988112233",
        openTime: "05:30",
        closeTime: "23:59",
        isOpen: true,
        ratingAverage: 4.5,
        categories: [
            {
                name: "Phở",
                dishes: [
                    {
                        name: "Phở bò tái nạm",
                        price: 68000,
                        image: "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&q=80&w=700",
                        description: "Nước dùng bò trong, thịt tái mềm, nạm gân và bánh phở tươi.",
                    },
                    {
                        name: "Phở gà xé lá chanh",
                        price: 62000,
                        image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&q=80&w=700",
                        description: "Gà ta xé, nước dùng thanh, lá chanh và hành ngò.",
                    },
                ],
            },
            {
                name: "Món nước",
                dishes: [
                    {
                        name: "Bún mọc sườn non",
                        price: 65000,
                        image: "https://images.unsplash.com/photo-1555126634-323283e090fa?auto=format&fit=crop&q=80&w=700",
                        description: "Mọc dai, sườn non hầm mềm, nước dùng nấm thơm nhẹ.",
                    },
                    {
                        name: "Miến gà măng khô",
                        price: 64000,
                        image: "https://images.unsplash.com/photo-1626804475297-41608ea09aeb?auto=format&fit=crop&q=80&w=700",
                        description: "Miến dong, gà xé, măng khô và nước dùng ngọt thanh.",
                    },
                ],
            },
        ],
    }
];

const dataSource = new DataSource({
    type: "mysql",
    host: process.env.MYSQLHOST,
    port: Number(process.env.MYSQLPORT),
    username: process.env.MYSQLUSER,
    password: process.env.MYSQLPASSWORD,
    database: process.env.MYSQLDATABASE,
    entities: [
        Restaurant,
        Categories,
        Dish,
        User,
        Carts,
        CartItems,
        DeliveryAddress,
        Order,
        OrderItem,
        Review,
    ],
    synchronize: true,
});

async function findOrCreateRestaurant(repository: Repository<Restaurant>, data: SeedRestaurant) {
    const existing = await repository.findOne({ where: { name: data.name } });
    const restaurant = repository.create({
        ...existing,
        name: data.name,
        address: data.address,
        city: data.city,
        cuisine: data.cuisine,
        imgage: data.imgage,
        description: data.description,
        phoneNumber: data.phoneNumber,
        openTime: data.openTime,
        closeTime: data.closeTime,
        isOpen: data.isOpen,
        ratingAverage: data.ratingAverage,
    });

    return repository.save(restaurant);
}

async function findOrCreateCategory(repository: Repository<Categories>, restaurantId: number, name: string) {
    const existing = await repository.findOne({ where: { restaurantId, name } });
    const category = repository.create({
        ...existing,
        restaurantId,
        name,
    });

    return repository.save(category);
}

async function findOrCreateDish(
    repository: Repository<Dish>,
    restaurantId: number,
    categoryId: number,
    dish: SeedCategory["dishes"][number],
) {
    const existing = await repository.findOne({ where: { restaurantId, name: dish.name } });
    const entity = repository.create({
        ...existing,
        restaurantId,
        categoryId,
        name: dish.name,
        price: dish.price,
        image: dish.image,
        description: dish.description,
        isAvailable: dish.isAvailable ?? true,
    });

    return repository.save(entity);
}

async function seed() {
    await dataSource.initialize();

    const restaurantRepository = dataSource.getRepository(Restaurant);
    const categoryRepository = dataSource.getRepository(Categories);
    const dishRepository = dataSource.getRepository(Dish);

    let categoryCount = 0;
    let dishCount = 0;

    for (const item of restaurants) {
        const restaurant = await findOrCreateRestaurant(restaurantRepository, item);

        for (const category of item.categories) {
            const savedCategory = await findOrCreateCategory(categoryRepository, restaurant.id, category.name);
            categoryCount += 1;

            for (const dish of category.dishes) {
                await findOrCreateDish(dishRepository, restaurant.id, savedCategory.id, dish);
                dishCount += 1;
            }
        }
    }

    console.log("Seed completed: " + restaurants.length + " restaurants, " + categoryCount + " categories, " + dishCount + " dishes.");
    await dataSource.destroy();
}

seed().catch(async (error) => {
    console.error("Seed failed:", error);
    if (dataSource.isInitialized) {
        await dataSource.destroy();
    }
    process.exit(1);
});
