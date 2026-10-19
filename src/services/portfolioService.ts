/**
 * Service to fetch comprehensive project details from Glio CMS API.
 * Supports both client-side and build-time environments.
 */

const GLIO_BASE_URL = (
  process.env.NEXT_PUBLIC_GLIO_API_URL ||
  process.env.GLIO_API_URL ||
  "https://glio.vercel.app/api/public"
)
  .trim()
  .replace(/\/+$/, "");

const GLIO_URL = GLIO_BASE_URL.endsWith("/api/public")
  ? GLIO_BASE_URL
  : `${GLIO_BASE_URL}/api/public`;

const GLIO_KEY =
  process.env.NEXT_PUBLIC_GLIO_API_KEY ||
  process.env.GLIO_API_KEY ||
  "GlioAgencySecretKey_SejatiDimedia_2026_xYz987!";

const NDA_SLUGS = [
  "wood-tracebility-system-industry-manufaktur",
  "digitalisasi-sistem-bongkar-muat-material-logistik-kayu-industry-manufaktur",
  "warehouse-management-system-industry-manufaktur",
  "digitalisasi-import-monitoring-system-industry-manufaktur",
  "digitalisasi-sistem-surat-jalan-industry-manufaktur",
  "erp-digitalisasi-produksi-industry-manufaktur",
  "report--dashboard-industry-manufaktur",
];

export async function getProjectDetailFromGlio(slug: string) {
  try {
    const res = await fetch(`${GLIO_URL}/projects/${slug}`, {
      headers: {
        "x-api-key": GLIO_KEY,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(`Error: ${res.status} ${res.statusText}`);
    }

    const project = await res.json();

    // Strict NDA censorship enforcement:
    // If the project is identified under NDA / proprietary manufacturing,
    // sensitive documentation, internal URLs, screenshots, and proprietary code must be redacted.
    const isNda =
      NDA_SLUGS.includes(slug) ||
      Boolean(project.isNda) ||
      slug.includes("industry-manufaktur");

    if (isNda) {
      return {
        ...project,
        isNda: true,
        isProfessional: true,
        documents: project.documents || [],
        links: [],
        clientSummary: project.clientSummary,
        clientSummaryId: project.clientSummaryId,
        clientSummaryEn: project.clientSummaryEn,
        projectUrl: "",
        githubUrl: "",
        description:
          project.description ||
          "### Arsitektur Sistem Internal [DATA DISENSOR DI BAWAH NDA]\n\nImplementasi modul proprietary meliputi integrasi pipeline sensor data real-time, sinkronisasi inventaris multi-gudang, dan enkripsi payload transmisi telemetry pabrik. Dokumentasi detail teknis, skema database relasional, dan source code repositori internal dilindungi oleh Non-Disclosure Agreement (NDA).",
      };
    }

    return project;
  } catch (error) {
    console.error(`Gagal mengambil detail project ${slug} dari Glio:`, error);
    return null;
  }
}
