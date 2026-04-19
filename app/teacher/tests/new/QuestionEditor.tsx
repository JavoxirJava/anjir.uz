"use client";

import { useFieldArray, type UseFormReturn } from "react-hook-form";
import type { TestInput } from "@/lib/validations/test";
import { uz } from "@/lib/strings/uz";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { FileUploadField } from "@/components/lectures/FileUploadField";

const Q_TYPES = [
  { value: "single", label: uz.tests.singleChoice },
  { value: "multiple", label: uz.tests.multipleChoice },
  { value: "true_false", label: "To'g'ri/Noto'g'ri" },
  { value: "fill_blank", label: uz.tests.fillBlank },
] as const;

interface Props {
  index: number;
  form: UseFormReturn<TestInput>;
  onRemove: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  canRemove: boolean;
}

export function QuestionEditor({ index, form, onRemove, onMoveUp, onMoveDown, canRemove }: Props) {
  const qType = form.watch(`questions.${index}.question_type`);
  const imageUrl = form.watch(`questions.${index}.image_url`);

  const { fields: optionFields, append: appendOption, remove: removeOption } = useFieldArray({
    control: form.control,
    name: `questions.${index}.options`,
  });

  function handleTypeChange(type: string) {
    form.setValue(`questions.${index}.question_type`, type as TestInput["questions"][0]["question_type"]);

    if (type === "true_false") {
      form.setValue(`questions.${index}.options`, [
        { option_text: "To'g'ri", is_correct: true },
        { option_text: "Noto'g'ri", is_correct: false },
      ]);
    } else if (type === "fill_blank") {
      form.setValue(`questions.${index}.options`, [
        { option_text: "", is_correct: true },
      ]);
    } else {
      // single yoki multiple uchun 4 ta variant
      const cur = form.getValues(`questions.${index}.options`) ?? [];
      if (cur.length < 2) {
        form.setValue(`questions.${index}.options`, [
          { option_text: "", is_correct: true },
          { option_text: "", is_correct: false },
          { option_text: "", is_correct: false },
          { option_text: "", is_correct: false },
        ]);
      }
    }
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold" id={`q-${index}-label`}>
            {index + 1}-savol
          </h3>
          <div className="flex items-center gap-1">
            {onMoveUp && (
              <button
                type="button"
                onClick={onMoveUp}
                aria-label="Yuqoriga ko'chirish"
                className="rounded p-1 hover:bg-muted focus-visible:outline-2 text-sm"
              >
                ↑
              </button>
            )}
            {onMoveDown && (
              <button
                type="button"
                onClick={onMoveDown}
                aria-label="Pastga ko'chirish"
                className="rounded p-1 hover:bg-muted focus-visible:outline-2 text-sm"
              >
                ↓
              </button>
            )}
            {canRemove && (
              <button
                type="button"
                onClick={onRemove}
                aria-label={`${index + 1}-savolni o'chirish`}
                className="rounded p-1 text-destructive hover:bg-destructive/10 focus-visible:outline-2 text-sm"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4" aria-labelledby={`q-${index}-label`}>
        {/* Savol matni */}
        <FormField
          control={form.control}
          name={`questions.${index}.question_text`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Savol matni <span aria-hidden="true" className="text-destructive">*</span></FormLabel>
              <FormControl>
                <Textarea
                  rows={2}
                  placeholder="Savol matnini kiriting..."
                  aria-required="true"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          {/* Savol turi */}
          <FormField
            control={form.control}
            name={`questions.${index}.question_type`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Savol turi</FormLabel>
                <Select
                  value={field.value ?? ""}
                  onValueChange={(v) => { field.onChange(v); if (v) handleTypeChange(v); }}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Q_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Ball */}
          <FormField
            control={form.control}
            name={`questions.${index}.points`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{uz.tests.points}</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    max={10}
                    aria-label="Ball"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Rasm (ixtiyoriy) */}
        {!imageUrl ? (
          <div>
            <p className="text-sm font-medium mb-1.5">{uz.tests.image} (ixtiyoriy)</p>
            <FileUploadField
              accept="image/jpeg,image/png,image/webp"
              maxSizeMb={5}
              label="Rasm yuklash"
              folder="questions"
              onUploaded={(url) => form.setValue(`questions.${index}.image_url`, url)}
            />
          </div>
        ) : (
          <div className="space-y-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt={form.watch(`questions.${index}.image_alt`) ?? "Savol rasmi"}
              className="max-h-40 rounded-md border object-contain"
            />
            <FormField
              control={form.control}
              name={`questions.${index}.image_alt`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {uz.tests.altText}{" "}
                    <span aria-hidden="true" className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Screen reader uchun rasm tavsifi..."
                      aria-required="true"
                      aria-describedby={`alt-hint-${index}`}
                      {...field}
                    />
                  </FormControl>
                  <p id={`alt-hint-${index}`} className="text-xs text-muted-foreground">
                    {uz.tests.altTextRequired}
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />
            <button
              type="button"
              onClick={() => form.setValue(`questions.${index}.image_url`, "")}
              className="text-xs text-destructive underline focus-visible:outline-2"
            >
              Rasmni o&apos;chirish
            </button>
          </div>
        )}

        {/* Javob variantlari */}
        {qType !== "fill_blank" && (
          <fieldset>
            <legend className="text-sm font-medium mb-2">
              Javob variantlari
              {qType === "multiple" && (
                <span className="ml-2 text-xs font-normal text-muted-foreground">
                  (bir nechta to&apos;g&apos;ri javob belgilash mumkin)
                </span>
              )}
            </legend>
            <div className="space-y-2">
              {optionFields.map((opt, oi) => (
                <div key={opt.id} className="flex items-center gap-2">
                  <input
                    type={qType === "multiple" ? "checkbox" : "radio"}
                    name={`q${index}-correct`}
                    checked={!!form.watch(`questions.${index}.options.${oi}.is_correct`)}
                    onChange={(e) => {
                      if (qType === "single") {
                        // Boshqalarni o'chirish
                        optionFields.forEach((_, i) => {
                          form.setValue(`questions.${index}.options.${i}.is_correct`, i === oi);
                        });
                      } else {
                        form.setValue(`questions.${index}.options.${oi}.is_correct`, e.target.checked);
                      }
                    }}
                    aria-label={`${oi + 1}-variant to'g'ri javob`}
                    disabled={qType === "true_false"}
                    className="w-4 h-4 accent-primary"
                  />
                  <FormField
                    control={form.control}
                    name={`questions.${index}.options.${oi}.option_text`}
                    render={({ field }) => (
                      <Input
                        {...field}
                        placeholder={`${oi + 1}-variant...`}
                        disabled={qType === "true_false"}
                        aria-label={`${oi + 1}-variant matni`}
                        className="flex-1"
                      />
                    )}
                  />
                  {qType !== "true_false" && optionFields.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeOption(oi)}
                      aria-label={`${oi + 1}-variantni o'chirish`}
                      className="text-muted-foreground hover:text-destructive focus-visible:outline-2 p-1"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}

              {qType !== "true_false" && optionFields.length < 6 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => appendOption({ option_text: "", is_correct: false })}
                >
                  + {uz.tests.addOption}
                </Button>
              )}
            </div>
          </fieldset>
        )}

        {/* Bo'sh joy to'ldirish */}
        {qType === "fill_blank" && (
          <FormField
            control={form.control}
            name={`questions.${index}.options.0.option_text`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>To'g'ri javob <span aria-hidden="true" className="text-destructive">*</span></FormLabel>
                <FormControl>
                  <Input placeholder="To'g'ri javob matni..." aria-required="true" {...field} />
                </FormControl>
                <p className="text-xs text-muted-foreground">
                  Kichik/katta harf farqi tekshirilmaydi
                </p>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
      </CardContent>
    </Card>
  );
}
