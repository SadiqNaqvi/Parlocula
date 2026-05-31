
type JsonLdSchemas = {
    schema: Record<string, unknown>,
    breadcrumbs: Record<string, unknown>
}

const JsonLd = ({ schemas }: { schemas: JsonLdSchemas | null }) => {

    if (!schemas) return;

    const { breadcrumbs, schema } = schemas;
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={
                    {
                        __html: JSON.stringify(schema).replace(/</g, '\\u003c'),
                    }
                }
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={
                    {
                        __html: JSON.stringify(breadcrumbs).replace(/</g, '\\u003c'),
                    }
                }
            />
        </>
    )

}

export default JsonLd;