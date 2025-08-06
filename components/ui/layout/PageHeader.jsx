"use client"
import * as Icons from "@/lib/config/icons"


export default function PageHeader({ title, description, icon, children }) {
   const IconComponent = icon ? Icons[icon] : null;


  return (
   <div className="mb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-xl md:text-3xl font-bold text-foreground">
            {IconComponent && <IconComponent className="text-primary size-8" />}
            {title}
          </h1>
          {description && <p className="text-muted-foreground">{description}</p>}
        </div>

        {children && <div>{children}</div>}
      </div>
    </div>
  );
}
