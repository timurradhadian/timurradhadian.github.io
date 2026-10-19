/**
 * Maps technology names and technical skills to their corresponding Iconify icon classes.
 * Covers languages, frameworks, databases, cloud, DevOps, and developer tools.
 */
export function getTechIcon(name: string): string {
  const normalized = name.toLowerCase().trim();

  // Languages & Core Runtimes
  if (normalized === "typescript" || normalized === "ts") return "icon-[simple-icons--typescript]";
  if (normalized === "javascript" || normalized === "js") return "icon-[simple-icons--javascript]";
  if (normalized === "golang" || normalized === "go") return "icon-[simple-icons--go]";
  if (normalized === "python" || normalized.startsWith("python")) return "icon-[simple-icons--python]";
  if (normalized === "php") return "icon-[simple-icons--php]";
  if (normalized === "dart") return "icon-[simple-icons--dart]";
  if (normalized === "node.js" || normalized === "nodejs" || normalized === "node js" || normalized === "node") return "icon-[simple-icons--nodedotjs]";

  // Frontend Frameworks & Libraries
  if (normalized === "react" || normalized === "react.js" || normalized === "react 19" || normalized === "reactjs") return "icon-[simple-icons--react]";
  if (normalized === "next.js" || normalized === "nextjs" || normalized === "next") return "icon-[simple-icons--nextdotjs]";
  if (normalized === "vue" || normalized === "vue.js" || normalized === "vuejs") return "icon-[simple-icons--vuedotjs]";
  if (normalized === "nuxt" || normalized === "nuxt.js" || normalized === "nuxtjs") return "icon-[simple-icons--nuxt]";
  if (normalized === "angular") return "icon-[simple-icons--angular]";
  if (normalized === "astro") return "icon-[simple-icons--astro]";
  if (normalized === "flutter") return "icon-[simple-icons--flutter]";
  if (normalized === "react native") return "icon-[simple-icons--react]";
  if (normalized === "tailwind" || normalized === "tailwind css" || normalized === "tailwindcss") return "icon-[simple-icons--tailwindcss]";
  if (normalized.includes("framer motion") || normalized === "framer") return "icon-[simple-icons--framer]";

  // Backend Frameworks & Systems
  if (normalized === "express" || normalized === "express.js" || normalized === "expressjs") return "icon-[simple-icons--express]";
  if (normalized === "laravel") return "icon-[simple-icons--laravel]";
  if (normalized === "codeigniter") return "icon-[simple-icons--codeigniter]";
  if (normalized === "graphql") return "icon-[simple-icons--graphql]";
  if (normalized === "prisma") return "icon-[simple-icons--prisma]";
  if (normalized === "jwt" || normalized.includes("json web token")) return "icon-[simple-icons--jsonwebtokens]";
  if (normalized === "axios") return "icon-[simple-icons--axios]";
  if (normalized.includes("socket io") || normalized.includes("socket.io")) return "icon-[simple-icons--socketdotio]";
  if (normalized.includes("pusher")) return "icon-[simple-icons--pusher]";
  if (normalized.includes("telegram")) return "icon-[simple-icons--telegram]";
  if (normalized.includes("rabbitmq")) return "icon-[simple-icons--rabbitmq]";
  if (normalized.includes("kafka")) return "icon-[simple-icons--apachekafka]";

  // Databases & Caches
  if (normalized === "postgresql" || normalized === "postgres") return "icon-[simple-icons--postgresql]";
  if (normalized === "mysql") return "icon-[simple-icons--mysql]";
  if (normalized === "mongodb" || normalized === "mongo") return "icon-[simple-icons--mongodb]";
  if (normalized === "redis") return "icon-[simple-icons--redis]";
  if (normalized.includes("vector db") || normalized.includes("vector")) return "icon-[lucide--database]";
  if (normalized.includes("database")) return "icon-[lucide--database]";

  // AI & ML
  if (normalized.includes("gemini") || normalized.includes("google gemini")) return "icon-[simple-icons--googlegemini]";
  if (normalized.includes("langchain")) return "icon-[simple-icons--langchain]";
  if (normalized.includes("huggingface") || normalized.includes("hugging face")) return "icon-[simple-icons--huggingface]";
  if (normalized.includes("ollama")) return "icon-[simple-icons--ollama]";
  if (normalized.includes("rag") || normalized.includes("retrieval")) return "icon-[lucide--brain-circuit]";
  if (normalized.includes("qlora") || normalized.includes("fine-tuning")) return "icon-[lucide--cpu]";
  if (normalized.includes("prompt")) return "icon-[lucide--sparkles]";

  // Cloud & DevOps & Tooling
  if (normalized === "docker" || normalized === "docker compose") return "icon-[simple-icons--docker]";
  if (normalized === "git") return "icon-[simple-icons--git]";
  if (normalized.includes("github") || normalized.includes("github actions")) return "icon-[simple-icons--github]";
  if (normalized.includes("ci/cd") || normalized.includes("workflow")) return "icon-[lucide--workflow]";
  if (normalized.includes("firebase")) return "icon-[simple-icons--firebase]";
  if (normalized.includes("postman")) return "icon-[simple-icons--postman]";
  if (normalized.includes("jira")) return "icon-[simple-icons--jira]";
  if (normalized.includes("trello")) return "icon-[simple-icons--trello]";
  if (normalized.includes("cloudflare")) return "icon-[simple-icons--cloudflare]";
  if (normalized.includes("linux")) return "icon-[simple-icons--linux]";
  if (normalized.includes("midtrans")) return "icon-[lucide--credit-card]";

  // Architecture concepts
  if (normalized.includes("microservice")) return "icon-[lucide--boxes]";
  if (normalized.includes("monolith")) return "icon-[lucide--box]";
  if (normalized.includes("event-driven")) return "icon-[lucide--zap]";
  if (normalized.includes("rest") || normalized.includes("api")) return "icon-[lucide--network]";
  if (normalized.includes("accessibility") || normalized.includes("wcag")) return "icon-[lucide--accessibility]";

  // Fallback
  return "icon-[lucide--code-2]";
}
