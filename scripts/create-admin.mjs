/**
 * 초기 관리자 계정 생성 스크립트
 *
 * 사용법:
 *   npm run create-admin
 *
 * 실행 전 조건:
 *   - .env.local에 NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY 설정
 *   - Supabase 마이그레이션 실행 완료 (profiles 테이블 존재)
 */

import { readFileSync } from "fs";
import { createClient } from "@supabase/supabase-js";
import { createInterface } from "readline";

// ─── .env.local 파서 ──────────────────────────────────────────────────────────

function loadEnvFile(path) {
  try {
    const content = readFileSync(path, "utf-8");
    const env = {};
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx === -1) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, "");
      env[key] = val;
    }
    return env;
  } catch {
    return {};
  }
}

const fileEnv = loadEnvFile(".env.local");

function getEnv(key) {
  return fileEnv[key] || process.env[key] || "";
}

const SUPABASE_URL      = getEnv("NEXT_PUBLIC_SUPABASE_URL");
const SERVICE_ROLE_KEY  = getEnv("SUPABASE_SERVICE_ROLE_KEY");

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("\n❌ 환경 변수 누락");
  console.error("   .env.local에 아래 항목이 있는지 확인하세요:");
  console.error("   NEXT_PUBLIC_SUPABASE_URL");
  console.error("   SUPABASE_SERVICE_ROLE_KEY\n");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// ─── 역할 정의 ────────────────────────────────────────────────────────────────

const ROLES = [
  "customer",
  "sales_rep",
  "sales_manager",
  "dispatcher",
  "accountant",
  "admin",
  "super_admin",
];

const ROLE_LABELS = {
  customer:      "고객",
  sales_rep:     "영업 담당자",
  sales_manager: "영업 관리자",
  dispatcher:    "배차 담당자",
  accountant:    "경리",
  admin:         "관리자",
  super_admin:   "최고 관리자",
};

// ─── readline 유틸 ────────────────────────────────────────────────────────────

function createRl() {
  return createInterface({ input: process.stdin, output: process.stdout });
}

function ask(rl, question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => resolve(answer.trim()));
  });
}

function askSecret(question) {
  return new Promise((resolve) => {
    process.stdout.write(question);
    const stdin = process.stdin;
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding("utf8");

    let value = "";
    stdin.on("data", function handler(ch) {
      if (ch === "\n" || ch === "\r" || ch === "\u0004") {
        stdin.setRawMode(false);
        stdin.pause();
        stdin.removeListener("data", handler);
        process.stdout.write("\n");
        resolve(value);
      } else if (ch === "\u0003") {
        process.exit();
      } else if (ch === "\u007f") {
        value = value.slice(0, -1);
      } else {
        value += ch;
        process.stdout.write("*");
      }
    });
  });
}

// ─── 메인 ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(" 현대유앤아이환경 · 직원 계정 생성");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  const rl = createRl();

  const email    = await ask(rl, "이메일: ");
  rl.close();

  if (!email || !email.includes("@")) {
    console.error("❌ 유효한 이메일을 입력하세요.");
    process.exit(1);
  }

  const password = await askSecret("비밀번호 (8자 이상): ");

  if (password.length < 8) {
    console.error("❌ 비밀번호는 8자 이상이어야 합니다.");
    process.exit(1);
  }

  const rl2 = createRl();
  const fullName = await ask(rl2, "이름 (성명): ");

  console.log("\n역할 선택:");
  ROLES.forEach((r, i) => {
    const label = ROLE_LABELS[r];
    const marker = r === "admin" ? " ← 기본" : "";
    console.log(`  ${i + 1}. ${r.padEnd(14)} ${label}${marker}`);
  });

  const roleInput = await ask(rl2, "\n번호 또는 역할 이름 입력 [기본: 7=admin]: ");
  rl2.close();

  let role = "admin";
  if (roleInput) {
    const num = parseInt(roleInput, 10);
    if (!isNaN(num) && num >= 1 && num <= ROLES.length) {
      role = ROLES[num - 1];
    } else if (ROLES.includes(roleInput)) {
      role = roleInput;
    } else {
      console.error("❌ 유효하지 않은 역할입니다.");
      process.exit(1);
    }
  }

  console.log(`\n생성 정보:`);
  console.log(`  이메일: ${email}`);
  console.log(`  이름:   ${fullName || "(미입력)"}`);
  console.log(`  역할:   ${role} (${ROLE_LABELS[role]})`);

  // ── 1. Supabase Auth 사용자 생성 ──────────────────────────────────────────
  process.stdout.write("\n계정 생성 중...");

  const { data: authData, error: authError } =
    await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,                   // 이메일 인증 없이 바로 활성화
      user_metadata: { full_name: fullName },
    });

  if (authError) {
    console.error("\n❌ 사용자 생성 실패:", authError.message);
    process.exit(1);
  }

  const userId = authData.user.id;

  // ── 2. profiles 역할 업데이트 ─────────────────────────────────────────────
  const { error: profileError } = await supabase
    .from("profiles")
    .update({ role, full_name: fullName || null })
    .eq("id", userId);

  if (profileError) {
    console.error("\n⚠️  역할 설정 실패:", profileError.message);
    console.log("   사용자는 생성됐으나 역할이 'customer'로 남아있습니다.");
    console.log("   Supabase SQL Editor에서 아래 쿼리를 실행하세요:\n");
    console.log(
      `   UPDATE profiles SET role = '${role}', full_name = '${fullName}' WHERE id = '${userId}';\n`
    );
    process.exit(1);
  }

  console.log(" 완료!\n");
  console.log("✅ 계정이 성공적으로 생성됐습니다.");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`  이메일: ${email}`);
  console.log(`  이름:   ${fullName || "(미입력)"}`);
  console.log(`  역할:   ${role} (${ROLE_LABELS[role]})`);
  console.log(`  UUID:   ${userId}`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("\n로그인 URL: http://localhost:3000/login\n");
}

main().catch((err) => {
  console.error("\n❌ 예상치 못한 오류:", err.message);
  process.exit(1);
});
