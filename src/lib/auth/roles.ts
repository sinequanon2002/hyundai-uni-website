// 사용자 역할 정의 및 권한 유틸리티
// 역할 추가/변경 시 profiles 테이블 CHECK 제약도 함께 수정 필요

export const USER_ROLES = [
  "customer",
  "sales_rep",
  "sales_manager",
  "dispatcher",
  "accountant",
  "admin",
  "super_admin",
] as const;

export type UserRole = (typeof USER_ROLES)[number];

export const ROLE_LABELS: Record<UserRole, string> = {
  customer:      "고객",
  sales_rep:     "영업 담당자",
  sales_manager: "영업 관리자",
  dispatcher:    "배차 담당자",
  accountant:    "경리",
  admin:         "관리자",
  super_admin:   "최고 관리자",
};

/** 관리자 백오피스 접근 가능 역할 (customer 제외 전체) */
export const STAFF_ROLES: UserRole[] = [
  "sales_rep",
  "sales_manager",
  "dispatcher",
  "accountant",
  "admin",
  "super_admin",
];

/** 모든 관리 권한을 가진 역할 */
export const ADMIN_ROLES: UserRole[] = ["admin", "super_admin"];

/** 관리자 백오피스 접근 가능 여부 */
export function isStaff(role: string | null | undefined): role is UserRole {
  return STAFF_ROLES.includes(role as UserRole);
}

/** 최고 관리 권한 여부 */
export function isAdmin(role: string | null | undefined): role is UserRole {
  return ADMIN_ROLES.includes(role as UserRole);
}
