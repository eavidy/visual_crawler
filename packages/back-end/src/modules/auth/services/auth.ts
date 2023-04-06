export interface UserBaseInfo {
    password: string;
    name: string;

    groupIds?: string[];
    roleIds?: string[];
    permissions?: KeyType[];
}

export interface Authenticatable {
    hasPermission(permission: KeyType): boolean;
}

export class User implements Authenticatable {
    private permission: Set<KeyType>;
    constructor(readonly id: string, info: UserBaseInfo) {
        this.permission = new Set(info.permissions);
        this.name = info.name;
        this.password = info.password;
        // this.role = new Role(info.roleIds);
    }
    hasPermission(permission: KeyType): boolean {
        let has = this.permission.has(permission);
        if (!has && this.role) has = this.role.hasPermission(permission);
        return has;
    }
    readonly password: string;
    readonly name: string;
    readonly role?: Role;
    // readonly group?: UserGroup;
}

type KeyType = string | number;
export class Role implements Authenticatable {
    static addRole() {}
    static removeRole() {}
    static updateRole() {}
    static getRole() {}
    private readonly permissions: Set<KeyType>;
    constructor(permissions: KeyType[]) {
        this.permissions = new Set(permissions);
    }
    addPermissions(...permissions: KeyType[]) {
        for (const permission of permissions) {
            this.permissions.add(permission);
        }
    }
    removePermissions(...permissions: KeyType[]) {
        for (const permission of permissions) {
            this.permissions.delete(permission);
        }
    }
    hasPermission(permission: KeyType): boolean {
        return this.permissions.has(permission);
    }
}
