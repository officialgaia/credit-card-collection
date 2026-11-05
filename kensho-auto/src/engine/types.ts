export interface OptionInfo {
  value: string;
  text: string;
  disabled: boolean;
}

/** ページ内で収集したフォーム項目の情報（個人情報は含まない） */
export interface FieldInfo {
  idx: number;
  tag: "input" | "select" | "textarea";
  type: string;
  name: string;
  id: string;
  placeholder: string;
  autocomplete: string;
  /** 項目自体のラベル（label要素・aria-label） */
  label: string;
  /** 行・グループの見出し（th / dt / legend / 直前の見出し） */
  groupLabel: string;
  required: boolean;
  maxLength: number | null;
  options: OptionInfo[];
  /** radio / checkbox の value */
  value: string;
  checked: boolean;
  visible: boolean;
}

export type FieldKey =
  | "lastName" | "firstName" | "fullName"
  | "lastNameKana" | "firstNameKana" | "fullNameKana"
  | "zip" | "zip1" | "zip2"
  | "prefecture" | "city" | "street" | "building" | "address"
  | "phone" | "phone1" | "phone2" | "phone3"
  | "email"
  | "birthDate" | "birthYear" | "birthMonth" | "birthDay"
  | "age" | "gender"
  | "agree" | "newsletter";

export type FillAction =
  | { idx: number; kind: "fill"; key: FieldKey | "survey"; value: string }
  | { idx: number; kind: "select"; key: FieldKey | "survey"; optionValue: string }
  | { idx: number; kind: "check"; key: FieldKey | "survey" };

export interface FillPlan {
  actions: FillAction[];
  /** 自動で埋められない必須項目があれば manual にする理由 */
  manualReasons: string[];
  /** デバッグ用：各項目の判定結果（値は含めない） */
  classified: { idx: number; key: string; label: string }[];
}
