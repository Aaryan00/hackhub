// Hand-written to match supabase/migrations. Regenerate anytime with:
//   supabase gen types typescript --project-id <ref> > src/lib/database.types.ts

export type ExperienceLevel = "student" | "junior" | "mid" | "senior" | "lead";
export type TrustTier = "bronze" | "silver" | "gold";
export type HackathonMode = "online" | "offline" | "hybrid";
export type Difficulty = "beginner" | "intermediate" | "advanced";
export type TeamStatus =
  | "looking_for_members"
  | "building"
  | "submitted"
  | "winner"
  | "closed";
export type TeamMemberRole = "admin" | "member";
export type JoinRequestStatus = "pending" | "approved" | "rejected";

type ProfileRow = {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  location: string | null;
  timezone: string | null;
  company: string | null;
  college: string | null;
  experience_level: ExperienceLevel | null;
  github_url: string | null;
  linkedin_url: string | null;
  portfolio_url: string | null;
  resume_url: string | null;
  languages: string[];
  linkedin_verified: boolean;
  github_verified: boolean;
  trust_tier: TrustTier | null;
  platform_score: number;
  onboarded: boolean;
  created_at: string;
  updated_at: string;
};

type SkillRow = {
  id: string;
  name: string;
  slug: string;
  category: string;
};

type HackathonRow = {
  id: string;
  name: string;
  organizer: string | null;
  description: string | null;
  prize_pool: string | null;
  registration_deadline: string | null;
  start_date: string | null;
  end_date: string | null;
  theme: string | null;
  mode: HackathonMode;
  min_team_size: number;
  max_team_size: number;
  technologies: string[];
  difficulty: Difficulty;
  registration_link: string | null;
  banner_url: string | null;
  location: string | null;
  is_weekend: boolean;
  created_by: string | null;
  created_at: string;
};

type TeamRow = {
  id: string;
  name: string;
  logo_url: string | null;
  description: string | null;
  skills_needed: string[];
  hackathon_id: string | null;
  admin_id: string;
  status: TeamStatus;
  max_members: number;
  created_at: string;
  updated_at: string;
};

type TeamMemberRow = {
  team_id: string;
  profile_id: string;
  role: TeamMemberRole;
  joined_at: string;
};

type JoinRequestRow = {
  id: string;
  team_id: string;
  profile_id: string;
  message: string | null;
  status: JoinRequestStatus;
  created_at: string;
};

type Table<Row, Insert, Update> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      profiles: Table<
        ProfileRow,
        Partial<ProfileRow> & { id: string },
        Partial<ProfileRow>
      >;
      skills: Table<SkillRow, Omit<SkillRow, "id">, Partial<SkillRow>>;
      profile_skills: Table<
        { profile_id: string; skill_id: string },
        { profile_id: string; skill_id: string },
        { profile_id?: string; skill_id?: string }
      >;
      hackathons: Table<
        HackathonRow,
        Partial<HackathonRow> & { name: string },
        Partial<HackathonRow>
      >;
      hackathon_saves: Table<
        { profile_id: string; hackathon_id: string; created_at: string },
        { profile_id: string; hackathon_id: string },
        { profile_id?: string; hackathon_id?: string }
      >;
      teams: Table<
        TeamRow,
        Partial<TeamRow> & { name: string; admin_id: string },
        Partial<TeamRow>
      >;
      team_members: Table<
        TeamMemberRow,
        Partial<TeamMemberRow> & { team_id: string; profile_id: string },
        Partial<TeamMemberRow>
      >;
      team_join_requests: Table<
        JoinRequestRow,
        Partial<JoinRequestRow> & { team_id: string; profile_id: string },
        Partial<JoinRequestRow>
      >;
    };
    Views: Record<string, never>;
    Functions: {
      is_team_member: {
        Args: { _team_id: string };
        Returns: boolean;
      };
      is_team_admin: {
        Args: { _team_id: string };
        Returns: boolean;
      };
    };
    Enums: {
      experience_level: ExperienceLevel;
      trust_tier: TrustTier;
      hackathon_mode: HackathonMode;
      difficulty: Difficulty;
      team_status: TeamStatus;
      team_member_role: TeamMemberRole;
      join_request_status: JoinRequestStatus;
    };
  };
};

// Convenience row aliases used across the app.
export type Profile = ProfileRow;
export type Skill = SkillRow;
export type Hackathon = HackathonRow;
export type Team = TeamRow;
export type TeamMember = TeamMemberRow;
export type JoinRequest = JoinRequestRow;
