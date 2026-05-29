import { connectDB } from "@/lib/db";
import { secureJsonResponse } from "@/lib/api-utils";
import { requireAdmin } from "@/lib/api-guard";
import {
  buildAdminUserFilter,
  buildAdminUserSort,
  toAdminUserListItem,
  type AdminUserFilter,
  type AdminUserSort,
} from "@/lib/admin-users";
import { User } from "@/models/User";

export async function GET(request: Request) {
  const session = await requireAdmin();
  if (session instanceof Response) return session;

  const { searchParams } = new URL(request.url);
  const sort = (searchParams.get("sort") || "newest") as AdminUserSort;
  const filter = (searchParams.get("filter") || "all") as AdminUserFilter;

  await connectDB();

  const users = await User.find(buildAdminUserFilter(filter))
    .sort(buildAdminUserSort(sort))
    .limit(500);

  return secureJsonResponse({
    users: users.map(toAdminUserListItem),
    sort,
    filter,
  });
}
