"use client";

import { useState, useTransition } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { testSchema, type TestInput, type QuestionInput } from "@/lib/validations/test";
import { createTestAction } from "@/app/actions/tests";
import { uz } from "@/lib/strings/uz";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { QuestionEditor } from "./QuestionEditor";

interface Subject { id: string; name: string }
interface ClassItem { id: string; grade: number; letter: string }

const TEST_TYPES = [
  { value: "entry", label: uz.tests.entryTest },
  { value: "post_topic", label: uz.tests.postTopic },
  { value: "home_study", label: uz.tests.homeStudy },
] as const;

export function TestBuilderForm({
  subjects,
  classes,
}: {
  subjects: Subject[];
  classes: ClassItem[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<TestInput>({
    resolver: zodResolver(testSchema),
    defaultValues: {
      title: "",
      description: "",
      subjectId: "",
      classIds: [],
      testType: "home_study",
      timeLimit: null,
      maxAttempts: null,
      questions: [defaultQuestion()],
    },
  });

  const { fields: questionFields, append, remove, move } = useFieldArray({
    control: form.control,
    name: "questions",
  });

  function defaultQuestion(): QuestionInput {
    return {
      question_text: "",
      question_type: "single",
      points: 1,
      order: 0,
      options: [
        { option_text: "", is_correct: true },
        { option_text: "", is_correct: false },
        { option_text: "", is_correct: false },
        { option_text: "", is_correct: false },
      ],
    };
  }

  function onSubmit(values: TestInput) {
    startTransition(async () => {
      const result = await createTestAction(values);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Test muvaffaqiyatli yaratildi");
        router.push("/teacher/tests");
      }
    });
  }

  const timeLimitValue = form.watch("timeLimit");
  const maxAttemptsValue = form.watch("maxAttempts");

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        noValidate
        aria-label={uz.teacher.addTest}
        className="space-y-6"
      >
        {/* Test ma'lumotlari */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Test ma&apos;lumotlari</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Test nomi <span aria-hidden="true" className="text-destructive">*</span></FormLabel>
                  <FormControl><Input aria-required="true" placeholder="Test nomi..." {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{uz.common.description}</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Qisqacha tavsif..." rows={2} className="resize-none" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="subjectId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fan <span aria-hidden="true" className="text-destructive">*</span></FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger aria-required="true">
                          <SelectValue placeholder="Fan tanlang" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {subjects.map((s) => (
                          <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="testType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Test turi <span aria-hidden="true" className="text-destructive">*</span></FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {TEST_TYPES.map((t) => (
                          <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Sinflar (multiple) */}
            <FormField
              control={form.control}
              name="classIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sinflar <span aria-hidden="true" className="text-destructive">*</span></FormLabel>
                  <div
                    role="group"
                    aria-label="Sinflarni tanlang"
                    className="flex flex-wrap gap-3"
                  >
                    {classes.map((c) => {
                      const checked = field.value.includes(c.id);
                      return (
                        <label
                          key={c.id}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <Checkbox
                            checked={checked}
                            onCheckedChange={(v) => {
                              if (v) field.onChange([...field.value, c.id]);
                              else field.onChange(field.value.filter((id) => id !== c.id));
                            }}
                            aria-label={`${c.grade}-sinf ${c.letter}`}
                          />
                          <span className="text-sm">{c.grade}-{c.letter}</span>
                        </label>
                      );
                    })}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              {/* Vaqt chegarasi */}
              <div className="space-y-2">
                <Label htmlFor="timeLimit">{uz.tests.timeLimit}</Label>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="timeLimitToggle"
                    checked={timeLimitValue !== null}
                    onCheckedChange={(v) => form.setValue("timeLimit", v ? 30 : null)}
                    aria-label="Vaqt chegarasini yoqish"
                  />
                  <label htmlFor="timeLimitToggle" className="text-sm cursor-pointer">
                    Vaqt chegarasi
                  </label>
                  {timeLimitValue !== null && (
                    <Input
                      id="timeLimit"
                      type="number"
                      min={1}
                      max={180}
                      className="w-20"
                      value={timeLimitValue ?? ""}
                      onChange={(e) => form.setValue("timeLimit", parseInt(e.target.value) || null)}
                      aria-label="Daqiqada vaqt chegarasi"
                    />
                  )}
                </div>
              </div>

              {/* Max urinishlar */}
              <div className="space-y-2">
                <Label>{uz.tests.maxAttempts}</Label>
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={maxAttemptsValue !== null}
                    onCheckedChange={(v) => form.setValue("maxAttempts", v ? 3 : null)}
                    aria-label="Urinishlar sonini cheklash"
                  />
                  <span className="text-sm cursor-pointer">Cheklash</span>
                  {maxAttemptsValue !== null && (
                    <Input
                      type="number"
                      min={1}
                      max={10}
                      className="w-20"
                      value={maxAttemptsValue ?? ""}
                      onChange={(e) => form.setValue("maxAttempts", parseInt(e.target.value) || null)}
                      aria-label="Maksimal urinishlar soni"
                    />
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Separator />

        {/* Savollar */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              Savollar
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                ({questionFields.length} ta)
              </span>
            </h2>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append(defaultQuestion())}
            >
              + {uz.tests.addQuestion}
            </Button>
          </div>

          {form.formState.errors.questions?.root && (
            <p className="text-sm text-destructive" role="alert">
              {form.formState.errors.questions.root.message}
            </p>
          )}

          <ol className="space-y-4" aria-label="Savollar ro'yxati">
            {questionFields.map((field, index) => (
              <li key={field.id}>
                <QuestionEditor
                  index={index}
                  form={form}
                  onRemove={() => remove(index)}
                  onMoveUp={index > 0 ? () => move(index, index - 1) : undefined}
                  onMoveDown={index < questionFields.length - 1 ? () => move(index, index + 1) : undefined}
                  canRemove={questionFields.length > 1}
                />
              </li>
            ))}
          </ol>
        </div>

        <div className="flex items-center gap-3 pt-2 pb-4">
          <Button type="submit" disabled={isPending} aria-busy={isPending}>
            {isPending ? uz.common.loading : "Testni saqlash"}
          </Button>
          <a href="/teacher/tests" className="text-sm text-muted-foreground hover:text-foreground focus-visible:outline-2">
            {uz.common.cancel}
          </a>
        </div>
      </form>
    </Form>
  );
}
