'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState, ChangeEvent, CSSProperties, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { toast } from 'sonner';
import { useFormStore, FormData as StoreFormData } from '@/lib/form.store';

const FormSchema = z.object({
  motThoi: z.string().min(1, 'Tiêu đề \'Một Thời\' không được để trống'),
  thoiHanDaXa: z.string().min(1, 'Thời hạn không được để trống'),
  school: z.string().min(1, 'Trường không được để trống'),
  class: z.string().min(1, 'Lớp không được để trống'),
  name: z.string().min(1, 'Họ và tên không được để trống'),
  essayContentTop: z.string().optional(),
  essayContentBottom: z.string().optional(),
  image: z.string().optional()
    .refine((val) => val === undefined || val === null || (typeof val === 'string' && val.startsWith('data:image/')), {
      message: 'Ảnh không hợp lệ. Vui lòng chọn lại.',
    })
}).refine(data => {
  const topContent = data.essayContentTop?.trim() || '';
  const bottomContent = data.essayContentBottom?.trim() || '';
  return (topContent + bottomContent).length > 0;
}, { message: 'Nội dung kỷ niệm không được để trống', path: ['essayContentTop'] });

type FormValues = z.infer<typeof FormSchema>;

const inputBaseStyle = "border-0 border-b px-0 pt-1 pb-[1px] bg-transparent focus:ring-0 focus:outline-none text-black text-sm font-comic w-full box-border";
const textareaBaseStyle = "w-full resize-none bg-transparent placeholder:text-brand-input-placeholder/70 text-sm font-comic text-black box-border focus:outline-none overflow-hidden";
const labelClass = "text-brand-blue font-times font-bold";

const getLinedBackgroundStyle = (hasError: boolean): CSSProperties => {
  const lineColor = hasError ? '#ef4444' : '#363C83'; // brand-error or brand-blue
  const lineHeightEm = 1.625; // Use a variable for em value
  return {
    backgroundImage: `linear-gradient(to bottom, transparent calc(${lineHeightEm}em - 1px), ${lineColor} calc(${lineHeightEm}em - 1px), ${lineColor} ${lineHeightEm}em, transparent ${lineHeightEm}em)`,
    backgroundSize: `100% ${lineHeightEm}em`,
    lineHeight: `${lineHeightEm}em`,
    boxSizing: 'border-box', // Ensure consistent height calculation
    paddingTop: '0.1em', // Small adjustment for text position within lines
  };
};

