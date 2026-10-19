export interface TechIconInfo {
  iconClass: string;
  color?: string;
}

/**
 * Returns the exact authentic Iconify icon class for any technology, framework, database, or skill.
 * Prioritizes official multi-color vector SVGs from @iconify-json/logos and @iconify-json/devicon
 * so colors are naturally embedded without artificial CSS overrides.
 */
export function getTechIcon(name: unknown): TechIconInfo {
  let str = "";
  if (typeof name === "string") {
    str = name;
  } else if (name && typeof name === "object") {
    const obj = name as Record<string, unknown>;
    str = (obj.name as string) || (obj.label as string) || (obj.title as string) || "";
  }
  const normalized = (str || "").toLowerCase().trim();

  // 1. Programming Languages & Runtimes
  if (normalized === "typescript" || normalized === "ts") {
    return { iconClass: "icon-[logos--typescript-icon]" };
  }
  if (normalized === "javascript" || normalized === "js") {
    return { iconClass: "icon-[logos--javascript]" };
  }
  if (normalized === "golang" || normalized === "go") {
    return { iconClass: "icon-[logos--go]" };
  }
  if (normalized === "python" || normalized.startsWith("python")) {
    return { iconClass: "icon-[logos--python]" };
  }
  if (normalized === "php") {
    return { iconClass: "icon-[logos--php]" };
  }
  if (normalized === "dart") {
    return { iconClass: "icon-[logos--dart]" };
  }
  if (
    normalized === "node.js" ||
    normalized === "nodejs" ||
    normalized === "node js" ||
    normalized === "node"
  ) {
    return { iconClass: "icon-[logos--nodejs-icon]" };
  }

  // 2. Frontend Frameworks & Libraries
  if (
    normalized === "react" ||
    normalized === "react.js" ||
    normalized === "react 19" ||
    normalized === "reactjs"
  ) {
    return { iconClass: "icon-[logos--react]" };
  }
  if (
    normalized === "next.js" ||
    normalized === "nextjs" ||
    normalized === "next"
  ) {
    return { iconClass: "icon-[logos--nextjs-icon]" };
  }
  if (
    normalized === "vue" ||
    normalized === "vue.js" ||
    normalized === "vuejs"
  ) {
    return { iconClass: "icon-[logos--vue]" };
  }
  if (
    normalized === "nuxt" ||
    normalized === "nuxt.js" ||
    normalized === "nuxtjs"
  ) {
    return { iconClass: "icon-[logos--nuxt-icon]" };
  }
  if (normalized === "angular") {
    return { iconClass: "icon-[logos--angular-icon]" };
  }
  if (normalized === "astro") {
    return { iconClass: "icon-[logos--astro-icon]" };
  }
  if (normalized === "flutter") {
    return { iconClass: "icon-[logos--flutter]" };
  }
  if (normalized === "react native") {
    return { iconClass: "icon-[devicon--reactnative]" };
  }
  if (
    normalized === "tailwind" ||
    normalized === "tailwind css" ||
    normalized === "tailwindcss"
  ) {
    return { iconClass: "icon-[logos--tailwindcss-icon]" };
  }
  if (normalized === "redux") {
    return { iconClass: "icon-[logos--redux]" };
  }
  if (normalized === "zustand") {
    return { iconClass: "icon-[lucide--layers]" };
  }
  if (normalized.includes("framer motion") || normalized === "framer") {
    return { iconClass: "icon-[logos--framer]" };
  }
  if (normalized.includes("tanstack") || normalized.includes("react-query")) {
    return { iconClass: "icon-[logos--react-query-icon]" };
  }

  // 3. Backend Frameworks & Systems
  if (
    normalized === "express" ||
    normalized === "express.js" ||
    normalized === "expressjs"
  ) {
    return { iconClass: "icon-[skill-icons--expressjs-light]" };
  }
  if (normalized === "laravel") {
    return { iconClass: "icon-[logos--laravel]" };
  }
  if (normalized.includes("laravel breeze") || normalized.includes("laravel sanctum")) {
    return { iconClass: "icon-[logos--laravel]" };
  }
  if (normalized === "codeigniter") {
    return { iconClass: "icon-[logos--codeigniter-icon]" };
  }
  if (normalized === "nestjs" || normalized === "nest.js") {
    return { iconClass: "icon-[logos--nestjs]" };
  }
  if (normalized === "fastapi" || normalized === "fast api") {
    return { iconClass: "icon-[devicon--fastapi]" };
  }
  if (normalized === "django") {
    return { iconClass: "icon-[logos--django-icon]" };
  }
  if (normalized === "filament") {
    return { iconClass: "icon-[logos--laravel]" };
  }

  // 4. Databases & Storage
  if (normalized === "mysql") {
    return { iconClass: "icon-[logos--mysql]" };
  }
  if (
    normalized === "postgresql" ||
    normalized === "postgres" ||
    normalized === "psql"
  ) {
    return { iconClass: "icon-[logos--postgresql]" };
  }
  if (normalized === "mongodb" || normalized === "mongo") {
    return { iconClass: "icon-[logos--mongodb-icon]" };
  }
  if (normalized === "redis") {
    return { iconClass: "icon-[logos--redis]" };
  }
  if (normalized === "firebase" || normalized === "firestore" || normalized === "realtime database") {
    return { iconClass: "icon-[logos--firebase]" };
  }
  if (normalized === "supabase") {
    return { iconClass: "icon-[logos--supabase-icon]" };
  }
  if (normalized === "prisma") {
    return { iconClass: "icon-[logos--prisma]" };
  }
  if (normalized.includes("vector db") || normalized.includes("vector database")) {
    return { iconClass: "icon-[logos--milvus-icon]" };
  }

  // 5. API, Networking & Realtime
  if (normalized === "graphql") {
    return { iconClass: "icon-[logos--graphql]" };
  }
  if (normalized === "restful api" || normalized === "rest api" || normalized === "rest") {
    return { iconClass: "icon-[logos--swagger]" };
  }
  if (normalized.includes("socket.io") || normalized.includes("socket io") || normalized.includes("socker.io")) {
    return { iconClass: "icon-[logos--socket-io]" };
  }
  if (normalized.includes("pusher")) {
    return { iconClass: "icon-[logos--pusher-icon]" };
  }
  if (normalized.includes("rabbitmq")) {
    return { iconClass: "icon-[logos--rabbitmq-icon]" };
  }
  if (normalized.includes("jwt")) {
    return { iconClass: "icon-[logos--jwt-icon]" };
  }
  if (normalized.includes("axios")) {
    return { iconClass: "icon-[logos--axios]" };
  }
  if (normalized.includes("telegram")) {
    return { iconClass: "icon-[logos--telegram]" };
  }
  if (normalized.includes("midtrans")) {
    return { iconClass: "icon-[lucide--credit-card]" };
  }

  // 6. DevOps, Cloud & Architecture
  if (normalized === "docker" || normalized === "docker compose") {
    return { iconClass: "icon-[logos--docker-icon]" };
  }
  if (normalized.includes("ci/cd") || normalized.includes("github actions")) {
    return { iconClass: "icon-[logos--github-actions]" };
  }
  if (normalized.includes("cloudflare")) {
    return { iconClass: "icon-[logos--cloudflare-icon]" };
  }
  if (normalized.includes("cloudinary")) {
    return { iconClass: "icon-[logos--cloudinary-icon]" };
  }
  if (normalized.includes("google maps") || normalized.includes("gmaps")) {
    return { iconClass: "icon-[logos--google-maps]" };
  }
  if (normalized === "git") {
    return { iconClass: "icon-[logos--git-icon]" };
  }
  if (normalized === "postman") {
    return { iconClass: "icon-[logos--postman-icon]" };
  }
  if (normalized === "jira") {
    return { iconClass: "icon-[logos--jira]" };
  }
  if (normalized === "trello") {
    return { iconClass: "icon-[logos--trello]" };
  }
  if (normalized === "n8n") {
    return { iconClass: "icon-[logos--n8n-icon]" };
  }
  if (normalized === "monolithic design") {
    return { iconClass: "icon-[lucide--layers]" };
  }
  if (normalized.includes("microservice")) {
    return { iconClass: "icon-[lucide--boxes]" };
  }
  if (normalized.includes("event-driven")) {
    return { iconClass: "icon-[logos--rabbitmq-icon]" };
  }

  // 7. AI & LLM Engineering
  if (normalized === "langchain") {
    return { iconClass: "icon-[logos--langchain-icon]" };
  }
  if (normalized === "huggingface" || normalized === "hugging face") {
    return { iconClass: "icon-[logos--hugging-face-icon]" };
  }
  if (normalized === "ollama") {
    return { iconClass: "icon-[logos--ollama]" };
  }
  if (normalized.includes("gemini")) {
    return { iconClass: "icon-[logos--google-gemini]" };
  }
  if (normalized.includes("openai") || normalized.includes("chatgpt")) {
    return { iconClass: "icon-[logos--openai-icon]" };
  }
  if (normalized.includes("rag") || normalized.includes("retrieval-augmented")) {
    return { iconClass: "icon-[lucide--sparkles]" };
  }
  if (normalized.includes("qlora") || normalized.includes("fine-tuning") || normalized.includes("fine tuning")) {
    return { iconClass: "icon-[lucide--sliders-horizontal]" };
  }
  if (normalized.includes("prompt engineering")) {
    return { iconClass: "icon-[lucide--terminal]" };
  }
  if (normalized.includes("multi agent") || normalized.includes("agent")) {
    return { iconClass: "icon-[lucide--bot]" };
  }
  if (normalized.includes("react tool calling")) {
    return { iconClass: "icon-[lucide--refresh-cw]" };
  }
  if (normalized.includes("llm") || normalized.includes("ai")) {
    return { iconClass: "icon-[logos--google-gemini]" };
  }

  // 8. General fallbacks
  if (normalized.includes("auth") || normalized.includes("security")) {
    return { iconClass: "icon-[lucide--shield-check]" };
  }
  if (normalized.includes("route") || normalized.includes("api")) {
    return { iconClass: "icon-[lucide--network]" };
  }
  if (normalized.includes("db") || normalized.includes("database")) {
    return { iconClass: "icon-[lucide--database]" };
  }

  return { iconClass: "icon-[lucide--code-2]" };
}
