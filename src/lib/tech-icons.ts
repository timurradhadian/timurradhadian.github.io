export interface TechIconInfo {
  iconClass: string;
  color: string;
}

/**
 * Returns the exact Iconify icon class and official brand color for any technology or skill.
 * Ensures 100% of skills and tech stacks across Glio & SejatiDimedia have accurate, vibrant icons.
 */
export function getTechIcon(name: string): TechIconInfo {
  const normalized = name.toLowerCase().trim();

  // Languages & Core Runtimes
  if (normalized === "typescript" || normalized === "ts") {
    return { iconClass: "icon-[simple-icons--typescript]", color: "#3178C6" };
  }
  if (normalized === "javascript" || normalized === "js") {
    return { iconClass: "icon-[simple-icons--javascript]", color: "#EAB308" };
  }
  if (normalized === "golang" || normalized === "go") {
    return { iconClass: "icon-[simple-icons--go]", color: "#00ADD8" };
  }
  if (normalized === "python" || normalized.startsWith("python")) {
    return { iconClass: "icon-[simple-icons--python]", color: "#3776AB" };
  }
  if (normalized === "php") {
    return { iconClass: "icon-[simple-icons--php]", color: "#777BB4" };
  }
  if (normalized === "dart") {
    return { iconClass: "icon-[simple-icons--dart]", color: "#0175C2" };
  }
  if (
    normalized === "node.js" ||
    normalized === "nodejs" ||
    normalized === "node js" ||
    normalized === "node"
  ) {
    return { iconClass: "icon-[simple-icons--nodedotjs]", color: "#5FA04E" };
  }

  // Frontend Frameworks & Libraries
  if (
    normalized === "react" ||
    normalized === "react.js" ||
    normalized === "react 19" ||
    normalized === "reactjs"
  ) {
    return { iconClass: "icon-[simple-icons--react]", color: "#087EA4" };
  }
  if (
    normalized === "next.js" ||
    normalized === "nextjs" ||
    normalized === "next"
  ) {
    return { iconClass: "icon-[simple-icons--nextdotjs]", color: "#000000" };
  }
  if (
    normalized === "vue" ||
    normalized === "vue.js" ||
    normalized === "vuejs"
  ) {
    return { iconClass: "icon-[simple-icons--vuedotjs]", color: "#4FC08D" };
  }
  if (
    normalized === "nuxt" ||
    normalized === "nuxt.js" ||
    normalized === "nuxtjs"
  ) {
    return { iconClass: "icon-[simple-icons--nuxt]", color: "#00DC82" };
  }
  if (normalized === "angular") {
    return { iconClass: "icon-[simple-icons--angular]", color: "#DD0031" };
  }
  if (normalized === "astro") {
    return { iconClass: "icon-[simple-icons--astro]", color: "#BC52EE" };
  }
  if (normalized === "flutter") {
    return { iconClass: "icon-[simple-icons--flutter]", color: "#02569B" };
  }
  if (normalized === "react native") {
    return { iconClass: "icon-[simple-icons--react]", color: "#61DAFB" };
  }
  if (
    normalized === "tailwind" ||
    normalized === "tailwind css" ||
    normalized === "tailwindcss"
  ) {
    return { iconClass: "icon-[simple-icons--tailwindcss]", color: "#06B6D4" };
  }
  if (normalized === "redux") {
    return { iconClass: "icon-[simple-icons--redux]", color: "#764ABC" };
  }
  if (normalized.includes("framer motion") || normalized === "framer") {
    return { iconClass: "icon-[simple-icons--framer]", color: "#0055FF" };
  }

  // Backend Frameworks & Systems
  if (
    normalized === "express" ||
    normalized === "express.js" ||
    normalized === "expressjs"
  ) {
    return { iconClass: "icon-[simple-icons--express]", color: "#000000" };
  }
  if (normalized === "laravel") {
    return { iconClass: "icon-[simple-icons--laravel]", color: "#FF2D20" };
  }
  if (normalized === "codeigniter") {
    return { iconClass: "icon-[simple-icons--codeigniter]", color: "#EE4326" };
  }
  if (normalized === "graphql") {
    return { iconClass: "icon-[simple-icons--graphql]", color: "#E10098" };
  }
  if (normalized === "prisma") {
    return { iconClass: "icon-[simple-icons--prisma]", color: "#2D3748" };
  }
  if (normalized === "jwt" || normalized.includes("json webtokens")) {
    return { iconClass: "icon-[simple-icons--jsonwebtokens]", color: "#000000" };
  }
  if (normalized === "axios") {
    return { iconClass: "icon-[simple-icons--axios]", color: "#5A29E4" };
  }
  if (normalized.includes("socket io") || normalized.includes("socket.io")) {
    return { iconClass: "icon-[simple-icons--socketdotio]", color: "#010101" };
  }
  if (normalized.includes("pusher")) {
    return { iconClass: "icon-[simple-icons--pusher]", color: "#300D4F" };
  }
  if (normalized.includes("telegram")) {
    return { iconClass: "icon-[simple-icons--telegram]", color: "#26A5E4" };
  }
  if (normalized.includes("rabbitmq")) {
    return { iconClass: "icon-[simple-icons--rabbitmq]", color: "#FF6600" };
  }
  if (normalized.includes("kafka")) {
    return { iconClass: "icon-[simple-icons--apachekafka]", color: "#231F20" };
  }

  // Databases & Storage
  if (normalized === "postgresql" || normalized === "postgres") {
    return { iconClass: "icon-[simple-icons--postgresql]", color: "#4169E1" };
  }
  if (normalized === "mysql") {
    return { iconClass: "icon-[simple-icons--mysql]", color: "#4479A1" };
  }
  if (normalized === "mongodb" || normalized === "mongo") {
    return { iconClass: "icon-[simple-icons--mongodb]", color: "#47A248" };
  }
  if (normalized === "redis") {
    return { iconClass: "icon-[simple-icons--redis]", color: "#DC382D" };
  }
  if (normalized.includes("vector db") || normalized.includes("vector")) {
    return { iconClass: "icon-[lucide--database]", color: "#6366F1" };
  }
  if (normalized.includes("database")) {
    return { iconClass: "icon-[lucide--database]", color: "#4F46E5" };
  }

  // AI & ML
  if (normalized.includes("gemini") || normalized.includes("google gemini")) {
    return { iconClass: "icon-[simple-icons--googlegemini]", color: "#8E75FF" };
  }
  if (normalized.includes("langchain")) {
    return { iconClass: "icon-[simple-icons--langchain]", color: "#1C3C3C" };
  }
  if (normalized.includes("huggingface") || normalized.includes("hugging face")) {
    return { iconClass: "icon-[simple-icons--huggingface]", color: "#FFD21E" };
  }
  if (normalized.includes("ollama")) {
    return { iconClass: "icon-[simple-icons--ollama]", color: "#18181B" };
  }
  if (normalized.includes("rag") || normalized.includes("retrieval")) {
    return { iconClass: "icon-[lucide--brain-circuit]", color: "#8B5CF6" };
  }
  if (normalized.includes("qlora") || normalized.includes("fine-tuning")) {
    return { iconClass: "icon-[lucide--cpu]", color: "#EC4899" };
  }
  if (normalized.includes("prompt")) {
    return { iconClass: "icon-[lucide--sparkles]", color: "#F59E0B" };
  }

  // Cloud & DevOps & Tooling
  if (normalized === "docker" || normalized === "docker compose") {
    return { iconClass: "icon-[simple-icons--docker]", color: "#2496ED" };
  }
  if (normalized === "git") {
    return { iconClass: "icon-[simple-icons--git]", color: "#F05032" };
  }
  if (normalized.includes("github") || normalized.includes("github actions")) {
    return { iconClass: "icon-[simple-icons--github]", color: "#181717" };
  }
  if (normalized.includes("ci/cd") || normalized.includes("workflow")) {
    return { iconClass: "icon-[lucide--workflow]", color: "#10B981" };
  }
  if (normalized.includes("firebase")) {
    return { iconClass: "icon-[simple-icons--firebase]", color: "#FFCA28" };
  }
  if (normalized.includes("postman")) {
    return { iconClass: "icon-[simple-icons--postman]", color: "#FF6C37" };
  }
  if (normalized.includes("jira")) {
    return { iconClass: "icon-[simple-icons--jira]", color: "#0052CC" };
  }
  if (normalized.includes("trello")) {
    return { iconClass: "icon-[simple-icons--trello]", color: "#0052CC" };
  }
  if (normalized.includes("cloudflare")) {
    return { iconClass: "icon-[simple-icons--cloudflare]", color: "#F38020" };
  }
  if (normalized.includes("linux")) {
    return { iconClass: "icon-[simple-icons--linux]", color: "#FCC624" };
  }
  if (normalized.includes("midtrans")) {
    return { iconClass: "icon-[lucide--credit-card]", color: "#002B49" };
  }

  // Architecture concepts
  if (normalized.includes("microservice")) {
    return { iconClass: "icon-[lucide--boxes]", color: "#0284C7" };
  }
  if (normalized.includes("monolith")) {
    return { iconClass: "icon-[lucide--box]", color: "#4F46E5" };
  }
  if (normalized.includes("event-driven")) {
    return { iconClass: "icon-[lucide--zap]", color: "#D97706" };
  }
  if (normalized.includes("rest") || normalized.includes("api")) {
    return { iconClass: "icon-[lucide--network]", color: "#0D9488" };
  }
  if (normalized.includes("accessibility") || normalized.includes("wcag")) {
    return { iconClass: "icon-[lucide--accessibility]", color: "#2563EB" };
  }

  // Fallback
  return { iconClass: "icon-[lucide--code-2]", color: "#475569" };
}