export default function FormClient() {
  const router = useRouter();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { formData, setFormData } = useFormStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    clearErrors,
  } = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: formData 
      ? { 
          ...formData, 
          image: undefined
        } 
      : {
          motThoi: '',
          thoiHanDaXa: '',
          school: '',
          class: '',
          name: '',
          essayContentTop: '',
          essayContentBottom: '',
          image: undefined,
        }
  });

  useEffect(() => {
    const storedImage = localStorage.getItem('userImageData');
    if (storedImage) {
      setImagePreview(storedImage);
      setValue('image', storedImage, { shouldValidate: true });
    }
  }, [setValue]);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Kích thước ảnh tối đa là 10MB.');
        e.target.value = '';
        setValue('image', undefined);
        setImagePreview(null);
        localStorage.removeItem('userImageData'); // Clear from localStorage
        return;
      }
      if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
        toast.error('Chỉ chấp nhận file ảnh (JPEG, PNG, WEBP, GIF).');
        e.target.value = '';
        setValue('image', undefined);
        setImagePreview(null);
        localStorage.removeItem('userImageData'); // Clear from localStorage
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        setValue('image', dataUrl, { shouldValidate: true });
        setImagePreview(dataUrl);
        localStorage.setItem('userImageData', dataUrl); // Save to localStorage
        clearErrors('image');
      };
      reader.readAsDataURL(file);
    } else {
      setValue('image', undefined, { shouldValidate: true });
      setImagePreview(null);
      localStorage.removeItem('userImageData'); // Clear from localStorage
    }
  };

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    const currentDate = new Date().toLocaleDateString('vi-VN', { day: 'numeric', month: 'long', year: 'numeric' }).replace(' tháng', ' Tháng');
    
    const dataToStore: StoreFormData = {
      motThoi: data.motThoi,
      thoiHanDaXa: data.thoiHanDaXa,
      school: data.school,
      class: data.class,
      name: data.name,
      essayContentTop: data.essayContentTop || '',
      essayContentBottom: data.essayContentBottom || '',
      ngayThangNam: currentDate,
      // Note: The image data itself is NOT part of dataToStore for Zustand
      // It's handled separately via localStorage and imagePreview state.
    };

    setFormData(dataToStore); // Save main form data to Zustand store
    router.push('/form/result');
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full p-4 md:p-6 font-times bg-transparent max-h-[100svh] overflow-y-auto flex flex-col text-sm">
      <div className="text-center mb-4">
        <p className={`${labelClass} text-sm`}>Ngày {new Date().toLocaleDateString('vi-VN', { day: 'numeric', month: 'long', year: 'numeric' }).replace(' tháng', ' Tháng').replace(',',' Năm')}</p>
        
        <div className="flex items-baseline justify-center space-x-2">
          <label htmlFor="motThoi" className={`${labelClass} text-[18px] uppercase`}>Một Thời</label>
          <input 
            type="text" 
            {...register('motThoi')} 
            id="motThoi" 
            className={`${inputBaseStyle} ${errors.motThoi ? 'border-brand-error focus:border-brand-error' : 'border-brand-blue focus:border-brand-blue'}`}
            style={{width: '125px'}} 
          />
        </div>

        <div className="flex items-baseline justify-center space-x-2">
          <label htmlFor="thoiHanDaXa" className={`${labelClass} text-sm`}>Thời hạn đã xa</label>
          <input 
            type="text" 
            {...register('thoiHanDaXa')} 
            id="thoiHanDaXa" 
            className={`${inputBaseStyle} ${errors.thoiHanDaXa ? 'border-brand-error focus:border-brand-error' : 'border-brand-blue focus:border-brand-blue'}`}
            style={{width: '80px'}} 
          />
        </div>
      </div>

      <div className="flex justify-between items-start mb-4 space-x-2">
        <div className=" box-border flex-grow-[3] space-y-2 bg-transparent">
          <div className="flex items-baseline">
            <label htmlFor="school" className={`${labelClass} text-sm mr-[6px]`}>Trường:</label>
            <input 
              type="text" 
              {...register('school')} 
              id="school" 
              className={`${inputBaseStyle} flex-1 ${errors.school ? 'border-brand-error focus:border-brand-error' : 'border-brand-blue focus:border-brand-blue'}`}
            />
          </div>
          
          <div className="flex items-baseline">
            <label htmlFor="class" className={`${labelClass} text-sm mr-[6px]`}>Lớp:</label>
            <input 
              type="text" 
              {...register('class')} 
              id="class" 
              className={`${inputBaseStyle} flex-1 ${errors.class ? 'border-brand-error focus:border-brand-error' : 'border-brand-blue focus:border-brand-blue'}`}
            />
          </div>

          <div className="flex items-baseline">
            <label htmlFor="name" className={`${labelClass} text-sm mr-[6px]`}>Họ và tên:</label>
            <input 
              type="text" 
              {...register('name')} 
              id="name" 
              className={`${inputBaseStyle} flex-1 ${errors.name ? 'border-brand-error focus:border-brand-error' : 'border-brand-blue focus:border-brand-blue'}`}
            />
          </div>
        </div>
        <div 
          className={`px-2 py-1 box-border flex-grow-[1] ml-4 flex h-[100px] w-[100px] flex-col items-center justify-start bg-transparent border ${errors.image ? 'border-brand-error' : 'border-brand-blue'}`} 
        >
          <p className={`${labelClass} text-sm italic underline mb-1`}>Điểm</p>
        </div>
      </div>

      <div className={`mb-4 px-2 py-1 bg-transparent border ${errors.image ? 'border-brand-error' : 'border-brand-blue'}`}>
        <h2 className={`${labelClass} text-center font-semibold mb-2 text-sm underline decoration-brand-blue italic`}>Lời phê của ban nhạc</h2>
        <div className="h-20 bg-transparent"></div>
      </div>

      <div className="mb-4 flex flex-col items-center">
        <h2 className={`${labelClass} text-[24px] font-bold text-center mb-1`}>ĐỀ BÀI</h2>
        <p className={`${labelClass} text-center text-sm my-3 px-1 md:w-3/4`}>
          Cậu hãy chia sẻ với bọn tớ một vài kỷ niệm thời học sinh của mình, hoặc cậu cũng có thể viết đôi dòng cảm nghĩ dành cho Truant Fu và ca khúc &apos;Một Thời&apos; nhé!
        </p>
        
        <div className="flex mt-2 flex-1 w-full space-x-3">
          <div className="w-[170px] flex-shrink-0 h-[160px] box-border">
            <input type="file" id="image" accept="image/*" onChange={handleImageChange} className="hidden" />
            <label 
              htmlFor="image" 
              className={`w-full h-full cursor-pointer border-2 bg-transparent text-brand-blue flex flex-col items-center justify-center text-center box-border ${errors.image ? 'border-brand-error' : 'border-brand-blue'}`}
            >
              {imagePreview ? (
                <Image src={imagePreview} width={170} height={160} alt="Xem trước" className="w-full h-full object-cover" />
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 mb-0.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                  </svg>
                  <p className="text-[14px] leading-tight font-times font-bold">Chọn file ảnh</p>
                  <p className="text-[10px] leading-tight font-times mt-0.5 font-bold">Tối đa: 10 MB</p>
                </>
              )}
            </label>
          </div>

          <div className="flex-grow h-[160px] box-border">
            <textarea
              {...register('essayContentTop')}
              placeholder="Mùa hè năm ấy, tớ..."
              className={`${textareaBaseStyle} h-full`} 
              style={getLinedBackgroundStyle(!!errors.essayContentTop)} 
            />
          </div>
        </div>
        <div className="flex-1 w-full">
          <textarea
            {...register('essayContentBottom')}
            rows={6} 
            placeholder="Tớ vẫn nhớ..."
            className={`${textareaBaseStyle}`}
            style={getLinedBackgroundStyle(!!errors.essayContentTop)} 
          />
        </div>
      </div>
      
      <div className="text-center pb-2">
        <button 
          type="submit" 
          className="px-8 py-3 bg-transparent text-brand-blue text-lg font-semibold hover:opacity-90 transition-opacity duration-300 flex items-center justify-center mx-auto space-x-2 font-times"
        >
          <span>Nộp bài</span>
          <Image src="/icons/long-arrow.svg" alt="Nộp bài" width={60} height={24} />
        </button>
      </div>
    </form>
  );
} 