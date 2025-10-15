import ClientLayout from "@/components/ClientLayout";

export default function ShowTimeLayout({children}: {children: React.ReactNode}) {
  return (
    <ClientLayout>
        {children}
    </ClientLayout>
  )
}
