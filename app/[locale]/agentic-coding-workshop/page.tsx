import type { Metadata } from "next";
import Footer from "@/app/components/footer";
import { FadeInSection } from "@/app/components/fade-in-section";
import { AnimatedTitle } from "@/app/components/animated-title";
import { TransitionLink } from "@/app/components/transition-link";
import { getDictionary } from "../dictionaries";
import { i18n, isAppLocale, type AppLocale } from "@/i18n.config";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  AddTeamIcon,
  Analytics02Icon,
  BookEditIcon,
  Books01Icon,
  BubbleChatAddIcon,
  CheckListIcon,
  ClipboardIcon,
  CodeCircleIcon,
  CommandLineIcon,
  ComputerTerminal01Icon,
  CompassIcon,
  CursorPointer01Icon,
  DocumentValidationIcon,
  Download01Icon,
  Flag03Icon,
  FlashIcon,
  FolderLibraryIcon,
  GalaxyIcon,
  GraduationScrollIcon,
  Layers02Icon,
  LibraryIcon,
  RepeatIcon,
  Robot01Icon,
  Rocket01Icon,
  Shield01Icon,
  SparklesIcon,
  Structure01Icon,
  Target02Icon,
  Task01Icon,
  TickDouble02Icon,
  ToolsIcon,
  UserGroupIcon,
  Wallet01Icon,
  WebDesign01Icon,
  WorkHistoryIcon,
  AlertSquareIcon,
  Brain01Icon,
  Wrench01Icon,
  Video01Icon,
  BulbIcon,
} from "@hugeicons/core-free-icons";

const NAV_ITEMS = [
  { label: "Resumen", href: "#overview" },
  { label: "Problema", href: "#problema" },
  { label: "Solución", href: "#solucion" },
  { label: "Agentes", href: "#agentes" },
  { label: "Planning", href: "#planning" },
  { label: "Development", href: "#development" },
  { label: "Recursos", href: "#recursos" },
];

type IconDefinition = typeof Analytics02Icon;

interface ProblemCard {
  icon: IconDefinition;
  title: string;
  description: string;
  highlight: string;
  details: string[];
  sourceLabel: string;
  sourceHref: string;
}

const CALLOUT_STYLES = {
  info: "border-sky-200 bg-sky-50 text-sky-900",
  success: "border-emerald-200 bg-emerald-50 text-emerald-900",
  warning: "border-amber-200 bg-amber-50 text-amber-900",
  accent:
    "border-[var(--color-accent-primary)]/30 bg-[var(--color-accent-secondary)]/20 text-[var(--color-accent-primary)]",
};

type CalloutVariant = keyof typeof CALLOUT_STYLES;

type PlanningStep = {
  number: string;
  title: string;
  summary: string;
  bullets: string[];
  commands: string[];
  callout?: {
    variant: CalloutVariant;
    title: string;
    text: string;
  };
  icon: IconDefinition;
};

type DevelopmentStep = {
  number: string;
  title: string;
  summary: string;
  bullets: string[];
  commands: string[];
  callouts?: Array<{
    variant: CalloutVariant;
    title: string;
    text: string;
  }>;
  icon: IconDefinition;
};

const PROBLEM_CARDS: ProblemCard[] = [
  {
    icon: AlertSquareIcon,
    title: "Degradación con contexto largo",
    description:
      "El benchmark LoCoDiff (enero 2025) muestra que incluso el mejor modelo disponible, Sonnet 4.5, degrada significativamente con contextos largos.",
    highlight:
      "El resultado: de 96 % de precisión con contextos de 2 K–21 K tokens a 64 % con más de 60 K tokens. Cuando le das todo tu codebase al modelo, se ahoga en información.",
    details: [
      "Los modelos de punta siguen dependiendo de ventanas de contexto manejables para mantener la precisión.",
      "Darles archivos completos o repositorios enteros produce ruido, repeticiones y decisiones inconsistentes.",
    ],
    sourceLabel: "LoCoDiff Benchmark",
    sourceHref: "https://abanteai.github.io/LoCoDiff-bench/",
  },
  {
    icon: Brain01Icon,
    title: "Sin memoria a largo plazo",
    description:
      "Un estudio de METR (julio 2025) demostró que developers expertos con 2+ años de experiencia en sus propios proyectos fueron 20 % más lentos usando AI que trabajando solos.",
    highlight:
      "¿Por qué? El LLM arranca de cero cada vez: no tiene el contexto tácito que las personas acumulan. Los expertos predijeron que serían 39 % más rápidos, pero la realidad fue lo opuesto.",
    details: [
      "Tiempo observado por story: 1.67 h sin AI vs 2.26 h con AI asistida.",
      "Predicciones previas esperaban reducciones de 24 %–39 %, exponiendo la brecha entre expectativas y realidad.",
    ],
    sourceLabel: "METR AI R&D Study (July 2025)",
    sourceHref:
      "https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/",
  },
];

interface SolutionCard {
  icon: IconDefinition;
  title: string;
  description: string;
  outcome: string;
}

const SOLUTION_CARDS: SolutionCard[] = [
  {
    icon: Layers02Icon,
    title: "Sharding",
    description:
      "Documentos grandes se dividen en fragmentos pequeños y enfocados. En vez de darle al Developer un PRD de 10 000 tokens, recibe un shard de 400–600 tokens con lo esencial para la story.",
    outcome:
      "Resultado: cada agente opera en la zona de 96 % de precisión (<5 K tokens) sin ruido adicional.",
  },
  {
    icon: AddTeamIcon,
    title: "Agentes especializados",
    description:
      "Ocho agentes con roles concretos: Product Manager, Architect, Developer, QA, etc. Cada uno tiene instrucciones y checklist propios, y consulta solamente el contexto que necesita.",
    outcome:
      "Resultado: contexto quirúrgicamente preciso para cada decisión, sin sobrecargar al modelo.",
  },
  {
    icon: DocumentValidationIcon,
    title: "Documentación estructurada",
    description:
      "Planning riguroso antes de codear: PRD completo, arquitectura definida y stories secuenciales que se validan entre sí. Eso crea la “memoria” que los LLMs no tienen.",
    outcome:
      "Resultado: los agentes trabajan con información profesional y verificable, siempre alineada con el objetivo del proyecto.",
  },
];

const BMAD_REASON_POINTS = [
  {
    title: "1. Contexto optimizado",
    description:
      "En el estudio METR los equipos trabajaron con codebases enormes en Cursor y terminaron 20 % más lentos. BMAD hace lo contrario: el PM trabaja con 2 K tokens de requirements, Arquitectura con ~3 K tokens y el Developer con un único epic (1.5 K tokens). Precisión alta, sin degradación.",
  },
  {
    title: "2. Validaciones y transparencia",
    description:
      "El Product Owner valida cada story draft antes de pasar a desarrollo, el QA revisa el trabajo del Developer y el equipo humano aprueba cada hito. Los artefactos son legibles por humanos y quedan versionados en el repo.",
  },
  {
    title: "3. Elicitación avanzada",
    description:
      "Los agentes hacen preguntas y completan documentación iterativamente. No es solo generar código: descubren, clarifican y actualizan requirements manteniendo a la persona en el loop.",
  },
];

const COMMAND_SYNTAX_BLOCKS = [
  {
    heading: "Claude Code / OpenCode",
    commands: [
      "/pm *create-prd here's some rough notes @notes.md",
      "/architect *create-full-stack-architecture @prd.md",
      "/dev *develop-story @docs/stories/1.1.md",
    ],
  },
  {
    heading: "Cursor / Windsurf",
    commands: [
      "@PM Create PRD, here's some notes @notes.md",
      "@architect Design the system architecture, here's the @prd.md",
      "@dev *develop @docs/stories/1.1.md",
    ],
  },
];

const COMMAND_SWITCH_STEPS = [
  "Limpia el contexto con /clear (Claude Code) o /new (OpenCode).",
  "Invocá el agente con su comando de inicialización (ej: /po *shard-doc).",
  "Pasale únicamente los archivos relevantes usando @filename.md.",
];

