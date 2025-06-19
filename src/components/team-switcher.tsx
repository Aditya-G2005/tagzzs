"use client";

import * as React from "react";
import { ChevronsRight } from "lucide-react";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useRouter } from "next/navigation";

export function TeamSwitcher({}) {
  const router = useRouter();

  const handleRouteHome = () => {
    router.push("/");
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size="lg"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
          onClick={handleRouteHome}
        >
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-sidebar-primary-foreground">
            {/* <activeTeam.logo className="size-4" /> */}
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">TAGZS</span>
            {/* <span className="truncate text-xs">{activeTeam.plan}</span> */}
          </div>
          <ChevronsRight className="ml-auto" />
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
