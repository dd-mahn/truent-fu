import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex flex-col flex-1 items-center bg-crumpled-paper justify-center gap-4 text-center">
      {/* Crumpled paper background should be set in globals.css on body */}

      <div className="px-2">
        {" "}
        {/* Pushes content down a bit, but primarily relies on justify-center */}
        <p className="text-base leading-relaxed font-medium text-black font-nvn">
          &ldquo;... Chỉ mong thời gian trôi thật chậm, như một thước phim tua
          ngược, đưa ký ức trở về nơi những kỷ niệm bắt đầu...&rdquo;
        </p>
      </div>

      <div className="">
        {" "}
        {/* Pushes button to bottom */}
        <Link
          href="/form"
          className="px-8 py-3 bg-transparent text-brand-blue rounded-lg text-lg font-semibold hover:opacity-90 transition-opacity duration-300 flex items-center space-x-2"
        >
          <span>Tiếp tục</span>
          <Image src="/icons/long-arrow.svg" alt="Arrow right" width={60} height={24} />
        </Link>
      </div>
    </div>
  );
}