const PLANNING_STEPS: PlanningStep[] = [
  {
    number: "1",
    title: "PM: PRD Creation",
    summary:
      "El Product Manager crea el Product Requirements Document guiando al usuario sección por sección.",
    bullets: [
      "Proceso interactivo: el PM hace preguntas y captura respuestas a medida que avanza.",
      "Define features y epics (solo títulos de stories en esta fase).",
      "Detalla requirements funcionales y no funcionales.",
      "Prioriza MVP vs roadmap y captura dependencias clave.",
      "Cada sección se revisa y aprueba antes de continuar.",
    ],
    commands: ["/pm *create-prd"],
    callout: {
      variant: "info",
      title: "Nota importante",
      text: "Las stories en el PRD son breves (solo títulos). Más adelante el Scrum Master las expandirá con tareas detalladas.",
    },
    icon: Task01Icon,
  },
  {
    number: "2",
    title: "Architect: System Design",
    summary:
      "El Architect lee el PRD y diseña la arquitectura técnica completa, siempre de forma interactiva.",
    bullets: [
      "Selecciona tech stack para frontend, backend y base de datos.",
      "Define la estructura de carpetas y organización del código.",
      "Diseña APIs y contratos entre componentes.",
      "Cubre escalabilidad, seguridad, observabilidad y performance.",
      "Cada sección se valida con el usuario antes de avanzar.",
    ],
    commands: ["/architect *create-full-stack-architecture"],
    icon: Structure01Icon,
  },
  {
    number: "3",
    title: "PO: Master Checklist",
    summary:
      "El Product Owner valida que PRD y arquitectura estén perfectamente alineados antes de sharding.",
    bullets: [
      "Verifica coherencia entre requirements y diseño técnico.",
      "Confirma que la arquitectura permite implementar todos los features priorizados.",
      "Identifica gaps, contradicciones o riesgos que deben resolverse antes de continuar.",
    ],
    commands: ["/po *execute-checklist-po"],
    callout: {
      variant: "warning",
      title: "Si algo no cierra",
      text: "Se refinan los documentos hasta que todo tenga sentido. No se pasa a la siguiente fase sin validación completa.",
    },
    icon: CheckListIcon,
  },
  {
    number: "4",
    title: "PO: Sharding",
    summary:
      "El Product Owner ejecuta el sharding de PRD y Arquitectura en epics y stories manejables (<2 K tokens).",
    bullets: [
      "Corre el programa de terminal que divide automáticamente los documentos.",
      "Genera shards pequeños ubicados en docs/epics y docs/stories.",
      "Cada archivo contiene contexto enfocado y se guarda como Markdown versionable.",
      "Ejemplo: un PRD grande se transforma en docs/epics/epic-1-auth.md, docs/epics/epic-2-dashboard.md, etc.",
    ],
    commands: [
      "/po *shard-doc docs/prd.md",
      "/po *shard-doc docs/architecture.md",
    ],
    callout: {
      variant: "success",
      title: "Resultado",
      text: "Backlog priorizado, con stories shardeadas y listas para desarrollo iterativo.",
    },
    icon: Layers02Icon,
  },
];

const PLANNING_OPTIONAL_AGENTS = [
  "Business Analyst: investigaciones greenfield y project brief inicial.",
  "UX Expert: specs de interfaz y prompts para herramientas como v0 o Lovable.",
  "QA: perfila riesgos y criterios de calidad antes de empezar el desarrollo.",
];

const PLANNING_SUMMARY_POINTS = [
  "PRD completo y validado.",
  "Arquitectura definida y alineada con el PRD.",
  "Backlog de stories shardeadas y priorizadas.",
  "Contexto estructurado y versionado para todo el equipo.",
];

const DEVELOPMENT_STEPS: DevelopmentStep[] = [
  {
    number: "1",
    title: "SM: Review previous notes",
    summary:
      "El Scrum Master repasa las notas de la story anterior para arrancar con aprendizaje acumulado.",
    bullets: [
      "Identifica qué funcionó y qué no funcionó.",
      "Recupera decisiones técnicas importantes.",
      "Revisa feedback del Developer y del QA.",
      "Documenta aprendizajes para aplicar en la próxima story.",
    ],
    commands: ["/sm *review-notes @docs/stories/1.0.md"],
    callouts: [
      {
        variant: "accent",
        title: "Loop de aprendizaje",
        text: "Las notas de hoy alimentan el draft de mañana. El equipo mejora story tras story.",
      },
    ],
    icon: WorkHistoryIcon,
  },
  {
    number: "2",
    title: "SM: Draft next story",
    summary:
      "El Scrum Master arma el draft de la próxima story usando únicamente el contexto relevante.",
    bullets: [
      "Lee solo el epic correspondiente (no todo el PRD).",
      "Revisa la arquitectura y el PRD en la medida justa.",
      "Genera tareas secuenciales muy claras.",
      "Define criterios de aceptación específicos.",
      "Incluye suficiente contexto sin ahogar al modelo.",
    ],
    commands: ["/sm *draft story 1.1"],
    icon: BookEditIcon,
  },
  {
    number: "3",
    title: "PO: Validate story draft",
    summary:
      "El Product Owner valida el draft con el PRD para asegurar coherencia antes de codear.",
    bullets: [
      "Chequea que el draft coincida con los objetivos originales.",
      "Confirma que todos los requirements estén cubiertos.",
      "Señala gaps o contradicciones para corrección inmediata.",
      "Puede aportar recomendaciones al Scrum Master.",
    ],
    commands: ["/po *validate story @docs/stories/1.1.md"],
    callouts: [
      {
        variant: "success",
        title: "Check de alineación",
        text: "Garantiza que el Developer implemente exactamente lo acordado en planning.",
      },
    ],
    icon: CheckListIcon,
  },
  {
    number: "4",
    title: "Dev: Implementation",
    summary:
      "El Developer implementa la story completa siguiendo arquitectura, UX y checklist de pruebas.",
    bullets: [
      "Produce código de producción alineado con la arquitectura.",
      "Escribe tests unitarios, de integración y E2E según corresponda.",
      "Cubre manejo de errores y edge cases.",
      "Puede invocar MCPs como Playwright para automatizar pruebas end-to-end.",
    ],
    commands: ["/dev *develop-story @docs/stories/1.1.md"],
    icon: CodeCircleIcon,
  },
  {
    number: "5",
    title: "QA: Test story thoroughly",
    summary:
      "El QA ejerce el rol de gatekeeper de calidad antes de que la story avance.",
    bullets: [
      "Ejecuta todos los tests (unitarios, integración, E2E).",
      "Realiza testing manual sobre user flows y edge cases.",
      "Verifica que se cumplan los criterios de aceptación.",
      "Perfila riesgos (seguridad, performance, fiabilidad).",
      "Emite veredicto: PASS (todo ok) / CONCERNS (revisar) / FAIL (crítico) / WAIVED (aceptado explícitamente).",
    ],
    commands: ["/qa *review @docs/stories/1.1.md"],
    callouts: [
      {
        variant: "accent",
        title: "Quality gates",
        text: "PASS (todo ok) • CONCERNS (señales leves) • FAIL (problema crítico) • WAIVED (riesgo aceptado explícitamente).",
      },
      {
        variant: "success",
        title: "Check crítico",
        text: "El QA asegura que el código funciona y cumple estándares profesionales antes de pasar a producción.",
      },
    ],
    icon: Shield01Icon,
  },
  {
    number: "6",
    title: "Dev: Fix according to QA review",
    summary:
      "El Developer corrige según el reporte del QA y deja todo en estado PASS.",
    bullets: [
      "Revisa el resultado del QA (PASS/CONCERNS/FAIL).",
      "Implementa fixes y mejoras puntuales.",
      "Resuelve cada CONCERN y FAIL registrado.",
      "Reejecuta los tests para confirmar que nada se rompe.",
    ],
    commands: ["/dev Fix the issues from QA review @docs/stories/1.1.md"],
    callouts: [
      {
        variant: "warning",
        title: "Iterativo",
        text: "Si el QA emitió FAIL, se repite la revisión hasta obtener PASS o WAIVED.",
      },
    ],
    icon: Wrench01Icon,
  },
  {
    number: "7",
    title: "Mark done & next story",
    summary:
      "Se cierra la story y el equipo vuelve al paso 1 con la siguiente prioridad.",
    bullets: [
      "Actualiza el backlog marcando la story como done.",
      "Elige la siguiente story del backlog priorizado.",
      "Vuelve al paso 1: el SM revisa las notas recién escritas.",
    ],
    commands: [],
    callouts: [
      {
        variant: "accent",
        title: "Loop iterativo",
        text: "Story por story, commit por commit, hasta completar el proyecto.",
      },
    ],
    icon: RepeatIcon,
  },
];

