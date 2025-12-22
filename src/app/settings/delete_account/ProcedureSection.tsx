import { BlogHeading1, BlogHeading3, BlogList, BlogSubSection } from "@components/blog";

const ProcedureSection = () => (
    <>
        <header>
            <BlogHeading1>Before we process your request…</BlogHeading1>
            <BlogSubSection>
                <p>Deleting your Parlocula account is a multi-step, irreversible process designed to protect users from accidental loss of data.</p>
            </BlogSubSection>
        </header>
        <section className="space-y-3">
            <p>When you submit a deletion request:</p>
            <ol>
                <BlogList>
                    <strong>Your account is immediately deactivated.</strong>
                    <p>Your profile becomes hidden, and nobody will see your activity, shelves, etc.</p>
                </BlogList>
                <BlogList>
                    <strong>Your account enters a 30-day countdown.</strong>
                    <p>During this time, your account is scheduled for permanent deletion.</p>
                </BlogList>
                <BlogList>
                    <strong>If you log back in within these 30 days,</strong>
                    <p>the deletion request is automatically cancelled, and your account is restored.</p>
                </BlogList>
                <BlogList>
                    <strong>After 30 days pass without login:</strong>
                    <p>Your profile and most of the associated personal data are permanently deleted.</p>
                </BlogList>
            </ol>
        </section>
        <section>
            <BlogHeading3>Important Reminder:</BlogHeading3>
            <BlogSubSection>
                <p>The following will NOT be deleted automatically:</p>
                <ul>
                    <BlogList>Posts you{"'"}ve made</BlogList>
                    <BlogList>Comments and replies</BlogList>
                    <BlogList>Reactions and likes you{"'"}ve added</BlogList>
                </ul>
                <p>These remain because they are part of the community threads.</p>
                <p>If you want them removed, you must delete them yourself before submitting the deletion request.</p>
            </BlogSubSection>
        </section>
    </>
);

export default ProcedureSection;