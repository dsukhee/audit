import { router } from "../trpc";
import { authRouter } from "./auth";
import { auditRouter } from "./audit";
import { organizationRouter } from "./organization";
import { checklistRouter } from "./checklist";
import { nonconformityRouter } from "./nonconformity";
import { riskRouter } from "./risk";

export const appRouter = router({
  auth: authRouter,
  audit: auditRouter,
  organization: organizationRouter,
  checklist: checklistRouter,
  nonconformity: nonconformityRouter,
  risk: riskRouter,
});

export type AppRouter = typeof appRouter;
