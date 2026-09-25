import Image from "next/image";
import { TeamLinksRow } from "@/app/components/team-card";
import { renderWithBioLinks } from "@/app/utils/footnotes";
import { initials, type TeamMember } from "@/app/data/team";
import { BioDialog } from "./bio-dialog";

function MemberFace({ member }: { member: TeamMember }) {
  return (
    <div className="lab-member-photo">
      {member.photo ? (
        <Image
          src={member.photo}
          alt=""
          width={400}
          height={400}
          sizes="(max-width: 820px) 45vw, 220px"
        />
      ) : (
        <span aria-hidden="true">{initials(member.name)}</span>
      )}
    </div>
  );
}

/**
 * Team grid item: square photo, name and role. With a bio, the card opens it
 * in a dialog; without one it shows the person's links directly.
 */
export function MemberCard({
  member,
  role,
  bio,
  readBioLabel,
  closeLabel,
}: {
  member: TeamMember;
  role?: string;
  bio?: string;
  readBioLabel: string;
  closeLabel: string;
}) {
  const face = (
    <>
      <MemberFace member={member} />
      <span className="lab-member-name">{member.name}</span>
      {role && <span className="lab-member-role">{role}</span>}
    </>
  );

  if (!bio) {
    return (
      <li className="lab-member">
        {face}
        <TeamLinksRow links={member.links} className="mt-2" />
      </li>
    );
  }

  return (
    <li>
      <BioDialog
        card={face}
        label={member.name}
        openLabel={readBioLabel}
        closeLabel={closeLabel}
      >
        <div className="lab-dialog-head">
          <MemberFace member={member} />
          <div>
            <h3 className="lab-member-name">{member.name}</h3>
            {role && <p className="lab-member-role">{role}</p>}
            <TeamLinksRow links={member.links} gap="md" className="mt-3" />
          </div>
        </div>
        <p className="lab-dialog-bio">{renderWithBioLinks(bio)}</p>
      </BioDialog>
    </li>
  );
}
