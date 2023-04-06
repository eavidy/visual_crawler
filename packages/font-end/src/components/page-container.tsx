import React from "react";

export function PageContainer(
    props: React.PropsWithChildren<{ style?: React.CSSProperties; contentStyle?: React.CSSProperties }>
) {
    return (
        <div
            style={{
                background: "#F6F7F9",
                padding: "24px",
                width: "100%",
                height: "100%",
                minWidth: "1200px",
                minHeight: 700,
                ...props.style,
            }}
        >
            <div
                style={{
                    border: "1px #E8E8EA solid",
                    borderRadius: "6px",
                    height: "100%",
                    background: "#FFF",
                    ...props.contentStyle,
                }}
            >
                {props.children}
            </div>
        </div>
    );
}
