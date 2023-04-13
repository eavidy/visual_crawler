export namespace ApiReq {
    interface UserInfo {
        name: string;
        oldPwd: string;
        newPwd: string;
        pwdConfirm: string;
    }
    interface UpdateUserInfo {
        id: string;
        name?: string;
        pwd?: {
            old: string;
            new: string;
        };
    }
    interface CreateUser {
        id: string;
        name?: string;
        pwd: string;
    }
}
export namespace ApiRes {
    interface GetUserList {
        _id: string;
        name: string;
    }
}
