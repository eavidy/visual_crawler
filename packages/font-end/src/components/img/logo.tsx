import React from "react";
import { Image, ImageProps } from "antd";

export default function LogoIcon(props: ImageProps & { size?: number }) {
    const { size = 50, style, ...imageProps } = props;
    return (
        <Image
            src="/img/logo.webp"
            preview={false}
            style={{ borderRadius: "50%", width: size, padding: "5px", backgroundColor: "#fff", ...style }}
            {...imageProps}
        />
    );
}
