"use client";

import { PortalLayout } from "@shesha-io/pd-publicportal";
import React from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <PortalLayout>{children}</PortalLayout>;
}
