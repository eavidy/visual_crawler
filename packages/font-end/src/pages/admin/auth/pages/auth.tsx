import React from "react";
import { Outlet } from "react-router-dom";

export default function Auth() {
    return (
        <div>
            auth
            <Outlet />
        </div>
    );
}
