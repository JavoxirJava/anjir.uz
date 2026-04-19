import { cn } from "@/lib/utils";

interface Props {
  children: React.ReactNode;
  as?: keyof React.JSX.IntrinsicElements;
  className?: string;
}

/**
 * Faqat screen reader uchun ko'rinadigan kontent.
 * Vizual jihatdan yashiriladi, lekin AT tomonidan o'qiladi.
 */
export function ScreenReaderOnly({ children, as: Tag = "span", className }: Props) {
  return (
    <Tag className={cn("sr-only", className)}>
      {children}
    </Tag>
  );
}
