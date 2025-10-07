import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { UsersList } from "@/components/users-list"

export default function UsersPage() {
  return (
    <DashboardShell>
      <DashboardHeader 
        heading="Users" 
        text="Manage system users, roles, and permissions for your football management system"
      />
      <UsersList />
    </DashboardShell>
  )
}