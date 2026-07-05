import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import WalletApp from "@/components/WalletApp";

export default async function WalletPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  return <WalletApp userName={session.user?.name ?? session.user?.email ?? "there"} />;
}
