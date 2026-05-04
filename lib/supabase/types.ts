/**
 * Supabase DB jadvallarining TypeScript turlari.
 * `supabase gen types` bilan avtomatik yanglanishi mumkin.
 */

export type UserRole = "super_admin" | "director" | "teacher" | "student";
export type UserStatus = "pending" | "active" | "rejected";
export type ContentType = "pdf" | "video" | "audio" | "ppt";
export type TestType = "entry" | "post_topic" | "home_study";
export type QuestionType = "single" | "multiple" | "true_false" | "fill_blank";
export type GameTemplate = "word_match" | "ordering" | "memory";
export type AudioSource = "uploaded" | "web_speech" | "google_tts";
export type SubtitleSource = "manual" | "ai";
export type ContrastMode = "normal" | "high" | "dark";
export type ColorBlindMode = "normal" | "protanopia" | "deuteranopia" | "tritanopia";
export type FontSize = "small" | "medium" | "large" | "xlarge";
export type TtsSource = "web_speech" | "google_tts" | "own_reader";

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          phone: string;
          first_name: string;
          last_name: string;
          role: UserRole;
          status: UserStatus;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["users"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["users"]["Insert"]>;
      };
      schools: {
        Row: {
          id: string;
          name: string;
          address: string | null;
          director_id: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["schools"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["schools"]["Insert"]>;
      };
      classes: {
        Row: {
          id: string;
          school_id: string;
          grade: number;
          letter: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["classes"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["classes"]["Insert"]>;
      };
      subjects: {
        Row: {
          id: string;
          name: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["subjects"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["subjects"]["Insert"]>;
      };
      school_subjects: {
        Row: {
          school_id: string;
          subject_id: string;
        };
        Insert: Database["public"]["Tables"]["school_subjects"]["Row"];
        Update: Partial<Database["public"]["Tables"]["school_subjects"]["Row"]>;
      };
      teacher_assignments: {
        Row: {
          id: string;
          teacher_id: string;
          school_id: string;
          class_id: string;
          subject_id: string;
        };
        Insert: Omit<Database["public"]["Tables"]["teacher_assignments"]["Row"], "id">;
        Update: Partial<Database["public"]["Tables"]["teacher_assignments"]["Insert"]>;
      };
      student_profiles: {
        Row: {
          user_id: string;
          school_id: string;
          class_id: string;
          approved_by: string | null;
          approved_at: string | null;
          rejection_reason: string | null;
        };
        Insert: Database["public"]["Tables"]["student_profiles"]["Row"];
        Update: Partial<Database["public"]["Tables"]["student_profiles"]["Row"]>;
      };
      accessibility_profiles: {
        Row: {
          user_id: string;
          vision_mode: boolean;
          hearing_mode: boolean;
          motor_mode: boolean;
          tts_source: TtsSource;
          font_size: FontSize;
          contrast_mode: ContrastMode;
          color_blind_mode: ColorBlindMode;
          reduce_motion: boolean;
          subtitles_always: boolean;
          screening_completed: boolean;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["accessibility_profiles"]["Row"], "updated_at">;
        Update: Partial<Database["public"]["Tables"]["accessibility_profiles"]["Insert"]>;
      };
      lectures: {
        Row: {
          id: string;
          creator_id: string;
          school_id: string | null;
          subject_id: string;
          class_id: string | null;
          title: string;
          description: string | null;
          content_type: ContentType;
          file_url: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["lectures"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["lectures"]["Insert"]>;
      };
      lecture_subtitles: {
        Row: {
          id: string;
          lecture_id: string;
          vtt_url: string;
          language: string;
          source: SubtitleSource;
        };
        Insert: Omit<Database["public"]["Tables"]["lecture_subtitles"]["Row"], "id">;
        Update: Partial<Database["public"]["Tables"]["lecture_subtitles"]["Insert"]>;
      };
      assignments: {
        Row: {
          id: string;
          teacher_id: string;
          subject_id: string;
          class_id: string;
          title: string;
          description: string | null;
          file_url: string | null;
          deadline: string | null;
          difficulty_level: "low" | "medium" | "high";
          is_for_disabled: boolean;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["assignments"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["assignments"]["Insert"]>;
      };
      assignment_submissions: {
        Row: {
          id: string;
          assignment_id: string;
          student_id: string;
          text: string | null;
          file_url: string | null;
          submitted_at: string;
          grade: number | null;
          comment: string | null;
        };
        Insert: Omit<Database["public"]["Tables"]["assignment_submissions"]["Row"], "id" | "submitted_at">;
        Update: Partial<Database["public"]["Tables"]["assignment_submissions"]["Insert"]>;
      };
      tests: {
        Row: {
          id: string;
          teacher_id: string;
          subject_id: string;
          title: string;
          description: string | null;
          time_limit: number | null;
          test_type: TestType;
          max_attempts: number | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["tests"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["tests"]["Insert"]>;
      };
      test_classes: {
        Row: {
          test_id: string;
          class_id: string;
        };
        Insert: Database["public"]["Tables"]["test_classes"]["Row"];
        Update: Partial<Database["public"]["Tables"]["test_classes"]["Row"]>;
      };
      questions: {
        Row: {
          id: string;
          test_id: string;
          question_text: string;
          question_type: QuestionType;
          image_url: string | null;
          image_alt: string | null;
          points: number;
          order: number;
        };
        Insert: Omit<Database["public"]["Tables"]["questions"]["Row"], "id">;
        Update: Partial<Database["public"]["Tables"]["questions"]["Insert"]>;
      };
      question_options: {
        Row: {
          id: string;
          question_id: string;
          option_text: string;
          is_correct: boolean;
        };
        Insert: Omit<Database["public"]["Tables"]["question_options"]["Row"], "id">;
        Update: Partial<Database["public"]["Tables"]["question_options"]["Insert"]>;
      };
      test_attempts: {
        Row: {
          id: string;
          student_id: string;
          test_id: string;
          started_at: string;
          finished_at: string | null;
          score: number | null;
        };
        Insert: Omit<Database["public"]["Tables"]["test_attempts"]["Row"], "id">;
        Update: Partial<Database["public"]["Tables"]["test_attempts"]["Insert"]>;
      };
      test_answers: {
        Row: {
          id: string;
          attempt_id: string;
          question_id: string;
          answer_text: string | null;
          selected_option_ids: string[] | null;
          is_correct: boolean;
        };
        Insert: Omit<Database["public"]["Tables"]["test_answers"]["Row"], "id">;
        Update: Partial<Database["public"]["Tables"]["test_answers"]["Insert"]>;
      };
      games: {
        Row: {
          id: string;
          teacher_id: string;
          template_type: GameTemplate;
          subject_id: string;
          class_id: string | null;
          title: string;
          content_json: Record<string, unknown>;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["games"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["games"]["Insert"]>;
      };
      game_classes: {
        Row: {
          game_id: string;
          class_id: string;
        };
        Insert: Database["public"]["Tables"]["game_classes"]["Row"];
        Update: Partial<Database["public"]["Tables"]["game_classes"]["Row"]>;
      };
      game_attempts: {
        Row: {
          id: string;
          student_id: string;
          game_id: string;
          score: number;
          duration: number;
          completed_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["game_attempts"]["Row"], "id">;
        Update: Partial<Database["public"]["Tables"]["game_attempts"]["Insert"]>;
      };
      books: {
        Row: {
          id: string;
          uploader_id: string;
          title: string;
          description: string | null;
          pdf_url: string;
          audio_url: string | null;
          audio_source: AudioSource | null;
          ocr_required: boolean;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["books"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["books"]["Insert"]>;
      };
      book_bookmarks: {
        Row: {
          user_id: string;
          book_id: string;
          page: number;
          audio_timestamp: number | null;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["book_bookmarks"]["Row"], "updated_at">;
        Update: Partial<Database["public"]["Tables"]["book_bookmarks"]["Insert"]>;
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          title: string;
          message: string;
          link: string | null;
          read: boolean;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["notifications"]["Row"], "id" | "created_at" | "read">;
        Update: Partial<Database["public"]["Tables"]["notifications"]["Insert"]>;
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
  };
}
