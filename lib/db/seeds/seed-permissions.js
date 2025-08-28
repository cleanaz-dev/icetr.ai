const { PrismaClient } = require("../../generated/prisma");

const prisma = new PrismaClient();

const permissions = [
  // User Management
  { name: "user.create" },
  { name: "user.read" },
  { name: "user.update" },
  { name: "user.delete" },
  { name: "user.invite" },

  // Lead Management
  { name: "lead.create" },
  { name: "lead.read" },
  { name: "lead.update" },
  { name: "lead.delete" },
  { name: "lead.assign" },

  // Campaign Management
  { name: "campaign.create" },
  { name: "campaign.read" },
  { name: "campaign.update" },
  { name: "campaign.delete" },

  // Training Management
  { name: "training.create" },
  { name: "training.read" },
  { name: "training.update" },
  { name: "training.delete" },
  { name: "training.access" },

  // Call Management
  { name: "call.create" },
  { name: "call.read" },
  { name: "call.update" },
  { name: "call.delete" },

  // Organization Management
  { name: "organization.read" },
  { name: "organization.update" },
  { name: "organization.settings" },

  // Reports & Analytics
  { name: "reports.view" },
  { name: "reports.export" },
  { name: "analytics.view" },

  // Team Management
  { name: "team.create" },
  { name: "team.read" },
  { name: "team.update" },
  { name: "team.delete" },
  { name: "team.assign" },

  // Document Management
  { name: "document.create" },
  { name: "document.read" },
  { name: "document.update" },
  { name: "document.delete" },

  // Integration Management
  { name: "integration.create" },
  { name: "integration.read" },
  { name: "integration.update" },
  { name: "integration.delete" },
  { name: "integration.public" },

  // API Access Management
  { name: "api.access" }, // General API access (for authenticated users)
  { name: "api.key.create" }, // Create new API keys
  { name: "api.key.read" }, // View existing API keys
  { name: "api.key.update" }, // Rotate or rename API keys
  { name: "api.key.delete" }, // Revoke or delete API keys
  { name: "api.usage.read" },

  // Billing Acesss
  { name: "billing.read" },
  { name: "billing.update" },
  { name: "billing.delete" },
  { name: "billing.access" },

  // Broacast Management
  { name: "broadcast.create" },
  { name: "broadcast.read" },
  { name: "broadcast.update" },
  { name: "broadcast.delete" },
  { name: "broadcast.access" },
];

const roles = [
  {
    type: "SuperAdmin",
    permissions: [
      "user.create",
      "user.read",
      "user.update",
      "user.delete",
      "user.invite",
      "lead.create",
      "lead.read",
      "lead.update",
      "lead.delete",
      "lead.assign",
      "campaign.create",
      "campaign.read",
      "campaign.update",
      "campaign.delete",
      "document.read",
      "document.create",
      "document.update",
      "document.delete",
      "training.create",
      "training.read",
      "training.update",
      "training.delete",
      "training.access",
      "call.create",
      "call.read",
      "call.update",
      "call.delete",
      "organization.read",
      "organization.update",
      "organization.settings",
      "reports.view",
      "reports.export",
      "analytics.view",
      "team.create",
      "team.read",
      "team.update",
      "team.delete",
      "team.assign",
      "integration.create",
      "integration.read",
      "integration.update",
      "integration.delete",
      "integration.public",
      "api.key.read",
      "api.key.create",
      "api.key.update",
      "api.key.delete",
      "api.usage.read",
      "api.access",
      "billing.read",
      "billing.update",
      "billing.delete",
      "billing.access",
      "broadcast.create",
      "broadcast.read",
      "broadcast.update",
      "broadcast.delete",
      "broadcast.access",
    ],
  },
  {
    type: "Admin",
    permissions: [
      "user.read",
      "user.update",
      "user.invite",
      "lead.create",
      "lead.read",
      "lead.update",
      "lead.delete",
      "lead.assign",
      "campaign.create",
      "campaign.read",
      "campaign.update",
      "campaign.delete",
      "document.read",
      "document.create",
      "document.update",
      "document.delete",
      "training.read",
      "training.update",
      "training.access",
      "call.create",
      "call.read",
      "call.update",
      "organization.read",
      "reports.view",
      "reports.export",
      "analytics.view",
      "team.read",
      "team.update",
      "team.assign",
      "integration.read",
      "integration.update",
      "integration.public",
      "api.key.read",
      "api.usage.read",
      "api.access",
      "broadcast.create",
      "broadcast.read",
      "broadcast.update",
      "broadcast.delete",
      "broadcast.access",
    ],
  },
  {
    type: "OrgManager",
    permissions: [
      "user.read",
      "lead.create",
      "lead.read",
      "lead.update",
      "lead.assign",
      "campaign.read",
      "campaign.update",
      "document.read",
      "document.create",
      "document.update",
      "training.read",
      "training.access",
      "call.create",
      "call.read",
      "call.update",
      "reports.view",
      "analytics.view",
      "team.read",
      "team.assign",
      "integration.public",
      "api.access",
      "api.usage.read",
      "broadcast.create",
      "broadcast.read",
      "broadcast.update",
      "broadcast.delete",
      "broadcast.access",
    ],
  },
  {
    type: "Agent",
    permissions: [
      "lead.read",
      "lead.update",
      "campaign.read",
      "document.read",
      "training.read",
      "training.access",
      "call.create",
      "call.read",
      "call.update",
      "integration.public",
      "broadcast.access",
      "broadcast.read",
    ],
  },
];

