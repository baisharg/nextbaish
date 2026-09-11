import Image from "next/image";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  GithubIcon,
  Globe02Icon,
  GraduationScrollIcon,
  InstagramIcon,
  Linkedin01Icon,
} from "@hugeicons/core-free-icons";
import { initials, type TeamLinks, type TeamMember } from "@/app/data/team";

type Size = "sm" | "lg";

const PHOTO_PX: Record<Size, number> = { sm: 120, lg: 160 };

/**
 * Circular avatar. Photos are cropped to the circle with `object-cover`, so
 * cut-outs with transparent backgrounds and regular square portraits read the
 * same way. Falls back to initials when there is no photo.
 */
export function TeamPhoto({
  member,
  size = "sm",
}: {
  member: TeamMember;
  size?: Size;
}) {
  const px = PHOTO_PX[size];
  return (
    <div
      className="overflow-hidden rounded-full bg-[var(--brand-50)] ring-1 ring-[rgba(126,106,246,0.18)]"
      style={{ height: px, width: px }}
    >
      {member.photo ? (
        <Image
          src={member.photo}
          alt={member.name}
          width={500}
          height={500}
          sizes={`${px}px`}
          className="h-full w-full object-cover"
          loading="lazy"
          quality={90}
        />
      ) : (
        <div
          className="flex h-full w-full items-center justify-center bg-[var(--color-accent-primary)]"
          aria-hidden="true"
        >
          <span
            className={`font-semibold text-white ${size === "lg" ? "text-3xl" : "text-2xl"}`}
          >
            {initials(member.name)}
          </span>
        </div>
      )}
    </div>
  );
}

const LINK_ICONS: {
  key: keyof TeamLinks;
  label: string;
  icon: typeof GithubIcon;
}[] = [
  { key: "github", label: "GitHub", icon: GithubIcon },
  { key: "linkedin", label: "LinkedIn", icon: Linkedin01Icon },
  { key: "website", label: "Website", icon: Globe02Icon },
  { key: "scholar", label: "Google Scholar", icon: GraduationScrollIcon },
  { key: "instagram", label: "Instagram", icon: InstagramIcon },
];

export function TeamLinksRow({
  links,
  className = "",
}: {
  links?: TeamLinks;
  className?: string;
}) {
  if (!links) return null;
  const entries = LINK_ICONS.filter(({ key }) => links[key]);
  if (entries.length === 0) return null;
  return (
    <div className={`flex gap-2 ${className}`}>
      {entries.map(({ key, label, icon }) => (
        <a
          key={key}
          href={links[key]}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          className="text-slate-700 transition hover:opacity-70"
        >
          <HugeiconsIcon icon={icon} size={20} />
        </a>
      ))}
    </div>
  );
}

/**
 * Compact team card: avatar, name, role, links. Matches the existing card
 * style on the About page.
 */
export function TeamCard({
  member,
  role,
  badge,
}: {
  member: TeamMember;
  role?: string;
  /** Small pill shown under the role, e.g. "BAISH Labs". */
  badge?: string;
}) {
  return (
    <article className="card-glass relative overflow-hidden flex flex-col items-center p-4 text-center">
      <div className="relative flex flex-col items-center space-y-2">
        <TeamPhoto member={member} size="sm" />
        <div className="space-y-1">
          <h4 className="text-base font-semibold text-slate-900">
            {member.name}
          </h4>
          {role && (
            <p className="text-xs leading-snug text-slate-600">{role}</p>
          )}
          {badge && <span className="pill">{badge}</span>}
        </div>
        <TeamLinksRow links={member.links} />
      </div>
    </article>
  );
}

/**
 * Text-only card without a photo, used for advisors.
 */
export function TeamTextCard({
  member,
  role,
}: {
  member: TeamMember;
  role?: string;
}) {
  return (
    <article className="card-glass relative overflow-hidden flex flex-col gap-2 p-5">
      <h4 className="text-base font-semibold text-slate-900">{member.name}</h4>
      {role && <p className="text-sm leading-snug text-slate-600">{role}</p>}
      <TeamLinksRow links={member.links} className="mt-auto pt-2" />
    </article>
  );
}

/**
 * Wide card with a bio, used for the founding directors and the Head of Lab.
 */
export function TeamBioCard({
  member,
  role,
  bio,
}: {
  member: TeamMember;
  role?: string;
  bio: React.ReactNode;
}) {
  return (
    <article className="card-glass">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
        <div className="flex-shrink-0 mx-auto sm:mx-0">
          <TeamPhoto member={member} size="lg" />
        </div>
        <div className="flex flex-col gap-3 flex-1">
          <div>
            <h4 className="text-2xl font-semibold text-slate-900">
              {member.name}
            </h4>
            {role && <p className="text-sm text-slate-600 mt-1">{role}</p>}
          </div>
          <p className="text-sm leading-relaxed text-slate-700">{bio}</p>
          <TeamLinksRow links={member.links} className="gap-3" />
        </div>
      </div>
    </article>
  );
}