const DEVELOPMENT_NOTES = [
  "Validaciones integradas: PO valida antes de codear, QA testea después, Developer corrige y documenta.",
  "Flexibilidad de calidad: podés aceptar CONCERNS en un MVP o exigir PASS en software crítico.",
  "Loop de aprendizaje continuo: las notas del Developer alimentan al SM en la siguiente iteración.",
];

const DEVELOPMENT_SUMMARY_POINTS = [
  "Siempre tenés una versión funcional y testeada después de cada story.",
  "Podés pivotar rápido: cada ciclo entrega valor independiente.",
  "El aprendizaje se acumula con notas y retrospectivas cortas.",
  "La persona sigue en control: aprueba cada transición clave.",
];

interface ToolOption {
  icon: IconDefinition;
  title: string;
  highlight: string;
  bullets: string[];
  note?: string;
}

const TOOL_OPTIONS: ToolOption[] = [
  {
    icon: SparklesIcon,
    title: "Claude Code",
    highlight:
      "Mejor opción: herramienta oficial de Anthropic con Sonnet 4.5 (top del benchmark).",
    bullets: ["Máxima calidad", "Integración perfecta", "$100/mes (Max Plan)"],
  },
  {
    icon: ComputerTerminal01Icon,
    title: "OpenCode",
    highlight: "Más versátil: te logueás con tu proveedor y usa ese plan.",
    bullets: [
      "Login con Anthropic, GitHub Copilot, Z.ai, etc.",
      "Usa el plan de tu proveedor",
      "Open source y multi-modelo",
    ],
    note: "Requiere workaround (ver más abajo).",
  },
  {
    icon: CursorPointer01Icon,
    title: "Cursor / Windsurf",
    highlight: "IDEs populares que soportan BMAD con sintaxis @mention.",
    bullets: ["Editores completos", "Comunidad grande", "Sintaxis @agent"],
  },
  {
    icon: GalaxyIcon,
    title: "Gemini CLI",
    highlight: "Gratis: Gemini 2.5 Pro con soporte oficial BMAD.",
    bullets: [
      "Gemini 2.5 Pro",
      "Uso gratuito incluido",
      "Soporte oficial BMAD",
    ],
  },
  {
    icon: Robot01Icon,
    title: "Droid CLI",
    highlight: "Gratis: GPT-5-Codex a través de Factory AI.",
    bullets: ["GPT-5-Codex model", "100 % gratis", "Factory AI platform"],
    note: "Requiere workaround (ver más abajo).",
  },
];

const QUICK_START = {
  title: "Workshop Repo — empezá ahora",
  description:
    "Repositorio listo con BMAD preinstalado, scripts de setup y MCPs configurados.",
  bullets: [
    "BMAD pre-instalado y configurado",
    "Script de setup para Droid CLI (gratis)",
    "MCPs incluidos (Sequential Thinking, Playwright)",
    "Comandos BMAD listos para usar",
    "Workflows de ejemplo",
  ],
  link: {
    label: "github.com/baisharg/Workshop-Vibe-Coding",
    href: "https://github.com/baisharg/Workshop-Vibe-Coding",
  },
  commands: [
    "git clone https://github.com/baisharg/Workshop-Vibe-Coding",
    "cd Workshop-Vibe-Coding",
    "./setup.sh",
  ],
  note: "El script instala Droid CLI (gratis, GPT-5-Codex) y configura todos los comandos BMAD automáticamente.",
};

interface ResourceCard {
  icon: IconDefinition;
  title: string;
  description: string;
  bullets: string[];
  link: {
    label: string;
    href: string;
  };
}

const LEARNING_RESOURCES: ResourceCard[] = [
  {
    icon: FolderLibraryIcon,
    title: "BMAD Repository",
    description: "Repositorio completo con prompts, documentación y ejemplos.",
    bullets: [
      "Prompts de los 8 agentes",
      "Setup automatizado",
      "Documentación completa",
      "Ejemplos de proyectos",
    ],
    link: {
      label: "github.com/bmad-code-org/bmad-method",
      href: "https://github.com/bmad-code-org/bmad-method/",
    },
  },
  {
    icon: Video01Icon,
    title: "BMAD Method Masterclass",
    description: "Tutorial en video que recorre el método de punta a punta.",
    bullets: [
      "Setup paso a paso",
      "Uso de cada agente",
      "Workflow completo",
      "Ejemplos en vivo",
    ],
    link: {
      label: "youtu.be/LorEJPrALcg",
      href: "https://youtu.be/LorEJPrALcg",
    },
  },
];

interface PlanOption {
  icon: IconDefinition;
  title: string;
  highlight: string;
  bullets: string[];
  link: {
    label: string;
    href: string;
  };
}

const PLAN_OPTIONS: PlanOption[] = [
  {
    icon: Wallet01Icon,
    title: "Z.ai Coding Plan",
    highlight: "Recomendado: opción económica para estudiantes y makers.",
    bullets: [
      "Solo $3/mes",
      "Modelo GLM 4.6",
      "Performance cercana a Sonnet 4",
      "Ideal para estudiantes",
    ],
    link: { label: "z.ai/subscribe", href: "https://z.ai/subscribe" },
  },
  {
    icon: FlashIcon,
    title: "Claude Code + Max Plan",
    highlight: "Para entusiastas: máxima calidad para agentic coding.",
    bullets: [
      "Terminal Agent oficial de Anthropic",
      "Acceso a Sonnet 4.5",
      "Max Plan: $100/mes con límites altos",
      "Experiencia optimizada para agentes",
    ],
    link: {
      label: "claude.com/product/claude-code",
      href: "https://www.claude.com/product/claude-code",
    },
  },
  {
    icon: GraduationScrollIcon,
    title: "GitHub Student Pack",
    highlight: "Si sos estudiante, conseguís Copilot Pro gratis.",
    bullets: [
      "Copilot Pro incluido",
      "Acceso a Sonnet 4.5",
      "Mejor modelo del benchmark",
      "Sin costo para estudiantes",
    ],
    link: {
      label: "education.github.com/pack",
      href: "https://education.github.com/pack",
    },
  },
];

interface CliTool {
  icon: IconDefinition;
  title: string;
  description: string;
  bullets: string[];
  link: {
    label: string;
    href: string;
  };
  install?: string;
  steps?: string[];
  note?: string;
}

const CLI_TOOLS: CliTool[] = [
  {
    icon: ComputerTerminal01Icon,
    title: "OpenCode",
    description:
      "Programa de terminal open source. Te logueás con tu proveedor y OpenCode usa ese plan.",
    bullets: [
      "Login con Anthropic, Copilot, Z.ai, etc.",
      "Corre en la terminal de cualquier IDE",
      "Compatible con MCP servers",
      "Multi-modelo y open source",
    ],
    link: { label: "opencode.ai", href: "https://opencode.ai/" },
    install: "curl -fsSL https://opencode.ai/install | bash",
    steps: [
      "Instalá BMAD seleccionando la opción «Claude Code».",
      "Renombrá el directorio .claude/ a .opencode/.",
      "Pasá los archivos .md al nivel superior (no dentro de agents/ o tasks/).",
    ],
    note: "Requiere workaround para mapear la carpeta de BMAD.",
  },
  {
    icon: Robot01Icon,
    title: "Droid CLI",
    description:
      "Cliente de Factory AI que expone GPT-5-Codex gratis, compatible con BMAD.",
    bullets: [
      "Modelo GPT-5-Codex",
      "Completamente gratis",
      "Terminal program orientado a agentes",
    ],
    link: {
      label: "docs.factory.ai/cli",
      href: "https://docs.factory.ai/cli/getting-started/overview",
    },
    steps: [
      "Instalá BMAD seleccionando la opción «Claude Code».",
      "Renombrá .claude/ a .factory/.",
      "Mové los archivos .md al nivel superior de .factory/.",
    ],
    note: "Workaround similar al de OpenCode para reutilizar los prompts.",
  },
];