async function syncPermissions() {
  console.log("🔄 Synchronizing permissions...");

  // Get existing permissions
  const existingPermissions = await prisma.permission.findMany();
  const existingPermissionNames = new Set(
    existingPermissions.map((p) => p.name)
  );
  const requiredPermissionNames = new Set(permissions.map((p) => p.name));

  // Find permissions to create and warn about unused
  const toCreate = permissions.filter(
    (p) => !existingPermissionNames.has(p.name)
  );
  const unused = existingPermissions.filter(
    (p) => !requiredPermissionNames.has(p.name)
  );

  // Create new permissions
  if (toCreate.length > 0) {
    await Promise.all(
      toCreate.map((permission) =>
        prisma.permission.create({ data: permission })
      )
    );
    console.log(
      `✅ Created ${toCreate.length} new permissions: ${toCreate
        .map((p) => p.name)
        .join(", ")}`
    );
  }

  // Warn about unused permissions (don't delete them)
  if (unused.length > 0) {
    console.log(
      `⚠️  Found ${
        unused.length
      } permissions in DB not defined in file: ${unused
        .map((p) => p.name)
        .join(", ")}`
    );
    console.log(
      `   These permissions are kept but won't be assigned to any roles.`
    );
  }

  // Return all permissions map (including unused ones)
  const allPermissions = await prisma.permission.findMany();
  return new Map(allPermissions.map((p) => [p.name, p]));
}

async function syncRoles(permissionMap) {
  console.log("🔄 Synchronizing roles...");

  for (const roleData of roles) {
    // Get required permissions for this role
    const requiredPermissions = roleData.permissions
      .map((permName) => permissionMap.get(permName))
      .filter(Boolean);
    const requiredPermissionIDs = requiredPermissions.map((p) => p.id);

    // Find or create the role
    let role = await prisma.role.findFirst({
      where: { type: roleData.type },
    });

    if (!role) {
      // Create new role
      role = await prisma.role.create({
        data: {
          type: roleData.type,
          permissionIDs: requiredPermissionIDs,
        },
      });
      console.log(
        `✅ Created new role "${roleData.type}" with ${requiredPermissions.length} permissions`
      );
    } else {
      // Update existing role - completely replace permissions
      const currentPermissionIDs = new Set(role.permissionIDs);
      const newPermissionIDs = new Set(requiredPermissionIDs);

      // Check if there are any changes
      const hasChanges =
        currentPermissionIDs.size !== newPermissionIDs.size ||
        [...currentPermissionIDs].some((id) => !newPermissionIDs.has(id));

      if (hasChanges) {
        await prisma.role.update({
          where: { id: role.id },
          data: {
            permissionIDs: requiredPermissionIDs,
          },
        });

        const added = requiredPermissionIDs.filter(
          (id) => !currentPermissionIDs.has(id)
        );
        const removed = [...currentPermissionIDs].filter(
          (id) => !newPermissionIDs.has(id)
        );

        console.log(
          `🔄 Updated role "${roleData.type}":${
            added.length > 0 ? ` +${added.length} permissions` : ""
          }${removed.length > 0 ? ` -${removed.length} permissions` : ""}`
        );
      } else {
        console.log(`✅ Role "${roleData.type}" is already up to date`);
      }
    }

    // Update permission.roleIDs to maintain bidirectional relationship
    for (const permission of requiredPermissions) {
      const currentRoleIDs = new Set(permission.roleIDs);
      if (!currentRoleIDs.has(role.id)) {
        await prisma.permission.update({
          where: { id: permission.id },
          data: {
            roleIDs: {
              push: role.id,
            },
          },
        });
      }
    }
  }

  // Clean up orphaned role references in permissions
  const allRoles = await prisma.role.findMany();
  const validRoleIDs = new Set(allRoles.map((r) => r.id));

  const allPermissions = await prisma.permission.findMany();
  for (const permission of allPermissions) {
    const validRoleIDsForPermission = permission.roleIDs.filter((roleId) =>
      validRoleIDs.has(roleId)
    );
    const rolesWithThisPermission = allRoles
      .filter((role) => role.permissionIDs.includes(permission.id))
      .map((role) => role.id);

    const shouldHaveRoleIDs = [...new Set(rolesWithThisPermission)];

    // Update if there's a mismatch
    if (
      JSON.stringify(validRoleIDsForPermission.sort()) !==
      JSON.stringify(shouldHaveRoleIDs.sort())
    ) {
      await prisma.permission.update({
        where: { id: permission.id },
        data: {
          roleIDs: shouldHaveRoleIDs,
        },
      });
    }
  }
}

async function seedPermissionsAndRoles() {
  try {
    console.log("🌱 Starting permissions and roles synchronization...");

    // Sync permissions (create new, delete obsolete)
    const permissionMap = await syncPermissions();

    // Sync roles (create new, update existing with correct permissions)
    await syncRoles(permissionMap);

    // Final summary
    const finalPermissions = await prisma.permission.findMany();
    const finalRoles = await prisma.role.findMany();

    console.log("🎉 Synchronization completed successfully!");
    console.log(
      `📊 Final state: ${finalPermissions.length} permissions, ${finalRoles.length} roles`
    );
  } catch (error) {
    console.error("❌ Error synchronizing permissions and roles:", error);
  } finally {
    await prisma.$disconnect();
  }
}

seedPermissionsAndRoles();
