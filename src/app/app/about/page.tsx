import { Navbar } from "@components";
import { BlogFooter, BlogHeading1, BlogHeading2, BlogHeading3, BlogList, BlogSection, BlogSubSection } from "@components/blog";

const AppAboutPage = () => {

    return (
        <>
            <Navbar />

            <header>
                <BlogHeading1>About Parlocula</BlogHeading1>
                <BlogSubSection>
                    <BlogHeading2>What is Parlocula?</BlogHeading2>
                    <p>
                        Parlocula is a <strong>community-driven social media platform</strong> built for people who not just watch movies and shows — they feel them, analyze them and <strong>live</strong> them.
                    </p>
                    <p>The name comes from two beautiful ideas:</p>
                    <ul>
                        <BlogList><strong>“Parlo”</strong> - Italian for “I speak”</BlogList>
                        <BlogList><strong>cula”</strong> - from Spanish “película”, meaning “motion picture”</BlogList>
                    </ul>
                    <p>Together, Parlocula is <strong>{'"'}To speak about motion pictures.{'"'}</strong></p>
                    <p>And that is exactly what this place is.</p>
                    <p><strong>A home for taleons</strong> — the films, series, characters, artists, and stories that shape our lives.</p>
                </BlogSubSection>
            </header>

            <BlogSection>
                <BlogHeading2>Why Parlocula Exists?</BlogHeading2>
                <BlogSubSection>
                    <p>We built Parlocula because I share the same love you do — the love of watching movies and shows, and especially talking about them.</p>
                    <p>Other platforms are either too cluttered, too broad, or too disconnected.</p>
                    <p>Movies and shows aren{"'"}t just entertainment.</p>
                    <p>They{"'"}re emotional experiences. They{"'"}re memories. They{"'"}re conversation starters.</p>
                    <p>They deserve a dedicated home that feels clean, youthful, and community-first.</p>
                </BlogSubSection>
                <BlogSubSection>
                    <p>So Parlocula combines:</p>
                    <ul>
                        <BlogList>Wiki + Community + Shelves</BlogList>
                        <BlogList>All in one single, beautifully tailored cine-space.</BlogList>
                    </ul>
                </BlogSubSection>
            </BlogSection>

            <BlogSection>
                <BlogHeading2>What You Can Do on Parlocula</BlogHeading2>
                <p className="my-2">Below are the core features designed to make Parlocula the ultimate social home for cine-lovers.</p>

                <BlogSubSection>
                    <BlogHeading3>1. Taleons Wiki</BlogHeading3>
                    <p>A complete, searchable, beautifully structured wiki for:</p>
                    <ul>
                        <BlogList>Movies</BlogList>
                        <BlogList>Shows</BlogList>
                        <BlogList>Artists</BlogList>
                        <BlogList>Characters</BlogList>
                        <BlogList>Companies</BlogList>
                        <BlogList>Networks</BlogList>
                        <BlogList>Genres</BlogList>
                        <BlogList>Years</BlogList>
                        <BlogList>And more</BlogList>
                    </ul>
                    <p>Every taleon has its own dedicated wiki page with details, credits, ratings, genres, release years, related content, and <strong>threads created by the community</strong>.</p>
                    <p>Wiki pages are the starting point — from there, users dive into discussions, threads, and shelves.</p>
                </BlogSubSection>

                <BlogSubSection>
                    <BlogHeading3>2. Threads</BlogHeading3>
                    <p>Threads are dedicated discussion hubs created on topics like:</p>
                    <ul>
                        <BlogList>Specific movies and shows</BlogList>
                        <BlogList>Artists</BlogList>
                        <BlogList>Characters</BlogList>
                        <BlogList>Franchises</BlogList>
                        <BlogList>Fan theories</BlogList>
                        <BlogList>Analysis and breakdowns</BlogList>
                    </ul>
                    <p>Thread creators can assign <strong>moderators</strong> to maintain clean and friendly discussions, making each thread feel like a curated mini-community.</p>
                </BlogSubSection>

                <BlogSubSection>
                    <BlogHeading3>3. Posts</BlogHeading3>
                    <p>Every discussion starts with a post. Types of posts include:</p>

                    <BlogSubSection>
                        <p className="text-semibold">Text Based:</p>
                        <ul>
                            <BlogList>Discussions</BlogList>
                            <BlogList>Questions</BlogList>
                            <BlogList>Jokes / Roasts</BlogList>
                            <BlogList>Facts & Information</BlogList>
                            <BlogList>Theories & Speculations</BlogList>
                        </ul>
                    </BlogSubSection>

                    <BlogSubSection>
                        <p className="text-semibold">Frame Based:</p>
                        <ul>
                            <BlogList>Images like Wallpapers, etc.</BlogList>
                            <BlogList>Videos like Movie Clips, etc.</BlogList>
                        </ul>
                    </BlogSubSection>

                    <BlogSubSection>
                        <p className="text-semibold">Additional features:</p>
                        <ul>
                            <BlogList>NSFW & Spoiler tagging</BlogList>
                            <BlogList>Age-appropriate content control</BlogList>
                            <BlogList>Reactions & comments</BlogList>
                            <BlogList>Clean spoiler-safe and NSFW-safe viewing</BlogList>
                            <BlogList>Automatic filtering for under-aged users</BlogList>
                        </ul>
                    </BlogSubSection>

                    <p>Posts feel expressive, interactive, and tailored for cine culture.</p>
                </BlogSubSection>

                <BlogSubSection>
                    <BlogHeading3>4. Comments & Replies</BlogHeading3>
                    <p>Users can comment directly on posts or reply to other comments.</p>
                    <ul>
                        <BlogList>Like comments</BlogList>
                        <BlogList>Tag comments as Spoiler or NSFW</BlogList>
                        <BlogList>Clean spoiler-safe hiding system</BlogList>
                        <BlogList>Easy conversation tracking</BlogList>
                    </ul>
                    <p>The comment system makes discussions feel alive and organized.</p>
                </BlogSubSection>

                <BlogSubSection>
                    <BlogHeading3>5. Shelves</BlogHeading3>
                    <p>Shelves allow users to collect, organize, and share taleons.</p>
                    <p>They{`'`}re your personal movie diary — refined and social.</p>

                    <BlogSubSection>
                        <p>Every user gets three built-in shelves:</p>
                        <ul>
                            <BlogList>Favorites - Taleons you love</BlogList>
                            <BlogList>Watched - Your watch history</BlogList>
                            <BlogList>Recommended - To share suggestions with others</BlogList>
                        </ul>
                    </BlogSubSection>

                    <BlogSubSection>
                        <p>Plus, users can create custom shelves with:</p>
                        <ul>
                            <BlogList>Private or Public visibility</BlogList>
                            <BlogList>Collaborators chosen from followers</BlogList>
                            <BlogList>Folder-like organization</BlogList>
                            <BlogList>Shareable collections</BlogList>
                        </ul>
                    </BlogSubSection>

                    <p>Shelves become a beautiful reflection of your journey with cinema.</p>
                </BlogSubSection>

                <BlogSubSection>
                    <BlogHeading3>6. Real-Time Experience</BlogHeading3>
                    <p>Parlocula feels alive with:</p>
                    <ul>
                        <BlogList>Real-time chatting</BlogList>
                        <BlogList>Instant notifications</BlogList>
                        <BlogList>Push notifications for everything important</BlogList>
                        <BlogList>Typing indicators, online status, and quick messaging tools</BlogList>
                    </ul>
                    <p>It{"'"}s social, dynamic, and fast — not another static app.</p>
                </BlogSubSection>
            </BlogSection>

            <BlogSection>
                <BlogHeading2>The Heart of Parlocula</BlogHeading2>
                <BlogSubSection>
                    <p>At its core, Parlocula is a community. A place where people who love movies and shows can:</p>
                    <ul>
                        <BlogList>Express themselves</BlogList>
                        <BlogList>Learn from each other</BlogList>
                        <BlogList>Share stories</BlogList>
                        <BlogList>Discover new favorites</BlogList>
                        <BlogList>Celebrate characters, artists, and cinematic universes</BlogList>
                        <BlogList>And connect with people who feel the same way</BlogList>
                    </ul>
                </BlogSubSection>
                <p>Friendly. Passionate. Youth-driven. Built by us, used by us.</p>
            </BlogSection>

            <BlogFooter />
        </>
    )

}

export default AppAboutPage;