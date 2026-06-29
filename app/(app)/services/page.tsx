"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ServicesTable } from "./ServicesTable";
import { PackagesTable } from "./PackagesTable";
import { CreateServiceDialog } from "./CreateServiceDialog";
import { CreatePackageDialog } from "./CreatePackageDialog";

export default function ServicesPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Services & Packages
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage your operational blueprints and commercial packages.
        </p>
      </div>

      <Tabs defaultValue="services" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="services">Services (Blueprints)</TabsTrigger>
            <TabsTrigger value="packages">Packages (Commercial)</TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <CreateServiceDialog />
            <CreatePackageDialog />
          </div>
        </div>

        <TabsContent value="services" className="m-0">
          <ServicesTable />
        </TabsContent>
        <TabsContent value="packages" className="m-0">
          <PackagesTable />
        </TabsContent>
      </Tabs>
    </div>
  );
}
