import ClientLayout from "@/components/ClientLayout";

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <ClientLayout>
      {children}
    </ClientLayout>
  )
}
