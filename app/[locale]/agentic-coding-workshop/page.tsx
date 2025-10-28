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
interface AgenticMetadata {
  title: string;
  description: string;
  openGraph: {
    title: string;
    description: string;
  };
  twitter: {
    title: string;
    description: string;
  };
}

type AgenticNav = {
  overview: string;
  problem: string;
  solution: string;
  agents: string;
  planning: string;
  development: string;
  resources: string;
};

interface AgenticBreadcrumb {
  home: string;
  current: string;
}

interface AgenticHeroButtons {
  startNow: string;
  baish: string;
  yHat: string;
  joinWhatsapp: string;
  viewResources: string;
}

interface AgenticHero {
  title: string;
  tagline: string;
  eventDetails: string;
  note: string;
  whatsapp: string;
  buttons: AgenticHeroButtons;
}

interface AgenticProblemCard {
  title: string;
  description: string;
  highlight: string;
  details: string[];
  sourceLabel: string;
}

type AgenticProblemCardKey = "contextDegradation" | "lackOfLongTermMemory";

interface AgenticProblem {
  eyebrow: string;
  title: string;
  description: string;
  sourcePrefix: string;
  cards: Record<AgenticProblemCardKey, AgenticProblemCard>;
}

interface AgenticSolutionCard {
  title: string;
  description: string;
  outcome: string;
}

type AgenticSolutionCardKey =
  | "sharding"
  | "specializedAgents"
  | "structuredDocumentation";

interface AgenticReasonPoint {
  title: string;
  description: string;
}

type AgenticReasonKey =
  | "optimizedContext"
  | "validationTransparency"
  | "advancedElicitation";

interface AgenticSolution {
  eyebrow: string;
  title: string;
  description: string;
  description2: string;
  calloutTitle: string;
  cards: Record<AgenticSolutionCardKey, AgenticSolutionCard>;
  reasons: Record<AgenticReasonKey, AgenticReasonPoint>;
}

interface AgenticAgentsSection {
  eyebrow: string;
  title: string;
  description: string;
  artifactsLabel: string;
}

interface AgenticAgent {
  name: string;
  role: string;
  description: string;
  artifacts: string[];
}

type AgenticAgentKey =
  | "businessAnalyst"
  | "productManager"
  | "architect"
  | "uxExpert"
  | "productOwner"
  | "scrumMaster"
  | "developer"
  | "qa";

interface AgenticCommandSyntaxBlock {
  heading: string;
}

type AgenticCommandSyntaxBlockKey = "claudeOpencode" | "cursorWindsurf";

interface AgenticCommandSyntax {
  title: string;
  description: string;
  blocks: Record<AgenticCommandSyntaxBlockKey, AgenticCommandSyntaxBlock>;
}

interface AgenticCommandSwitchTip {
  prefix: string;
  beforeDocs: string;
  beforeExample: string;
  afterExample: string;
}

interface AgenticCommandSwitch {
  title: string;
  description: string;
  steps: string[];
  tip: AgenticCommandSwitchTip;
}

interface AgenticCommands {
  eyebrow: string;
  title: string;
  description: string;
  syntax: AgenticCommandSyntax;
  switch: AgenticCommandSwitch;
}

interface AgenticCallout {
  title: string;
  text: string;
}

interface AgenticPlanningStepEntry {
  title: string;
  summary: string;
  bullets: string[];
  callout?: AgenticCallout;
}

type AgenticPlanningStepKey =
  | "pmPrdCreation"
  | "architectDesign"
  | "poChecklist"
  | "poSharding";

interface AgenticPlanning {
  eyebrow: string;
  title: string;
  description: string;
  steps: Record<AgenticPlanningStepKey, AgenticPlanningStepEntry>;
  optionalAgentsTitle: string;
  optionalAgents: string[];
  summaryTitle: string;
  summaryPoints: string[];
  summaryNote: string;
}

interface AgenticDevelopmentStepEntry {
  title: string;
  summary: string;
  bullets: string[];
  callouts?: AgenticCallout[];
}

type AgenticDevelopmentStepKey =
  | "smReviewNotes"
  | "smDraftNextStory"
  | "poValidateDraft"
  | "devImplementation"
  | "qaReview"
  | "devFixes"
  | "markDone";

interface AgenticDevelopment {
  eyebrow: string;
  title: string;
  description: string;
  steps: Record<AgenticDevelopmentStepKey, AgenticDevelopmentStepEntry>;
  loopReminder: string;
  notesTitle: string;
  notes: string[];
  advantagesTitle: string;
  advantagesPoints: string[];
}

interface AgenticToolOption {
  title: string;
  highlight: string;
  bullets: string[];
  note?: string;
}

type AgenticToolOptionKey =
  | "claudeCode"
  | "openCode"
  | "cursorWindsurf"
  | "geminiCli"
  | "droidCli";

interface AgenticQuickStart {
  title: string;
  description: string;
  bullets: string[];
  linkLabel: string;
  note: string;
  calloutLabel: string;
}

interface AgenticLearningResource {
  title: string;
  description: string;
  bullets: string[];
  linkLabel: string;
}

type AgenticLearningResourceKey = "bmadRepository" | "bmadMasterclass";

interface AgenticPlanOption {
  title: string;
  highlight: string;
  bullets: string[];
  linkLabel: string;
}

type AgenticPlanOptionKey = "zaiPlan" | "claudeMax" | "githubStudent";

