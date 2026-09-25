export type Gender = "M" | "F";
export type Skill = "Elite" | "Intermediate" | "Beginner";
export type Role = "Handler" | "Cutter" | "All-arounder";

export type Player = {
  id: string;
  name: string;
  gender: Gender;
  skill: Skill;
  role: Role;
  years: number;
  /** 1-10 self/captain rated attributes */
  throwing: number;
  speed: number;
  defense: number;
  stamina: number;
  captain?: boolean;
  spiritCaptain?: boolean;
};

const mk = (
  name: string,
  gender: Gender,
  skill: Skill,
  role: Role,
  years: number,
  throwing: number,
  speed: number,
  defense: number,
  stamina: number,
  extra: Partial<Player> = {},
): Player => ({
  id: name.toLowerCase().replace(/[^a-z]+/g, "-"),
  name,
  gender,
  skill,
  role,
  years,
  throwing,
  speed,
  defense,
  stamina,
  ...extra,
});

/**
 * Starting roster for KM Ultimate (25 players final).
 * Skill / role / years / attribute ratings are editable in the app —
 * these are starting estimates only.
 */
export const INITIAL_ROSTER: Player[] = [
  mk("Bienvenido Fajardo", "M", "Intermediate", "Cutter", 3, 6, 7, 6, 6),
  mk("Carl Vincent Delos Santos", "M", "Elite", "Handler", 6, 9, 7, 7, 8),
  mk("Dash Salera", "M", "Elite", "All-arounder", 7, 8, 8, 8, 8),
  mk("Francis Marticio", "M", "Intermediate", "Cutter", 3, 6, 7, 6, 7),
  mk("Gab Mempin", "M", "Intermediate", "Handler", 4, 7, 6, 6, 6),
  mk("Gelo Suarez", "M", "Intermediate", "All-arounder", 4, 7, 7, 7, 7),
  mk("Ibarra Glenn Medina", "M", "Elite", "Handler", 6, 9, 7, 7, 7),
  mk("Jarred Ivan Cachuela Leysa", "M", "Elite", "All-arounder", 8, 9, 8, 8, 9, {
    captain: true,
  }),
  mk("Kenneth Arandela", "M", "Intermediate", "Cutter", 3, 6, 7, 7, 6),
  mk("Matthew Tuazon", "M", "Beginner", "Cutter", 1, 4, 6, 5, 6),
  mk("Mike Pastor", "M", "Intermediate", "Cutter", 4, 6, 8, 7, 7),
  mk("Teofilo Clarens Villanueva", "M", "Intermediate", "All-arounder", 4, 7, 7, 7, 7),
  mk("Teofilo Jarien Villanueva", "M", "Beginner", "Cutter", 2, 5, 6, 5, 6),
  mk("Teofilo Vicente Villanueva", "M", "Intermediate", "Handler", 5, 7, 6, 6, 7),
  mk("Ulrich Griinke", "M", "Beginner", "Cutter", 1, 4, 6, 5, 5),

  mk("Aaliyah Gutierrez", "F", "Intermediate", "Cutter", 3, 6, 7, 6, 6),
  mk("Coleen Escalada", "F", "Intermediate", "All-arounder", 4, 7, 7, 7, 7),
  mk("Faith Remogat", "F", "Beginner", "Cutter", 1, 4, 6, 5, 5),
  mk("Katzen Oliva", "F", "Intermediate", "Handler", 4, 7, 6, 6, 6),
  mk("Lucille Sofia Catalan", "F", "Beginner", "Handler", 2, 5, 5, 5, 5),
  mk("Marion Abella", "F", "Elite", "Cutter", 5, 7, 8, 8, 8),
  mk("Minea Angeles", "F", "Beginner", "Cutter", 1, 4, 6, 5, 5),
  mk("Renela Gonzales", "F", "Intermediate", "Handler", 4, 7, 6, 7, 6),
  mk("Sophia Genio", "F", "Beginner", "Cutter", 2, 5, 6, 5, 6),
  mk("Yliojah Baysac", "F", "Elite", "All-arounder", 5, 8, 7, 8, 7, {
    spiritCaptain: true,
  }),
];

export const SKILLS: Skill[] = ["Elite", "Intermediate", "Beginner"];
export const ROLES: Role[] = ["Handler", "Cutter", "All-arounder"];
export const GENDERS: Gender[] = ["M", "F"];
