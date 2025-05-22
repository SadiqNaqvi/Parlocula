"use client";

import { CheckBoxIcon, EmptyBoxIcon, XmarkIcon } from "@assets/Icons";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react"

const mood = ["happy", "sad", "laugh", "cry", "loved", "blush", "loveit", "likeit", "burned", "fired", "knocked", "emo", "crazy", "proud", "confused", "sick", "sleepy", "satisfied", "dissapointed", "celebrate", "neutral", "weird", "shocked", "scared", "angry", "devil", "shy", "disgust", "broken", "fixed"]
const moodToEmoji: Record<string, string> = {
    "loveit": "https://em-content.zobj.net/source/animated-noto-color-emoji/356/smiling-face-with-heart-eyes_1f60d.gif",
    "likeit": "https://em-content.zobj.net/source/animated-noto-color-emoji/356/star-struck_1f929.gif",
    "burned": "https://em-content.zobj.net/source/animated-noto-color-emoji/356/heart-on-fire_2764-fe0f-200d-1f525.gif",
    "fired": "https://em-content.zobj.net/source/animated-noto-color-emoji/356/fire_1f525.gif",
    "knocked": "https://em-content.zobj.net/source/animated-noto-color-emoji/356/dizzy-face_1f635.gif",
    "emo": "https://em-content.zobj.net/source/animated-noto-color-emoji/356/face-holding-back-tears_1f979.gif",
    "happy": "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f600.svg",
    "sad": "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f615.svg",
    "laugh": "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f923.svg",
    "cry": "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f62d.svg",
    "loved": "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f970.svg",
    "blush": "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f92d.svg",
    "crazy": "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f92a.svg",
    "proud": "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1fae1.svg",
    "confused": "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f914.svg",
    "sick": "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f912.svg",
    "sleepy": "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f971.svg",
    "satisfied": "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f60c.svg",
    "dissapointed": "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f612.svg",
    "celebrate": "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f973.svg",
    "neutral": "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f610.svg",
    "weird": "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f974.svg",
    "shocked": "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f92f.svg",
    "scared": "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f628.svg",
    "angry": "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f624.svg",
    "devil": "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f608.svg",
    "shy": "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f648.svg",
    "disgust": "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f92e.svg",
    "broken": "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f494.svg",
    "fixed": "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/2764-fe0f-200d-1fa79.svg",
}
const accentColor = ["red", "red", "orangered", "darkorange", "orange", "yellow", "#c5cd32", "yellowgreen", "limegreen", "lime"]


export default function RatingComponent({ title }: { title: string }) {

    const router = useRouter();
    const pathname = usePathname();
    const [vote, setVote] = useState(2);

    const listOfQuestions = [
        { label: `Does it contains sensetive content or graphic violence?` },
        { label: `Does it contains explicit content or nudity?` },
        { label: `Does it contains vulgar language or profanity?` },
        { label: `Do you think one should watch it with family?` },
    ]

    return (
        <div className="absolute inset-0 top-0 z-[2] backdrop-brightness-50 backdrop-blur-md flex flex-cntr-all">
            <button className="absolute iconBtn top-2 right-2" onClick={() => router.push(`${pathname.replace('?action=rate', '')}`, { scroll: false })}>
                <XmarkIcon className="text-zinc-200" />
            </button>
            <div className="bg-[var(--primary)] p-8 rounded-lg w-[80%] h-[90%] overflow-y-auto">
                <section className="border-b p-6 border-[var(--gray30)]">
                    <h2 className="text-2xl text-center">Since you've already watched {title}</h2>
                    <p className="text-sm text-zinc-500 text-center">Help others decide if this should become their next POPCORN PARAGON. </p>
                </section>
                <section className="py-8 space-y-6">
                    <div>
                        <h2 className="text-3xl font-medium uppercase mb-2 text-center">Rating</h2>
                        <p className="text-center text-zinc-500">How likely do you think {title} is a must watch?</p>
                    </div>
                    <div className="w-4/5 mx-auto">
                        <input type="range" value={vote} onChange={(e) => setVote(parseInt(e.target.value))} step="1" min="0" max="9" className="p-0 w-full h-2 rounded-lg appearance-none cursor-pointer bg-no-repeat" style={{ accentColor: accentColor[vote], backgroundSize: `${vote * 11}%`, backgroundImage: `linear-gradient(to right, transparent, ${accentColor[vote]})` }} />
                        <ul className="flex flex-cntr-between">
                            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(el => (
                                <li className="text-sm text-zinc-500 cursor-pointer" onClick={() => setVote(el)}>{el}</li>
                            ))}
                        </ul>
                    </div>
                </section>
                <section className="py-8 space-y-6">
                    <div>
                        <h2 className="text-3xl font-medium text-center uppercase mb-3">Reaction</h2>
                        <p className="text-center text-zinc-500">Which emote suits best for your reaction about {title}?</p>
                    </div>
                    <ul className="grid grid-rows-4 grid-cols-6 gap-4 mx-auto h-fit w-fit">
                        {mood.map((el: string) => (
                            <li key={el} className="cursor-pointer transition-transform w-fit p-2 rounded-md hover:bg-[var(--gray20)] hover:scale-125">
                                <img src={moodToEmoji[el]} className="h-10 aspect-square" />
                            </li>
                        ))}
                    </ul>
                </section>
                <section className="py-8 space-y-6">
                    <div>
                        <h2 className="text-3xl font-medium text-center uppercase mb-3">Review</h2>
                        <p className="text-center text-zinc-500">Describe your experience while watching it (optional)</p>
                    </div>
                    <div className="relative w-[60%] max-w-2xl mx-auto">
                        <textarea className="h-36 w-full block break-words border border-solid border-[var(--gray30)] rounded-md p-2 mx-auto" placeholder="Write a spoiler free review here..."></textarea>
                        <span className="ml-auto mt-1 text-xs text-zinc-500">0/500</span>
                    </div>
                </section>
                <section className="py-8 space-y-6">
                    <h2 className="text-center text-3xl uppercase font-medium">Extra but Important</h2>
                    <ul className="flex gap-6 overflow-x-auto pb-2">
                        {listOfQuestions.map(el => (
                            <li key={el.label} className="flex flex-cntr-all flex-col gap-6 aspect-[9/4] min-w-96 w-96 p-4 border border-[var(--gray40)] rounded-md">
                                <p className="text-center">{el.label}</p>
                                <div className="flex mx-auto gap-8 w-fit">
                                    <button className="border-[var(--gray40)]">No</button>
                                    <button className="border-[var(--gray40)]">Yes</button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </section>
                <div className="flex flex-cntr-between">
                    <button className="border-0">
                        <EmptyBoxIcon />
                        <CheckBoxIcon />
                        Add to Suggestion?
                    </button>
                    <button className="primary">Submit</button>
                </div>
            </div>
        </div>
    )
}