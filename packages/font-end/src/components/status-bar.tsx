import React from "react";

const StatusColor = {
    finished: "#009e3c",
    processing: "#00B1EA",
    failed: "#EB3B16",
    default: "#828282",
};

type StatusBarProps = Pick<StatusInfoProps, "text" | "style">;
export function ProcessingStatus(props: StatusBarProps) {
    return <StatusInfo color={StatusColor.processing} text={props.text} style={props.style} />;
}
export function FinishedStatus(props: StatusBarProps) {
    return <StatusInfo color={StatusColor.finished} text={props.text} style={props.style} />;
}
export function FailedStatus(props: StatusBarProps) {
    return <StatusInfo color={StatusColor.failed} text={props.text} style={props.style} />;
}
export function DefaultStatus(props: StatusBarProps) {
    return <StatusInfo color={StatusColor.default} text={props.text} style={props.style} />;
}

interface StatusInfoProps {
    icon?: React.ReactNode;
    color?: string;
    text?: string;
    style?: React.CSSProperties;
}
export function StatusInfo(props: StatusInfoProps) {
    const { color, text } = props;

    return (
        <span>
            <flex
                style={{
                    padding: "2px 8px",
                    borderRadius: "8px",
                    color: "#FFF",
                    alignItems: "center",
                    background: color,
                    ...props.style,
                }}
            >
                {props.icon}
                {text}
            </flex>
        </span>
    );
}