interface AgenticCliTool {
  title: string;
  description: string;
  bullets: string[];
  linkLabel: string;
  steps?: string[];
  note?: string;
}

type AgenticCliToolKey = "openCode" | "droidCli";

interface AgenticSetupResource {
  title: string;
  description: string;
  commandLabel?: string;
  bullets: string[];
  linkLabel?: string;
  note?: string;
}

type AgenticSetupResourceKey = "installBmad" | "recommendedMcps";

interface AgenticResources {
  eyebrow: string;
  title: string;
  description: string;
  toolingTitle: string;
  toolOptions: Record<AgenticToolOptionKey, AgenticToolOption>;
  quickStart: AgenticQuickStart;
  learningTitle: string;
  learning: Record<AgenticLearningResourceKey, AgenticLearningResource>;
  plansTitle: string;
  plans: Record<AgenticPlanOptionKey, AgenticPlanOption>;
  cliTitle: string;
  cliInstallLabel: string;
  cliSetupLabel: string;
  cli: Record<AgenticCliToolKey, AgenticCliTool>;
  setupTitle: string;
  setup: Record<AgenticSetupResourceKey, AgenticSetupResource>;
}

interface AgenticCodingWorkshopDictionary {
  metadata: AgenticMetadata;
  nav: AgenticNav;
  breadcrumb: AgenticBreadcrumb;
  hero: AgenticHero;
  problem: AgenticProblem;
  solution: AgenticSolution;
  agentsSection: AgenticAgentsSection;
  agents: Record<AgenticAgentKey, AgenticAgent>;
  commands: AgenticCommands;
  planning: AgenticPlanning;
  development: AgenticDevelopment;
  resources: AgenticResources;
}


type NavKey = keyof AgenticCodingWorkshopDictionary["nav"];

type NavItemConfig = {
  labelKey: NavKey;
  href: string;
};

type NavItem = {
  href: string;
  label: string;
};

