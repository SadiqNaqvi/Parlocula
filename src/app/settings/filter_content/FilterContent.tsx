"use client";

import { Navbar } from "@components";
import ToggleButtonBar from "@components/ui/ToggleButtonBar";
import { toggleContentFiltering } from "@lib/helpers/mutations";
import { useEffect, useRef, useState } from "react";

const FilterContentTogglePage = ({ status }: { status: boolean }) => {

    const [checked, SetChecked] = useState(status);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)

    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                toggleContentFiltering();
            }
        }
    }, []);

    const handleToggle = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        SetChecked(!checked);

        timeoutRef.current = setTimeout(() => {
            toggleContentFiltering();
        }, 5000);
    }

    return (
        <>
            <Navbar />
            <ToggleButtonBar
                label="Filter Contents"
                checked={checked}
                onClick={handleToggle}
            />
            <p className="mt-4 text-center">
                {status ?

                    "By turning it off, explicit contents won't be filtered out."
                    :
                    "By turning it on, explicit contents in Posts, Comments and Threads will be filtered out before they reach you."
                }
            </p>
        </>
    )


}

export default FilterContentTogglePage;