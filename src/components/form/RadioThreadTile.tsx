import { CheckBoxIcon } from "@assets/Icons";
import { getInternalPoster } from "@lib/utils";
import { MereThread } from "@type/internal";
import Image from "next/image";
import { useFormContext } from "react-hook-form";

const posterInfo = { aspect_ratio: "1", height: "50", width: "50" }

const RadioThreadTile = ({ _id, poster, name, htmlName }: Omit<MereThread, "description"> & { htmlName: string }) => {

    const { register, formState: { isSubmitting } } = useFormContext();

    return (
        <li className="block">
            <label htmlFor={htmlName} className="group flex p-2 rounded-md border-gray40 bg-gray30 checked:border-(--secondary)">
                <Image height={50} width={50} alt={`Poster of thread ${name}`} loading="lazy" src={getInternalPoster({ path: poster, options: posterInfo })} />
                <h3 className="ml-2">{name}</h3>
                <input {...register(htmlName)} className="sr-only" value={_id} disabled={isSubmitting} type="checkbox" id={_id} />
                <div>
                    <span><CheckBoxIcon /></span>
                    <span><Check /></span>
                </div>
            </label>
        </li>
    )
}

export default RadioThreadTile;