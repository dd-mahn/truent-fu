import { useEffect, useState, useRef, CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { toPng } from "html-to-image";
import Image from "next/image";

// Define an interface for the formData expected from localStorage
interface LocalStorageFormData {
  motThoi: string;
  thoiHanDaXa: string;
  school: string;
  class: string;
  name: string;
  essayContentTop?: string;
  essayContentBottom?: string;
  ngayThangNam: string;
}

const downloadDataUrl = (dataUrl: string, filename: string) => {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Styles and helper copied from FormClient.tsx for consistency
const valueBaseStyle = "text-black text-sm font-comic"; // For displaying values
const labelClass = "text-brand-blue font-times font-bold";

const getLinedBackgroundStyle = (): CSSProperties => {
  const lineColor = "#363C83"; // Always brand-blue for result display
  const lineHeightEm = 1.625;
  return {
    backgroundImage: `linear-gradient(to bottom, transparent calc(${lineHeightEm}em - 1px), ${lineColor} calc(${lineHeightEm}em - 1px), ${lineColor} ${lineHeightEm}em, transparent ${lineHeightEm}em)`,
    backgroundSize: `100% ${lineHeightEm}em`,
    lineHeight: `${lineHeightEm}em`,
    boxSizing: "border-box",
    paddingTop: "0.1em",
  };
};

const staticCriticismText =
  "Những cảm xúc của tuổi trẻ luôn đáng trân trọng vì sự chân thành và mãnh liệt. Dù đôi khi bồng bột hay nông nổi, chính sự ngây dại ấy khiến tuổi trẻ trở nên sống động và khó quên, Cảm ơn cậu vì đã một phần thanh xuân của Truant Fu!";

export default function ResultClient() {
  const router = useRouter();
  const [retrievedFormData, setRetrievedFormData] =
    useState<LocalStorageFormData | null>(null);
  const [displayImage, setDisplayImage] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    // Attempt to read both main form data and image data from localStorage.
    const storedFormDataString = localStorage.getItem("formData");
    if (storedFormDataString) {
      try {
        const parsedData = JSON.parse(
          storedFormDataString
        ) as LocalStorageFormData;
        setRetrievedFormData(parsedData);
      } catch (error) {
        console.error("Failed to parse formData from localStorage:", error);
        setRetrievedFormData(null); // Ensure it's null if parsing fails
      }
    } else {
      setRetrievedFormData(null); // Ensure it's null if not found
    }

    const storedImage = localStorage.getItem("userImageData");
    setDisplayImage(storedImage);

    setHasHydrated(true);
  }, []);

  const handleDownload = async () => {
    if (!resultRef.current || !retrievedFormData) {
      console.error(
        "Download prerequisites not met: DOM element or form data missing."
      );
      alert("Không thể tải xuống: dữ liệu hoặc phần tử DOM bị thiếu.");
      return;
    }

    setIsDownloading(true);
    await new Promise((resolve) => setTimeout(resolve, 100)); // Small delay for rendering

    let success = false;
    try {
      const element = resultRef.current;
      const isSafari = /^((?!chrome|android).)*safari/i.test(
        navigator.userAgent
      );

      let dataUrl = "";
      const maxAttempts = isSafari ? 5 : 1;
      let lastDataUrlLength = 0;

      // Define the filter function to exclude stickers
      const filter = (node: HTMLElement) => {
        // Check if the node is an element and has the class
        if (node.classList && typeof node.classList.contains === "function") {
          return !node.classList.contains("exclude-from-download");
        }
        return true; // Keep other nodes
      };

      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        if (attempt > 0) {
          await new Promise((resolve) => setTimeout(resolve, 300 * attempt));
        }

        const currentDataUrl = await toPng(element, {
          cacheBust: true,
          pixelRatio: 2,
          skipAutoScale: true,
          width: element.offsetWidth,
          height: element.offsetHeight,
          fetchRequestInit: { cache: "no-cache" },
          filter: filter, // Add the filter here
        });

        dataUrl = currentDataUrl;

        if (isSafari) {
          if (dataUrl.length > lastDataUrlLength) {
            lastDataUrlLength = dataUrl.length;
            if (attempt < maxAttempts - 1) continue; // Continue if length increased and not last attempt
          } else {
            // Length did not increase or decreased, likely stable or an issue
            break;
          }
        } else {
          // Not Safari, or Safari but on the last attempt
          break;
        }
      }

      if (!dataUrl || dataUrl.length === 0) {
        throw new Error("Generated image data URL is empty.");
      }

      downloadDataUrl(
        dataUrl,
        `Một Thời - ${retrievedFormData.name || "result"}.png`
      );
      success = true;
    } catch (error) {
      console.error("Download error:", error);
      let message = "Không thể tải ảnh xuống. Vui lòng thử lại.";
      if (error instanceof Error && error.message) {
        message += ` Lỗi: ${error.message}`;
      }
      alert(message);
      success = false;
    } finally {
      setIsDownloading(false);
      if (success) {
        router.push("/form");
      }
    }
  };

  if (!hasHydrated) {
    // Show a loading state until hydration & localStorage read attempt is complete
    return (
      <p className="text-center py-10 text-brand-blue text-sm">
        Đang tải kết quả...
      </p>
    );
  }

  if (!retrievedFormData) {
    // formData from localStorage is not available
    return (
      <div className="text-center py-10">
        <p className="text-brand-error text-sm">Không tìm thấy dữ liệu form.</p>
        <button
          onClick={() => router.push("/form")}
          className="mt-4 px-4 py-2 bg-brand-blue text-white rounded text-sm hover:opacity-90"
        >
          Quay lại Form
        </button>
      </div>
    );
  }

  // At this point, retrievedFormData is available, and an attempt to load displayImage has been made.
  // displayImage might be null if no image was stored, which is fine.

  // const Sticker = ({
  //   src,
  //   alt,
  //   className,
  // }: {
  //   src: string;
  //   alt: string;
  //   className?: string;
  // }) => (
  //   <Image
  //     key={src}
  //     src={src}
  //     alt={alt}
  //     width={120}
  //     height={120}
  //     className={`absolute object-contain z-20 exclude-from-download ${
  //       className || ""
  //     }`}
  //     unoptimized={true}
  //   />
  // );

  return (
    <div className={`pt-24 md:pt-0 max-w-2xl mx-auto font-times relative bg-crumpled-paper`}>
      {/* Stickers */}
      {/* <Sticker
        src="/images/guitar.png"
        alt="Guitar Sticker"
        className="top-18 md:-top-5  animate-shake -left-2 rotate-30 w-24 h-24 md:w-36 md:h-36"
      />
      <Sticker
        src="/images/drum.png"
        alt="Chopsticks Sticker"
        className=" top-[45%] md:top-[40%] left-2  animate-shake -rotate-12 w-12"
      />
      <Sticker
        src="/images/logo.png"
        alt="TruantFu Logo Sticker"
        className="top-[48%] md:top-[45%] right-1  animate-shake -translate-y-1/2 w-12 md:w-20 opacity-80"
      />
      <Sticker
        src="/images/band.png"
        alt="Thanks Sticker"
        className="-bottom-0 left-3  animate-shake rotate-6 w-34 md:w-40"
      />
      <Sticker
        src="/images/guitar-blue.png"
        alt="Guitar Sticker"
        className="-bottom-0 right-3  animate-shake rotate-6 w-16"
      />
      <Sticker
        src="/images/guitar-black.png"
        alt="Guitar Sticker 2"
        className="top-18 right-0 w-20  animate-shake h-20 md:w-24 md:h-24"
      /> */}
      <div
        ref={resultRef}
        className="bg-crumpled-paper-sticker p-4 md:p-6 pb-8 text-sm overflow-hidden font-times"
      >
        {/* Header - Replicating FormClient structure & style */}
        <div className="text-center mb-4 relative z-10">
          <p className={`${labelClass} text-sm`}>
            {retrievedFormData.ngayThangNam}
          </p>
          <div className="flex items-baseline justify-center space-x-2">
            <span className={`${labelClass} text-[18px] uppercase`}>
              Một Thời
            </span>
            <span
              className={`${valueBaseStyle} border-b border-brand-blue px-0 pt-1 pb-[1px]`}
              style={{ width: "125px", display: "inline-block" }}
            >
              {retrievedFormData.motThoi}
            </span>
          </div>
          <div className="flex items-baseline justify-center space-x-2">
            <span className={`${labelClass} text-sm`}>Thời hạn đã xa</span>
            <span
              className={`${valueBaseStyle} border-b border-brand-blue px-0 pt-1 pb-[1px]`}
              style={{ width: "80px", display: "inline-block" }}
            >
              {retrievedFormData.thoiHanDaXa}
            </span>
          </div>
        </div>

        {/* Student Info & Score - Replicating FormClient structure & style */}
        <div className="flex justify-between mt-8 items-start mb-4 space-x-2 relative z-10">
          <div className="flex-grow-[3] space-y-2 bg-transparent box-border">
            <div className="flex items-baseline">
              <span className={`${labelClass} text-sm mr-[6px]`}>Trường:</span>
              <span
                className={`${valueBaseStyle} border-b border-brand-blue flex-1 px-0 pt-1 pb-[1px]`}
              >
                {retrievedFormData.school}
              </span>
            </div>
            <div className="flex items-baseline">
              <span className={`${labelClass} text-sm mr-[6px]`}>Lớp:</span>
              <span
                className={`${valueBaseStyle} border-b border-brand-blue flex-1 px-0 pt-1 pb-[1px]`}
              >
                {retrievedFormData.class}
              </span>
            </div>
            <div className="flex items-baseline">
              <span className={`${labelClass} text-sm mr-[6px]`}>
                Họ và tên:
              </span>
              <span
                className={`${valueBaseStyle} border-b border-brand-blue flex-1 px-0 pt-1 pb-[1px]`}
              >
                {retrievedFormData.name}
              </span>
            </div>
          </div>
          <div
            className={`p-3 flex-grow-[1] ml-4 flex h-[100px] w-[100px] flex-col items-center justify-start bg-transparent border border-brand-blue box-border`}
          >
            {/* Score box - Replaced with image for result page */}
            <p className={`${labelClass} text-sm mb-1 italic underline`}>
              Điểm
            </p>
            <Image
              width={80}
              height={80}
              src="/images/ten.png"
              alt="Điểm 10"
              className=" object-contain"
            />
          </div>
        </div>

        {/* Static Lời phê - Replicating FormClient structure & style */}
        <div
          className={`mb-4 px-1 py-1 bg-transparent border border-brand-blue relative z-10 box-border`}
        >
          <h2
            className={`${labelClass} text-center font-semibold text-sm underline decoration-brand-blue italic`}
          >
            Lời phê của ban nhạc
          </h2>
          <p className="scrollbar-hide text-[10px] md:text-sm italic whitespace-pre-wrap leading-relaxed text-justify text-brand-error font-nvn h-20 overflow-y-auto p-1 bg-transparent">
            {staticCriticismText}
          </p>
        </div>

        {/* Đề bài & Essay Lines - Replicating FormClient structure & style */}
        <div className="mb-4 flex flex-col items-center relative z-10">
          <h2 className={`${labelClass} text-[24px] font-bold text-center`}>
            ĐỀ BÀI
          </h2>
          <p className={`${labelClass} text-center text-sm my-2 px-1 md:w-3/4`}>
            Cậu hãy chia sẻ với bọn tớ một vài kỷ niệm thời học sinh của mình,
            hoặc cậu cũng có thể viết đôi dòng cảm nghĩ dành cho Truant Fu và ca
            khúc &apos;Một Thời&apos; nhé!
          </p>

          <div className="flex mt-2 flex-1 w-full space-x-3">
            {/* Uploaded Image Display (if exists) */}
            {displayImage && ( // Use displayImage state
              <div className="w-[170px] flex-shrink-0 h-[160px] box-border">
                <Image
                  width={170}
                  height={160}
                  src={displayImage} // Use displayImage state
                  alt="Kỷ niệm"
                  className="w-full h-full object-cover border border-brand-blue"
                />
              </div>
            )}
            {!displayImage && ( // Use displayImage state
              <div className="w-[170px] flex-shrink-0 h-[160px] box-border border border-dashed border-brand-blue/50"></div>
            )}

            {/* Essay Top Part - lined background */}
            <div
              className="flex-grow h-[160px] box-border whitespace-pre-wrap overflow-hidden font-comic text-sm text-black"
              style={getLinedBackgroundStyle()}
            >
              {retrievedFormData.essayContentTop || ""}
            </div>
          </div>
          {/* Essay Bottom Part - lined background */}
          <div
            className="flex-1 w-full mt-0 whitespace-pre-wrap overflow-hidden font-comic text-sm text-black"
            style={getLinedBackgroundStyle()}
          >
            {retrievedFormData.essayContentBottom || ""}
            {/* Fill remaining lines if content is short, to show full lined paper effect */}
            {Array.from({
              length: Math.max(
                0,
                6 -
                  (retrievedFormData.essayContentBottom || "").split("\n")
                    .length
              ),
            }).map((_, i) => (
              <div key={`fill-line-${i}`} style={{ height: "1.625em" }}></div>
            ))}
          </div>
        </div>
      </div>

      <div className="text-center pb-2">
        <button
          onClick={handleDownload}
          className="px-8 py-3 bg-transparent underline text-brand-blue text-lg font-semibold hover:opacity-90 transition-opacity duration-300 flex items-center justify-center mx-auto space-x-2 font-times"
        >
          <span> {isDownloading ? "Đang tải..." : "Lưu lại kết quả"}</span>
        </button>
      </div>
    </div>
  );
}
