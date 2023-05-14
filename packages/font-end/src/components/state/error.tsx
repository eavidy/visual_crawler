import { AuthorizationError } from "@/errors/auth.err";
import React, { useEffect } from "react";
import { Navigate, useRouteError } from "react-router-dom";

export function ErrorPage(): JSX.Element {
    const error = useRouteError();
    console.error(error);
    useEffect(() => {}, [error]);
    if (error instanceof Error) {
        if (error instanceof AuthorizationError) return <Navigate to="/login" />;

        return (
            <div style={{ whiteSpace: "pre", padding: 24 }}>
                <div>{error.stack}</div>
            </div>
        );
    }
    return error as any;
}
