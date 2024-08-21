import React, { Suspense } from "react";
import { AppProvider } from "./app-provider";
import { unstable_noStore as noStore } from "next/cache";
import StyledComponentsRegistry from "../lib/registry";
import { AntdRegistry } from "@ant-design/nextjs-registry";

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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Roboto&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat&display=swap"
          rel="stylesheet"
        />
        <Suspense>
          <AntdRegistry>
            <StyledComponentsRegistry>
              <AppProvider backendUrl={backendUrl}>{children}</AppProvider>
            </StyledComponentsRegistry>
          </AntdRegistry>
        </Suspense>
      </body>
    </html>
  );
}