const NAV_ITEMS: NavItemConfig[] = [
  { labelKey: "overview", href: "#overview" },
  { labelKey: "problem", href: "#problema" },
  { labelKey: "solution", href: "#solucion" },
  { labelKey: "agents", href: "#agentes" },
  { labelKey: "planning", href: "#planning" },
  { labelKey: "development", href: "#development" },
  { labelKey: "resources", href: "#recursos" },
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

type ProblemCardConfig = {
  key: keyof AgenticCodingWorkshopDictionary["problem"]["cards"];
  icon: IconDefinition;
  sourceHref: string;
};

const PROBLEM_CARD_CONFIGS: ProblemCardConfig[] = [
  {
    key: "contextDegradation",
    icon: AlertSquareIcon,
    sourceHref: "https://abanteai.github.io/LoCoDiff-bench/",
  },
  {
    key: "lackOfLongTermMemory",
    icon: Brain01Icon,
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

type SolutionCardConfig = {
  key: keyof AgenticCodingWorkshopDictionary["solution"]["cards"];
  icon: IconDefinition;
};

const SOLUTION_CARD_CONFIGS: SolutionCardConfig[] = [
  { key: "sharding", icon: Layers02Icon },
  { key: "specializedAgents", icon: AddTeamIcon },
  { key: "structuredDocumentation", icon: DocumentValidationIcon },
];

type ReasonKey = keyof AgenticCodingWorkshopDictionary["solution"]["reasons"];

const BMAD_REASON_CONFIGS: Array<{ key: ReasonKey }> = [
  { key: "optimizedContext" },
  { key: "validationTransparency" },
  { key: "advancedElicitation" },
];

type CommandSyntaxBlockConfig = {
  key: keyof AgenticCodingWorkshopDictionary["commands"]["syntax"]["blocks"];
  commands: string[];
};

type CommandSyntaxBlock = { heading: string; commands: string[] };

const COMMAND_SYNTAX_CONFIGS: CommandSyntaxBlockConfig[] = [
  {
    key: "claudeOpencode",
    commands: [
      "/pm *create-prd here's some rough notes @notes.md",
      "/architect *create-full-stack-architecture @prd.md",
      "/dev *develop-story @docs/stories/1.1.md",
    ],
  },
  {
    key: "cursorWindsurf",
    commands: [
      "@PM Create PRD, here's some notes @notes.md",
      "@architect Design the system architecture, here's the @prd.md",
      "@dev *develop @docs/stories/1.1.md",
    ],
  },
];

type ReasonPoint =
  AgenticCodingWorkshopDictionary["solution"]["reasons"][ReasonKey];

type PlanningStepKey =
  keyof AgenticCodingWorkshopDictionary["planning"]["steps"];

type PlanningStepConfig = {
  key: PlanningStepKey;
  number: string;
  icon: IconDefinition;
  commands: string[];
  calloutVariant?: CalloutVariant;
};

const PLANNING_STEP_CONFIGS: PlanningStepConfig[] = [
  {
    key: "pmPrdCreation",
    number: "1",
    icon: Task01Icon,
    commands: ["/pm *create-prd"],
    calloutVariant: "info",
  },
  {
    key: "architectDesign",
    number: "2",
    icon: Structure01Icon,
    commands: ["/architect *create-full-stack-architecture"],
  },
  {
    key: "poChecklist",
    number: "3",
    icon: CheckListIcon,
    commands: ["/po *execute-checklist-po"],
    calloutVariant: "warning",
  },
  {
    key: "poSharding",
    number: "4",
    icon: Layers02Icon,
    commands: [
      "/po *shard-doc docs/prd.md",
      "/po *shard-doc docs/architecture.md",
    ],
    calloutVariant: "success",
  },
];

type DevelopmentStepKey =
  keyof AgenticCodingWorkshopDictionary["development"]["steps"];

type DevelopmentStepConfig = {
  key: DevelopmentStepKey;
  number: string;
  icon: IconDefinition;
  commands: string[];
  calloutVariants?: CalloutVariant[];
};

const DEVELOPMENT_STEP_CONFIGS: DevelopmentStepConfig[] = [
  {
    key: "smReviewNotes",
    number: "1",
    icon: WorkHistoryIcon,
    commands: ["/sm *review-notes @docs/stories/1.0.md"],
    calloutVariants: ["accent"],
  },
  {
    key: "smDraftNextStory",
    number: "2",
    icon: BookEditIcon,
    commands: ["/sm *draft story 1.1"],
  },
  {
    key: "poValidateDraft",
    number: "3",
    icon: CheckListIcon,
    commands: ["/po *validate story @docs/stories/1.1.md"],
    calloutVariants: ["success"],
  },
  {
    key: "devImplementation",
    number: "4",
    icon: CodeCircleIcon,
    commands: ["/dev *develop-story @docs/stories/1.1.md"],
  },
  {
    key: "qaReview",
    number: "5",
    icon: Shield01Icon,
    commands: ["/qa *review @docs/stories/1.1.md"],
    calloutVariants: ["accent", "success"],
  },
  {
    key: "devFixes",
    number: "6",
    icon: Wrench01Icon,
    commands: ["/dev Fix the issues from QA review @docs/stories/1.1.md"],
    calloutVariants: ["warning"],
  },
  {
    key: "markDone",
    number: "7",
    icon: RepeatIcon,
    commands: [],
    calloutVariants: ["accent"],
  },
];

interface ToolOption {
  icon: IconDefinition;
  title: string;
  highlight: string;
  bullets: string[];
  note?: string;
}

type ToolOptionKey =
  keyof AgenticCodingWorkshopDictionary["resources"]["toolOptions"];

type ToolOptionConfig = {
  key: ToolOptionKey;
  icon: IconDefinition;
};

const TOOL_OPTION_CONFIGS: ToolOptionConfig[] = [
  { key: "claudeCode", icon: SparklesIcon },
  { key: "openCode", icon: ComputerTerminal01Icon },
  { key: "cursorWindsurf", icon: CursorPointer01Icon },
  { key: "geminiCli", icon: GalaxyIcon },
  { key: "droidCli", icon: Robot01Icon },
];

interface QuickStartContent {
  title: string;
  description: string;
  bullets: string[];
  link: {
    label: string;
    href: string;
  };
  commands: string[];
  note: string;
  calloutLabel: string;
}

const QUICK_START_CONFIG = {
  linkHref: "https://github.com/baisharg/Workshop-Vibe-Coding",
  commands: [
    "git clone https://github.com/baisharg/Workshop-Vibe-Coding",
    "cd Workshop-Vibe-Coding",
    "./setup.sh",
  ],
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

type ResourceCardKey =
  keyof AgenticCodingWorkshopDictionary["resources"]["learning"];

type ResourceCardConfig = {
  key: ResourceCardKey;
  icon: IconDefinition;
  linkHref: string;
};

const LEARNING_RESOURCE_CONFIGS: ResourceCardConfig[] = [
  {
    key: "bmadRepository",
    icon: FolderLibraryIcon,
    linkHref: "https://github.com/bmad-code-org/bmad-method/",
  },
  {
    key: "bmadMasterclass",
    icon: Video01Icon,
    linkHref: "https://youtu.be/LorEJPrALcg",
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

type PlanOptionKey =
  keyof AgenticCodingWorkshopDictionary["resources"]["plans"];

type PlanOptionConfig = {
  key: PlanOptionKey;
  icon: IconDefinition;
  linkHref: string;
};

const PLAN_OPTION_CONFIGS: PlanOptionConfig[] = [
  {
    key: "zaiPlan",
    icon: Wallet01Icon,
    linkHref: "https://z.ai/subscribe",
  },
  {
    key: "claudeMax",
    icon: FlashIcon,
    linkHref: "https://www.claude.com/product/claude-code",
  },
  {
    key: "githubStudent",
    icon: GraduationScrollIcon,
    linkHref: "https://education.github.com/pack",
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

type CliToolKey = keyof AgenticCodingWorkshopDictionary["resources"]["cli"];

type CliToolConfig = {
  key: CliToolKey;
  icon: IconDefinition;
  linkHref: string;
  install?: string;
};

const CLI_TOOL_CONFIGS: CliToolConfig[] = [
  {
    key: "openCode",
    icon: ComputerTerminal01Icon,
    linkHref: "https://opencode.ai/",
    install: "curl -fsSL https://opencode.ai/install | bash",
  },
  {
    key: "droidCli",
    icon: Robot01Icon,
    linkHref: "https://docs.factory.ai/cli/getting-started/overview",
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

type SetupResourceKey =
  keyof AgenticCodingWorkshopDictionary["resources"]["setup"];

type SetupResourceConfig = {
  key: SetupResourceKey;
  icon: IconDefinition;
  command?: string;
  linkHref?: string;
};

const SETUP_RESOURCE_CONFIGS: SetupResourceConfig[] = [
  {
    key: "installBmad",
    icon: Download01Icon,
    command: "npx bmad-method install",
  },
  {
    key: "recommendedMcps",
    icon: ToolsIcon,
    linkHref: "https://smithery.ai/",
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

type AgentKey = keyof AgenticCodingWorkshopDictionary["agents"];

type AgentConfig = {
  key: AgentKey;
  icon: IconDefinition;
  command: string;
};

const AGENT_CONFIGS: AgentConfig[] = [
  {
    key: "businessAnalyst",
    icon: Analytics02Icon,
    command: "/analyst *create-project-brief",
  },
  {
    key: "productManager",
    icon: ClipboardIcon,
    command: "/pm *create-prd",
  },
  {
    key: "architect",
    icon: Structure01Icon,
    command: "/architect *create-full-stack-architecture",
  },
  {
    key: "uxExpert",
    icon: WebDesign01Icon,
    command: "/ux-expert *create-front-end-spec",
  },
  {
    key: "productOwner",
    icon: CheckListIcon,
    command: "/po *shard-doc",
  },
  {
    key: "scrumMaster",
    icon: Flag03Icon,
    command: "/sm *draft",
  },
  {
    key: "developer",
    icon: CodeCircleIcon,
    command: "/dev *develop-story",
  },
  {
    key: "qa",
    icon: Shield01Icon,
    command: "/qa *review",
  },
];

const createNavItems = (
  nav: AgenticCodingWorkshopDictionary["nav"],
): NavItem[] =>
  NAV_ITEMS.map(({ labelKey, href }) => ({
    href,
    label: nav[labelKey],
  }));

const createProblemCards = (
  problem: AgenticCodingWorkshopDictionary["problem"],
): ProblemCard[] =>
  PROBLEM_CARD_CONFIGS.map(({ key, icon, sourceHref }) => {
    const content = problem.cards[key];
    return {
      icon,
      title: content.title,
      description: content.description,
      highlight: content.highlight,
      details: content.details,
      sourceLabel: content.sourceLabel,
      sourceHref,
    };
  });

const createSolutionCards = (
  solution: AgenticCodingWorkshopDictionary["solution"],
): SolutionCard[] =>
  SOLUTION_CARD_CONFIGS.map(({ key, icon }) => {
    const content = solution.cards[key];
    return {
      icon,
      title: content.title,
      description: content.description,
      outcome: content.outcome,
    };
  });

const createBmadReasonPoints = (
  solution: AgenticCodingWorkshopDictionary["solution"],
): ReasonPoint[] => BMAD_REASON_CONFIGS.map(({ key }) => solution.reasons[key]);

const createCommandSyntaxBlocks = (
  commands: AgenticCodingWorkshopDictionary["commands"],
): CommandSyntaxBlock[] =>
  COMMAND_SYNTAX_CONFIGS.map(({ key, commands: commandList }) => ({
    heading: commands.syntax.blocks[key].heading,
    commands: commandList,
  }));

const createPlanningSteps = (
  planning: AgenticCodingWorkshopDictionary["planning"],
): PlanningStep[] =>
  PLANNING_STEP_CONFIGS.map(
    ({ key, number, icon, commands, calloutVariant }) => {
      const content = planning.steps[key];
      return {
        number,
        icon,
        title: content.title,
        summary: content.summary,
        bullets: content.bullets,
        commands,
        callout:
          content.callout && calloutVariant
            ? { variant: calloutVariant, ...content.callout }
            : undefined,
      };
    },
  );

const createDevelopmentSteps = (
  development: AgenticCodingWorkshopDictionary["development"],
): DevelopmentStep[] =>
  DEVELOPMENT_STEP_CONFIGS.map(
    ({ key, number, icon, commands, calloutVariants }) => {
      const content = development.steps[key];
      const callouts = content.callouts?.map((callout, index) => ({
        variant: calloutVariants?.[index] ?? "info",
        ...callout,
      }));
      return {
        number,
        icon,
        title: content.title,
        summary: content.summary,
        bullets: content.bullets,
        commands,
        callouts,
      };
    },
  );

const createToolOptions = (
  toolOptions: AgenticCodingWorkshopDictionary["resources"]["toolOptions"],
): ToolOption[] =>
  TOOL_OPTION_CONFIGS.map(({ key, icon }) => {
    const content = toolOptions[key];
    return {
      icon,
      title: content.title,
      highlight: content.highlight,
      bullets: content.bullets,
      note: content.note,
    };
  });

const createQuickStart = (
  quickStart: AgenticCodingWorkshopDictionary["resources"]["quickStart"],
): QuickStartContent => ({
  title: quickStart.title,
  description: quickStart.description,
  bullets: quickStart.bullets,
  link: { label: quickStart.linkLabel, href: QUICK_START_CONFIG.linkHref },
  commands: QUICK_START_CONFIG.commands,
  note: quickStart.note,
  calloutLabel: quickStart.calloutLabel,
});

const createLearningResources = (
  learning: AgenticCodingWorkshopDictionary["resources"]["learning"],
): ResourceCard[] =>
  LEARNING_RESOURCE_CONFIGS.map(({ key, icon, linkHref }) => {
    const content = learning[key];
    return {
      icon,
      title: content.title,
      description: content.description,
      bullets: content.bullets,
      link: { label: content.linkLabel, href: linkHref },
    };
  });

const createPlanOptions = (
  plans: AgenticCodingWorkshopDictionary["resources"]["plans"],
): PlanOption[] =>
  PLAN_OPTION_CONFIGS.map(({ key, icon, linkHref }) => {
    const content = plans[key];
    return {
      icon,
      title: content.title,
      highlight: content.highlight,
      bullets: content.bullets,
      link: { label: content.linkLabel, href: linkHref },
    };
  });

const createCliTools = (
  cliTools: AgenticCodingWorkshopDictionary["resources"]["cli"],
): CliTool[] =>
  CLI_TOOL_CONFIGS.map(({ key, icon, linkHref, install }) => {
    const content = cliTools[key];
    return {
      icon,
      title: content.title,
      description: content.description,
      bullets: content.bullets,
      link: { label: content.linkLabel, href: linkHref },
      install,
      steps: content.steps,
      note: content.note,
    };
  });

const createSetupResources = (
  setup: AgenticCodingWorkshopDictionary["resources"]["setup"],
): SetupResource[] =>
  SETUP_RESOURCE_CONFIGS.map(({ key, icon, command, linkHref }) => {
    const content = setup[key];
    return {
      icon,
      title: content.title,
      description: content.description,
      commandLabel: content.commandLabel,
      command,
      bullets: content.bullets,
      link:
        linkHref && content.linkLabel
          ? {
              label: content.linkLabel,
              href: linkHref,
            }
          : undefined,
      note: content.note,
    };
  });

const createAgents = (
  agents: AgenticCodingWorkshopDictionary["agents"],
): AgentCard[] =>
  AGENT_CONFIGS.map(({ key, icon, command }) => {
    const content = agents[key];
    return {
      icon,
      name: content.name,
      role: content.role,
      command,
      description: content.description,
      artifacts: content.artifacts,
    };
  });

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const currentLocale = isAppLocale(locale)
    ? locale
    : (i18n.defaultLocale as AppLocale);
  const dict = await getDictionary(currentLocale);
  const t = dict.agenticCodingWorkshop as AgenticCodingWorkshopDictionary;
  const metadata = t.metadata;

  return {
    title: metadata.title,
    description: metadata.description,
    alternates: {
      canonical: `/agentic-coding-workshop`,
      languages: Object.fromEntries(
        i18n.locales.map((loc) => [loc, `/${loc}/agentic-coding-workshop`]),
      ),
    },
    openGraph: {
      title: metadata.openGraph.title,
      description: metadata.openGraph.description,
      url: `https://baish.com.ar/${currentLocale}/agentic-coding-workshop`,
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: metadata.twitter.title,
      description: metadata.twitter.description,
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
  const t = dict.agenticCodingWorkshop as AgenticCodingWorkshopDictionary;
  const hero = t.hero;
  const problem = t.problem;
  const solution = t.solution;
  const agentsSection = t.agentsSection;
  const commandsSection = t.commands;
  const planningSection = t.planning;
  const developmentSection = t.development;
  const resourcesSection = t.resources;
  const navItems = createNavItems(t.nav);
  const problemCards = createProblemCards(problem);
  const solutionCards = createSolutionCards(solution);
  const bmadReasonPoints = createBmadReasonPoints(solution);
  const commandSyntaxBlocks = createCommandSyntaxBlocks(commandsSection);
  const planningSteps = createPlanningSteps(planningSection);
  const developmentSteps = createDevelopmentSteps(developmentSection);
  const toolOptions = createToolOptions(resourcesSection.toolOptions);
  const quickStart = createQuickStart(resourcesSection.quickStart);
  const learningResources = createLearningResources(resourcesSection.learning);
  const planOptions = createPlanOptions(resourcesSection.plans);
  const cliTools = createCliTools(resourcesSection.cli);
  const setupResources = createSetupResources(resourcesSection.setup);
  const agents = createAgents(t.agents);
  const commandSwitchSteps = commandsSection.switch.steps;
  const commandTip = commandsSection.switch.tip;
  const planningOptionalAgents = planningSection.optionalAgents;
  const planningSummaryPoints = planningSection.summaryPoints;
  const developmentNotes = developmentSection.notes;
  const developmentAdvantages = developmentSection.advantagesPoints;

  return (
    <div className="relative z-10 min-h-screen bg-transparent text-slate-900">
      <div className="sticky top-24 z-20 mx-auto flex w-full max-w-6xl justify-center px-4 sm:px-6">
        <nav className="mt-8 flex w-full flex-wrap items-center justify-center gap-3 rounded-full border border-slate-200 bg-white/80 px-6 py-3 text-sm font-medium text-slate-600 shadow-lg shadow-slate-900/5 backdrop-blur">
          {navItems.map((item) => (
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
                    {t.breadcrumb.home}
                  </TransitionLink>
                  {" / "}
                  <span className="text-slate-500">{t.breadcrumb.current}</span>
                </div>
                <AnimatedTitle
                  text={hero.title}
                  slug="agentic-coding-workshop"
                  className="text-4xl font-semibold text-slate-900 sm:text-5xl"
                  as="h1"
                />
                <p className="text-lg text-slate-700">{hero.tagline}</p>
                <p className="text-base text-slate-600">{hero.eventDetails}</p>
                <p className="text-sm text-slate-500">{hero.note}</p>
              </div>

              <div className="w-full rounded-2xl border border-emerald-200 bg-emerald-50/80 p-5 text-slate-800 shadow-sm">
                <div className="flex items-start gap-3">
                  <span className="mt-1 inline-flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                    <HugeiconsIcon
                      icon={BubbleChatAddIcon}
                      size={22}
                      primaryColor="#047857"
                    />
                  </span>
                  <p className="text-base font-medium text-emerald-800">
                    {hero.whatsapp}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <a
                  href="#workshop-repo"
                  className="button-primary flex items-center gap-2 bg-emerald-500 text-white hover:bg-emerald-600"
                >
                  <HugeiconsIcon
                    icon={Rocket01Icon}
                    size={18}
                    primaryColor="#ffffff"
                  />
                  <span>{hero.buttons.startNow}</span>
                </a>
                <a
                  href="https://baish.com.ar"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="button-primary"
                >
                  {hero.buttons.baish}
                </a>
                <a
                  href="https://www.instagram.com/somos.yhat/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="button-primary"
                >
                  {hero.buttons.yHat}
                </a>
                <a
                  href="https://chat.whatsapp.com/IpVPWqa5gcM9ePJRgTMUPM"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="button-secondary flex items-center gap-2"
                >
                  <HugeiconsIcon
                    icon={BubbleChatAddIcon}
                    size={18}
                    primaryColor="var(--color-accent-primary)"
                  />
                  <span>{hero.buttons.joinWhatsapp}</span>
                </a>
                <a
                  href="#recursos"
                  className="button-secondary flex items-center gap-2"
                >
                  <HugeiconsIcon
                    icon={Books01Icon}
                    size={18}
                    primaryColor="var(--color-accent-primary)"
                  />
                  <span>{hero.buttons.viewResources}</span>
                </a>
              </div>
            </div>
          </section>
        </FadeInSection>

        <FadeInSection variant="slide-up" as="section" id="problema">
          <section className="space-y-10">
            <div className="space-y-4 text-center">
              <p className="text-sm uppercase tracking-[0.35em] text-[var(--color-accent-tertiary)]">
                {problem.eyebrow}
              </p>
              <h2 className="flex items-center justify-center gap-2 text-3xl font-semibold text-slate-900">
                <HugeiconsIcon
                  icon={AlertSquareIcon}
                  size={26}
                  primaryColor="var(--color-accent-primary)"
                />
                <span>{problem.title}</span>
              </h2>
              <p className="mx-auto max-w-2xl text-base text-slate-600">
                {problem.description}
              </p>
            </div>

            <div className="grid gap-6">
              {problemCards.map((card) => (
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
                      {problem.sourcePrefix}{" "}
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
                {solution.eyebrow}
              </p>
              <h2 className="flex items-center justify-center gap-2 text-3xl font-semibold text-slate-900">
                <HugeiconsIcon
                  icon={CheckListIcon}
                  size={26}
                  primaryColor="var(--color-accent-primary)"
                />
                <span>{solution.title}</span>
              </h2>
              <p className="mx-auto max-w-2xl text-base text-slate-700">
                {solution.description}
              </p>
              <p className="mx-auto max-w-2xl text-base text-slate-600">
                {solution.description2}
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {solutionCards.map((card) => (
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
                  <HugeiconsIcon
                    icon={BulbIcon}
                    size={24}
                    primaryColor="#A7F3D0"
                  />
                </span>
                <h3 className="text-xl font-semibold text-emerald-200">
                  {solution.calloutTitle}
                </h3>
              </div>
              <div className="mt-6 grid gap-6 md:grid-cols-3">
                {bmadReasonPoints.map(
                  (point: { title: string; description: string }) => (
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
                  ),
                )}
              </div>
            </div>
          </section>
        </FadeInSection>

        <FadeInSection variant="slide-up" delay={120} as="section" id="agentes">
          <section className="space-y-10">
            <div className="space-y-4 text-center">
              <p className="text-sm uppercase tracking-[0.35em] text-[var(--color-accent-tertiary)]">
                {agentsSection.eyebrow}
              </p>
              <h2 className="flex items-center justify-center gap-2 text-3xl font-semibold text-slate-900">
                <HugeiconsIcon
                  icon={UserGroupIcon}
                  size={26}
                  primaryColor="var(--color-accent-primary)"
                />
                <span>{agentsSection.title}</span>
              </h2>
              <p className="mx-auto max-w-2xl text-base text-slate-600">
                {agentsSection.description}
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {agents.map((agent) => (
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
                      {agentsSection.artifactsLabel}
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
                {commandsSection.eyebrow}
              </p>
              <h2 className="flex items-center justify-center gap-2 text-3xl font-semibold text-slate-900">
                <HugeiconsIcon
                  icon={CommandLineIcon}
                  size={26}
                  primaryColor="var(--color-accent-primary)"
                />
                <span>{commandsSection.title}</span>
              </h2>
              <p className="mx-auto max-w-2xl text-base text-slate-600">
                {commandsSection.description}
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
                    {commandsSection.syntax.title}
                  </h3>
                </div>
                <p className="mt-2 text-sm text-slate-600">
                  {commandsSection.syntax.description}
                </p>
                <div className="mt-6 space-y-4">
                  {commandSyntaxBlocks.map((block) => (
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
                    <HugeiconsIcon
                      icon={RepeatIcon}
                      size={22}
                      primaryColor="#047857"
                    />
                  </span>
                  <h3 className="text-xl font-semibold text-emerald-700">
                    {commandsSection.switch.title}
                  </h3>
                </div>
                <p className="mt-2 text-sm text-emerald-900/80">
                  {commandsSection.switch.description}
                </p>
                <ol className="mt-4 space-y-3 text-sm text-emerald-900/90">
                  {commandSwitchSteps.map((step, index) => (
                    <li key={step} className="flex gap-3">
                      <span className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-xs font-semibold text-white">
                        {index + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
                <p className="mt-6 rounded-2xl border border-emerald-200 bg-white/70 px-4 py-3 text-sm text-emerald-800">
                  <span className="font-semibold">{commandTip.prefix}</span>{" "}
                  {commandTip.beforeDocs} <code>docs/</code>{" "}
                  {commandTip.beforeExample}{" "}
                  <code>docs/epics/epic-2-dashboard.md</code>
                  {commandTip.afterExample}
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
                {planningSection.eyebrow}
              </p>
              <h2 className="flex items-center justify-center gap-2 text-3xl font-semibold text-slate-900">
                <HugeiconsIcon
                  icon={CompassIcon}
                  size={26}
                  primaryColor="var(--color-accent-primary)"
                />
                <span>{planningSection.title}</span>
              </h2>
              <p className="mx-auto max-w-2xl text-base text-slate-600">
                {planningSection.description}
              </p>
            </div>

            <div className="space-y-6">
              {planningSteps.map((step) => (
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
                  <HugeiconsIcon
                    icon={CheckListIcon}
                    size={20}
                    primaryColor="var(--color-accent-primary)"
                  />
                </span>
                <h3 className="text-base font-semibold text-slate-900">
                  {planningSection.optionalAgentsTitle}
                </h3>
              </div>
              <ul className="mt-3 space-y-2 text-sm text-slate-700">
                {planningOptionalAgents.map((item: string) => (
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
                  <HugeiconsIcon
                    icon={Target02Icon}
                    size={22}
                    primaryColor="#047857"
                  />
                </span>
                <h3 className="text-xl font-semibold text-emerald-700">
                  {planningSection.summaryTitle}
                </h3>
              </div>
              <ul className="mt-3 space-y-2 text-sm text-emerald-900/90">
                {planningSummaryPoints.map((point: string) => (
                  <li key={point}>
                    <span className="pr-2 text-emerald-500">✓</span>
                    {point}
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-sm font-medium text-amber-800">
                {planningSection.summaryNote}
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
                {developmentSection.eyebrow}
              </p>
              <h2 className="flex items-center justify-center gap-2 text-3xl font-semibold text-slate-900">
                <HugeiconsIcon
                  icon={RepeatIcon}
                  size={26}
                  primaryColor="var(--color-accent-primary)"
                />
                <span>{developmentSection.title}</span>
              </h2>
              <p className="mx-auto max-w-2xl text-base text-slate-600">
                {developmentSection.description}
              </p>
            </div>

            <div className="space-y-6">
              {developmentSteps.map((step) => (
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
                <HugeiconsIcon
                  icon={RepeatIcon}
                  size={20}
                  primaryColor="#A855F7"
                />
                <span>{developmentSection.loopReminder}</span>
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm">
              <div className="flex items-center gap-2 text-base font-semibold text-slate-900">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-accent-secondary)]/30 text-[var(--color-accent-primary)]">
                  <HugeiconsIcon
                    icon={CheckListIcon}
                    size={20}
                    primaryColor="var(--color-accent-primary)"
                  />
                </span>
                <h3 className="text-base font-semibold text-slate-900">
                  {developmentSection.notesTitle}
                </h3>
              </div>
              <ul className="mt-3 space-y-2 text-sm text-slate-700">
                {developmentNotes.map((note: string) => (
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
                  <HugeiconsIcon
                    icon={TickDouble02Icon}
                    size={22}
                    primaryColor="#047857"
                  />
                </span>
                <h3 className="text-xl font-semibold text-emerald-700">
                  {developmentSection.advantagesTitle}
                </h3>
              </div>
              <ul className="mt-3 space-y-2 text-sm text-emerald-900/90">
                {developmentAdvantages.map((point: string) => (
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
                {resourcesSection.eyebrow}
              </p>
              <h2 className="flex items-center justify-center gap-2 text-3xl font-semibold text-slate-900">
                <HugeiconsIcon
                  icon={LibraryIcon}
                  size={26}
                  primaryColor="var(--color-accent-primary)"
                />
                <span>{resourcesSection.title}</span>
              </h2>
              <p className="mx-auto max-w-2xl text-base text-slate-600">
                {resourcesSection.description}
              </p>
            </div>

            <div className="space-y-6 rounded-3xl border border-slate-200 bg-gradient-to-r from-[#EDE7FC] via-[#f5f5f5] to-[#A8C5FF2a] p-8 shadow-sm">
              <div className="flex items-center justify-center gap-2 text-xl font-semibold text-[var(--color-accent-primary)]">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-accent-secondary)]/30">
                  <HugeiconsIcon
                    icon={ToolsIcon}
                    size={22}
                    primaryColor="var(--color-accent-primary)"
                  />
                </span>
                <h3 className="text-xl font-semibold text-[var(--color-accent-primary)]">
                  {resourcesSection.toolingTitle}
                </h3>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {toolOptions.map((tool) => (
                  <article
                    key={tool.title}
                    className="flex h-full flex-col gap-3 rounded-2xl border border-white/60 bg-white/70 p-5 shadow-sm shadow-slate-900/5 backdrop-blur"
                  >
                    <div className="flex items-center gap-2">
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-accent-secondary)]/30 text-[var(--color-accent-primary)]">
                        <HugeiconsIcon
                          icon={tool.icon}
                          size={20}
                          primaryColor="var(--color-accent-primary)"
                        />
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
                  <HugeiconsIcon
                    icon={Rocket01Icon}
                    size={28}
                    primaryColor="#16A34A"
                  />
                </div>
                <div className="flex-1 space-y-4">
                  <h3 className="text-2xl font-semibold text-emerald-700">
                    {quickStart.title}
                  </h3>
                  <p className="text-sm text-emerald-900/80">
                    {quickStart.description}
                  </p>
                  <ul className="space-y-2 text-sm text-emerald-900/90">
                    {quickStart.bullets.map((bullet) => (
                      <li key={bullet}>
                        <span className="pr-2 text-emerald-500">✓</span>
                        {bullet}
                      </li>
                    ))}
                  </ul>
                  <a
                    className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-accent-primary)] underline-offset-4 hover:underline"
                    href={quickStart.link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {quickStart.link.label}
                    <span aria-hidden>↗</span>
                  </a>
                  <div className="rounded-2xl border border-emerald-200 bg-white/80 p-4 text-sm">
                    <p className="flex items-center gap-2 font-semibold text-emerald-700">
                      <HugeiconsIcon
                        icon={Rocket01Icon}
                        size={18}
                        primaryColor="#047857"
                      />
                      <span>{quickStart.calloutLabel}</span>
                    </p>
                    <div className="mt-3 space-y-2 font-mono text-[13px] text-slate-700">
                      {quickStart.commands.map((cmd) => (
                        <code
                          key={cmd}
                          className="block rounded-lg bg-slate-50 px-3 py-2"
                        >
                          {cmd}
                        </code>
                      ))}
                    </div>
                    <p className="mt-3 text-xs text-emerald-900/80">
                      {quickStart.note}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-center gap-2 text-xl font-semibold text-[var(--color-accent-primary)]">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-accent-secondary)]/30">
                  <HugeiconsIcon
                    icon={FolderLibraryIcon}
                    size={22}
                    primaryColor="var(--color-accent-primary)"
                  />
                </span>
                <h3 className="text-xl font-semibold text-[var(--color-accent-primary)]">
                  {resourcesSection.learningTitle}
                </h3>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {learningResources.map((resource) => (
                  <article
                    key={resource.title}
                    className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm shadow-slate-900/5"
                  >
                    <div className="flex items-center gap-2">
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-accent-secondary)]/30 text-[var(--color-accent-primary)]">
                        <HugeiconsIcon
                          icon={resource.icon}
                          size={20}
                          primaryColor="var(--color-accent-primary)"
                        />
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
                  <HugeiconsIcon
                    icon={Target02Icon}
                    size={22}
                    primaryColor="var(--color-accent-primary)"
                  />
                </span>
                <h3 className="text-xl font-semibold text-[var(--color-accent-primary)]">
                  {resourcesSection.plansTitle}
                </h3>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {planOptions.map((plan) => (
                  <article
                    key={plan.title}
                    className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm shadow-slate-900/5"
                  >
                    <div className="flex items-center gap-2">
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-accent-secondary)]/30 text-[var(--color-accent-primary)]">
                        <HugeiconsIcon
                          icon={plan.icon}
                          size={20}
                          primaryColor="var(--color-accent-primary)"
                        />
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
                  <HugeiconsIcon
                    icon={ComputerTerminal01Icon}
                    size={22}
                    primaryColor="var(--color-accent-primary)"
                  />
                </span>
                <h3 className="text-xl font-semibold text-[var(--color-accent-primary)]">
                  {resourcesSection.cliTitle}
                </h3>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {cliTools.map((tool) => (
                  <article
                    key={tool.title}
                    className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm shadow-slate-900/5"
                  >
                    <div className="flex items-center gap-2">
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-accent-secondary)]/30 text-[var(--color-accent-primary)]">
                        <HugeiconsIcon
                          icon={tool.icon}
                          size={20}
                          primaryColor="var(--color-accent-primary)"
                        />
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
                          {resourcesSection.cliInstallLabel}
                        </p>
                        <code className="block rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-[13px] text-slate-700">
                          {tool.install}
                        </code>
                      </div>
                    )}
                    {tool.steps && (
                      <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50/80 p-4 text-sm">
                        <p className="text-sm font-semibold text-slate-800">
                          {resourcesSection.cliSetupLabel}
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
                  <HugeiconsIcon
                    icon={ToolsIcon}
                    size={22}
                    primaryColor="var(--color-accent-primary)"
                  />
                </span>
                <h3 className="text-xl font-semibold text-[var(--color-accent-primary)]">
                  {resourcesSection.setupTitle}
                </h3>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {setupResources.map((item) => (
                  <article
                    key={item.title}
                    className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm shadow-slate-900/5"
                  >
                    <div className="flex items-center gap-2">
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-accent-secondary)]/30 text-[var(--color-accent-primary)]">
                        <HugeiconsIcon
                          icon={item.icon}
                          size={20}
                          primaryColor="var(--color-accent-primary)"
                        />
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
