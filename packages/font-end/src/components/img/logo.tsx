import React, { CSSProperties } from "react";
import { Image } from "antd";

export default function LogoIcon(props: { size?: number; style?: CSSProperties }) {
    const { size = 50 } = props;
    return (
        <Image
            src="/img/logo.webp"
            preview={false}
            style={{ borderRadius: "50%", width: size, padding: "5px", backgroundColor: "#fff", ...props.style }}
        />
    );
}
