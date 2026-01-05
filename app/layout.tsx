import "./globals.css"

export const metadata = {
  title: "Cyberlab",
  description: "Bug bounty lab",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
