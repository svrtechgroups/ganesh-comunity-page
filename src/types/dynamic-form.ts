export type DynamicFieldType =
  | 'TEXT'
  | 'TEXTAREA'
  | 'SELECT'
  | 'RADIO'
  | 'CHECKBOX'
  | 'DATE'
  | 'APPOINTMENT';

export interface FieldOption {
  label: string;
  value: string;
}

export interface AppointmentScheduleConfig {
  startTime: string; // e.g. "08:00"
  endTime: string; // e.g. "21:00"
  intervalMinutes: number; // e.g. 30
  maxCapacity: number; // e.g. 5
  daysOfWeek: number[]; // e.g. [1, 2, 3, 4, 5] (1=Monday, 7/0=Sunday)
  timezone: string; // e.g. "Europe/London", "UTC", "Asia/Kolkata"
  maxDaysInAdvance?: number; // e.g. 10 (respondent can only book up to 10 days ahead)
  minNoticeHours?: number; // e.g. 2 (cannot book slots within 2 hours of current time)
  bookingCutoffDate?: string; // e.g. "2026-10-31" (closing date after which no booking is allowed)
}

export interface FormFieldInput {
  id?: string;
  label: string;
  type: DynamicFieldType;
  placeholder?: string;
  helpText?: string;
  isRequired: boolean;
  orderIndex: number;
  options?: FieldOption[];
  appointmentConfig?: AppointmentScheduleConfig;
  isActive?: boolean;
}

export interface FormConfigInput {
  id?: string;
  title: string;
  description?: string;
  isPublished: boolean;
  fields: FormFieldInput[];
}

export interface AppointmentSlotDTO {
  id: string;
  fieldId: string;
  startTime: string; // ISO UTC string
  endTime: string;   // ISO UTC string
  maxCapacity: number;
  bookedCount: number;
  remainingCapacity: number;
  isAvailable: boolean;
  formattedLocalTime?: string;
  formattedTimeRange?: string; // e.g. "9:00 AM – 9:30 AM"
}

export interface SubmissionPayload {
  formId: string;
  answers: {
    fieldId: string;
    answerValue: string;
    jsonValue?: string[];
    slotId?: string; // If field type is APPOINTMENT
  }[];
  clientTimezone?: string;
}

export interface FieldAnalyticsDTO {
  fieldId: string;
  fieldLabel: string;
  fieldType: DynamicFieldType;
  totalAnswers: number;
  choiceDistribution?: {
    choice: string;
    count: number;
    percentage: number;
  }[];
  appointmentStats?: {
    totalSlots: number;
    totalCapacity: number;
    totalBooked: number;
    utilizationPercentage: number;
  };
}

export interface FormAnalyticsReport {
  formId: string;
  formTitle: string;
  isPublished: boolean;
  totalSubmissions: number;
  submissionsLast7Days: number;
  fields: FieldAnalyticsDTO[];
}