interface SetupResource {
  icon: IconDefinition;
  title: string;
  description: string;
  commandLabel?: string;
  command?: string;
  bullets: string[];
  link?: {
    label: string;
    href: string;
  };
  note?: string;
}

const SETUP_RESOURCES: SetupResource[] = [
  {
    icon: Download01Icon,
    title: "Instalación de BMAD",
    description:
      "BMAD se instala por proyecto en el directorio raíz, dejando todo versionable.",
    commandLabel: "En la raíz de tu proyecto:",
    command: "npx bmad-method install",
    bullets: [
      "Crea la carpeta .bmad-core/ con agentes y templates.",
      "Instalación por proyecto (no global).",
      "Todo queda bajo control de versiones.",
    ],
  },
  {
    icon: ToolsIcon,
    title: "MCP Tools recomendadas",
    description: "Herramientas que amplían las capacidades de los agentes.",
    bullets: [
      "Playwright: browser automation para testing E2E.",
      "Sequential Thinking: razonamiento estructurado.",
      "Explorá más MCPs en el repositorio de Smithery.",
    ],
    link: {
      label: "smithery.ai — repositorio de MCP tools",
      href: "https://smithery.ai/",
    },
    note: "Configurá los MCPs en tu IDE y los agentes los usarán cuando los necesiten.",
  },
];

interface AgentCard {
  icon: IconDefinition;
  name: string;
  role: string;
  command: string;
  description: string;
  artifacts: string[];
}

const AGENTS: AgentCard[] = [
  {
    icon: Analytics02Icon,
    name: "Business Analyst",
    role: "Insightful Analyst & Strategic Ideation Partner",
    command: "/analyst *create-project-brief",
    description:
      "Market research, brainstorming, competitive analysis, creación de project briefs y documentación de proyectos brownfield.",
    artifacts: [
      "Project brief",
      "Market research",
      "Competitor analysis",
      "Brainstorming output",
    ],
  },
  {
    icon: ClipboardIcon,
    name: "Product Manager",
    role: "Investigative Product Strategist & Market-Savvy PM",
    command: "/pm *create-prd",
    description:
      "Crea PRDs, define estrategia de producto, prioriza features y mantiene alineados a los stakeholders. Paso obligatorio del método.",
    artifacts: ["PRD (Product Requirements Document)", "Brownfield PRD"],
  },
  {
    icon: Structure01Icon,
    name: "Architect",
    role: "Holistic System Architect & Full-Stack Technical Leader",
    command: "/architect *create-full-stack-architecture",
    description:
      "Diseño de sistemas, arquitectura técnica, selección de tecnologías, contratos de API y planes de infraestructura. Paso obligatorio del método.",
    artifacts: [
      "Full-stack architecture",
      "Backend architecture",
      "Frontend architecture",
      "Brownfield architecture",
    ],
  },
  {
    icon: WebDesign01Icon,
    name: "UX Expert",
    role: "User Experience Designer & UI Specialist",
    command: "/ux-expert *create-front-end-spec",
    description:
      "Diseño UI/UX, wireframes, prototipos, front-end specifications y prompts listos para v0 o Lovable.",
    artifacts: ["Front-end spec", "UI design prompts"],
  },
  {
    icon: CheckListIcon,
    name: "Product Owner",
    role: "Technical Product Owner & Process Steward",
    command: "/po *shard-doc",
    description:
      "Gestiona el backlog, refina historias, define acceptance criteria y valida la coherencia entre artefactos. Crítico: el sharding evita la degradación del modelo.",
    artifacts: ["Sharded documents", "Epic files", "Story validations"],
  },
  {
    icon: Flag03Icon,
    name: "Scrum Master",
    role: "Technical Scrum Master & Story Preparation Specialist",
    command: "/sm *draft",
    description:
      "Prepara historias claras, gestiona epics, dirige retros y mantiene la cadencia ágil. Produce drafts listos para que el Developer implemente sin fricción.",
    artifacts: ["User story drafts", "Sequential tasks", "Acceptance criteria"],
  },
  {
    icon: CodeCircleIcon,
    name: "Developer",
    role: "Expert Senior Software Engineer & Implementation Specialist",
    command: "/dev *develop-story",
    description:
      "Implementa código, cubre tests, refactoriza y documenta decisiones. Trabaja story por story con cobertura de pruebas.",
    artifacts: [
      "Production code",
      "Unit tests",
      "Integration tests",
      "E2E tests",
      "Code documentation",
    ],
  },
  {
    icon: Shield01Icon,
    name: "QA",
    role: "Test Architect with Quality Advisory Authority",
    command: "/qa *review",
    description:
      "Define estrategias de testing, evalúa riesgos, asegura trazabilidad de requirements y emite la decisión de calidad final.",
    artifacts: [
      "QA results & gate decisions",
      "Risk profiles",
      "Test plans & design",
      "Requirements tracing",
      "NFR assessments",
    ],
  },
];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const currentLocale = isAppLocale(locale)
    ? locale
    : (i18n.defaultLocale as AppLocale);

  return {
    title: "Agentic Coding Workshop — BAISH",
    description:
      "Todo el material del workshop de Agentic Coding: metodología BMAD, agentes, workflows, y recursos para empezar inmediatamente.",
    alternates: {
      canonical: `/agentic-coding-workshop`,
      languages: Object.fromEntries(
        i18n.locales.map((loc) => [loc, `/${loc}/agentic-coding-workshop`]),
      ),
    },
    openGraph: {
      title: "Agentic Coding Workshop — BAISH",
      description:
        "Metodología completa de agentic coding (BMAD) con agentes, workflows, y recursos prácticos.",
      url: `https://baish.com.ar/${currentLocale}/agentic-coding-workshop`,
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: "Agentic Coding Workshop — BAISH",
      description:
        "Metodología completa de agentic coding (BMAD) con agentes, workflows, y recursos prácticos.",
    },
  };
}

export default async function AgenticCodingWorkshopPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const currentLocale: AppLocale = isAppLocale(locale)
    ? locale
    : (i18n.defaultLocale as AppLocale);
  const dict = await getDictionary(currentLocale);

  return (
    <div className="relative z-10 min-h-screen bg-transparent text-slate-900">
      <div className="sticky top-24 z-20 mx-auto flex w-full max-w-6xl justify-center px-4 sm:px-6">
        <nav className="mt-8 flex w-full flex-wrap items-center justify-center gap-3 rounded-full border border-slate-200 bg-white/80 px-6 py-3 text-sm font-medium text-slate-600 shadow-lg shadow-slate-900/5 backdrop-blur">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="transition hover:text-[var(--color-accent-primary)]"
            >
              {item.label}
            </a>
          ))}
        </nav>
      </div>

      <main className="relative z-10 mx-auto flex max-w-6xl flex-col gap-20 px-6 pb-24 pt-16 sm:px-10">
        <FadeInSection variant="fade" as="section" id="overview" startVisible>
          <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-[#EDE7FC] via-[#f5f5f5] to-[#A8C5FF2a] px-6 py-16 shadow-sm sm:px-12">
            <div className="absolute inset-y-0 right-[-10%] hidden w-1/3 rounded-full bg-[#9275E533] blur-3xl lg:block" />
            <div className="relative flex flex-col items-start gap-8">
              <div className="space-y-4">
                <div className="text-sm text-slate-600">
                  <TransitionLink
                    href={`/${currentLocale}`}
                    className="transition hover:text-[var(--color-accent-primary)]"
                  >
                    Inicio
                  </TransitionLink>
                  {" / "}
                  <span className="text-slate-500">
                    Agentic Coding Workshop
                  </span>
                </div>
                <AnimatedTitle
                  text="Workshop de Agentic Coding"
                  slug="agentic-coding-workshop"
                  className="text-4xl font-semibold text-slate-900 sm:text-5xl"
                  as="h1"
                />
                <p className="text-lg text-slate-700">
                  Armá proyectos con AI como si tuvieras todo un equipo:
                  metodología BMAD, agentes, procesos y herramientas listas para
                  usar.
                </p>
                <p className="text-base text-slate-600">
                  Viernes 3 de octubre 2025, 16:00hs · Salas 1109 y 1110 — BAISH x Y-hat
                </p>
                <p className="text-sm text-slate-500">
                  Esta página reúne todos los materiales y recursos del
                  workshop.
                </p>
              </div>

              <div className="w-full rounded-2xl border border-emerald-200 bg-emerald-50/80 p-5 text-slate-800 shadow-sm">
                <div className="flex items-start gap-3">
                  <span className="mt-1 inline-flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                    <HugeiconsIcon icon={BubbleChatAddIcon} size={22} primaryColor="#047857" />
                  </span>
                  <p className="text-base font-medium text-emerald-800">
                    Unite al grupo de WhatsApp "Agentic Coding" dentro de la comunidad BAISH para discutir ideas,
                    compartir proyectos y pedir ayuda con BMAD.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <a
                  href="#workshop-repo"
                  className="button-primary flex items-center gap-2 bg-emerald-500 text-white hover:bg-emerald-600"
                >
                  <HugeiconsIcon icon={Rocket01Icon} size={18} primaryColor="#ffffff" />
                  <span>Empezar ahora</span>
                </a>
                <a
                  href="https://baish.com.ar"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="button-primary"
                >
                  BAISH
                </a>
                <a
                  href="https://www.instagram.com/somos.yhat/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="button-primary"
                >
                  Y-hat
                </a>
                <a
                  href="https://chat.whatsapp.com/IpVPWqa5gcM9ePJRgTMUPM"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="button-secondary flex items-center gap-2"
                >
                  <HugeiconsIcon icon={BubbleChatAddIcon} size={18} primaryColor="var(--color-accent-primary)" />
                  <span>Unirse al WhatsApp</span>
                </a>
                <a href="#recursos" className="button-secondary flex items-center gap-2">
                  <HugeiconsIcon icon={Books01Icon} size={18} primaryColor="var(--color-accent-primary)" />
                  <span>Ver recursos</span>
                </a>
              </div>
            </div>
          </section>
        </FadeInSection>

        <FadeInSection variant="slide-up" as="section" id="problema">
          <section className="space-y-10">
            <div className="space-y-4 text-center">
              <p className="text-sm uppercase tracking-[0.35em] text-[var(--color-accent-tertiary)]">
                Contexto
              </p>
              <h2 className="flex items-center justify-center gap-2 text-3xl font-semibold text-slate-900">
                <HugeiconsIcon
                  icon={AlertSquareIcon}
                  size={26}
                  primaryColor="var(--color-accent-primary)"
                />
                <span>El problema con los LLMs tradicionales</span>
              </h2>
              <p className="mx-auto max-w-2xl text-base text-slate-600">
                Dos obstáculos hacen que “darle todo al modelo” no funcione:
                degradación en contextos largos y falta de memoria real a través
                del tiempo.
              </p>
            </div>

            <div className="grid gap-6">
              {PROBLEM_CARDS.map((card) => (
                <article
                  key={card.title}
                  className="rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-sm shadow-slate-900/5 backdrop-blur"
                >
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-accent-secondary)]/30 text-[var(--color-accent-primary)]">
                        <HugeiconsIcon
                          icon={card.icon}
                          size={24}
                          primaryColor="var(--color-accent-primary)"
                        />
                      </span>
                      <h3 className="text-2xl font-semibold text-slate-900">
                        {card.title}
                      </h3>
                    </div>
                    <p className="text-base text-slate-700">
                      {card.description}
                    </p>
                    <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5 text-sm text-amber-800 shadow-inner">
                      {card.highlight}
                    </div>
                    <ul className="space-y-2 text-sm text-slate-600">
                      {card.details.map((detail) => (
                        <li key={detail} className="leading-relaxed">
                          <span className="pr-2 text-[var(--color-accent-primary)]">
                            •
                          </span>
                          {detail}
                        </li>
                      ))}
                    </ul>
                    <p className="text-sm text-slate-500">
                      Fuente:{" "}
                      <a
                        href={card.sourceHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[var(--color-accent-primary)] underline-offset-4 hover:underline"
                      >
                        {card.sourceLabel}
                      </a>
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </FadeInSection>

        <FadeInSection variant="slide-up" delay={80} as="section" id="solucion">
          <section className="space-y-10">
            <div className="space-y-4 text-center">
              <p className="text-sm uppercase tracking-[0.35em] text-[var(--color-accent-tertiary)]">
                Método BMAD
              </p>
              <h2 className="flex items-center justify-center gap-2 text-3xl font-semibold text-slate-900">
                <HugeiconsIcon
                  icon={CheckListIcon}
                  size={26}
                  primaryColor="var(--color-accent-primary)"
                />
                <span>La solución: un equipo agentic que planifica y ejecuta</span>
              </h2>
              <p className="mx-auto max-w-2xl text-base text-slate-700">
                BMAD es un método de desarrollo con AI donde ocho agentes
                especializados trabajan como un equipo real. Planifican todo el
                proyecto antes de codear y luego ejecutan story por story con
                validaciones continuas.
              </p>
              <p className="mx-auto max-w-2xl text-base text-slate-600">
                Cada agente es el mismo LLM con un prompt especializado y acceso
                a contexto shardeado y verificado. No hay memoria mágica: hay
                documentación estructurada al alcance justo.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {SOLUTION_CARDS.map((card) => (
                <article
                  key={card.title}
                  className="flex h-full flex-col gap-4 rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-sm shadow-slate-900/5 backdrop-blur"
                >
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-accent-secondary)]/30 text-[var(--color-accent-primary)]">
                      <HugeiconsIcon
                        icon={card.icon}
                        size={24}
                        primaryColor="var(--color-accent-primary)"
                      />
                    </span>
                    <h3 className="text-xl font-semibold text-slate-900">
                      {card.title}
                    </h3>
                  </div>
                  <p className="flex-1 text-base text-slate-700">
                    {card.description}
                  </p>
                  <p className="text-sm font-medium text-emerald-600">
                    {card.outcome}
                  </p>
                </article>
              ))}
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-900 p-8 text-slate-100 shadow-lg shadow-slate-900/20">
              <div className="flex items-center gap-3 text-xl font-semibold text-emerald-200">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-emerald-200/20 text-emerald-200">
                  <HugeiconsIcon icon={BulbIcon} size={24} primaryColor="#A7F3D0" />
                </span>
                <h3 className="text-xl font-semibold text-emerald-200">
                  ¿Por qué funciona BMAD?
                </h3>
              </div>
              <div className="mt-6 grid gap-6 md:grid-cols-3">
                {BMAD_REASON_POINTS.map((point) => (
                  <div
                    key={point.title}
                    className="rounded-2xl border border-white/10 bg-white/5 p-5"
                  >
                    <h4 className="text-base font-semibold text-emerald-100">
                      {point.title}
                    </h4>
                    <p className="mt-2 text-sm leading-relaxed text-slate-100/90">
                      {point.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </FadeInSection>

        <FadeInSection variant="slide-up" delay={120} as="section" id="agentes">
          <section className="space-y-10">
            <div className="space-y-4 text-center">
              <p className="text-sm uppercase tracking-[0.35em] text-[var(--color-accent-tertiary)]">
                Equipo Agentic
              </p>
              <h2 className="flex items-center justify-center gap-2 text-3xl font-semibold text-slate-900">
                <HugeiconsIcon
                  icon={UserGroupIcon}
                  size={26}
                  primaryColor="var(--color-accent-primary)"
                />
                <span>Los ocho agentes de BMAD</span>
              </h2>
              <p className="mx-auto max-w-2xl text-base text-slate-600">
                Cada rol es el mismo modelo con un prompt especializado y
                contexto shardeado. El resultado: un equipo multidisciplinario
                que trabaja como si fuera humano.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {AGENTS.map((agent) => (
                <article
                  key={agent.name}
                  className="flex h-full flex-col gap-4 rounded-3xl border border-slate-200 bg-white/95 p-7 shadow-sm shadow-slate-900/5 backdrop-blur transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="flex items-start gap-4">
                    <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-accent-secondary)]/30 text-[var(--color-accent-primary)]">
                      <HugeiconsIcon
                        icon={agent.icon}
                        size={24}
                        primaryColor="var(--color-accent-primary)"
                      />
                    </span>
                    <div>
                      <h3 className="text-xl font-semibold text-slate-900">
                        {agent.name}
                      </h3>
                      <p className="text-sm font-medium text-[var(--color-accent-primary)]">
                        {agent.role}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm font-mono text-slate-500">
                    {agent.command}
                  </p>
                  <p className="text-sm text-slate-700">{agent.description}</p>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900">
                      Artifacts
                    </h4>
                    <ul className="mt-2 space-y-2 text-sm text-slate-600">
                      {agent.artifacts.map((artifact) => (
                        <li key={artifact} className="flex items-start gap-2">
                          <span className="mt-1 text-xs text-[var(--color-accent-primary)]">
                            ●
                          </span>
                          <span>{artifact}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </FadeInSection>

        <FadeInSection
          variant="slide-up"
          delay={140}
          as="section"
          id="commands"
        >
          <section className="space-y-10">
            <div className="space-y-4 text-center">
              <p className="text-sm uppercase tracking-[0.35em] text-[var(--color-accent-tertiary)]">
                Operativa diaria
              </p>
              <h2 className="flex items-center justify-center gap-2 text-3xl font-semibold text-slate-900">
                <HugeiconsIcon
                  icon={CommandLineIcon}
                  size={26}
                  primaryColor="var(--color-accent-primary)"
                />
                <span>Cómo se usan los comandos</span>
              </h2>
              <p className="mx-auto max-w-2xl text-base text-slate-600">
                Los agentes se invocan por terminal o en el IDE usando comandos
                cortos. En todos los casos pasás el contexto con @archivo.md.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-[#EDE7FC] via-[#f5f5f5] to-white p-8 shadow-sm shadow-slate-900/5">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-accent-secondary)]/30 text-[var(--color-accent-primary)]">
                    <HugeiconsIcon
                      icon={CommandLineIcon}
                      size={22}
                      primaryColor="var(--color-accent-primary)"
                    />
                  </span>
                  <h3 className="text-xl font-semibold text-[var(--color-accent-primary)]">
                    Sintaxis de comandos
                  </h3>
                </div>
                <p className="mt-2 text-sm text-slate-600">
                  Elegí la herramienta que uses y seguí la misma estructura:
                  comando + acción + archivos relevantes.
                </p>
                <div className="mt-6 space-y-4">
                  {COMMAND_SYNTAX_BLOCKS.map((block) => (
                    <div
                      key={block.heading}
                      className="rounded-2xl border border-slate-200 bg-white/90 p-5"
                    >
                      <p className="text-sm font-semibold text-slate-900">
                        {block.heading}
                      </p>
                      <div className="mt-3 space-y-2 font-mono text-sm text-slate-600">
                        {block.commands.map((cmd) => (
                          <code
                            key={cmd}
                            className="block rounded-lg bg-slate-50 px-3 py-2 text-[13px] text-slate-700"
                          >
                            {cmd}
                          </code>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </article>

              <article className="rounded-3xl border border-emerald-200 bg-emerald-50/80 p-8 shadow-sm shadow-emerald-900/10">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-emerald-200/40 text-emerald-700">
                    <HugeiconsIcon icon={RepeatIcon} size={22} primaryColor="#047857" />
                  </span>
                  <h3 className="text-xl font-semibold text-emerald-700">
                    Cambiar de agente sin ruido
                  </h3>
                </div>
                <p className="mt-2 text-sm text-emerald-900/80">
                  Cada agente opera en su propio contexto. Para alternar sin
                  confusiones:
                </p>
                <ol className="mt-4 space-y-3 text-sm text-emerald-900/90">
                  {COMMAND_SWITCH_STEPS.map((step, index) => (
                    <li key={step} className="flex gap-3">
                      <span className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-xs font-semibold text-white">
                        {index + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
                <p className="mt-6 rounded-2xl border border-emerald-200 bg-white/70 px-4 py-3 text-sm text-emerald-800">
                  Tip: mantené tus documentos en <code>docs/</code> y usá
                  nombres claros (ej.{" "}
                  <code>docs/epics/epic-2-dashboard.md</code>) para shardear
                  contexto con precisión.
                </p>
              </article>
            </div>
          </section>
        </FadeInSection>

        <FadeInSection
          variant="slide-up"
          delay={160}
          as="section"
          id="planning"
        >
          <section className="space-y-10 rounded-3xl border border-slate-200 bg-gradient-to-br from-[#EDE7FC] via-[#f5f5f5] to-[#A8C5FF2a] px-6 py-12 shadow-sm sm:px-12">
            <div className="space-y-3 text-center">
              <p className="text-sm uppercase tracking-[0.35em] text-[var(--color-accent-tertiary)]">
                Fase 1
              </p>
              <h2 className="flex items-center justify-center gap-2 text-3xl font-semibold text-slate-900">
                <HugeiconsIcon
                  icon={CompassIcon}
                  size={26}
                  primaryColor="var(--color-accent-primary)"
                />
                <span>Planning (una sola vez al inicio)</span>
              </h2>
              <p className="mx-auto max-w-2xl text-base text-slate-600">
                Diseño completo antes de escribir código. Todo se ejecuta desde
                la terminal con comandos BMAD.
              </p>
            </div>

            <div className="space-y-6">
              {PLANNING_STEPS.map((step) => (
                <article
                  key={step.number}
                  className="rounded-3xl border border-white/60 bg-white/70 p-6 shadow-sm shadow-slate-900/5 backdrop-blur"
                >
                  <div className="flex flex-col gap-5 md:flex-row">
                    <div className="flex flex-shrink-0 items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-accent-primary)] text-lg font-semibold text-white">
                        {step.number}
                      </div>
                      <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-accent-secondary)]/30 text-[var(--color-accent-primary)]">
                        <HugeiconsIcon
                          icon={step.icon}
                          size={24}
                          primaryColor="var(--color-accent-primary)"
                        />
                      </span>
                    </div>
                    <div className="flex-1 space-y-4">
                      <div>
                        <h3 className="text-xl font-semibold text-slate-900">
                          {step.title}
                        </h3>
                        <p className="mt-1 text-sm text-slate-600">
                          {step.summary}
                        </p>
                      </div>
                      <ul className="space-y-2 text-sm text-slate-700">
                        {step.bullets.map((bullet) => (
                          <li key={bullet} className="leading-relaxed">
                            <span className="pr-2 text-[var(--color-accent-primary)]">
                              •
                            </span>
                            {bullet}
                          </li>
                        ))}
                      </ul>
                      {step.commands.length > 0 && (
                        <div className="space-y-2">
                          {step.commands.map((cmd) => (
                            <code
                              key={cmd}
                              className="inline-block rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-[13px] text-slate-700"
                            >
                              {cmd}
                            </code>
                          ))}
                        </div>
                      )}
                      {step.callout && (
                        <div
                          className={`rounded-2xl border px-4 py-3 text-sm ${(CALLOUT_STYLES as Record<string, string>)[step.callout.variant]}`}
                        >
                          <strong className="block text-base font-semibold">
                            {step.callout.title}
                          </strong>
                          <span className="text-sm">{step.callout.text}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm">
              <div className="flex items-center gap-2 text-base font-semibold text-slate-900">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-accent-secondary)]/30 text-[var(--color-accent-primary)]">
                  <HugeiconsIcon icon={CheckListIcon} size={20} primaryColor="var(--color-accent-primary)" />
                </span>
                <h3 className="text-base font-semibold text-slate-900">
                  Agentes adicionales según necesidad
                </h3>
              </div>
              <ul className="mt-3 space-y-2 text-sm text-slate-700">
                {PLANNING_OPTIONAL_AGENTS.map((item) => (
                  <li key={item}>
                    <span className="pr-2 text-[var(--color-accent-primary)]">
                      •
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-3xl border border-emerald-200 bg-emerald-50/80 p-6 shadow-sm">
              <div className="flex items-center gap-2 text-xl font-semibold text-emerald-700">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-emerald-200/40 text-emerald-700">
                  <HugeiconsIcon icon={Target02Icon} size={22} primaryColor="#047857" />
                </span>
                <h3 className="text-xl font-semibold text-emerald-700">
                  Al finalizar planning tenés:
                </h3>
              </div>
              <ul className="mt-3 space-y-2 text-sm text-emerald-900/90">
                {PLANNING_SUMMARY_POINTS.map((point) => (
                  <li key={point}>
                    <span className="pr-2 text-emerald-500">✓</span>
                    {point}
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-sm font-medium text-amber-800">
                No escribiste una línea de código todavía. Ese enfoque
                intencional evita semanas de refactorings más adelante.
              </p>
            </div>
          </section>
        </FadeInSection>

        <FadeInSection
          variant="slide-up"
          delay={180}
          as="section"
          id="development"
        >
          <section className="space-y-10">
            <div className="space-y-3 text-center">
              <p className="text-sm uppercase tracking-[0.35em] text-[var(--color-accent-tertiary)]">
                Fase 2
              </p>
              <h2 className="flex items-center justify-center gap-2 text-3xl font-semibold text-slate-900">
                <HugeiconsIcon
                  icon={RepeatIcon}
                  size={26}
                  primaryColor="var(--color-accent-primary)"
                />
                <span>Development loop iterativo</span>
              </h2>
              <p className="mx-auto max-w-2xl text-base text-slate-600">
                Implementación story por story con validaciones integradas.
                Repetí este loop hasta completar tu backlog.
              </p>
            </div>

            <div className="space-y-6">
              {DEVELOPMENT_STEPS.map((step) => (
                <article
                  key={step.number}
                  className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm shadow-slate-900/5 backdrop-blur"
                >
                  <div className="flex flex-col gap-5 md:flex-row">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-slate-900 text-lg font-semibold text-white">
                      {step.number}
                    </div>
                    <div className="flex-1 space-y-4">
                      <div>
                        <h3 className="text-xl font-semibold text-slate-900">
                          {step.title}
                        </h3>
                        <p className="mt-1 text-sm text-slate-600">
                          {step.summary}
                        </p>
                      </div>
                      <ul className="space-y-2 text-sm text-slate-700">
                        {step.bullets.map((bullet) => (
                          <li key={bullet} className="leading-relaxed">
                            <span className="pr-2 text-slate-900">•</span>
                            {bullet}
                          </li>
                        ))}
                      </ul>
                      {step.commands.length > 0 && (
                        <div className="space-y-2">
                          {step.commands.map((cmd) => (
                            <code
                              key={cmd}
                              className="inline-block rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-[13px] text-slate-700"
                            >
                              {cmd}
                            </code>
                          ))}
                        </div>
                      )}
                      {step.callouts?.length ? (
                        <div className="space-y-3">
                          {step.callouts.map((callout) => (
                            <div
                              key={callout.title}
                              className={`rounded-2xl border px-4 py-3 text-sm ${(CALLOUT_STYLES as Record<string, string>)[callout.variant]}`}
                            >
                              <strong className="block text-base font-semibold">
                                {callout.title}
                              </strong>
                              <span className="text-sm">{callout.text}</span>
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-900/95 p-6 text-slate-100 shadow-lg shadow-slate-900/20">
              <p className="flex items-center gap-2 text-sm font-medium">
                <HugeiconsIcon icon={RepeatIcon} size={20} primaryColor="#A855F7" />
                <span>Este loop se repite: volvés al paso 1 con la próxima story.</span>
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm">
              <div className="flex items-center gap-2 text-base font-semibold text-slate-900">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-accent-secondary)]/30 text-[var(--color-accent-primary)]">
                  <HugeiconsIcon icon={CheckListIcon} size={20} primaryColor="var(--color-accent-primary)" />
                </span>
                <h3 className="text-base font-semibold text-slate-900">
                  Notas sobre el proceso
                </h3>
              </div>
              <ul className="mt-3 space-y-2 text-sm text-slate-700">
                {DEVELOPMENT_NOTES.map((note) => (
                  <li key={note}>
                    <span className="pr-2 text-slate-900">•</span>
                    {note}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-3xl border border-emerald-200 bg-emerald-50/80 p-6 shadow-sm">
              <div className="flex items-center gap-2 text-xl font-semibold text-emerald-700">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-emerald-200/40 text-emerald-700">
                  <HugeiconsIcon icon={TickDouble02Icon} size={22} primaryColor="#047857" />
                </span>
                <h3 className="text-xl font-semibold text-emerald-700">
                  Ventajas del loop iterativo
                </h3>
              </div>
              <ul className="mt-3 space-y-2 text-sm text-emerald-900/90">
                {DEVELOPMENT_SUMMARY_POINTS.map((point) => (
                  <li key={point}>
                    <span className="pr-2 text-emerald-500">✓</span>
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </FadeInSection>

        <FadeInSection
          variant="slide-up"
          delay={200}
          as="section"
          id="recursos"
        >
          <section className="space-y-12">
            <div className="space-y-3 text-center">
              <p className="text-sm uppercase tracking-[0.35em] text-[var(--color-accent-tertiary)]">
                Recursos
              </p>
              <h2 className="flex items-center justify-center gap-2 text-3xl font-semibold text-slate-900">
                <HugeiconsIcon
                  icon={LibraryIcon}
                  size={26}
                  primaryColor="var(--color-accent-primary)"
                />
                <span>Todo para empezar hoy mismo</span>
              </h2>
              <p className="mx-auto max-w-2xl text-base text-slate-600">
                Herramientas, plantillas y guías para ejecutar BMAD sin
                fricción.
              </p>
            </div>

            <div className="space-y-6 rounded-3xl border border-slate-200 bg-gradient-to-r from-[#EDE7FC] via-[#f5f5f5] to-[#A8C5FF2a] p-8 shadow-sm">
              <div className="flex items-center justify-center gap-2 text-xl font-semibold text-[var(--color-accent-primary)]">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-accent-secondary)]/30">
                  <HugeiconsIcon icon={ToolsIcon} size={22} primaryColor="var(--color-accent-primary)" />
                </span>
                <h3 className="text-xl font-semibold text-[var(--color-accent-primary)]">
                  ¿Qué herramienta usar?
                </h3>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {TOOL_OPTIONS.map((tool) => (
                  <article
                    key={tool.title}
                    className="flex h-full flex-col gap-3 rounded-2xl border border-white/60 bg-white/70 p-5 shadow-sm shadow-slate-900/5 backdrop-blur"
                  >
                    <div className="flex items-center gap-2">
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-accent-secondary)]/30 text-[var(--color-accent-primary)]">
                        <HugeiconsIcon icon={tool.icon} size={20} primaryColor="var(--color-accent-primary)" />
                      </span>
                      <h4 className="text-lg font-semibold text-slate-900">
                        {tool.title}
                      </h4>
                    </div>
                    <p className="text-sm font-medium text-slate-700">
                      {tool.highlight}
                    </p>
                    <ul className="space-y-2 text-sm text-slate-600">
                      {tool.bullets.map((bullet) => (
                        <li key={bullet}>
                          <span className="pr-2 text-[var(--color-accent-primary)]">
                            ✓
                          </span>
                          {bullet}
                        </li>
                      ))}
                    </ul>
                    {tool.note && (
                      <p className="text-xs font-medium text-amber-700">
                        {tool.note}
                      </p>
                    )}
                  </article>
                ))}
              </div>
            </div>

            <div
              id="workshop-repo"
              className="rounded-3xl border border-emerald-200 bg-emerald-50/80 p-8 shadow-sm"
            >
              <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
                <div className="rounded-2xl border border-emerald-300 bg-white/80 p-5 text-emerald-600">
                  <HugeiconsIcon icon={Rocket01Icon} size={28} primaryColor="#16A34A" />
                </div>
                <div className="flex-1 space-y-4">
                  <h3 className="text-2xl font-semibold text-emerald-700">
                    {QUICK_START.title}
                  </h3>
                  <p className="text-sm text-emerald-900/80">
                    {QUICK_START.description}
                  </p>
                  <ul className="space-y-2 text-sm text-emerald-900/90">
                    {QUICK_START.bullets.map((bullet) => (
                      <li key={bullet}>
                        <span className="pr-2 text-emerald-500">✓</span>
                        {bullet}
                      </li>
                    ))}
                  </ul>
                  <a
                    className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-accent-primary)] underline-offset-4 hover:underline"
                    href={QUICK_START.link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {QUICK_START.link.label}
                    <span aria-hidden>↗</span>
                  </a>
                  <div className="rounded-2xl border border-emerald-200 bg-white/80 p-4 text-sm">
                    <p className="flex items-center gap-2 font-semibold text-emerald-700">
                      <HugeiconsIcon icon={Rocket01Icon} size={18} primaryColor="#047857" />
                      <span>Quick start</span>
                    </p>
                    <div className="mt-3 space-y-2 font-mono text-[13px] text-slate-700">
                      {QUICK_START.commands.map((cmd) => (
                        <code
                          key={cmd}
                          className="block rounded-lg bg-slate-50 px-3 py-2"
                        >
                          {cmd}
                        </code>
                      ))}
                    </div>
                    <p className="mt-3 text-xs text-emerald-900/80">
                      {QUICK_START.note}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-center gap-2 text-xl font-semibold text-[var(--color-accent-primary)]">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-accent-secondary)]/30">
                  <HugeiconsIcon icon={FolderLibraryIcon} size={22} primaryColor="var(--color-accent-primary)" />
                </span>
                <h3 className="text-xl font-semibold text-[var(--color-accent-primary)]">
                  Repositorios y aprendizaje
                </h3>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {LEARNING_RESOURCES.map((resource) => (
                  <article
                    key={resource.title}
                    className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm shadow-slate-900/5"
                  >
                    <div className="flex items-center gap-2">
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-accent-secondary)]/30 text-[var(--color-accent-primary)]">
                        <HugeiconsIcon icon={resource.icon} size={20} primaryColor="var(--color-accent-primary)" />
                      </span>
                      <h4 className="text-lg font-semibold text-slate-900">
                        {resource.title}
                      </h4>
                    </div>
                    <p className="mt-1 text-sm text-slate-600">
                      {resource.description}
                    </p>
                    <ul className="mt-3 space-y-2 text-sm text-slate-600">
                      {resource.bullets.map((bullet) => (
                        <li key={bullet}>
                          <span className="pr-2 text-[var(--color-accent-primary)]">
                            ✓
                          </span>
                          {bullet}
                        </li>
                      ))}
                    </ul>
                    <a
                      className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-accent-primary)] underline-offset-4 hover:underline"
                      href={resource.link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {resource.link.label}
                      <span aria-hidden>↗</span>
                    </a>
                  </article>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-center gap-2 text-xl font-semibold text-[var(--color-accent-primary)]">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-accent-secondary)]/30">
                  <HugeiconsIcon icon={Target02Icon} size={22} primaryColor="var(--color-accent-primary)" />
                </span>
                <h3 className="text-xl font-semibold text-[var(--color-accent-primary)]">
                  Planes recomendados
                </h3>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {PLAN_OPTIONS.map((plan) => (
                  <article
                    key={plan.title}
                    className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm shadow-slate-900/5"
                  >
                    <div className="flex items-center gap-2">
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-accent-secondary)]/30 text-[var(--color-accent-primary)]">
                        <HugeiconsIcon icon={plan.icon} size={20} primaryColor="var(--color-accent-primary)" />
                      </span>
                      <h4 className="text-lg font-semibold text-slate-900">
                        {plan.title}
                      </h4>
                    </div>
                    <p className="mt-1 text-sm font-medium text-slate-700">
                      {plan.highlight}
                    </p>
                    <ul className="mt-3 space-y-2 text-sm text-slate-600">
                      {plan.bullets.map((bullet) => (
                        <li key={bullet}>
                          <span className="pr-2 text-[var(--color-accent-primary)]">
                            ✓
                          </span>
                          {bullet}
                        </li>
                      ))}
                    </ul>
                    <a
                      className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-accent-primary)] underline-offset-4 hover:underline"
                      href={plan.link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {plan.link.label}
                      <span aria-hidden>↗</span>
                    </a>
                  </article>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-center gap-2 text-xl font-semibold text-[var(--color-accent-primary)]">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-accent-secondary)]/30">
                  <HugeiconsIcon icon={ComputerTerminal01Icon} size={22} primaryColor="var(--color-accent-primary)" />
                </span>
                <h3 className="text-xl font-semibold text-[var(--color-accent-primary)]">
                  Herramientas CLI / Terminal
                </h3>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {CLI_TOOLS.map((tool) => (
                  <article
                    key={tool.title}
                    className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm shadow-slate-900/5"
                  >
                    <div className="flex items-center gap-2">
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-accent-secondary)]/30 text-[var(--color-accent-primary)]">
                        <HugeiconsIcon icon={tool.icon} size={20} primaryColor="var(--color-accent-primary)" />
                      </span>
                      <h4 className="text-lg font-semibold text-slate-900">
                        {tool.title}
                      </h4>
                    </div>
                    <p className="mt-1 text-sm text-slate-600">
                      {tool.description}
                    </p>
                    <ul className="mt-3 space-y-2 text-sm text-slate-600">
                      {tool.bullets.map((bullet) => (
                        <li key={bullet}>
                          <span className="pr-2 text-[var(--color-accent-primary)]">
                            ✓
                          </span>
                          {bullet}
                        </li>
                      ))}
                    </ul>
                    <a
                      className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-accent-primary)] underline-offset-4 hover:underline"
                      href={tool.link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {tool.link.label}
                      <span aria-hidden>↗</span>
                    </a>
                    {tool.install && (
                      <div className="mt-4 space-y-2">
                        <p className="text-xs font-semibold text-slate-700">
                          Instalación:
                        </p>
                        <code className="block rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-[13px] text-slate-700">
                          {tool.install}
                        </code>
                      </div>
                    )}
                    {tool.steps && (
                      <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50/80 p-4 text-sm">
                        <p className="text-sm font-semibold text-slate-800">
                          Configuración BMAD:
                        </p>
                        <ol className="mt-2 space-y-2 text-sm text-slate-700">
                          {tool.steps.map((step) => (
                            <li key={step} className="leading-relaxed">
                              {step}
                            </li>
                          ))}
                        </ol>
                        {tool.note && (
                          <p className="mt-3 text-xs font-medium text-amber-700">
                            {tool.note}
                          </p>
                        )}
                      </div>
                    )}
                  </article>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-center gap-2 text-xl font-semibold text-[var(--color-accent-primary)]">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-accent-secondary)]/30">
                  <HugeiconsIcon icon={ToolsIcon} size={22} primaryColor="var(--color-accent-primary)" />
                </span>
                <h3 className="text-xl font-semibold text-[var(--color-accent-primary)]">
                  Instalación y setup
                </h3>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {SETUP_RESOURCES.map((item) => (
                  <article
                    key={item.title}
                    className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm shadow-slate-900/5"
                  >
                    <div className="flex items-center gap-2">
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-accent-secondary)]/30 text-[var(--color-accent-primary)]">
                        <HugeiconsIcon icon={item.icon} size={20} primaryColor="var(--color-accent-primary)" />
                      </span>
                      <h4 className="text-lg font-semibold text-slate-900">
                        {item.title}
                      </h4>
                    </div>
                    <p className="mt-1 text-sm text-slate-600">
                      {item.description}
                    </p>
                    {item.command && (
                      <div className="mt-3 space-y-2 text-sm">
                        <p className="font-semibold text-slate-700">
                          {item.commandLabel}
                        </p>
                        <code className="block rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-[13px] text-slate-700">
                          {item.command}
                        </code>
                      </div>
                    )}
                    <ul className="mt-3 space-y-2 text-sm text-slate-600">
                      {item.bullets.map((bullet) => (
                        <li key={bullet}>
                          <span className="pr-2 text-[var(--color-accent-primary)]">
                            ✓
                          </span>
                          {bullet}
                        </li>
                      ))}
                    </ul>
                    {item.link && (
                      <a
                        className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-accent-primary)] underline-offset-4 hover:underline"
                        href={item.link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {item.link.label}
                        <span aria-hidden>↗</span>
                      </a>
                    )}
                    {item.note && (
                      <p className="mt-3 text-xs text-slate-500">{item.note}</p>
                    )}
                  </article>
                ))}
              </div>
            </div>
          </section>
        </FadeInSection>
      </main>

      <Footer locale={currentLocale} t={dict.footer} />
    </div>
  );
}
