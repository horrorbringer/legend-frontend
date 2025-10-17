import DashboardLayout from '@/components/customer/DashboardLayout'
import React from 'react'

export default function CustomerDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLayout>{children}</DashboardLayout>
  )
}
