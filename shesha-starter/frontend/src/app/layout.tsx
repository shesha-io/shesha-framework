import React from "react";
import { AppProvider } from "./app-provider";
import { unstable_noStore as noStore } from "next/cache";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { NavigationGuardProvider } from "next-navigation-guard";
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  noStore();
  const backendUrl = process.env.BACKEND_URL ?? "http://localhost:21021";

  return (
    <html lang="en">
      <body>
        <NavigationGuardProvider>
          <AntdRegistry>
            <AppProvider backendUrl={backendUrl}>{children}</AppProvider>
          </AntdRegistry>
        </NavigationGuardProvider>
      </body>
    </html>
  );
}
