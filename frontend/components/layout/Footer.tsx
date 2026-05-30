import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-orange-200/70 bg-[#fff7ed] py-12">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-10">
        <div className="grid gap-12 md:grid-cols-4">
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-2xl bg-[#ff6b00] text-base font-black text-white">
                HD
              </span>
              <span className="text-lg font-black tracking-tight text-[#23140c]">HungerDash</span>
            </Link>
            <p className="mt-6 max-w-sm text-sm leading-7 text-[#704322]">
              HungerDash - Ứng dụng giao món ngon tận nơi, nhanh chóng và tin cậy. 
              Mang cả thế giới ẩm thực đến cửa nhà bạn chỉ trong vài cú chạm.
            </p>
          </div>
          
          <div>
            <h4 className="text-sm font-black uppercase tracking-wider text-[#23140c]">Về chúng tôi</h4>
            <ul className="mt-6 space-y-4 text-sm font-semibold text-[#704322]">
              <li><Link href="#" className="hover:text-[#ff6b00]">Câu chuyện thương hiệu</Link></li>
              <li><Link href="#" className="hover:text-[#ff6b00]">Tuyển dụng</Link></li>
              <li><Link href="#" className="hover:text-[#ff6b00]">Liên hệ</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-black uppercase tracking-wider text-[#23140c]">Hợp tác</h4>
            <ul className="mt-6 space-y-4 text-sm font-semibold text-[#704322]">
              <li><Link href="#" className="hover:text-[#ff6b00]">Dành cho nhà hàng</Link></li>
              <li><Link href="#" className="hover:text-[#ff6b00]">Trở thành tài xế</Link></li>
              <li><Link href="#" className="hover:text-[#ff6b00]">Quảng cáo</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 border-t border-orange-200/40 pt-8 text-center text-xs font-bold text-[#a36b3f]">
          <p>© {new Date().getFullYear()} HungerDash. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
