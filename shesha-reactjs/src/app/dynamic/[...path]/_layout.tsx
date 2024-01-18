"use client";

import { MainLayout } from "@/components";
import React from "react";

export default function Layout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <MainLayout>{children}</MainLayout>;
}