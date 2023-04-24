import { useState } from "react";

export function useComponent() {
    const [refresh, setRefresh] = useState(false);
    return { forceRefresh: () => setRefresh(!refresh) };
}
